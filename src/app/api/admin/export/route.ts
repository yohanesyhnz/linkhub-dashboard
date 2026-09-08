import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const links = await db.link.findMany({
      include: {
        category: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    const exportData = links.map((l) => ({
      ID: l.id,
      Name: l.name,
      Description: l.description || '',
      URL: l.url,
      Category: l.category.name,
      Status: l.status,
      QuickAccess: l.isQuickAccess ? 'YES' : 'NO',
      ClickCount: l.clickCount,
      DisplayOrder: l.displayOrder,
      CreatedAt: l.createdAt.toISOString(),
      UpdatedAt: l.updatedAt.toISOString(),
    }));

    const csv = Papa.unparse(exportData);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="linkhub_links_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Gagal mengekspor data.' }, { status: 500 });
  }
}
