'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  FolderTree,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  userRole = 'VIEWER',
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'ADMIN';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'VIEWER'],
    },
    {
      name: 'Semua Link',
      href: '/links',
      icon: Link2,
      roles: ['ADMIN', 'VIEWER'],
    },
  ];

  const adminItems = [
    {
      name: 'Kelola Link',
      href: '/admin/links',
      icon: Link2,
      roles: ['ADMIN'],
    },
    {
      name: 'Kategori',
      href: '/admin/categories',
      icon: FolderTree,
      roles: ['ADMIN'],
    },
    {
      name: 'Statistik & Analitik',
      href: '/admin/statistics',
      icon: BarChart3,
      roles: ['ADMIN'],
    },
    {
      name: 'Manajemen User',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Pengaturan',
      href: '/admin/settings',
      icon: Settings,
      roles: ['ADMIN'],
    },
  ];

  const content = (
    <div className="flex flex-col h-full py-5 px-4">
      {/* Brand Label */}
      <div className="px-3 mb-6">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Menu Utama
        </div>
      </div>

      {/* Main Nav */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Section (Conditional) */}
      {isAdmin && (
        <div className="mt-8">
          <div className="px-3 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Admin Panel
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wide bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
              Admin
            </span>
          </div>
          <div className="space-y-1">
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Info Box at bottom */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Tips Penggunaan</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Klik tombol <strong>QR Code</strong> di kartu link untuk langsung membukanya di HP Anda.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-fadeIn">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
