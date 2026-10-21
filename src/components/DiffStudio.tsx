'use client';

import React, { useState } from 'react';
import { computeJsonDiff } from '@/lib/json';
import { DiffEntry } from '@/types';
import {
  GitCompare,
  Trash2,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  RefreshCw
} from 'lucide-react';

export const DiffStudio: React.FC = () => {
  const [jsonA, setJsonA] = useState('');
  const [jsonB, setJsonB] = useState('');

  const [diffs, setDiffs] = useState<DiffEntry[]>([]);
  const [hasCompared, setHasCompared] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = () => {
    setError('');
    try {
      const a = JSON.parse(jsonA || '{}');
      const b = JSON.parse(jsonB || '{}');
      const results = computeJsonDiff(a, b);
      setDiffs(results);
      setHasCompared(true);
    } catch (err: any) {
      setError(`Diff Error: ${err?.message || 'Invalid JSON'}`);
    }
  };

  const handleClear = () => {
    setJsonA('');
    setJsonB('');
    setDiffs([]);
    setHasCompared(false);
    setError('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {/* Action Toolbar */}
      <div className="bg-surface-card border-b border-surface-border px-4 py-2.5 flex items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white">Semantic JSON Diff</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCompare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare JSONs</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-red-500/10 border border-surface-border hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-xs text-red-400 flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Main Split Comparison */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-border min-h-0">
        {/* Left: Document A */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <span className="font-semibold text-slate-200">Original JSON (A)</span>
            <span>{jsonA.length} chars</span>
          </div>
          <div className="flex-1 relative min-h-0">
            <textarea
              value={jsonA}
              onChange={(e) => setJsonA(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 whitespace-pre"
            />
          </div>
        </div>

        {/* Right: Document B */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <span className="font-semibold text-slate-200">Modified JSON (B)</span>
            <span>{jsonB.length} chars</span>
          </div>
          <div className="flex-1 relative min-h-0">
            <textarea
              value={jsonB}
              onChange={(e) => setJsonB(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 whitespace-pre"
            />
          </div>
        </div>
      </div>

      {/* Bottom Diff Results Drawer */}
      <div className="h-48 border-t border-surface-border bg-surface-darker flex flex-col flex-shrink-0 overflow-hidden">
        <div className="h-8 px-3 border-b border-surface-border flex items-center justify-between text-xs bg-surface-card font-semibold text-slate-300">
          <span>Comparison Results</span>
          {hasCompared && (
            <span className="text-[11px] font-mono text-slate-400">
              {diffs.length === 0 ? 'Documents are identical' : `${diffs.length} differences detected`}
            </span>
          )}
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 font-mono text-xs">
          {!hasCompared ? (
            <div className="text-slate-500 text-center py-8">
              Click &quot;Compare JSONs&quot; above to inspect additions, deletions, and modifications.
            </div>
          ) : diffs.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 p-2">
              <CheckCircle className="w-4 h-4" />
              <span>Both JSON documents are semantically identical!</span>
            </div>
          ) : (
            diffs.map((d, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2 rounded border ${
                  d.type === 'added'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : d.type === 'removed'
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                }`}
              >
                <div className="mt-0.5">
                  {d.type === 'added' && <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {d.type === 'removed' && <MinusCircle className="w-3.5 h-3.5 text-red-400" />}
                  {d.type === 'changed' && <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />}
                </div>
                <div className="flex-1 break-words">
                  <span className="font-semibold text-white mr-2">[{d.path}]</span>
                  <span>{d.message}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
