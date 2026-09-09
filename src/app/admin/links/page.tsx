'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastProvider, useToast } from '@/components/Toast';
import LinkModal from '@/components/LinkModal';
import ImportModal from '@/components/ImportModal';
import ConfirmModal from '@/components/ConfirmModal';
import { LinkItem } from '@/components/LinkCard';
import { formatDate } from '@/lib/utils';
import {
  Link2,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Power,
  Zap,
  RefreshCw,
} from 'lucide-react';

export default function AdminLinksPage() {
  return (
    <ToastProvider>
      <AdminLinksContent />
    </ToastProvider>
  );
}

function AdminLinksContent() {
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, lRes, cRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/links'),
        fetch('/api/admin/categories'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (lRes.ok) {
        const l = await lRes.json();
        setLinks(l.links || []);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setCategories(c.categories || []);
      }
    } catch (err) {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Link (Create or Update)
  const handleSaveLink = async (formData: Partial<LinkItem>) => {
    const isEdit = Boolean(formData.id);
    const endpoint = isEdit ? `/api/admin/links/${formData.id}` : '/api/admin/links';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan link.');

    showToast(isEdit ? 'Link berhasil diperbarui!' : 'Link baru berhasil ditambahkan! 🚀', 'success');
    loadData();
  };

  // Toggle Link Status
  const handleToggleStatus = async (link: LinkItem) => {
    try {
      const nextStatus = link.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Status link diubah menjadi ${nextStatus}`, 'info');
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, status: nextStatus } : l))
        );
      }
    } catch (e) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  // Delete Link
  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    const res = await fetch(`/api/admin/links/${linkToDelete.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      showToast('Link berhasil dihapus dari database', 'success');
      loadData();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || 'Gagal menghapus link', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.location.href = '/api/admin/export';
    showToast('Mengunduh file data CSV...', 'info');
  };

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCat === 'all' || l.categoryId === selectedCat;
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [links, search, selectedCat, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Link2 className="w-6 h-6 text-brand-600" /> LINK MANAGEMENT
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kelola, tambah, edit, atau nonaktifkan tautan dalam sistem secara realtime
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => {
                  setEditingLink(null);
                  setIsLinkModalOpen(true);
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD NEW LINK</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari link..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="ACTIVE">🟢 ACTIVE</option>
                <option value="INACTIVE">🔴 INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Links Management Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-600">Memuat tabel link...</p>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Belum ada link yang terdaftar atau sesuai filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-12 text-center">Urutan</th>
                      <th className="p-4">Nama Link & URL</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4 text-center">Klik</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Terakhir Diubah</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 text-center font-mono font-bold text-slate-400">
                          {link.displayOrder}
                        </td>
                        <td className="p-4">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl mt-0.5">{link.icon || '🔗'}</span>
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{link.name}</span>
                                {link.isQuickAccess && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                    Quick
                                  </span>
                                )}
                              </div>
                              {link.description && (
                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{link.description}</div>
                              )}
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1 mt-1 truncate max-w-xs"
                              >
                                <span>{link.url}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {link.category?.icon} {link.category?.name}
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap font-bold text-slate-800">
                          {link.clickCount}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(link)}
                            title="Klik untuk toggle status"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border transition flex items-center gap-1 mx-auto ${
                              link.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{link.status}</span>
                          </button>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {formatDate(link.updatedAt)}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setIsLinkModalOpen(true);
                              }}
                              className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition"
                              title="Edit Link"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setLinkToDelete(link);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Hapus Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleSaveLink}
        categories={categories}
        initialData={editingLink}
      />

      {/* Import CSV Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Link"
        message={`Apakah Anda yakin ingin menghapus tautan "${linkToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Link"
        cancelText="Batal"
      />
    </div>
  );
}
