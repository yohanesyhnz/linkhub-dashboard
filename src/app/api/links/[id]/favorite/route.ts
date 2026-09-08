import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const linkId = params.id;

    // Check if already favorited
    const existing = await db.userFavorite.findUnique({
      where: {
        userId_linkId: {
          userId: user.id,
          linkId,
        },
      },
    });

    let isFavorite = false;
    if (existing) {
      await db.userFavorite.delete({
        where: { id: existing.id },
      });
      isFavorite = false;
    } else {
      await db.userFavorite.create({
        data: {
          userId: user.id,
          linkId,
        },
      });
      isFavorite = true;
    }

    return NextResponse.json({ success: true, isFavorite });
  } catch (err: any) {
    console.error('Error toggling favorite:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
