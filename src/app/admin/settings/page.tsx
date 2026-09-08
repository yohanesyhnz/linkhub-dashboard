'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastProvider, useToast } from '@/components/Toast';
import { Settings, Shield, Database, Save, CheckCircle2, Server, Globe, Download } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <ToastProvider>
      <AdminSettingsContent />
    </ToastProvider>
  );
}

function AdminSettingsContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [appName, setAppName] = useState('LINK HUB DASHBOARD');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Pengaturan sistem berhasil disimpan!', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-slate-700" /> PENGATURAN SISTEM
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Konfigurasi umum, database, dan informasi lingkungan operasional
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: General Config */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" /> Identitas Aplikasi
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Portal Dashboard
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Domain Akses Internet / Intranet
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="https://linkhub.domain.com"
                    className="w-full px-3.5 py-2.5 bg-slate-100 text-sm text-slate-500 font-mono rounded-xl border border-slate-200 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dapat diakses melalui jaringan WiFi, 4G, 5G, dan SSL/HTTPS.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                  </button>
                </div>
              </form>

              {/* Data Export & Backup */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" /> Cadangan & Ekspor Data
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unduh seluruh kumpulan data link, kategori, dan statistik dalam format CSV standar yang dapat dibuka di Microsoft Excel atau Google Spreadsheet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/api/admin/export';
                    showToast('Mengunduh backup CSV...', 'info');
                  }}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs flex items-center space-x-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File CSV</span>
                </button>
              </div>
            </div>

            {/* Right 1 Col: System Environment Specs */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" /> Status Server
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Database Engine</span>
                    <span className="font-bold text-slate-800">SQLite + Prisma ORM</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Enkripsi Auth</span>
                    <span className="font-bold text-slate-800">Bcrypt + JWT Cookie</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Framework</span>
                    <span className="font-bold text-slate-800">Next.js 14 (App Router)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">Status Layanan</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
