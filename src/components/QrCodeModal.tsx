'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkName: string;
  url: string;
  icon?: string;
}

export default function QrCodeModal({ isOpen, onClose, linkName, url, icon = '🔗' }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          {icon}
        </div>

        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{linkName}</h3>
        <p className="text-xs text-slate-500 mb-5">Scan QR Code dengan kamera smartphone Anda untuk membuka link ini langsung di HP.</p>

        {/* QR Code Container */}
        <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 shadow-inner">
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#f8fafc"
            fgColor="#0f172a"
            level="Q"
            includeMargin={true}
          />
        </div>

        {/* URL Box & Actions */}
        <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl mb-4 border border-slate-200/60">
          <span className="text-xs text-slate-600 truncate text-left mr-2 font-mono flex-1">{url}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm flex items-center space-x-1 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-md shadow-brand-500/20"
        >
          <span>Buka di Tab Baru</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
