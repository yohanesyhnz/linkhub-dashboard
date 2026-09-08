import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await db.category.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            links: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
