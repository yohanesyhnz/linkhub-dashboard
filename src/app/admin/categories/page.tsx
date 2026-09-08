'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastProvider, useToast } from '@/components/Toast';
import CategoryModal, { CategoryItem } from '@/components/CategoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import { FolderTree, Plus, Edit2, Trash2, Layers, RefreshCw, Hash } from 'lucide-react';

export default function AdminCategoriesPage() {
  return (
    <ToastProvider>
      <AdminCategoriesContent />
    </ToastProvider>
  );
}

function AdminCategoriesContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/categories'),
      ]);
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setCategories(c.categories || []);
      }
    } catch (e) {
      showToast('Gagal memuat kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (formData: Partial<CategoryItem>) => {
    const isEdit = Boolean(formData.id);
    const endpoint = isEdit ? `/api/admin/categories/${formData.id}` : '/api/admin/categories';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori.');

    showToast(isEdit ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil dibuat! 🎉', 'success');
    loadCategories();
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Gagal menghapus kategori', 'error');
    } else {
      showToast('Kategori berhasil dihapus', 'success');
      loadCategories();
    }
  };

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
                <FolderTree className="w-6 h-6 text-indigo-600" /> KELOLA KATEGORI
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Atur pengelompokan sistem (Dashboard, CMMS, Maintenance, Sparepart, SOP, dll.)
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCategory(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ TAMBAH KATEGORI</span>
            </button>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Memuat kategori...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-inner">
                        {cat.icon || '📁'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1">{cat.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {cat._count?.links || 0} Tautan
                      </span>
                      <span>&bull; Urutan #{cat.displayOrder}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      Status: <strong className="text-emerald-700">{cat.status}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"? Tautan di dalamnya akan dialihkan ke kategori "Other".`}
        confirmText="Hapus Kategori"
      />
    </div>
  );
}
