import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

interface ImportItem {
  name: string;
  description?: string;
  url: string;
  category: string;
  icon?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { items }: { items: ImportItem[] } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data import tidak boleh kosong.' }, { status: 400 });
    }

    // Get all existing categories
    const existingCats = await db.category.findMany();
    const catMap = new Map<string, string>();
    existingCats.forEach((c) => catMap.set(c.name.toLowerCase(), c.id));

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.url) {
        errors.push(`Baris ${i + 1}: Nama dan URL wajib diisi.`);
        continue;
      }

      // Ensure category exists or create it
      const catName = item.category?.trim() || 'Other';
      let categoryId = catMap.get(catName.toLowerCase());

      if (!categoryId) {
        const newCat = await db.category.create({
          data: {
            name: catName,
            icon: '📁',
            status: 'ACTIVE',
          },
        });
        categoryId = newCat.id;
        catMap.set(catName.toLowerCase(), categoryId);
      }

      let url = item.url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await db.link.create({
        data: {
          name: item.name.trim(),
          description: item.description?.trim() || null,
          url,
          categoryId,
          icon: item.icon?.trim() || '🔗',
          status: item.status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      totalReceived: items.length,
      errors,
    });
  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Gagal memproses import data.' }, { status: 500 });
  }
}
