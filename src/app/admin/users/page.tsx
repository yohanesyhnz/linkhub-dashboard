'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastProvider, useToast } from '@/components/Toast';
import UserModal, { UserItem } from '@/components/UserModal';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDate } from '@/lib/utils';
import { Users, Plus, Shield, User as UserIcon, Edit2, Trash2, RefreshCw, KeyRound, Check, X } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <ToastProvider>
      <AdminUsersContent />
    </ToastProvider>
  );
}

function AdminUsersContent() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [curRes, uRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/users'),
      ]);

      if (curRes.ok) {
        const c = await curRes.json();
        setCurrentUser(c.user);
      }
      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      showToast('Gagal memuat pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (formData: any) => {
    const isEdit = Boolean(formData.id);
    const endpoint = isEdit ? `/api/admin/users/${formData.id}` : '/api/admin/users';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data user.');

    showToast(isEdit ? 'Data user berhasil diperbarui!' : 'User baru berhasil dibuat! 🎉', 'success');
    loadUsers();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Gagal menghapus user', 'error');
    } else {
      showToast('User berhasil dihapus', 'success');
      loadUsers();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={currentUser} />

      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" /> MANAJEMEN USER & ROLE
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kelola hak akses pengguna (ADMIN untuk management, VIEWER untuk read-only)
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ TAMBAH USER</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-purple-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-600">Memuat data user...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Role</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Terdaftar</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                              {u.avatar || '👤'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{u.fullName || u.username}</div>
                              <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-600">{u.email}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              u.role === 'ADMIN'
                                ? 'bg-brand-50 text-brand-700 border-brand-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role === 'ADMIN' ? (
                              <Shield className="w-3 h-3 mr-1 text-brand-600" />
                            ) : (
                              <UserIcon className="w-3 h-3 mr-1 text-slate-500" />
                            )}
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {currentUser?.id !== u.id && (
                              <button
                                onClick={() => {
                                  setUserToDelete(u);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                title="Hapus User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${userToDelete?.username}"?`}
        confirmText="Hapus User"
      />
    </div>
  );
}
