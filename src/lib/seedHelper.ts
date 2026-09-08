import bcrypt from 'bcryptjs';
import db from './db';

let isSeeding = false;

export async function ensureInitialData() {
  if (isSeeding) return;
  try {
    const userCount = await db.user.count();
    if (userCount > 0) return;

    isSeeding = true;
    console.log('Database empty. Auto-seeding initial data...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    const admin = await db.user.create({
      data: {
        username: 'admin',
        email: 'admin@linkhub.local',
        fullName: 'System Administrator',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: '👨‍💼',
      },
    });

    const viewer = await db.user.create({
      data: {
        username: 'viewer',
        email: 'viewer@linkhub.local',
        fullName: 'General Viewer',
        passwordHash: viewerPassword,
        role: 'VIEWER',
        status: 'ACTIVE',
        avatar: '👤',
      },
    });

    // Categories
    const categoriesData = [
      { name: 'Dashboard', icon: '📊', color: 'blue', displayOrder: 1 },
      { name: 'CMMS', icon: '📋', color: 'indigo', displayOrder: 2 },
      { name: 'Maintenance', icon: '🛠', color: 'amber', displayOrder: 3 },
      { name: 'Production', icon: '🏭', color: 'emerald', displayOrder: 4 },
      { name: 'Sparepart', icon: '📦', color: 'orange', displayOrder: 5 },
      { name: 'Report', icon: '📈', color: 'purple', displayOrder: 6 },
      { name: 'Document', icon: '📁', color: 'teal', displayOrder: 7 },
      { name: 'Engineering', icon: '🔧', color: 'cyan', displayOrder: 8 },
      { name: 'System', icon: '💻', color: 'slate', displayOrder: 9 },
      { name: 'Application', icon: '📱', color: 'rose', displayOrder: 10 },
      { name: 'Website', icon: '🌐', color: 'sky', displayOrder: 11 },
      { name: 'Reference', icon: '📚', color: 'violet', displayOrder: 12 },
      { name: 'Other', icon: '⚙️', color: 'zinc', displayOrder: 13 },
    ];

    const catMap: Record<string, string> = {};
    for (const cat of categoriesData) {
      const created = await db.category.create({ data: cat });
      catMap[cat.name] = created.id;
    }

    // Links
    const linksData = [
      {
        name: 'Looker Studio Monitoring Dashboard',
        description: 'Dashboard real-time KPI, OEE, dan performa utilisasi mesin utilitas & produksi.',
        url: 'https://lookerstudio.google.com/reporting/demo-dankos-maintenance',
        category: 'Dashboard',
        icon: '📊',
        isQuickAccess: true,
        displayOrder: 1,
        clickCount: 142,
      },
      {
        name: 'CMMS Work Order & Preventive Maintenance',
        description: 'Sistem sentral manajemen perintah kerja (Work Order), jadwal preventive maintenance (PM), dan histori perbaikan.',
        url: 'https://cmms.company-internal.net/work-orders',
        category: 'CMMS',
        icon: '📋',
        isQuickAccess: true,
        displayOrder: 2,
        clickCount: 289,
      },
      {
        name: 'Sparepart Inventory & Stock Locator (SAP / WMS)',
        description: 'Pengecekan ketersediaan sparepart mesin, bin location rak gudang, dan reorder point.',
        url: 'https://wms.company-internal.net/inventory/spareparts',
        category: 'Sparepart',
        icon: '📦',
        isQuickAccess: true,
        displayOrder: 3,
        clickCount: 195,
      },
      {
        name: 'Grafana Server & IoT Host Monitoring',
        description: 'Monitoring sensor suhu, getaran (vibration), daya UPS, dan status server HQL Synology.',
        url: 'http://grafana-host.internal:3000/d/iot-monitoring',
        category: 'System',
        icon: '💻',
        isQuickAccess: true,
        displayOrder: 4,
        clickCount: 98,
      },
      {
        name: 'SCADA Realtime Production Line 02 & Line 07',
        description: 'Status live running mesin washing, filling, capping, dan packaging packaging line.',
        url: 'https://scada-web.internal/plant-view/line-overview',
        category: 'Production',
        icon: '🏭',
        isQuickAccess: true,
        displayOrder: 5,
        clickCount: 174,
      },
      {
        name: 'Daily Maintenance Activity & Log Sheet',
        description: 'Form pengisian checklist harian teknisi mekanik & elektrik shift 1, 2, 3.',
        url: 'https://docs.google.com/spreadsheets/d/maintenance-daily-log-2026',
        category: 'Maintenance',
        icon: '🛠',
        isQuickAccess: true,
        displayOrder: 6,
        clickCount: 215,
      },
    ];

    for (const item of linksData) {
      const categoryId = catMap[item.category] || catMap['Other'];
      await db.link.create({
        data: {
          name: item.name,
          description: item.description,
          url: item.url,
          categoryId,
          icon: item.icon,
          isQuickAccess: item.isQuickAccess,
          displayOrder: item.displayOrder,
          clickCount: item.clickCount,
          status: 'ACTIVE',
        },
      });
    }

    console.log('Auto-seed completed successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  } finally {
    isSeeding = false;
  }
}
