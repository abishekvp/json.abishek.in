'use client';

import React, { useState, useMemo } from 'react';
import { ConvertTarget } from '@/types';
import {
  jsonToTypescript,
  jsonToCsv,
  jsonToYaml,
  jsonToXml
} from '@/lib/json';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Download,
  Code2
} from 'lucide-react';

interface ConvertersProps {
  data: any;
}

export const Converters: React.FC<ConvertersProps> = ({ data }) => {
  const [target, setTarget] = useState<ConvertTarget>('ts');
  const [copied, setCopied] = useState(false);

  const convertedResult = useMemo(() => {
    if (!data) return '// Please enter valid JSON in the Formatter tab to convert';

    try {
      if (target === 'ts') return jsonToTypescript(data);
      if (target === 'csv') return jsonToCsv(data);
      if (target === 'yaml') return jsonToYaml(data);
      if (target === 'xml') return jsonToXml(data);
      if (target === 'python') {
        return `# Python Dictionary representation\ndata = ${JSON.stringify(data, null, 4)
          .replace(/true/g, 'True')
          .replace(/false/g, 'False')
          .replace(/null/g, 'None')}`;
      }
      if (target === 'go') {
        return `// Go Struct representation\n${jsonToTypescript(data)
          .replace(/interface/g, 'type')
          .replace(/export /g, '')}`;
      }
      return '';
    } catch (err: any) {
      return `Conversion Error: ${err?.message || 'Failed'}`;
    }
  }, [data, target]);

  const handleCopy = () => {
    if (!convertedResult) return;
    navigator.clipboard.writeText(convertedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!convertedResult) return;
    const ext = target === 'ts' ? 'ts' : target === 'python' ? 'py' : target;
    const blob = new Blob([convertedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderLines = (code: string) => {
    const count = Math.max(code.split('\n').length, 1);
    return Array.from({ length: count }, (_, i) => i + 1).join('\n');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {/* Ribbon */}
      <div className="bg-surface-card border-b border-surface-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Format & Schema Converter</span>
          </div>

          <div className="h-4 w-px bg-surface-border" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Export Target:</span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as ConvertTarget)}
              className="bg-surface-subtle border border-surface-border rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ts">TypeScript Interfaces</option>
              <option value="csv">CSV (Flat Table)</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML Document</option>
              <option value="go">Go Structs</option>
              <option value="python">Python Dict / Class</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Output'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Fullscreen Output Pane */}
      <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
        <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
          <pre className="m-0 p-0">{renderLines(convertedResult)}</pre>
        </div>

        <textarea
          readOnly
          value={convertedResult}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
        />
      </div>
    </div>
  );
};
