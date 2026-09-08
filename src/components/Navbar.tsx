'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  Shield,
  User as UserIcon,
  ExternalLink,
  Search,
  Sparkles,
  Link2,
} from 'lucide-react';
import { useToast } from './Toast';

interface NavbarProps {
  user: {
    id: string;
    username: string;
    fullName?: string | null;
    role: string;
    avatar?: string | null;
  } | null;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Navbar({
  user,
  onSearchChange,
  searchValue = '',
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}: NavbarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        showToast('Logout berhasil', 'info');
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <Link2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                LINK HUB <span className="text-brand-600">PORTAL</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-600 font-medium tracking-wide uppercase">
                Centralized Enterprise Links
              </span>
            </div>
          </div>
        </div>

        {/* Center: Realtime Search (if search prop provided) */}
        {onSearchChange && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari link, deskripsi, atau kategori..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-50 border border-slate-200/70 py-1.5 px-2.5 sm:px-3 rounded-2xl">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shadow-2xs">
                {user.avatar || '👤'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                  {user.fullName || user.username}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium flex items-center gap-1">
                  {user.role === 'ADMIN' ? (
                    <span className="text-brand-700 font-semibold flex items-center">
                      <Shield className="w-2.5 h-2.5 mr-0.5" /> ADMIN
                    </span>
                  ) : (
                    <span>VIEWER</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 rounded-xl transition flex items-center space-x-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
