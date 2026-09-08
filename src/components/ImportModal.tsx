'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  name: string;
  description?: string;
  url: string;
  category: string;
  icon?: string;
  status?: string;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = [];
        for (const raw of results.data as any[]) {
          // Normalize column keys (support case insensitivity)
          const keys = Object.keys(raw);
          const findKey = (name: string) =>
            keys.find((k) => k.toLowerCase().replace(/[^a-z]/g, '') === name.toLowerCase().replace(/[^a-z]/g, ''));

          const nameKey = findKey('name') || findKey('namalink') || findKey('title');
          const urlKey = findKey('url') || findKey('link') || findKey('linkurl');
          const catKey = findKey('category') || findKey('kategori');
          const descKey = findKey('description') || findKey('deskripsi') || findKey('desc');
          const iconKey = findKey('icon') || findKey('emoji');
          const statusKey = findKey('status');

          if (raw[nameKey || ''] && raw[urlKey || '']) {
            rows.push({
              name: String(raw[nameKey || '']).trim(),
              url: String(raw[urlKey || '']).trim(),
              category: raw[catKey || ''] ? String(raw[catKey || '']).trim() : 'General',
              description: raw[descKey || ''] ? String(raw[descKey || '']).trim() : '',
              icon: raw[iconKey || ''] ? String(raw[iconKey || '']).trim() : '🔗',
              status: raw[statusKey || ''] ? String(raw[statusKey || '']).trim().toUpperCase() : 'ACTIVE',
            });
          }
        }

        if (rows.length === 0) {
          setError('File tidak memiliki data yang valid. Pastikan ada kolom "Name" dan "URL".');
        } else {
          setParsedData(rows);
        }
      },
      error: (err) => {
        setError(`Gagal membaca file: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/admin/links/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengimpor data.');
      }

      showToast(`Berhasil mengimpor ${data.importedCount} tautan! 🎉`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat import.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sample = `Name,URL,Category,Description,Icon,Status
Looker Studio Dashboard,https://lookerstudio.google.com/reporting/demo,Dashboard,Dashboard Monitoring Mesin Produksi,📊,ACTIVE
CMMS Work Order,https://cmms.company.internal/wo,CMMS,Sistem perintah kerja teknisi,📋,ACTIVE
Sparepart Stock,https://wms.company.internal/spareparts,Sparepart,Database ketersediaan suku cadang,📦,ACTIVE`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'template_import_linkhub.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Data Link (CSV / Spreadsheet)</h2>
              <p className="text-xs text-slate-500">Unggah file CSV untuk menambahkan banyak tautan sekaligus ke database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-brand-50/20 transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-slate-100 group-hover:bg-brand-100 text-slate-500 group-hover:text-brand-600 flex items-center justify-center transition">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">
              {fileName ? fileName : 'Klik untuk memilih file CSV'}
            </p>
            <p className="text-xs text-slate-500">Mendukung file format .CSV dengan kolom Name, URL, Category, Description</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline underline-offset-2"
            >
              📥 Download Contoh Template CSV
            </button>
            {parsedData.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {parsedData.length} tautan siap diimport
              </span>
            )}
          </div>

          {/* Table Preview */}
          {parsedData.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 sticky top-0 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">No</th>
                    <th className="p-2.5">Nama Link</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">URL</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800 truncate max-w-[140px]">{row.name}</td>
                      <td className="p-2.5 truncate max-w-[90px]">{row.category}</td>
                      <td className="p-2.5 font-mono text-[11px] truncate max-w-[180px] text-blue-600">{row.url}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                          {row.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={parsedData.length === 0 || loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{loading ? 'Mengimpor Data...' : `Import ${parsedData.length} Link ke Database`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
