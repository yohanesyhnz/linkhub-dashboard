'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  QrCode,
  Copy,
  Check,
  Calendar,
  MousePointerClick,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDate, getDomain } from '@/lib/utils';
import { useToast } from './Toast';
import QrCodeModal from './QrCodeModal';

export interface LinkItem {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  categoryId: string;
  icon?: string | null;
  status: string;
  isQuickAccess: boolean;
  displayOrder: number;
  clickCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string | null;
  };
  isFavorite?: boolean;
}

interface LinkCardProps {
  link: LinkItem;
  onFavoriteChange?: (linkId: string, isFav: boolean) => void;
  showAdminActions?: boolean;
  onEdit?: (link: LinkItem) => void;
  onDelete?: (link: LinkItem) => void;
}

export default function LinkCard({
  link,
  onFavoriteChange,
  showAdminActions = false,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const { showToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(Boolean(link.isFavorite));
  const [clickCount, setClickCount] = useState(link.clickCount);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Toggle Favorite
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextFav = !isFavorite;
      setIsFavorite(nextFav);
      if (onFavoriteChange) onFavoriteChange(link.id, nextFav);

      const res = await fetch(`/api/links/${link.id}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          nextFav ? 'Ditambahkan ke Favorit ⭐' : 'Dihapus dari Favorit',
          'info'
        );
      }
    } catch (err) {
      setIsFavorite(!isFavorite);
    }
  };

  // Copy Link URL
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    showToast('Link berhasil disalin ke clipboard 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Link and track click count asynchronously without reloading dashboard
  const handleOpenLink = async (e: React.MouseEvent) => {
    // Open in new tab immediately
    window.open(link.url, '_blank', 'noopener,noreferrer');

    // Async record click in background
    try {
      setClickCount((prev) => prev + 1);
      await fetch(`/api/links/${link.id}/click`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to log click', err);
    }
  };

  // Category Color Map
  const getCategoryColor = (catName: string) => {
    const colors: Record<string, string> = {
      Dashboard: 'bg-blue-50 text-blue-700 border-blue-200',
      CMMS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
      Production: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Sparepart: 'bg-orange-50 text-orange-700 border-orange-200',
      Report: 'bg-purple-50 text-purple-700 border-purple-200',
      Document: 'bg-teal-50 text-teal-700 border-teal-200',
      Engineering: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      System: 'bg-slate-100 text-slate-700 border-slate-300',
      Application: 'bg-rose-50 text-rose-700 border-rose-200',
      Website: 'bg-sky-50 text-sky-700 border-sky-200',
      Reference: 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return colors[catName] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const domain = getDomain(link.url);

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      >
        {/* Top Header Card */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* Left: Icon & Category */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 group-hover:rotate-3 transition">
                {link.icon || '🔗'}
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getCategoryColor(
                    link.category?.name || ''
                  )}`}
                >
                  <span className="mr-1">{link.category?.icon || '📁'}</span>
                  {link.category?.name || 'General'}
                </span>
                {link.isQuickAccess && (
                  <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    <Zap className="w-2.5 h-2.5 mr-0.5 fill-amber-600 text-amber-600" />
                    Quick
                  </span>
                )}
              </div>
            </div>

            {/* Right: Favorite & Status */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleToggleFavorite}
                title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                className={`p-1.5 rounded-xl transition ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`}
                />
              </button>

              {link.status === 'INACTIVE' && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                  INACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition leading-snug mb-1.5 line-clamp-2">
            {link.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {link.description || 'Tidak ada deskripsi tambahan untuk tautan ini.'}
          </p>

          {/* Domain tag */}
          <div className="inline-flex items-center text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 max-w-full truncate mb-4">
            <span className="truncate">{domain}</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 mt-2 space-y-3">
          {/* Metadata Row: Clicks & Added Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1">
              <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
              <span>{clickCount} x dibuka</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(link.updatedAt || link.createdAt)}</span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-2">
            {/* Quick Actions (QR & Copy) */}
            <button
              onClick={() => setIsQrOpen(true)}
              title="Tampilkan QR Code"
              className="p-2.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-xl transition shadow-2xs"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              title="Salin Link URL"
              className="p-2.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-xl transition shadow-2xs"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* OPEN LINK Main Button */}
            <button
              onClick={handleOpenLink}
              className="flex-1 py-2.5 px-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm shadow-brand-500/25 active:scale-[0.98]"
            >
              <span>OPEN LINK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Popup */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        linkName={link.name}
        url={link.url}
        icon={link.icon || '🔗'}
      />
    </>
  );
}
