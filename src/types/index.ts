export type ActiveTab = 'format' | 'tree' | 'convert' | 'query' | 'diff';

export type ConvertTarget = 'ts' | 'csv' | 'yaml' | 'xml' | 'python' | 'go';

export interface JsonMetrics {
  objects: number;
  arrays: number;
  keys: number;
  maxDepth: number;
  byteSize: number;
  lines: number;
}

export interface DiffEntry {
  type: 'added' | 'removed' | 'changed';
  path: string;
  message: string;
}
