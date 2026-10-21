'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  bytesToSize,
  calculateMetrics,
  sortObjectKeys,
  repairJsonText
} from '@/lib/json';
import {
  Wand2,
  ArrowDownAZ,
  Copy,
  Check,
  Download,
  Trash2,
  UploadCloud,
  ClipboardPaste,
  AlertCircle,
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface FormatStudioProps {
  rawInput: string;
  setRawInput: (val: string) => void;
  parsedData: any;
  setParsedData: (val: any) => void;
}

export const FormatStudio: React.FC<FormatStudioProps> = ({
  rawInput,
  setRawInput,
  parsedData,
  setParsedData
}) => {
  const [indent, setIndent] = useState<number | string>(2);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting and Validation
  const { formattedOutput, error, metrics, isValid } = useMemo(() => {
    if (!rawInput.trim()) {
      return {
        formattedOutput: '',
        error: '',
        metrics: calculateMetrics(null, ''),
        isValid: null
      };
    }

    try {
      const parsed = JSON.parse(rawInput);
      setParsedData(parsed);

      let output = '';
      if (indent === 'minify') {
        output = JSON.stringify(parsed);
      } else if (indent === '\t') {
        output = JSON.stringify(parsed, null, '\t');
      } else {
        output = JSON.stringify(parsed, null, Number(indent));
      }

      const met = calculateMetrics(parsed, output);
      return { formattedOutput: output, error: '', metrics: met, isValid: true };
    } catch (err: any) {
      let msg = err?.message || 'Invalid JSON syntax';
      const lineColMatch = msg.match(/line (\d+) column (\d+)/i) || msg.match(/position (\d+)/i);
      let extraHint = '';
      if (lineColMatch) {
        if (lineColMatch[2]) {
          extraHint = ` (Near Line ${lineColMatch[1]}, Col ${lineColMatch[2]})`;
        } else {
          const pos = parseInt(lineColMatch[1], 10);
          const line = rawInput.substring(0, pos).split('\n').length;
          extraHint = ` (Near Line ${line})`;
        }
      }

      return {
        formattedOutput: '',
        error: `${msg}${extraHint}`,
        metrics: calculateMetrics(null, rawInput),
        isValid: false
      };
    }
  }, [rawInput, indent, setParsedData]);

  const handleRepair = () => {
    if (!rawInput.trim()) return;
    const fixed = repairJsonText(rawInput);
    try {
      const parsed = JSON.parse(fixed);
      setRawInput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setRawInput(fixed);
    }
  };

  const handleSortKeys = () => {
    if (!parsedData) return;
    const sorted = sortObjectKeys(parsedData);
    setRawInput(JSON.stringify(sorted, null, typeof indent === 'number' ? indent : 2));
  };

  const handleCopy = () => {
    if (!formattedOutput) return;
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawInput(text);
    } catch (e) {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRawInput(evt.target?.result as string);
    };
    reader.readAsText(file);
  };

  const renderLines = (text: string) => {
    const count = Math.max(text.split('\n').length, 1);
    return Array.from({ length: count }, (_, i) => i + 1).join('\n');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {/* Action Toolbar */}
      <div className="bg-surface-card border-b border-surface-border px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Indent selector */}
          <div className="inline-flex rounded-lg bg-surface-subtle p-0.5 border border-surface-border">
            <button
              onClick={() => setIndent(2)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                indent === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => setIndent(4)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                indent === 4 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              4 Spaces
            </button>
            <button
              onClick={() => setIndent('\t')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                indent === '\t' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tab
            </button>
            <button
              onClick={() => setIndent('minify')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                indent === 'minify' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Minify
            </button>
          </div>

          <button
            onClick={handleRepair}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold transition-colors"
            title="Automatically fix unquoted keys, single quotes, trailing commas, comments"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Repair JSON</span>
          </button>

          <button
            onClick={handleSortKeys}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Sort object keys alphabetically"
          >
            <ArrowDownAZ className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort Keys</span>
          </button>

        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
            title="Upload local JSON file"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          <button
            onClick={() => setRawInput('')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-red-500/10 border border-surface-border hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Error / Status Alert */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-xs text-red-400 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate">{error}</span>
          </div>
          <button
            onClick={handleRepair}
            className="px-2.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-[11px] flex-shrink-0"
          >
            Auto Repair Now
          </button>
        </div>
      )}

      {/* Dual Fullscreen Editor Pane */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-border min-h-0">
        {/* Left: Raw Input */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Input JSON</span>
            </div>

            <div className="flex items-center gap-2">
              {isValid === true && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Valid JSON
                </span>
              )}
              {isValid === false && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  Invalid Syntax
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                {rawInput.length.toLocaleString()} chars
              </span>
            </div>
          </div>

          <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
            <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
              <pre className="m-0 p-0">{renderLines(rawInput)}</pre>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
            />
          </div>
        </div>

        {/* Right: Formatted Output */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Formatted Output</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-2">
                {metrics.lines.toLocaleString()} lines · {bytesToSize(metrics.byteSize)}
              </span>

              <button
                onClick={handleCopy}
                disabled={!formattedOutput}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-slate-300 hover:text-white rounded hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!formattedOutput}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none"
                title="Download formatted JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
            <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
              <pre className="m-0 p-0">{renderLines(formattedOutput)}</pre>
            </div>
            <textarea
              readOnly
              value={formattedOutput}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
            />
          </div>
        </div>
      </div>

      {/* Metrics & Statistics Bar */}
      <div className="h-10 bg-surface-card border-t border-surface-border px-4 flex items-center justify-between text-xs text-slate-400 select-none flex-shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Size:</span>
            <span className="text-slate-200 font-mono">{bytesToSize(metrics.byteSize)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Lines:</span>
            <span className="text-slate-200 font-mono">{metrics.lines.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Objects:</span>
            <span className="text-slate-200 font-mono">{metrics.objects.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Arrays:</span>
            <span className="text-slate-200 font-mono">{metrics.arrays.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Keys:</span>
            <span className="text-slate-200 font-mono">{metrics.keys.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Max Depth:</span>
            <span className="text-slate-200 font-mono">{metrics.maxDepth}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden md:block">
          RFC 8259 Standard · Real-time AST Validator
        </div>
      </div>
    </div>
  );
};
