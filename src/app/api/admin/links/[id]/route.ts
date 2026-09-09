import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const linkId = params.id;
    const body = await req.json();
    const { name, description, url, categoryId, icon, status, isQuickAccess, displayOrder } = body;

    let formattedUrl = url?.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const updated = await db.link.update({
      where: { id: linkId },
      data: {
        name: name ? name.trim() : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        url: formattedUrl || undefined,
        categoryId: categoryId || undefined,
        icon: icon !== undefined ? icon : undefined,
        status: status || undefined,
        isQuickAccess: isQuickAccess !== undefined ? Boolean(isQuickAccess) : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, link: updated });
  } catch (err: any) {
    console.error('Admin PUT link error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui link.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const linkId = params.id;

    // Delete relation records first to prevent foreign key constraint issues in PostgreSQL
    await db.$transaction([
      db.linkClick.deleteMany({ where: { linkId } }),
      db.userFavorite.deleteMany({ where: { linkId } }),
      db.link.delete({ where: { id: linkId } }),
    ]);

    return NextResponse.json({ success: true, message: 'Link berhasil dihapus.' });
  } catch (err: any) {
    console.error('Admin DELETE link error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus link.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const linkId = params.id;
    const body = await req.json();

    const updated = await db.link.update({
      where: { id: linkId },
      data: body,
      include: { category: true },
    });

    return NextResponse.json({ success: true, link: updated });
  } catch (err: any) {
    console.error('Admin PATCH link error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengubah status link.' }, { status: 500 });
  }
}
