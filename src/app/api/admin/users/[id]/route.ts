import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getSessionUser(req);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const userId = params.id;
    const body = await req.json();
    const { username, email, fullName, role, status, password } = body;

    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (fullName !== undefined) updateData.fullName = fullName?.trim() || null;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password && password.length >= 4) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui user.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getSessionUser(req);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const userId = params.id;

    // Prevent deleting own account
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.' },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus user.' }, { status: 500 });
  }
}
