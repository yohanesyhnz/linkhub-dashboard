const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for LINK HUB DASHBOARD...');

  // 1. Create Default Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@linkhub.local',
      fullName: 'System Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: '👨‍💼',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { username: 'viewer' },
    update: {},
    create: {
      username: 'viewer',
      email: 'viewer@linkhub.local',
      fullName: 'General Viewer',
      passwordHash: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
      avatar: '👤',
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: {},
    create: {
      username: 'supervisor',
      email: 'supervisor@linkhub.local',
      fullName: 'Production Supervisor',
      passwordHash: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
      avatar: '👷‍♂️',
    },
  });

  console.log('Users created:', { admin: admin.username, viewer: viewer.username, supervisor: supervisor.username });

  // 2. Create Categories
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

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, color: cat.color, displayOrder: cat.displayOrder },
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }

  console.log(`Categories created: ${Object.keys(categoryMap).length}`);

  // 3. Create Realistic Seed Links
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
      name: 'OSR 2D Barcode & Camera Vision System (RRU 3085)',
      description: 'Web console kamera inspeksi visual 2D Datamatrix barcode dan rejection rate printer.',
      url: 'http://vision-osr.local/dashboard',
      category: 'Engineering',
      icon: '🔧',
      isQuickAccess: false,
      displayOrder: 6,
      clickCount: 64,
    },
    {
      name: 'Daily Maintenance Activity & Log Sheet',
      description: 'Form pengisian checklist harian teknisi mekanik & elektrik shift 1, 2, 3.',
      url: 'https://docs.google.com/spreadsheets/d/maintenance-daily-log-2026',
      category: 'Maintenance',
      icon: '🛠',
      isQuickAccess: true,
      displayOrder: 7,
      clickCount: 215,
    },
    {
      name: 'Synology NAS HQL A & B File Repository',
      description: 'Pusat penyimpanan backup program PLC, HMI, dan recorder data logger HQL.',
      url: 'https://synology-storage.internal:5001',
      category: 'System',
      icon: '🗄️',
      isQuickAccess: false,
      displayOrder: 8,
      clickCount: 88,
    },
    {
      name: 'SOP & Standard Operating Procedures Library',
      description: 'Kumpulan dokumen SOP validasi, kalibrasi instrumen, dan instruksi kerja teknisi.',
      url: 'https://document-control.internal/sop/engineering',
      category: 'Document',
      icon: '📁',
      isQuickAccess: false,
      displayOrder: 9,
      clickCount: 52,
    },
    {
      name: 'Energy & Utility Monitoring (UPS / External Pump)',
      description: 'Laporan konsumsi daya listrik, tekanan kompresor angin, dan level air chiller.',
      url: 'https://energy-meter.internal/reports',
      category: 'Report',
      icon: '📈',
      isQuickAccess: false,
      displayOrder: 10,
      clickCount: 41,
    },
    {
      name: 'QCC Team Portal & CIP Innovation Tracker',
      description: 'Pencatatan ide perbaikan (Kaizen/QCC), progress A3 report, dan cosaving proyek.',
      url: 'https://qcc-portal.internal/team-projects',
      category: 'Application',
      icon: '💡',
      isQuickAccess: false,
      displayOrder: 11,
      clickCount: 37,
    },
    {
      name: 'E-Certificate Training & Sertifikasi Personel',
      description: 'Portal verifikasi sertifikat keahlian teknisi, K3 Listrik, dan pelatihan GMP.',
      url: 'https://hrd-training.internal/e-certificates',
      category: 'Reference',
      icon: '📜',
      isQuickAccess: false,
      displayOrder: 12,
      clickCount: 29,
    },
  ];

  for (const item of linksData) {
    const categoryId = categoryMap[item.category] || categoryMap['Other'];
    const link = await prisma.link.create({
      data: {
        name: item.name,
        description: item.description,
        url: item.url,
        categoryId: categoryId,
        icon: item.icon,
        isQuickAccess: item.isQuickAccess,
        displayOrder: item.displayOrder,
        clickCount: item.clickCount,
        status: 'ACTIVE',
      },
    });

    // Add some initial favorite for viewer to showcase the favorite feature
    if (item.isQuickAccess && item.displayOrder <= 2) {
      await prisma.userFavorite.create({
        data: {
          userId: viewer.id,
          linkId: link.id,
        },
      }).catch(() => {});
    }

    // Add sample link clicks
    for (let i = 0; i < Math.min(item.clickCount, 5); i++) {
      await prisma.linkClick.create({
        data: {
          linkId: link.id,
          userId: i % 2 === 0 ? viewer.id : admin.id,
          clickedAt: new Date(Date.now() - i * 86400000 * 2),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ipAddress: '192.168.1.10',
        },
      });
    }
  }

  // Settings
  await prisma.systemSetting.upsert({
    where: { key: 'app_name' },
    update: {},
    create: {
      key: 'app_name',
      value: 'LINK HUB DASHBOARD',
      description: 'Nama aplikasi portal tautan terpusat',
    },
  });

  console.log(`Seeded ${linksData.length} links successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
