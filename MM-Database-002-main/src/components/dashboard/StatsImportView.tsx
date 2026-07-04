import React, { useState, useRef, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, X,
  ChevronRight, RefreshCw, BarChart3, TrendingUp, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface ParsedStatsRow {
  discordHandle: string;
  metrics: {
    mtd: { gmv: number; posts: number; lives: number; orders: number };
    sevenDay: { gmv: number; posts: number; lives: number; orders: number };
  };
  _row: number;
}

// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseStatsCSV(text: string): ParsedStatsRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  // Find the header row — containing something like "discord" or "creator" or "handle"
  let headerIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const lower = cols.map((c) => c.toLowerCase().trim());
    if (lower.some((c) => c.includes('discord') || c.includes('creator') || c.includes('handle'))) {
      headerIdx = i;
      headers = lower;
      break;
    }
  }

  if (headerIdx === -1) return [];

  // Match columns
  const colIndex = (names: string[]) => {
    return headers.findIndex((h) => names.some((name) => h.includes(name)));
  };

  const cDiscord = colIndex(['discord', 'handle', 'creator']);
  const cGmvMtd = colIndex(['gmv mtd', 'mtd gmv', 'gmv month', 'month gmv', 'gmv_mtd']);
  const cGmv7d = colIndex(['gmv 7d', '7d gmv', 'gmv week', 'week gmv', 'gmv_7d']);
  const cPostsMtd = colIndex(['posts mtd', 'mtd posts', 'posts month', 'posts_mtd', 'posts']);
  const cPosts7d = colIndex(['posts 7d', '7d posts', 'posts week', 'posts_7d']);
  const cLivesMtd = colIndex(['lives mtd', 'mtd lives', 'lives month', 'lives_mtd', 'lives']);
  const cLives7d = colIndex(['lives 7d', '7d lives', 'lives week', 'lives_7d']);
  const cOrdersMtd = colIndex(['orders mtd', 'mtd orders', 'orders month', 'orders_mtd', 'orders']);
  const cOrders7d = colIndex(['orders 7d', '7d orders', 'orders week', 'orders_7d']);

  const results: ParsedStatsRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.every((c) => !c)) continue; // skip empty rows

    const val = (idx: number) => {
      if (idx < 0 || idx >= cols.length) return '';
      return cols[idx].trim();
    };

    const num = (idx: number) => {
      const v = val(idx);
      if (!v) return 0;
      // Strip currency signs or commas
      const cleaned = v.replace(/[$,]/g, '');
      const parsedVal = parseFloat(cleaned);
      return isNaN(parsedVal) ? 0 : parsedVal;
    };

    const rawHandle = val(cDiscord);
    if (!rawHandle) continue;

    const discordHandle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

    results.push({
      discordHandle,
      metrics: {
        mtd: {
          gmv: num(cGmvMtd),
          posts: num(cPostsMtd),
          lives: num(cLivesMtd),
          orders: num(cOrdersMtd),
        },
        sevenDay: {
          gmv: num(cGmv7d),
          posts: num(cPosts7d),
          lives: num(cLives7d),
          orders: num(cOrders7d),
        },
      },
      _row: i + 1,
    });
  }

  return results;
}

type Step = 'upload' | 'preview' | 'done';

export function StatsImportView() {
  const bulkUpdateStats = useMutation(api.creators.bulkUpdateStats);
  const creators = useQuery(api.creators.list) ?? [];
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedStatsRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ updated: number; notFound: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const existingHandles = useMemo(() => {
    return new Set(creators.map((c) => c.discordHandle.toLowerCase()));
  }, [creators]);

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file. In Google Sheets: File → Download → CSV.');
      return;
    }
    setParseError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onerror = () => setParseError('Could not read file. Try again.');
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseStatsCSV(text);
        if (rows.length === 0) {
          setParseError('Could not find a "Discord", "Handle", or "Creator" header column.');
          return;
        }
        setParsed(rows);
        setStep('preview');
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV. Check the file format.');
      }
    };
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (isImporting) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const payload = parsed.map(({ discordHandle, metrics }) => ({
        discordHandle,
        metrics,
      }));
      const result = await bulkUpdateStats({ updates: payload });
      setImportResult(result);
      setStep('done');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  function reset() {
    setStep('upload');
    setFileName('');
    setParsed([]);
    setParseError(null);
    setImportResult(null);
    setImportError(null);
  }

  const { matchesCount, missingCount } = useMemo(() => {
    let matches = 0;
    let missing = 0;
    for (const row of parsed) {
      if (existingHandles.has(row.discordHandle.toLowerCase())) {
        matches++;
      } else {
        missing++;
      }
    }
    return { matchesCount: matches, missingCount: missing };
  }, [parsed, existingHandles]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Import Creator Stats</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
            Bulk update GMV, posts, lives, and orders from Excel / CSV
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['upload', 'preview', 'done'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              step === s ? 'bg-emerald-500 text-black' :
              (step === 'preview' && s === 'upload') || step === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-zinc-800 text-zinc-600'
            }`}>
              {i + 1}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s ? 'text-zinc-100' : 'text-zinc-600'}`}>
              {s === 'upload' ? 'Upload CSV' : s === 'preview' ? 'Preview & Confirm' : 'Done'}
            </span>
            {i < 2 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Instructions */}
          <div className="mb-5 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expected CSV Format</p>
            <p className="text-xs text-zinc-400 font-medium">
              We dynamically search for headers in your CSV. Ensure the sheet has a column labeled <strong className="text-zinc-200">Discord</strong> or <strong className="text-zinc-200">Creator</strong> or <strong className="text-zinc-200">Handle</strong> for mapping, plus columns for stats:
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 font-medium pt-1">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Month-to-Date (MTD)</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>GMV MTD</li>
                  <li>Posts MTD</li>
                  <li>Lives MTD</li>
                  <li>Orders MTD</li>
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">7-Day</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>GMV 7D</li>
                  <li>Posts 7D</li>
                  <li>Lives 7D</li>
                  <li>Orders 7D</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group bg-zinc-900/20 hover:bg-emerald-500/5"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 group-hover:bg-emerald-500/10 border border-zinc-700 group-hover:border-emerald-500/30 flex items-center justify-center transition-all">
              <FileText className="w-6 h-6 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-300">Drop your stats CSV here or click to browse</p>
              <p className="text-xs text-zinc-600 mt-1 font-medium">Accepts .csv files exported from Excel or Google Sheets</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {parseError && (
            <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-bold">{parseError}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 'preview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold text-zinc-300">{fileName}</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {parsed.length} rows found
              </span>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-colors">
              <X className="w-3.5 h-3.5" /> Change file
            </button>
          </div>

          {/* Validation banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Matched Creators</p>
              <p className="text-2xl font-bold font-mono text-zinc-100">{matchesCount}</p>
              <p className="text-xs text-zinc-500 font-medium">Exist in the database and will be updated.</p>
            </div>
            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Unknown Creators</p>
              <p className="text-2xl font-bold font-mono text-zinc-100">{missingCount}</p>
              <p className="text-xs text-zinc-500 font-medium">Will be skipped (no exact matching Discord handle).</p>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Discord Handle</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">GMV MTD</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">GMV 7D</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Posts (MTD / 7D)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Lives (MTD / 7D)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Orders (MTD / 7D)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {parsed.slice(0, 50).map((c) => {
                    const isMatched = existingHandles.has(c.discordHandle.toLowerCase());
                    return (
                      <tr key={c._row} className={`hover:bg-zinc-800/20 transition-colors ${!isMatched ? 'bg-orange-500/[0.02]' : ''}`}>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {isMatched ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">Match</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 uppercase">Skip</span>
                          )}
                        </td>
                        <td className={`px-4 py-2.5 font-bold whitespace-nowrap ${isMatched ? 'text-zinc-200' : 'text-zinc-500'}`}>
                          @{c.discordHandle}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-300 whitespace-nowrap">${c.metrics.mtd.gmv.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-300 whitespace-nowrap">${c.metrics.sevenDay.gmv.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-400 whitespace-nowrap">{c.metrics.mtd.posts} / {c.metrics.sevenDay.posts}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-400 whitespace-nowrap">{c.metrics.mtd.lives} / {c.metrics.sevenDay.lives}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-400 whitespace-nowrap">{c.metrics.mtd.orders} / {c.metrics.sevenDay.orders}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {parsed.length > 50 && (
              <div className="px-4 py-3 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 font-medium">Showing first 50 of {parsed.length} rows</p>
              </div>
            )}
          </div>

          {importError && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-bold">{importError}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button onClick={reset} className="px-6 h-11 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || matchesCount === 0}
              className="flex items-center gap-2 px-8 h-11 bg-emerald-500 text-black text-[10px] font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating…</>
                : <><BarChart3 className="w-3.5 h-3.5" /> Update {matchesCount} Creators</>
              }
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && importResult && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">Stats Update Complete</h3>
            <p className="text-zinc-500 mt-2 font-medium">Your creator metrics have been successfully synchronized.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold font-mono text-emerald-400">{importResult.updated}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Updated</p>
            </div>
            <div className="w-px h-12 bg-zinc-800" />
            <div className="text-center">
              <p className="text-4xl font-bold font-mono text-zinc-500">{importResult.notFound}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Skipped (Not Found)</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="px-8 h-11 bg-zinc-800 text-zinc-100 text-[10px] font-bold rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest"
          >
            Import Another Stats File
          </button>
        </motion.div>
      )}
    </div>
  );
}
