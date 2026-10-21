import { JsonMetrics, DiffEntry } from '@/types';

export function bytesToSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateMetrics(obj: any, text: string): JsonMetrics {
  let objects = 0;
  let arrays = 0;
  let keys = 0;
  let maxDepth = 0;

  function traverse(item: any, depth: number) {
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(item)) {
      arrays++;
      for (const el of item) traverse(el, depth + 1);
    } else if (typeof item === 'object' && item !== null) {
      objects++;
      const itemKeys = Object.keys(item);
      keys += itemKeys.length;
      for (const k of itemKeys) traverse(item[k], depth + 1);
    }
  }

  if (obj !== null && obj !== undefined) {
    traverse(obj, 1);
  }

  const lines = text.trim() ? text.split('\n').length : 0;
  const byteSize = new TextEncoder().encode(text).length;

  return { objects, arrays, keys, maxDepth, byteSize, lines };
}

export function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc: any, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

export function repairJsonText(text: string): string {
  let repaired = text;

  // Strip single-line and multi-line comments
  repaired = repaired.replace(/\/\/.*$/gm, '');
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');

  // Convert Python/JS keywords
  repaired = repaired
    .replace(/\bNone\b/g, 'null')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bundefined\b/g, 'null');

  // Replace single-quoted strings with double quotes
  repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

  // Quote unquoted object keys (e.g. { name: "val" } -> { "name": "val" })
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // Strip trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*([\]}])/g, '$1');

  return repaired;
}

export function jsonToTypescript(obj: any, rootName = 'RootObject'): string {
  function getType(val: any): string {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      return `${getType(val[0])}[]`;
    }
    if (typeof val === 'object') return 'object';
    return typeof val;
  }

  const interfaces: string[] = [];
  function parseObject(o: Record<string, any>, name: string) {
    const lines = [`export interface ${name} {`];
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        const subName = k.charAt(0).toUpperCase() + k.slice(1);
        lines.push(`  ${k}: ${subName};`);
        parseObject(v, subName);
      } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
        const subName = k.charAt(0).toUpperCase() + k.slice(1) + 'Item';
        lines.push(`  ${k}: ${subName}[];`);
        parseObject(v[0], subName);
      } else {
        lines.push(`  ${k}: ${getType(v)};`);
      }
    }
    lines.push('}');
    interfaces.push(lines.join('\n'));
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      parseObject(obj[0], 'Item');
      interfaces.push(`export type ${rootName} = Item[];`);
    } else {
      interfaces.push(`export type ${rootName} = ${getType(obj)};`);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    parseObject(obj, rootName);
  }

  return interfaces.reverse().join('\n\n');
}

export function jsonToCsv(arr: any): string {
  let list = arr;
  if (!Array.isArray(list) || list.length === 0) {
    if (typeof list === 'object' && list !== null) {
      list = [list];
    } else {
      return 'Error: Top level JSON must be an array of objects to convert to CSV.';
    }
  }

  const headers: string[] = Array.from(new Set(list.flatMap((o: any) => Object.keys(o))));
  const csvLines = [headers.join(',')];
  for (const item of list) {
    const row = headers.map((h: string) => {
      const obj = item as Record<string, any>;
      let val = obj[h] !== undefined ? obj[h] : '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvLines.push(row.join(','));
  }
  return csvLines.join('\n');
}

export function jsonToYaml(obj: any, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map((item) => `${pad}- ${jsonToYaml(item, indent + 1).trim()}`).join('\n');
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj)
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${typeof v === 'string' ? `"${v}"` : v}`;
      })
      .join('\n');
  }
  return `${pad}${obj}`;
}

export function jsonToXml(obj: any, root = 'root'): string {
  function toXml(v: any, tag: string): string {
    if (Array.isArray(v)) {
      return v.map((item) => toXml(item, 'item')).join('');
    } else if (typeof v === 'object' && v !== null) {
      let body = '';
      for (const [k, val] of Object.entries(v)) {
        body += toXml(val, k);
      }
      return `<${tag}>${body}</${tag}>`;
    }
    return `<${tag}>${v}</${tag}>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj, root)}`;
}

export function evaluateJsonPath(data: any, query: string): any {
  if (!query.trim()) return data;
  let path = query.trim().replace(/^\$\.?/, '');
  const segments = path.split(/\.|\[|\]/).filter(Boolean);

  let current: any[] = [data];

  for (const seg of segments) {
    const next: any[] = [];
    for (const item of current) {
      if (item === null || item === undefined) continue;
      if (seg === '*') {
        if (Array.isArray(item)) next.push(...item);
        else if (typeof item === 'object') next.push(...Object.values(item));
      } else if (item[seg] !== undefined) {
        next.push(item[seg]);
      }
    }
    current = next;
  }

  return current.length === 1 ? current[0] : current;
}

export function computeJsonDiff(obj1: any, obj2: any): DiffEntry[] {
  const diffs: DiffEntry[] = [];

  function findDiffs(a: any, b: any, path = '$') {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      if (a !== b) {
        diffs.push({
          type: 'changed',
          path,
          message: `Changed: "${JSON.stringify(a)}" ➜ "${JSON.stringify(b)}"`
        });
      }
      return;
    }

    const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
    for (const k of allKeys) {
      const subPath = Array.isArray(a) || Array.isArray(b) ? `${path}[${k}]` : `${path}.${k}`;
      if (!(k in a)) {
        diffs.push({
          type: 'added',
          path: subPath,
          message: `Added: ${JSON.stringify(b[k])}`
        });
      } else if (!(k in b)) {
        diffs.push({
          type: 'removed',
          path: subPath,
          message: `Removed: ${JSON.stringify(a[k])}`
        });
      } else if (typeof a[k] === 'object' && a[k] !== null && typeof b[k] === 'object' && b[k] !== null) {
        findDiffs(a[k], b[k], subPath);
      } else if (a[k] !== b[k]) {
        diffs.push({
          type: 'changed',
          path: subPath,
          message: `Changed: "${a[k]}" ➜ "${b[k]}"`
        });
      }
    }
  }

  findDiffs(obj1, obj2);
  return diffs;
}
