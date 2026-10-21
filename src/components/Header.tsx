'use client';

import React, { useState } from 'react';
import { ActiveTab } from '@/types';
import {
  Layers,
  ChevronDown,
  Maximize,
  Minimize,
  ExternalLink,
  AlignLeft,
  Network,
  ArrowRightLeft,
  Search,
  GitCompare
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [suiteOpen, setSuiteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border px-4 flex items-center justify-between gap-4 select-none flex-shrink-0 z-40">
      {/* Brand & Suite Switcher */}
      <div className="flex items-center gap-3">
        <a href="https://apps.abishek.in" className="flex items-center gap-2 group text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Braces className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">
              JSON<span className="text-blue-400">Master</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PRO
            </span>
          </div>
        </a>

        {/* Suite Switcher */}
        <div className="relative">
          <button
            onClick={() => setSuiteOpen(!suiteOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface-subtle hover:bg-surface-hover border border-surface-border px-2.5 py-1.5 rounded-md transition-colors"
          >
            <span>All Tools</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {suiteOpen && (
            <div
              className="absolute top-full left-0 mt-1.5 w-60 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5"
              onMouseLeave={() => setSuiteOpen(false)}
            >
              <a href="https://apps.abishek.in" className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 rounded-lg">
                Tools & Apps Hub (apps.abishek.in)
              </a>
              <div className="h-px bg-surface-border my-1" />
              <a href="https://json.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600/20 rounded-lg">
                JSON Master Suite
              </a>
              <a href="https://base64.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Base64 Studio
              </a>
              <a href="https://compiler.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Web Compiler (HTML/CSS/JS)
              </a>
              <a href="https://md.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Markdown Studio Pro
              </a>
              <a href="https://prettier.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Prettier Code Formatter
              </a>
              <a href="https://image.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Image Compressor Pro
              </a>
              <a href="https://pdf.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                PDF Toolkit
              </a>
              <a href="https://youtube.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                YouTube Downloader
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <nav className="flex items-center bg-surface-subtle border border-surface-border rounded-lg p-1 gap-1">
        <button
          onClick={() => setActiveTab('format')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'format' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Format & Validate</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'tree' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Tree Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('convert')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'convert' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Convert Format</span>
        </button>

        <button
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'query' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>JSONPath Query</span>
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'diff' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>JSON Diff</span>
        </button>
      </nav>

      {/* Fullscreen & All Apps */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <a
          href="https://apps.abishek.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 shadow-sm"
        >
          <span>All Apps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
