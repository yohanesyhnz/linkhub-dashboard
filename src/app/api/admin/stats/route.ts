import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const [
      totalLinks,
      activeLinks,
      inactiveLinks,
      totalCategories,
      totalUsers,
      totalClicksResult,
      topLinks,
      recentlyAddedLinks,
      categoriesWithCounts,
      recentClicks,
    ] = await Promise.all([
      db.link.count(),
      db.link.count({ where: { status: 'ACTIVE' } }),
      db.link.count({ where: { status: 'INACTIVE' } }),
      db.category.count(),
      db.user.count(),
      db.link.aggregate({
        _sum: { clickCount: true },
      }),
      db.link.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { clickCount: 'desc' },
        take: 10,
        include: { category: true },
      }),
      db.link.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      }),
      db.category.findMany({
        include: {
          _count: {
            select: { links: true },
          },
        },
        orderBy: { displayOrder: 'asc' },
      }),
      db.linkClick.findMany({
        take: 10,
        orderBy: { clickedAt: 'desc' },
        include: {
          link: { select: { name: true, url: true, icon: true } },
          user: { select: { username: true, fullName: true } },
        },
      }),
    ]);

    const totalClicks = totalClicksResult._sum.clickCount || 0;

    return NextResponse.json({
      metrics: {
        totalLinks,
        activeLinks,
        inactiveLinks,
        totalCategories,
        totalUsers,
        totalClicks,
      },
      topLinks,
      recentlyAddedLinks,
      categoryDistribution: categoriesWithCounts.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        count: c._count.links,
      })),
      recentClicks,
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
