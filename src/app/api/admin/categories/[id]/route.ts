import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const categoryId = params.id;
    const body = await req.json();
    const { name, icon, color, status, displayOrder } = body;

    const updated = await db.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name: name.trim() }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(status && { status }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui kategori.' }, { status: 500 });
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

    const categoryId = params.id;

    // Check how many links belong to this category
    const linkCount = await db.link.count({
      where: { categoryId },
    });

    if (linkCount > 0) {
      // Find or create "Other" category to preserve links or prevent accidental wipe
      let otherCat = await db.category.findUnique({
        where: { name: 'Other' },
      });

      if (!otherCat) {
        otherCat = await db.category.create({
          data: { name: 'Other', icon: '⚙️', status: 'ACTIVE' },
        });
      }

      if (otherCat.id === categoryId) {
        return NextResponse.json(
          { error: 'Kategori default "Other" tidak dapat dihapus jika masih memiliki link.' },
          { status: 400 }
        );
      }

      // Move links to Other
      await db.link.updateMany({
        where: { categoryId },
        data: { categoryId: otherCat.id },
      });
    }

    await db.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
