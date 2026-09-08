'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Link2, Sparkles, Layers, FileText, Globe } from 'lucide-react';
import { LinkItem } from './LinkCard';

interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LinkItem>) => Promise<void>;
  categories: CategoryOption[];
  initialData?: LinkItem | null;
}

const COMMON_EMOJIS = ['📊', '📋', '🛠', '🏭', '📦', '📈', '📁', '🔧', '💻', '📱', '🌐', '📚', '⚙️', '💡', '📑', '🚀'];

export default function LinkModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}: LinkModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [icon, setIcon] = useState('🔗');
  const [status, setStatus] = useState('ACTIVE');
  const [isQuickAccess, setIsQuickAccess] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setUrl(initialData.url || '');
      setCategoryId(initialData.categoryId || (categories[0]?.id || ''));
      setIcon(initialData.icon || '🔗');
      setStatus(initialData.status || 'ACTIVE');
      setIsQuickAccess(Boolean(initialData.isQuickAccess));
      setDisplayOrder(initialData.displayOrder || 0);
    } else {
      setName('');
      setDescription('');
      setUrl('');
      setCategoryId(categories[0]?.id || '');
      setIcon('🔗');
      setStatus('ACTIVE');
      setIsQuickAccess(false);
      setDisplayOrder(0);
    }
    setError('');
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Link wajib diisi.');
      return;
    }
    if (!url.trim()) {
      setError('URL Link wajib diisi.');
      return;
    }
    if (!categoryId) {
      setError('Pilih kategori untuk link.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name: name.trim(),
        description: description.trim() || null,
        url: url.trim(),
        categoryId,
        icon,
        status,
        isQuickAccess,
        displayOrder: Number(displayOrder) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Link' : 'Tambah Link Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {/* Link Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Looker Studio Monitoring Dashboard"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Link <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://lookerstudio.google.com/..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 font-mono rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fungsi tautan ini secara singkat untuk tim..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '📁'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Link
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              >
                <option value="ACTIVE">🟢 ACTIVE (Tampil)</option>
                <option value="INACTIVE">🔴 INACTIVE (Sembunyi)</option>
              </select>
            </div>
          </div>

          {/* Icon / Emoji Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Icon / Emoji
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={icon}
                maxLength={4}
                onChange={(e) => setIcon(e.target.value)}
                className="w-14 text-center py-2 bg-slate-50 font-bold text-lg rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
              <div className="flex flex-wrap gap-1 items-center">
                {COMMON_EMOJIS.slice(0, 8).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-brand-100 hover:scale-110 flex items-center justify-center text-sm transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options: Quick Access & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <input
                type="checkbox"
                id="quickAccess"
                checked={isQuickAccess}
                onChange={(e) => setIsQuickAccess(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <label htmlFor="quickAccess" className="text-xs font-bold text-slate-800 cursor-pointer">
                ⚡ Tampilkan di Quick Access
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urutan Tampilan (Display Order)
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
