'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LinkCard, { LinkItem } from '@/components/LinkCard';
import { ToastProvider, useToast } from '@/components/Toast';
import {
  Link2,
  FolderTree,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface CategoryData {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  _count?: { links: number };
}

function DashboardContent() {
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'quick' | 'most_used' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch initial user & data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [userRes, linksRes, catsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/links'),
        fetch('/api/categories'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData.links || []);
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData.categories || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Search
      const matchSearch =
        !search ||
        link.name.toLowerCase().includes(search.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(search.toLowerCase())) ||
        link.url.toLowerCase().includes(search.toLowerCase()) ||
        (link.category?.name && link.category.name.toLowerCase().includes(search.toLowerCase()));

      // Category
      const matchCategory = selectedCategory === 'all' || link.categoryId === selectedCategory;

      // Tab Filters
      let matchTab = true;
      if (activeTab === 'favorites') matchTab = Boolean(link.isFavorite);
      if (activeTab === 'quick') matchTab = Boolean(link.isQuickAccess);

      return matchSearch && matchCategory && matchTab;
    }).sort((a, b) => {
      if (activeTab === 'most_used') return b.clickCount - a.clickCount;
      if (activeTab === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.displayOrder - b.displayOrder;
    });
  }, [links, search, selectedCategory, activeTab]);

  // Quick Access Links
  const quickAccessLinks = useMemo(() => {
    return links.filter((l) => l.isQuickAccess).slice(0, 6);
  }, [links]);

  // Recently Added Links
  const recentLinks = useMemo(() => {
    return [...links]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [links]);

  // Summary Metrics
  const totalActiveLinks = links.filter((l) => l.status === 'ACTIVE').length;
  const totalCategories = categories.length;
  const totalFavorites = links.filter((l) => l.isFavorite).length;
  const mostUsedLink = useMemo(() => {
    if (links.length === 0) return null;
    return [...links].sort((a, b) => b.clickCount - a.clickCount)[0];
  }, [links]);

  const handleFavoriteChange = (linkId: string, isFav: boolean) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, isFavorite: isFav } : l))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        <Sidebar
          userRole={user?.role || 'VIEWER'}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Dashboard Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold mb-3 text-sky-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sistem Portal Tautan Terpusat</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Halo, {user?.fullName || user?.username || 'Rekan Kerja'} 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Temukan seluruh tautan sistem operasional, dashboard, dokumen SOP, dan aplikasi kerja tim dalam satu wadah.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchData}
                  disabled={refreshing}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur transition flex items-center space-x-1.5 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin/links"
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Kelola Link</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {/* Metric 1 */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Link</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalActiveLinks}</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 inline-block">● Seluruh Tautan Aktif</span>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kategori</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalCategories}</div>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">Kategori Sistem</span>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favorit Saya</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalFavorites}</div>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 inline-block">Disimpan oleh Anda</span>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Used Link</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2 truncate line-clamp-1" title={mostUsedLink?.name}>
                {mostUsedLink ? mostUsedLink.name : '-'}
              </div>
              <span className="text-[11px] text-purple-700 font-semibold mt-0.5 inline-block">
                {mostUsedLink ? `${mostUsedLink.clickCount}x dibuka` : 'Belum ada klik'}
              </span>
            </div>
          </div>

          {/* Quick Access Section */}
          {quickAccessLinks.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Zap className="w-4 h-4 fill-amber-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">QUICK ACCESS</h2>
                </div>
                <span className="text-xs text-slate-600 font-medium">Tautan Utama yang Diprioritaskan</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickAccessLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      window.open(item.url, '_blank');
                      fetch(`/api/links/${item.id}/click`, { method: 'POST' });
                    }}
                    className="p-3 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200/80 rounded-2xl text-left transition group flex flex-col justify-between"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">{item.icon || '🔗'}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate mt-0.5">{item.category?.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search, Filter & Tabs Toolbar */}
          <div className="space-y-3.5">
            {/* Filter Tabs & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semua ({links.length})
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'favorites'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Favorit ({totalFavorites})</span>
                </button>
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'quick'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Quick Access</span>
                </button>
                <button
                  onClick={() => setActiveTab('most_used')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                    activeTab === 'most_used'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Paling Sering Digunakan</span>
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'recent'
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Terbaru
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex items-center space-x-1 self-end sm:self-auto border border-slate-200 p-1 rounded-xl bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid Card View"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table List View"
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedCategory === 'all'
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                🌐 Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center space-x-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.icon || '📁'}</span>
                  <span>{cat.name}</span>
                  {cat._count?.links !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === cat.id
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat._count.links}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Links List / Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Memuat tautan...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-3xl flex items-center justify-center text-3xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tidak ada tautan ditemukan</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {search
                  ? `Tidak ada hasil untuk kata kunci "${search}". Coba periksa ejaan atau gunakan kata kunci lain.`
                  : 'Belum ada tautan pada filter atau kategori yang dipilih.'}
              </p>
              {(search || selectedCategory !== 'all' || activeTab !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setActiveTab('all');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          ) : (
            /* Table View Mode */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">Link & Deskripsi</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">URL</th>
                      <th className="p-4 text-center">Dibuka</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{link.icon || '🔗'}</div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{link.name}</div>
                              {link.description && (
                                <div className="text-xs text-slate-500 line-clamp-1">{link.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {link.category?.icon} {link.category?.name}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-blue-600 truncate max-w-[200px]">
                          {link.url}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap font-bold text-slate-600">
                          {link.clickCount} x
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              window.open(link.url, '_blank');
                              fetch(`/api/links/${link.id}/click`, { method: 'POST' });
                            }}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1 shadow-sm transition"
                          >
                            <span>OPEN</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Recently Added Preview */}
          {recentLinks.length > 0 && (
            <div className="pt-6 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Baru Saja Ditambahkan
                  </h3>
                </div>
                <Link
                  href="/links"
                  className="text-xs text-brand-600 hover:text-brand-800 font-bold flex items-center"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {recentLinks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      window.open(item.url, '_blank');
                      fetch(`/api/links/${item.id}/click`, { method: 'POST' });
                    }}
                    className="p-3 bg-white hover:border-brand-400 border border-slate-200/80 rounded-2xl cursor-pointer transition shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon || '🔗'}</span>
                      <div className="truncate flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-600">{item.category?.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
