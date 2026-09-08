'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LinkCard, { LinkItem } from '@/components/LinkCard';
import { ToastProvider, useToast } from '@/components/Toast';
import { Link2, Search, Filter, Grid, List, RefreshCw } from 'lucide-react';

export default function LinksPage() {
  return (
    <ToastProvider>
      <LinksContent />
    </ToastProvider>
  );
}

function LinksContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, linksRes, catsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/links'),
        fetch('/api/categories'),
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);
      }
      if (linksRes.ok) {
        const l = await linksRes.json();
        setLinks(l.links || []);
      }
      if (catsRes.ok) {
        const c = await catsRes.json();
        setCategories(c.categories || []);
      }
    } catch (e) {
      showToast('Gagal memuat data link', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        const matchSearch =
          !search ||
          link.name.toLowerCase().includes(search.toLowerCase()) ||
          (link.description && link.description.toLowerCase().includes(search.toLowerCase())) ||
          link.url.toLowerCase().includes(search.toLowerCase()) ||
          (link.category?.name && link.category.name.toLowerCase().includes(search.toLowerCase()));

        const matchCategory = selectedCategory === 'all' || link.categoryId === selectedCategory;

        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'most_used') return b.clickCount - a.clickCount;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.displayOrder - b.displayOrder;
      });
  }, [links, search, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        <Sidebar
          userRole={user?.role || 'VIEWER'}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Link2 className="w-6 h-6 text-brand-600" /> Direktori Seluruh Tautan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Katalog lengkap semua tautan sistem dan aplikasi yang terdaftar
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl border border-brand-200">
                {filteredLinks.length} Tautan Ditemukan
              </span>
            </div>
          </div>

          {/* Filter and Sort bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik kata kunci untuk mencari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="displayOrder">Urutan Default</option>
                <option value="name">Nama (A-Z)</option>
                <option value="most_used">Paling Sering Dibuka</option>
                <option value="newest">Paling Baru Ditambahkan</option>
              </select>
            </div>
          </div>

          {/* Links Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Memuat direktori tautan...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">Tidak ada tautan yang sesuai.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onFavoriteChange={(id, isFav) =>
                    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isFavorite: isFav } : l)))
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
