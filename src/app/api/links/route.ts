import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ensureInitialData } from '@/lib/seedHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureInitialData();

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const filter = searchParams.get('filter') || 'all'; // all, favorites, quick, most_used, recent
    const sortBy = searchParams.get('sortBy') || 'displayOrder'; // displayOrder, most_used, newest, name

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (filter === 'quick') {
      where.isQuickAccess = true;
    } else if (filter === 'favorites') {
      where.favorites = {
        some: {
          userId: user.id,
        },
      };
    }

    // Determine order
    let orderBy: any = [{ displayOrder: 'asc' }, { createdAt: 'desc' }];
    if (filter === 'most_used' || sortBy === 'most_used') {
      orderBy = [{ clickCount: 'desc' }, { displayOrder: 'asc' }];
    } else if (filter === 'recent' || sortBy === 'newest') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sortBy === 'name') {
      orderBy = [{ name: 'asc' }];
    }

    const links = await db.link.findMany({
      where,
      orderBy,
      include: {
        category: true,
        favorites: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Transform links to include isFavorite boolean
    const formattedLinks = links.map((link) => ({
      ...link,
      isFavorite: link.favorites.length > 0,
      favorites: undefined,
    }));

    return NextResponse.json({ links: formattedLinks });
  } catch (err: any) {
    console.error('Error fetching links:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
