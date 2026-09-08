'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastProvider, useToast } from '@/components/Toast';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Layers,
  Users,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trophy,
} from 'lucide-react';

export default function AdminStatisticsPage() {
  return (
    <ToastProvider>
      <AdminStatsContent />
    </ToastProvider>
  );
}

function AdminStatsContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/stats'),
      ]);
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        setStats(data);
      }
    } catch (e) {
      showToast('Gagal memuat statistik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const maxClicks = stats?.topLinks?.[0]?.clickCount || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-600" /> STATISTIK & ANALITIK
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Laporan visual penggunaan sistem dan tautan terpopuler di organisasi
              </p>
            </div>

            <button
              onClick={loadStats}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Memuat analisis statistik...</p>
            </div>
          ) : stats ? (
            <>
              {/* Metric Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Klik Sistem</span>
                  <div className="text-2xl font-black text-brand-600 mt-1 flex items-center gap-1.5">
                    <MousePointerClick className="w-5 h-5" />
                    <span>{stats.metrics.totalClicks}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Total akumulasi pembukaan link</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Tautan</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stats.metrics.totalLinks}</div>
                  <span className="text-[10px] text-emerald-700 font-bold">{stats.metrics.activeLinks} Aktif &bull; {stats.metrics.inactiveLinks} Nonaktif</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Kategori</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{stats.metrics.totalCategories}</div>
                  <span className="text-[10px] text-slate-400">Kelompok kategori aktif</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Pengguna</span>
                  <div className="text-2xl font-black text-purple-600 mt-1">{stats.metrics.totalUsers}</div>
                  <span className="text-[10px] text-slate-400">Admin & Viewer</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Link Terpopuler</span>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {stats.topLinks?.[0]?.name || '-'}
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold">{stats.topLinks?.[0]?.clickCount || 0} Klik</span>
                </div>
              </div>

              {/* Main Analytics Row: Top 10 Links Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: TOP 10 MOST USED LINKS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">TOP 10 MOST USED LINKS</h2>
                        <p className="text-xs text-slate-500">10 tautan dengan frekuensi akses tertinggi</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {stats.topLinks.map((item: any, idx: number) => {
                      const percentage = Math.round((item.clickCount / maxClicks) * 100);
                      return (
                        <div key={item.id} className="group">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center space-x-2 font-bold text-slate-800 truncate pr-2">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  idx === 0
                                    ? 'bg-amber-400 text-amber-950'
                                    : idx === 1
                                    ? 'bg-slate-300 text-slate-800'
                                    : idx === 2
                                    ? 'bg-amber-700 text-amber-100'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-base">{item.icon || '🔗'}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 shrink-0">
                              {item.clickCount} klik
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-brand-600 to-sky-400 h-full rounded-full transition-all duration-500 group-hover:from-brand-500 group-hover:to-sky-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 1 Col: Category Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col">
                  <div className="flex items-center space-x-2.5 mb-5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Distribusi Kategori</h2>
                      <p className="text-xs text-slate-500">Jumlah tautan per kategori</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[380px] flex-1">
                    {stats.categoryDistribution.map((cat: any) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{cat.icon || '📁'}</span>
                          <span className="font-bold text-slate-800">{cat.name}</span>
                        </div>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                          {cat.count} Link
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Click Logs */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Aktivitas Klik Terakhir</h3>
                <p className="text-xs text-slate-500 mb-4">Log riwayat pembukaan link terkini secara realtime</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Tautan</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Waktu Klik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      {stats.recentClicks.map((click: any) => (
                        <tr key={click.id}>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span>{click.link?.icon || '🔗'}</span>
                              <span className="font-bold text-slate-800">{click.link?.name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {click.user?.fullName || click.user?.username || 'Guest/Viewer'}
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">
                            {formatDateTime(click.clickedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
