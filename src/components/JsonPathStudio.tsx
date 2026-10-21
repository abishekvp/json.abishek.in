'use client';

import React, { useState, useMemo } from 'react';
import { evaluateJsonPath } from '@/lib/json';
import {
  Search,
  Copy,
  Check,
  Terminal,
  Sparkles
} from 'lucide-react';

interface JsonPathStudioProps {
  data: any;
}

export const JsonPathStudio: React.FC<JsonPathStudioProps> = ({ data }) => {
  const [query, setQuery] = useState('$.items[*].name');
  const [copied, setCopied] = useState(false);

  const { resultText, count } = useMemo(() => {
    if (!data) {
      return { resultText: '// Please enter valid JSON in the Formatter tab first', count: 0 };
    }

    try {
      const res = evaluateJsonPath(data, query);
      const isArr = Array.isArray(res);
      return {
        resultText: JSON.stringify(res, null, 2),
        count: isArr ? res.length : res !== undefined ? 1 : 0
      };
    } catch (e: any) {
      return { resultText: `Query Error: ${e?.message || 'Invalid syntax'}`, count: 0 };
    }
  }, [data, query]);

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLines = (code: string) => {
    const lines = Math.max(code.split('\n').length, 1);
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {/* Top Search Query Bar */}
      <div className="bg-surface-card border-b border-surface-border p-4 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. $.items[*].name or $.customer.tier"
              className="w-full bg-surface-subtle border border-surface-border rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-400 font-medium">Quick Suggestions:</span>
          {['$.*', '$.items[*]', '$.items[0]', '$.customer.name', '$.billing.total'].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="px-2 py-0.5 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 font-mono text-[11px] transition-colors"
            >
              {chip}
            </button>
          ))}
          <span className="text-slate-500 ml-auto font-mono text-[11px]">
            {count} {count === 1 ? 'result' : 'results'} matched
          </span>
        </div>
      </div>

      {/* Query Result Editor Pane */}
      <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
        <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
          <pre className="m-0 p-0">{renderLines(resultText)}</pre>
        </div>

        <textarea
          readOnly
          value={resultText}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
        />
      </div>
    </div>
  );
};
