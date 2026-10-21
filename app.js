/**
 * JSON Master Studio — Comprehensive Client Application
 * Formatter, Validator, Tree Inspector, Converters, JSONPath & Diff
 */

// ================= THEME & SUITE SWITCHER =================
const themeToggle = document.getElementById('themeToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const switcherBtn = document.getElementById('switcherBtn');
const switcherMenu = document.getElementById('switcherMenu');

const savedTheme = localStorage.getItem('json_theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.remove('dark-theme');
  document.body.classList.add('light-theme');
}

themeToggle?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('json_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('json_theme', 'dark');
  }
});

fullscreenToggle?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    document.body.classList.add('fullscreen-mode');
  } else {
    document.exitFullscreen().catch(() => {});
    document.body.classList.remove('fullscreen-mode');
  }
});

switcherBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  switcherMenu?.classList.toggle('show');
});

document.addEventListener('click', () => {
  switcherMenu?.classList.remove('show');
});

// ================= TAB NAVIGATION =================
const tabBtns = document.querySelectorAll('.mode-tabs .tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tabName = btn.dataset.tab;
    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) targetPane.classList.add('active');

    // Tab hooks
    if (tabName === 'tree') renderTree();
    if (tabName === 'convert') runConvert();
    if (tabName === 'query') runQuery();
  });
});

// ================= TAB 1: FORMAT & VALIDATE =================
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const editorLines = document.getElementById('editorLines');
const outputLines = document.getElementById('outputLines');
const errorBanner = document.getElementById('errorBanner');
const statusBadge = document.getElementById('statusBadge');
const outputMeta = document.getElementById('outputMeta');

// Metrics
const statSize = document.getElementById('statSize');
const statLines = document.getElementById('statLines');
const statObjects = document.getElementById('statObjects');
const statArrays = document.getElementById('statArrays');
const statKeys = document.getElementById('statKeys');
const statDepth = document.getElementById('statDepth');

// Buttons
const btnFormat2 = document.getElementById('btnFormat2');
const btnFormat4 = document.getElementById('btnFormat4');
const btnFormatTab = document.getElementById('btnFormatTab');
const btnMinify = document.getElementById('btnMinify');
const btnRepair = document.getElementById('btnRepair');
const btnSortKeys = document.getElementById('btnSortKeys');
const btnClear = document.getElementById('btnClear');
const btnPaste = document.getElementById('btnPaste');
const btnCopy = document.getElementById('btnCopy');
const btnDownload = document.getElementById('btnDownload');
const fileUpload = document.getElementById('fileUpload');

let parsedData = null;

function updateLineNumbers(textarea, lineContainer) {
  const lineCount = (textarea.value || '').split('\n').length;
  let numbersHtml = '';
  for (let i = 1; i <= lineCount; i++) {
    numbersHtml += `<div>${i}</div>`;
  }
  lineContainer.innerHTML = numbersHtml;
}

jsonInput?.addEventListener('scroll', () => {
  editorLines.scrollTop = jsonInput.scrollTop;
});

jsonOutput?.addEventListener('scroll', () => {
  outputLines.scrollTop = jsonOutput.scrollTop;
});

function calculateMetrics(obj) {
  let objects = 0;
  let arrays = 0;
  let keys = 0;
  let maxDepth = 0;

  function traverse(item, depth) {
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

  traverse(obj, 1);
  return { objects, arrays, keys, maxDepth };
}

function bytesToSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateAndFormat(indent = 2, sort = false) {
  const raw = jsonInput.value.trim();
  updateLineNumbers(jsonInput, editorLines);

  if (!raw) {
    jsonOutput.value = '';
    updateLineNumbers(jsonOutput, outputLines);
    statusBadge.textContent = 'Empty';
    statusBadge.className = 'status-indicator';
    errorBanner.classList.remove('show');
    outputMeta.textContent = '0 lines · 0 B';
    statSize.textContent = '0 B';
    statLines.textContent = '0';
    statObjects.textContent = '0';
    statArrays.textContent = '0';
    statKeys.textContent = '0';
    statDepth.textContent = '0';
    parsedData = null;
    return;
  }

  try {
    let obj = JSON.parse(raw);

    if (sort) {
      obj = sortObjectKeys(obj);
    }

    parsedData = obj;

    const formatted = indent === 'minify'
      ? JSON.stringify(obj)
      : (indent === '\t' ? JSON.stringify(obj, null, '\t') : JSON.stringify(obj, null, indent));

    jsonOutput.value = formatted;
    updateLineNumbers(jsonOutput, outputLines);

    statusBadge.textContent = 'Valid JSON';
    statusBadge.className = 'status-indicator status-valid';
    errorBanner.classList.remove('show');

    const lineCount = formatted.split('\n').length;
    const byteCount = new TextEncoder().encode(formatted).length;
    outputMeta.textContent = `${lineCount.toLocaleString()} lines · ${bytesToSize(byteCount)}`;

    // Metrics
    const metrics = calculateMetrics(obj);
    statSize.textContent = bytesToSize(byteCount);
    statLines.textContent = lineCount.toLocaleString();
    statObjects.textContent = metrics.objects.toLocaleString();
    statArrays.textContent = metrics.arrays.toLocaleString();
    statKeys.textContent = metrics.keys.toLocaleString();
    statDepth.textContent = metrics.maxDepth;

  } catch (err) {
    statusBadge.textContent = 'Invalid JSON';
    statusBadge.className = 'status-indicator status-invalid';

    // Parse error location
    let errMsg = err.message;
    const lineColMatch = errMsg.match(/line (\d+) column (\d+)/i) || errMsg.match(/position (\d+)/i);
    let extraHint = '';

    if (lineColMatch) {
      if (lineColMatch[2]) {
        extraHint = ` (Near Line ${lineColMatch[1]}, Col ${lineColMatch[2]})`;
      } else {
        // approximate line from char position
        const pos = parseInt(lineColMatch[1], 10);
        const line = raw.substring(0, pos).split('\n').length;
        extraHint = ` (Near Line ${line})`;
      }
    }

    errorBanner.textContent = `Syntax Error: ${errMsg}${extraHint}. Click "Repair JSON" above to automatically fix common syntax issues.`;
    errorBanner.classList.add('show');
  }
}

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

// Auto-Repair Engine
function repairJsonText(text) {
  let repaired = text;

  // Remove single line comments // ...
  repaired = repaired.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments /* ... */
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');

  // Convert Python None, True, False to null, true, false
  repaired = repaired.replace(/\bNone\b/g, 'null')
                     .replace(/\bTrue\b/g, 'true')
                     .replace(/\bFalse\b/g, 'false');

  // Replace single-quoted string literals with double quotes
  // (Cautious replacement for keys and values)
  repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

  // Quote unquoted keys: e.g. { foo: "bar" } -> { "foo": "bar" }
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // Remove trailing commas before } or ]
  repaired = repaired.replace(/,\s*([\]}])/g, '$1');

  return repaired;
}

btnRepair?.addEventListener('click', () => {
  const original = jsonInput.value;
  if (!original.trim()) return;

  const fixed = repairJsonText(original);
  try {
    const parsed = JSON.parse(fixed);
    jsonInput.value = JSON.stringify(parsed, null, 2);
    validateAndFormat(2);
    alert('✨ JSON successfully repaired and formatted!');
  } catch (e) {
    jsonInput.value = fixed;
    validateAndFormat(2);
    alert('Repaired common syntax issues. Some manual adjustments may still be needed: ' + e.message);
  }
});

btnFormat2?.addEventListener('click', () => validateAndFormat(2));
btnFormat4?.addEventListener('click', () => validateAndFormat(4));
btnFormatTab?.addEventListener('click', () => validateAndFormat('\t'));
btnMinify?.addEventListener('click', () => validateAndFormat('minify'));
btnSortKeys?.addEventListener('click', () => validateAndFormat(2, true));

jsonInput?.addEventListener('input', () => validateAndFormat(2));

btnClear?.addEventListener('click', () => {
  jsonInput.value = '';
  validateAndFormat(2);
});

btnPaste?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    jsonInput.value = text;
    validateAndFormat(2);
  } catch (err) {
    alert('Clipboard access denied. Please press Ctrl+V to paste.');
  }
});

btnCopy?.addEventListener('click', async () => {
  if (!jsonOutput.value) return;
  await navigator.clipboard.writeText(jsonOutput.value);
  btnCopy.textContent = 'Copied!';
  setTimeout(() => btnCopy.textContent = 'Copy', 1800);
});

btnDownload?.addEventListener('click', () => {
  if (!jsonOutput.value) return;
  const blob = new Blob([jsonOutput.value], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'formatted-data.json';
  a.click();
});

// File upload
fileUpload?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    jsonInput.value = evt.target.result;
    validateAndFormat(2);
  };
  reader.readAsText(file);
});

// ================= TAB 2: INTERACTIVE TREE INSPECTOR =================
const treeStage = document.getElementById('treeStage');
const btnExpandAll = document.getElementById('btnExpandAll');
const btnCollapseAll = document.getElementById('btnCollapseAll');
const treeSearchInput = document.getElementById('treeSearchInput');

function buildTreeNode(key, val, currentPath = '$') {
  const node = document.createElement('div');
  node.className = 'tree-node';

  const nodePath = key !== null ? (Array.isArray(val) || !isNaN(key) ? `${currentPath}[${key}]` : `${currentPath}.${key}`) : currentPath;

  const header = document.createElement('span');

  if (typeof val === 'object' && val !== null) {
    const isArr = Array.isArray(val);
    const count = isArr ? val.length : Object.keys(val).length;

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = '▼';

    header.appendChild(toggle);

    if (key !== null) {
      const kSpan = document.createElement('span');
      kSpan.className = 'tree-key';
      kSpan.textContent = `"${key}"`;
      header.appendChild(kSpan);

      const col = document.createElement('span');
      col.className = 'tree-colon';
      col.textContent = ': ';
      header.appendChild(col);
    }

    const badge = document.createElement('span');
    badge.className = 'tree-badge';
    badge.textContent = isArr ? `Array[${count}]` : `Object{${count}}`;
    header.appendChild(badge);

    // Copy path button
    const copyPathBtn = document.createElement('button');
    copyPathBtn.className = 'tree-copy-btn';
    copyPathBtn.title = `Copy Path (${nodePath})`;
    copyPathBtn.textContent = '📋 Path';
    copyPathBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(nodePath);
      copyPathBtn.textContent = '✓ Copied';
      setTimeout(() => copyPathBtn.textContent = '📋 Path', 1200);
    };
    node.appendChild(header);
    node.appendChild(copyPathBtn);

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-children';

    if (isArr) {
      val.forEach((item, idx) => {
        childrenContainer.appendChild(buildTreeNode(idx, item, nodePath));
      });
    } else {
      Object.keys(val).forEach((k) => {
        childrenContainer.appendChild(buildTreeNode(k, val[k], nodePath));
      });
    }

    node.appendChild(childrenContainer);

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCollapsed = childrenContainer.style.display === 'none';
      childrenContainer.style.display = isCollapsed ? 'block' : 'none';
      toggle.textContent = isCollapsed ? '▼' : '►';
    });

  } else {
    // Primitive
    if (key !== null) {
      const kSpan = document.createElement('span');
      kSpan.className = 'tree-key';
      kSpan.textContent = `"${key}"`;
      header.appendChild(kSpan);

      const col = document.createElement('span');
      col.className = 'tree-colon';
      col.textContent = ': ';
      header.appendChild(col);
    }

    const valSpan = document.createElement('span');
    if (typeof val === 'string') {
      valSpan.className = 'tree-val-string';
      valSpan.textContent = `"${val}"`;
    } else if (typeof val === 'number') {
      valSpan.className = 'tree-val-number';
      valSpan.textContent = val;
    } else if (typeof val === 'boolean') {
      valSpan.className = 'tree-val-boolean';
      valSpan.textContent = val;
    } else if (val === null) {
      valSpan.className = 'tree-val-null';
      valSpan.textContent = 'null';
    }
    header.appendChild(valSpan);

    // Copy value button
    const copyValBtn = document.createElement('button');
    copyValBtn.className = 'tree-copy-btn';
    copyValBtn.title = 'Copy value';
    copyValBtn.textContent = '📋';
    copyValBtn.onclick = () => {
      navigator.clipboard.writeText(String(val));
      copyValBtn.textContent = '✓';
      setTimeout(() => copyValBtn.textContent = '📋', 1200);
    };

    node.appendChild(header);
    node.appendChild(copyValBtn);
  }

  return node;
}

function renderTree() {
  if (!parsedData) {
    try {
      parsedData = JSON.parse(jsonInput.value.trim());
    } catch (e) {
      treeStage.innerHTML = '<div class="tree-empty">Please enter valid JSON in the Formatter tab to inspect the interactive tree.</div>';
      return;
    }
  }

  treeStage.innerHTML = '';
  treeStage.appendChild(buildTreeNode(null, parsedData, '$'));
}

btnExpandAll?.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach(c => c.style.display = 'block');
  document.querySelectorAll('.tree-toggle').forEach(t => t.textContent = '▼');
});

btnCollapseAll?.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tree-toggle').forEach(t => t.textContent = '►');
});

treeSearchInput?.addEventListener('input', () => {
  const query = treeSearchInput.value.toLowerCase().trim();
  document.querySelectorAll('.tree-node').forEach(node => {
    if (!query) {
      node.style.opacity = '1';
      return;
    }
    const text = node.textContent.toLowerCase();
    node.style.opacity = text.includes(query) ? '1' : '0.2';
  });
});

// ================= TAB 3: CONVERTERS =================
const convertTargetSelect = document.getElementById('convertTargetSelect');
const btnRunConvert = document.getElementById('btnRunConvert');
const convertedOutput = document.getElementById('convertedOutput');
const btnCopyConverted = document.getElementById('btnCopyConverted');
const btnDownloadConverted = document.getElementById('btnDownloadConverted');

function jsonToTypescript(obj, rootName = 'RootObject') {
  function getType(val) {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      return `${getType(val[0])}[]`;
    }
    if (typeof val === 'object') return 'object';
    return typeof val;
  }

  const interfaces = [];
  function parseObject(o, name) {
    let lines = [`export interface ${name} {`];
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

function jsonToCsv(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    if (typeof arr === 'object' && arr !== null) {
      arr = [arr];
    } else {
      return 'Error: Top level JSON must be an array of objects to convert to CSV.';
    }
  }
  const headers = Array.from(new Set(arr.flatMap(o => Object.keys(o))));
  const csvLines = [headers.join(',')];
  for (const item of arr) {
    const row = headers.map(h => {
      let val = item[h] !== undefined ? item[h] : '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvLines.push(row.join(','));
  }
  return csvLines.join('\n');
}

function jsonToYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => `${pad}- ${jsonToYaml(item, indent + 1).trim()}`).join('\n');
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      }
      return `${pad}${k}: ${typeof v === 'string' ? `"${v}"` : v}`;
    }).join('\n');
  }
  return `${pad}${obj}`;
}

function jsonToXml(obj, root = 'root') {
  function toXml(v, tag) {
    if (Array.isArray(v)) {
      return v.map(item => toXml(item, 'item')).join('');
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

function runConvert() {
  let data = parsedData;
  if (!data) {
    try { data = JSON.parse(jsonInput.value); } catch (e) {
      convertedOutput.value = 'Error: Invalid JSON. Please enter valid JSON first.';
      return;
    }
  }

  const target = convertTargetSelect.value;
  let result = '';
  if (target === 'ts') result = jsonToTypescript(data);
  else if (target === 'csv') result = jsonToCsv(data);
  else if (target === 'yaml') result = jsonToYaml(data);
  else if (target === 'xml') result = jsonToXml(data);
  else if (target === 'python') {
    result = `# Python dict representation\ndata = ${JSON.stringify(data, null, 4).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}`;
  } else if (target === 'go') {
    result = `// Go Struct representation\n${jsonToTypescript(data).replace(/interface/g, 'type').replace(/export /g, '')}`;
  }

  convertedOutput.value = result;
}

btnRunConvert?.addEventListener('click', runConvert);
convertTargetSelect?.addEventListener('change', runConvert);

btnCopyConverted?.addEventListener('click', async () => {
  if (!convertedOutput.value) return;
  await navigator.clipboard.writeText(convertedOutput.value);
  btnCopyConverted.textContent = 'Copied!';
  setTimeout(() => btnCopyConverted.textContent = 'Copy Result', 1500);
});

btnDownloadConverted?.addEventListener('click', () => {
  if (!convertedOutput.value) return;
  const ext = convertTargetSelect.value === 'ts' ? 'ts' : convertTargetSelect.value;
  const blob = new Blob([convertedOutput.value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `converted-output.${ext}`;
  a.click();
});

// ================= TAB 4: JSONPATH QUERY =================
const jsonPathInput = document.getElementById('jsonPathInput');
const btnRunQuery = document.getElementById('btnRunQuery');
const queryResultText = document.getElementById('queryResultText');

function runQuery() {
  let data = parsedData;
  if (!data) {
    try { data = JSON.parse(jsonInput.value); } catch(e) {
      queryResultText.value = 'Please provide valid JSON in the Formatter tab first.';
      return;
    }
  }

  const query = jsonPathInput.value.trim();
  if (!query) {
    queryResultText.value = '';
    return;
  }

  try {
    // Evaluates paths like $.users[*].name, $.items[0], $.customer.name
    let path = query.replace(/^\$\.?/, '');
    const segments = path.split(/\.|\[|\]/).filter(Boolean);

    let current = [data];

    for (const seg of segments) {
      let next = [];
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

    queryResultText.value = JSON.stringify(current.length === 1 ? current[0] : current, null, 2);
  } catch (err) {
    queryResultText.value = `Query Evaluation Error: ${err.message}`;
  }
}

btnRunQuery?.addEventListener('click', runQuery);
jsonPathInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runQuery();
});

// ================= TAB 5: JSON DIFF =================
const diffInputA = document.getElementById('diffInputA');
const diffInputB = document.getElementById('diffInputB');
const btnCompareDiff = document.getElementById('btnCompareDiff');
const btnDiffClear = document.getElementById('btnDiffClear');
const diffResultsPane = document.getElementById('diffResultsPane');

btnDiffClear?.addEventListener('click', () => {
  diffInputA.value = '';
  diffInputB.value = '';
  diffResultsPane.innerHTML = '<div class="diff-empty">Click "Compare JSONs" to inspect differences side-by-side.</div>';
});

function compareDiff() {
  try {
    const a = JSON.parse(diffInputA.value || '{}');
    const b = JSON.parse(diffInputB.value || '{}');

    const diffs = [];

    function findDiffs(obj1, obj2, path = '$') {
      const allKeys = Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)]));
      for (const k of allKeys) {
        const subPath = `${path}.${k}`;
        if (!(k in obj1)) {
          diffs.push({ type: 'added', text: `+ Added [${subPath}]: ${JSON.stringify(obj2[k])}` });
        } else if (!(k in obj2)) {
          diffs.push({ type: 'removed', text: `- Removed [${subPath}]: ${JSON.stringify(obj1[k])}` });
        } else if (typeof obj1[k] === 'object' && obj1[k] !== null && typeof obj2[k] === 'object' && obj2[k] !== null) {
          findDiffs(obj1[k], obj2[k], subPath);
        } else if (obj1[k] !== obj2[k]) {
          diffs.push({ type: 'changed', text: `~ Changed [${subPath}]: "${obj1[k]}" ➜ "${obj2[k]}"` });
        }
      }
    }

    findDiffs(a, b);

    diffResultsPane.innerHTML = '';
    if (diffs.length === 0) {
      diffResultsPane.innerHTML = '<div style="color:var(--success); padding:10px;">✓ Both JSON documents are identical!</div>';
      return;
    }

    diffs.forEach(d => {
      const entry = document.createElement('div');
      entry.className = `diff-entry diff-${d.type}`;
      entry.textContent = d.text;
      diffResultsPane.appendChild(entry);
    });

  } catch (err) {
    diffResultsPane.innerHTML = `<div style="color:var(--danger)">Diff Error: ${err.message}. Please verify both inputs are valid JSON.</div>`;
  }
}

btnCompareDiff?.addEventListener('click', compareDiff);

// Initialize the empty editor and its status indicators.
validateAndFormat(2);
