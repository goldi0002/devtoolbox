import {
  FormatOptions,
  JsonStats,
  QueryResult,
  JsonErrorDetail,
  analyzeJsonError,
  autoRepairJson,
  computeJsonStats,
  formatJsonData,
  queryJsonData,
  jsonToTypeScript
} from './jsonEngine'

export interface WorkerJobRequest {
  id: string
  action: 'format' | 'repair' | 'query' | 'stats' | 'typescript'
  payload: {
    rawInput: string
    options?: FormatOptions
    queryString?: string
    queryType?: 'path' | 'jsexpr' | 'search'
    rootName?: string
  }
}

export interface WorkerJobResponse {
  id: string
  success: boolean
  action: string
  result?: {
    output?: string
    stats?: JsonStats
    queryResult?: QueryResult
    repairedJson?: string
    tsDefinition?: string
    errorDetail?: JsonErrorDetail
    executionTimeMs: number
  }
  error?: string
}

let workerInstance: Worker | null = null
let currentPendingJob: { id: string; resolve: (res: any) => void; reject: (err: any) => void } | null = null

function getOrCreateWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null
  }

  if (workerInstance) return workerInstance

  try {
    const workerScript = `
      // Embedded Web Worker for JSON processing
      self.onmessage = function(e) {
        const { id, action, payload } = e.data;
        const start = performance.now();

        try {
          if (action === 'format') {
            const { rawInput, options = { indent: 2 } } = payload;
            if (!rawInput || !rawInput.trim()) {
              self.postMessage({
                id,
                success: true,
                action,
                result: { output: '', executionTimeMs: 0 }
              });
              return;
            }

            let parsed;
            try {
              parsed = JSON.parse(rawInput);
            } catch (err) {
              // Extract error details
              const msg = err.message || 'Invalid JSON';
              self.postMessage({
                id,
                success: false,
                action,
                error: msg
              });
              return;
            }

            // Transform and format
            const output = formatData(parsed, options);
            const stats = computeStats(parsed, rawInput);
            const duration = Math.max(0.1, Number((performance.now() - start).toFixed(2)));

            self.postMessage({
              id,
              success: true,
              action,
              result: {
                output,
                stats,
                executionTimeMs: duration
              }
            });
          }
          else if (action === 'repair') {
            const { rawInput } = payload;
            const repaired = autoRepair(rawInput);
            let isValid = false;
            let output = repaired;
            try {
              const p = JSON.parse(repaired);
              output = JSON.stringify(p, null, 2);
              isValid = true;
            } catch {}

            const duration = Math.max(0.1, Number((performance.now() - start).toFixed(2)));
            self.postMessage({
              id,
              success: true,
              action,
              result: {
                repairedJson: output,
                isValid,
                executionTimeMs: duration
              }
            });
          }
          else if (action === 'query') {
            const { rawInput, queryString, queryType = 'path' } = payload;
            let parsed;
            try {
              parsed = JSON.parse(rawInput);
            } catch (err) {
              self.postMessage({
                id,
                success: false,
                action,
                error: 'Cannot query invalid JSON: ' + (err.message || 'Syntax Error')
              });
              return;
            }

            const qRes = runQuery(parsed, queryString, queryType);
            const duration = Math.max(0.1, Number((performance.now() - start).toFixed(2)));

            self.postMessage({
              id,
              success: !qRes.error,
              action,
              result: {
                queryResult: qRes,
                executionTimeMs: duration
              },
              error: qRes.error
            });
          }
        } catch (fatal) {
          self.postMessage({
            id,
            success: false,
            action,
            error: String(fatal)
          });
        }
      };

      function formatData(parsed, options) {
        let transformed = parsed;
        if (options.sortKeys && options.sortKeys !== 'none') {
          transformed = sortKeysDeep(transformed, options.sortKeys);
        }
        if (options.caseMode && options.caseMode !== 'none') {
          transformed = changeCaseDeep(transformed, options.caseMode);
        }
        if (options.removeNulls || options.removeEmptyStrings || options.removeEmptyArrays || options.removeEmptyObjects) {
          transformed = cleanDeep(transformed, options);
        }

        if (options.indent === 'minified' || options.indent === 'compact') {
          return JSON.stringify(transformed);
        }
        const sp = options.indent === '\\t' ? '\\t' : options.indent;
        let res = JSON.stringify(transformed, null, sp);
        if (options.escapeUnicode) {
          res = res.replace(/[\\u007F-\\uFFFF]/g, function(chr) {
            return '\\\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
          });
        }
        return res;
      }

      function sortKeysDeep(val, mode) {
        if (val === null || typeof val !== 'object') return val;
        if (Array.isArray(val)) return val.map(item => sortKeysDeep(item, mode));
        const keys = Object.keys(val);
        if (mode === 'asc') keys.sort((a, b) => a.localeCompare(b));
        else if (mode === 'desc') keys.sort((a, b) => b.localeCompare(a));
        else if (mode === 'natural') keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        else if (mode === 'length') keys.sort((a, b) => a.length - b.length || a.localeCompare(b));
        const res = {};
        for (const k of keys) {
          res[k] = sortKeysDeep(val[k], mode);
        }
        return res;
      }

      function changeCaseDeep(val, mode) {
        if (val === null || typeof val !== 'object') return val;
        if (Array.isArray(val)) return val.map(item => changeCaseDeep(item, mode));
        const res = {};
        for (const k of Object.keys(val)) {
          const newK = convertCase(k, mode);
          res[newK] = changeCaseDeep(val[k], mode);
        }
        return res;
      }

      function convertCase(str, mode) {
        const words = str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').split(/[\\s_\\-]+/).filter(Boolean);
        if (!words.length) return str;
        if (mode === 'camel') return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        if (mode === 'snake') return words.map(w => w.toLowerCase()).join('_');
        if (mode === 'kebab') return words.map(w => w.toLowerCase()).join('-');
        if (mode === 'pascal') return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        if (mode === 'constant') return words.map(w => w.toUpperCase()).join('_');
        return str;
      }

      function cleanDeep(val, opts) {
        if (val === null || val === undefined) return val;
        if (Array.isArray(val)) {
          let arr = val.map(item => cleanDeep(item, opts));
          if (opts.removeNulls) arr = arr.filter(x => x !== null && x !== undefined);
          if (opts.removeEmptyStrings) arr = arr.filter(x => x !== '');
          if (opts.removeEmptyArrays) arr = arr.filter(x => !(Array.isArray(x) && x.length === 0));
          if (opts.removeEmptyObjects) arr = arr.filter(x => !(typeof x === 'object' && x !== null && !Array.isArray(x) && Object.keys(x).length === 0));
          return arr;
        }
        if (typeof val === 'object') {
          const res = {};
          for (const [k, v] of Object.entries(val)) {
            const cleanVal = cleanDeep(v, opts);
            if (opts.removeNulls && (cleanVal === null || cleanVal === undefined)) continue;
            if (opts.removeEmptyStrings && cleanVal === '') continue;
            if (opts.removeEmptyArrays && Array.isArray(cleanVal) && cleanVal.length === 0) continue;
            if (opts.removeEmptyObjects && typeof cleanVal === 'object' && cleanVal !== null && !Array.isArray(cleanVal) && Object.keys(cleanVal).length === 0) continue;
            res[k] = cleanVal;
          }
          return res;
        }
        return val;
      }

      function computeStats(data, rawStr) {
        let totalKeys = 0;
        let maxDepth = 0;
        let totalObjects = 0;
        let totalArrays = 0;
        let totalPrimitives = 0;
        let stringCount = 0;
        let numberCount = 0;
        let booleanCount = 0;
        let nullCount = 0;

        function traverse(node, depth) {
          if (depth > maxDepth) maxDepth = depth;
          if (node === null) {
            nullCount++;
            totalPrimitives++;
            return;
          }
          if (Array.isArray(node)) {
            totalArrays++;
            for (let i = 0; i < node.length; i++) traverse(node[i], depth + 1);
            return;
          }
          if (typeof node === 'object') {
            totalObjects++;
            const keys = Object.keys(node);
            totalKeys += keys.length;
            for (const k of keys) traverse(node[k], depth + 1);
            return;
          }
          totalPrimitives++;
          if (typeof node === 'string') stringCount++;
          else if (typeof node === 'number') numberCount++;
          else if (typeof node === 'boolean') booleanCount++;
        }

        traverse(data, 1);
        const minified = JSON.stringify(data);
        const formatted = JSON.stringify(data, null, 2);
        const enc = new TextEncoder();

        return {
          totalKeys,
          depth: maxDepth,
          totalObjects,
          totalArrays,
          totalPrimitives,
          stringCount,
          numberCount,
          booleanCount,
          nullCount,
          rawSizeBytes: enc.encode(rawStr).length,
          formattedSizeBytes: enc.encode(formatted).length,
          minifiedSizeBytes: enc.encode(minified).length,
          lineCount: formatted.split('\\n').length,
          parseTimeMs: 0
        };
      }

      function autoRepair(input) {
        if (!input) return '';
        let text = input.trim();
        text = text.replace(/^(?:const|let|var)\\s+[a-zA-Z0-9_$]+\\s*=\\s*/, '').replace(/;+\\s*$/, '');
        text = text.replace(/^(?:export\\s+default|module\\.exports\\s*=)\\s*/, '');
        // strip comments
        text = text.replace(/\\/\\*[\\s\\S]*?\\*\\/|([^\\\\:]|^)\\/\\/.*$/gm, '$1');
        text = text.replace(/\\bTrue\\b/g, 'true').replace(/\\bFalse\\b/g, 'false').replace(/\\bNone\\b/g, 'null');
        text = text.replace(/'/g, '"');
        text = text.replace(/([{,]\\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\\s*:/g, '$1"$2":');
        text = text.replace(/,(\\s*[\\]}])/g, '$1');
        return text;
      }

      function runQuery(rootData, queryString, queryType) {
        const q = (queryString || '').trim();
        if (!q) return { data: rootData, matchCount: Array.isArray(rootData) ? rootData.length : 1 };
        if (queryType === 'jsexpr') {
          try {
            const fn = new Function('$, data', 'try { const f = (' + q + '); if (typeof f === "function") { return Array.isArray(data) ? data.filter(f) : f(data); } return (' + q + '); } catch(e) { throw e; }');
            const res = fn(rootData, rootData);
            return { data: res, matchCount: Array.isArray(res) ? res.length : (res !== undefined ? 1 : 0) };
          } catch(err) {
            return { data: null, matchCount: 0, error: err.message };
          }
        }
        // dot path evaluation
        try {
          const path = q.replace(/^\\$\\.?/, '');
          const segs = path.split('.').filter(Boolean);
          let curr = rootData;
          for (const s of segs) {
            if (curr == null) break;
            const m = s.match(/^([^\\[]*)\\[(.*?)\\]$/);
            if (m) {
              const p = m[1];
              const idx = m[2];
              curr = p ? curr[p] : curr;
              if (idx === '*') curr = Array.isArray(curr) ? curr : Object.values(curr);
              else curr = curr ? curr[parseInt(idx, 10)] : undefined;
            } else {
              curr = curr[s];
            }
          }
          return { data: curr, matchCount: Array.isArray(curr) ? curr.length : (curr !== undefined ? 1 : 0) };
        } catch(err) {
          return { data: null, matchCount: 0, error: err.message };
        }
      }
    `

    const blob = new Blob([workerScript], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    workerInstance = new Worker(url)

    workerInstance.onmessage = (e: MessageEvent<WorkerJobResponse>) => {
      const data = e.data
      if (currentPendingJob && currentPendingJob.id === data.id) {
        if (data.success) {
          currentPendingJob.resolve(data.result)
        } else {
          currentPendingJob.reject(new Error(data.error || 'Worker operation failed'))
        }
        currentPendingJob = null
      }
    }

    workerInstance.onerror = (err) => {
      if (currentPendingJob) {
        currentPendingJob.reject(err)
        currentPendingJob = null
      }
    }
  } catch {
    workerInstance = null
  }

  return workerInstance
}

export async function processJsonInWorker(
  action: 'format' | 'repair' | 'query' | 'stats' | 'typescript',
  payload: {
    rawInput: string
    options?: FormatOptions
    queryString?: string
    queryType?: 'path' | 'jsexpr' | 'search'
    rootName?: string
  }
): Promise<any> {
  const worker = getOrCreateWorker()
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  if (worker) {
    return new Promise((resolve, reject) => {
      currentPendingJob = { id: jobId, resolve, reject }
      worker.postMessage({ id: jobId, action, payload })
    })
  }

  // Fallback to synchronous engine if Web Worker is unavailable (e.g. during SSG)
  const start = performance.now()
  if (action === 'format') {
    const { rawInput, options = { indent: 2 } } = payload
    if (!rawInput.trim()) {
      return { output: '', executionTimeMs: 0 }
    }
    const parsed = JSON.parse(rawInput)
    const output = formatJsonData(parsed, options)
    const stats = computeJsonStats(parsed, rawInput)
    return {
      output,
      stats,
      executionTimeMs: Math.max(0.1, Number((performance.now() - start).toFixed(2)))
    }
  }

  if (action === 'repair') {
    const repaired = autoRepairJson(payload.rawInput)
    let isValid = false
    let output = repaired
    try {
      const p = JSON.parse(repaired)
      output = JSON.stringify(p, null, 2)
      isValid = true
    } catch {
      // Repaired output might still be a partial string
    }
    return {
      repairedJson: output,
      isValid,
      executionTimeMs: Math.max(0.1, Number((performance.now() - start).toFixed(2)))
    }
  }

  if (action === 'query') {
    const parsed = JSON.parse(payload.rawInput)
    const queryResult = queryJsonData(parsed, payload.queryString || '', payload.queryType || 'path')
    return {
      queryResult,
      executionTimeMs: Math.max(0.1, Number((performance.now() - start).toFixed(2)))
    }
  }

  if (action === 'typescript') {
    const parsed = JSON.parse(payload.rawInput)
    const tsDefinition = jsonToTypeScript(parsed, payload.rootName || 'RootObject')
    return {
      tsDefinition,
      executionTimeMs: Math.max(0.1, Number((performance.now() - start).toFixed(2)))
    }
  }
}
