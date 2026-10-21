'use client';

import React, { useState } from 'react';
import {
  Network,
  ChevronsDown,
  ChevronsUp,
  Search,
  Copy,
  Check,
  Code
} from 'lucide-react';

interface TreeInspectorProps {
  data: any;
}

export const TreeInspector: React.FC<TreeInspectorProps> = ({ data }) => {
  const [search, setSearch] = useState('');
  const [expandAllKey, setExpandAllKey] = useState<number>(0);
  const [collapseAllKey, setCollapseAllKey] = useState<number>(0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {/* Ribbon Bar */}
      <div className="bg-surface-card border-b border-surface-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <Network className="w-4 h-4 text-blue-400" />
            <span>Interactive Tree Explorer</span>
          </div>

          <div className="h-4 w-px bg-surface-border hidden sm:block" />

          {/* Search Key or Value */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-subtle border border-surface-border rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandAllKey((k) => k + 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span>Expand All</span>
          </button>

          <button
            onClick={() => setCollapseAllKey((k) => k + 1)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Main Tree Container */}
      <div className="flex-1 p-6 overflow-auto font-mono text-xs select-none">
        {data === null || data === undefined ? (
          <div className="text-center text-slate-500 py-16">
            <Code className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">No valid JSON loaded</p>
            <p className="text-xs text-slate-500 mt-1">Please enter valid JSON in the Formatter tab</p>
          </div>
        ) : (
          <TreeNode
            keyName={null}
            val={data}
            path="$"
            search={search.toLowerCase().trim()}
            expandAllKey={expandAllKey}
            collapseAllKey={collapseAllKey}
          />
        )}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  keyName: string | number | null;
  val: any;
  path: string;
  search: string;
  expandAllKey: number;
  collapseAllKey: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  val,
  path,
  search,
  expandAllKey,
  collapseAllKey
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedVal, setCopiedVal] = useState(false);

  React.useEffect(() => {
    if (expandAllKey > 0) setCollapsed(false);
  }, [expandAllKey]);

  React.useEffect(() => {
    if (collapseAllKey > 0) setCollapsed(true);
  }, [collapseAllKey]);

  const isObject = typeof val === 'object' && val !== null;
  const isArray = Array.isArray(val);

  const nodePath =
    keyName !== null
      ? isArray || !isNaN(Number(keyName))
        ? `${path}[${keyName}]`
        : `${path}.${keyName}`
      : path;

  const textRepresentation = String(val).toLowerCase();
  const keyRepresentation = String(keyName || '').toLowerCase();
  const isMatch =
    search === '' ||
    keyRepresentation.includes(search) ||
    textRepresentation.includes(search);

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nodePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1200);
  };

  const handleCopyVal = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(isObject ? JSON.stringify(val, null, 2) : String(val));
    setCopiedVal(true);
    setTimeout(() => setCopiedVal(false), 1200);
  };

  return (
    <div className={`my-1 pl-4 border-l border-slate-800 transition-opacity ${isMatch ? 'opacity-100' : 'opacity-30'}`}>
      <div className="flex items-center gap-1.5 py-0.5 hover:bg-surface-subtle/50 rounded px-1 group">
        {isObject ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span className="w-4 h-4 text-center text-slate-600">•</span>
        )}

        {/* Key */}
        {keyName !== null && (
          <span className="text-blue-300 font-semibold">
            {typeof keyName === 'number' ? `[${keyName}]` : `"${keyName}"`}
            <span className="text-slate-500">: </span>
          </span>
        )}

        {/* Value or Badge */}
        {isObject ? (
          <span
            onClick={() => setCollapsed(!collapsed)}
            className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-surface-subtle text-indigo-300 border border-surface-border cursor-pointer"
          >
            {isArray ? `Array [${val.length}]` : `Object {${Object.keys(val).length}}`}
          </span>
        ) : typeof val === 'string' ? (
          <span className="text-emerald-400">&quot;{val}&quot;</span>
        ) : typeof val === 'number' ? (
          <span className="text-amber-400 font-bold">{val}</span>
        ) : typeof val === 'boolean' ? (
          <span className="text-purple-400 font-bold">{String(val)}</span>
        ) : val === null ? (
          <span className="text-slate-500 italic">null</span>
        ) : (
          <span className="text-slate-300">{String(val)}</span>
        )}

        {/* Hover Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
          <button
            onClick={handleCopyPath}
            className="px-1.5 py-0.5 rounded bg-surface-card hover:bg-surface-hover border border-surface-border text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            title={`Copy JSONPath: ${nodePath}`}
          >
            {copiedPath ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            <span>Path</span>
          </button>

          <button
            onClick={handleCopyVal}
            className="px-1.5 py-0.5 rounded bg-surface-card hover:bg-surface-hover border border-surface-border text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            title="Copy value"
          >
            {copiedVal ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            <span>Val</span>
          </button>
        </div>
      </div>

      {/* Children (if expanded) */}
      {isObject && !collapsed && (
        <div className="ml-1">
          {isArray
            ? val.map((item: any, idx: number) => (
                <TreeNode
                  key={idx}
                  keyName={idx}
                  val={item}
                  path={nodePath}
                  search={search}
                  expandAllKey={expandAllKey}
                  collapseAllKey={collapseAllKey}
                />
              ))
            : Object.keys(val).map((k) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  val={val[k]}
                  path={nodePath}
                  search={search}
                  expandAllKey={expandAllKey}
                  collapseAllKey={collapseAllKey}
                />
              ))}
        </div>
      )}
    </div>
  );
};
