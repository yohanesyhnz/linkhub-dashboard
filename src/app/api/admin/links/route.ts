import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Diperlukan role ADMIN.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all';

    const where: any = {};
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
    if (status && status !== 'all') {
      where.status = status;
    }

    const links = await db.link.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ links });
  } catch (err: any) {
    console.error('Admin GET links error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Diperlukan role ADMIN.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, url, categoryId, icon, status, isQuickAccess, displayOrder } = body;

    if (!name || !url || !categoryId) {
      return NextResponse.json(
        { error: 'Nama Link, URL, dan Kategori wajib diisi.' },
        { status: 400 }
      );
    }

    // Format URL if missing protocol
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const link = await db.link.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        url: formattedUrl,
        categoryId,
        icon: icon || '🔗',
        status: status || 'ACTIVE',
        isQuickAccess: Boolean(isQuickAccess),
        displayOrder: Number(displayOrder) || 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (err: any) {
    console.error('Admin POST link error:', err);
    return NextResponse.json({ error: err.message || 'Gagal membuat link.' }, { status: 500 });
  }
}
