import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    const linkId = params.id;

    const link = await db.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link tidak ditemukan' }, { status: 404 });
    }

    // Increment count & create click record
    const updated = await db.$transaction([
      db.link.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 } },
      }),
      db.linkClick.create({
        data: {
          linkId,
          userId: user ? user.id : null,
          userAgent: req.headers.get('user-agent') || undefined,
          ipAddress: req.headers.get('x-forwarded-for') || undefined,
        },
      }),
    ]);

    return NextResponse.json({ success: true, clickCount: updated[0].clickCount });
  } catch (err: any) {
    console.error('Error tracking click:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
