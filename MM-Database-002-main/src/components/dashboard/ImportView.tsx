import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, X,
  ChevronRight, Users, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Twitch';

interface ParsedCreator {
  discordHandle: string;
  name: string;
  profile: {
    realName?: string;
    email?: string;
    phone?: string;
    location?: string;
    niche?: string;
    contentFormat?: string;
    toneVibe?: string;
    postingFrequency?: string;
  };
  accounts: { platform: Platform; handle: string; url: string }[];
  _row: number;
  _error?: string;
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

function extractHandle(url: string, platform: Platform): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (platform === 'YouTube' || platform === 'TikTok' || platform === 'Instagram') {
      const seg = parts.find((p) => p.startsWith('@')) ?? parts[parts.length - 1] ?? '';
      return seg.startsWith('@') ? seg : `@${seg}`;
    }
    return parts[parts.length - 1] ?? url;
  } catch {
    return url;
  }
}

function urlToAccount(url: string, platform: Platform): { platform: Platform; handle: string; url: string } | null {
  const clean = url.trim();
  if (!clean || clean === '-') return null;
  return { platform, handle: extractHandle(clean, platform), url: clean };
}

function parseCSV(text: string): ParsedCreator[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  // Find the header row — the one containing "Creator Name"
  let headerIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const lower = cols.map((c) => c.toLowerCase());
    if (lower.some((c) => c.includes('creator name'))) {
      headerIdx = i;
      headers = cols.map((c) => c.toLowerCase().trim());
      break;
    }
  }

  if (headerIdx === -1) return [];

  // Column index helpers
  const col = (name: string) => headers.findIndex((h) => h.includes(name));
  const colCreatorName   = col('creator name');
  const colRealName      = col('real name');
  const colEmail         = col('email');
  const colPhone         = col('phone');
  const colLocation      = col('location');
  const colYouTube       = col('youtube');
  const colInstagram     = col('instagram');
  const colTikTok        = col('tiktok');
  const colFacebook      = col('facebook');
  const colNiche         = col('niche') !== -1 ? col('niche') : col('primary');
  const colFormat        = col('format') !== -1 ? col('format') : col('content format');
  const colTone          = col('tone');
  const colFrequency     = col('frequency') !== -1 ? col('frequency') : col('posting');

  const results: ParsedCreator[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.every((c) => !c)) continue; // skip empty rows

    const raw = (idx: number) => (idx >= 0 ? (cols[idx] ?? '').trim() : '');

    const rawHandle = raw(colCreatorName);
    if (!rawHandle) continue;

    const discordHandle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;
    const realName = raw(colRealName);
    const name = realName || discordHandle;

    const accounts: ParsedCreator['accounts'] = [];
    const addAccount = (url: string, platform: Platform) => {
      const acc = urlToAccount(url, platform);
      if (acc) accounts.push(acc);
    };

    addAccount(raw(colYouTube), 'YouTube');
    addAccount(raw(colInstagram), 'Instagram');
    addAccount(raw(colTikTok), 'TikTok');
    addAccount(raw(colFacebook), 'Facebook');

    results.push({
      discordHandle,
      name,
      profile: {
        realName: realName || undefined,
        email: raw(colEmail) || undefined,
        phone: raw(colPhone) || undefined,
        location: raw(colLocation) || undefined,
        niche: raw(colNiche) || undefined,
        contentFormat: raw(colFormat) || undefined,
        toneVibe: raw(colTone) || undefined,
        postingFrequency: raw(colFrequency) || undefined,
      },
      accounts,
      _row: i + 1,
    });
  }

  return results;
}

// ── Component ────────────────────────────────────────────────────────────────

type Step = 'upload' | 'preview' | 'done';

export function ImportView() {
  const bulkImport = useMutation(api.creators.bulkImport);
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedCreator[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file. In Google Sheets: File → Download → CSV.');
      return;
    }
    setParseError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setParseError('Could not find a "Creator Name" column. Make sure the sheet is exported as-is from Google Sheets.');
        return;
      }
      setParsed(rows);
      setStep('preview');
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
      const payload = parsed.map(({ discordHandle, name, profile, accounts }) => ({
        discordHandle,
        name,
        profile: Object.values(profile).some(Boolean) ? profile : undefined,
        accounts,
      }));
      const result = await bulkImport({ creators: payload });
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

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Upload className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Import Creators</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
            Bulk import from SIGMA3000 Creator Roster CSV
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
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">How to export from Google Sheets</p>
            <ol className="space-y-1">
              {[
                'Open the SIGMA3000 Creator Roster sheet',
                'File → Download → Comma Separated Values (.csv)',
                'Upload the downloaded file below',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400 font-medium">
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
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
              <p className="text-sm font-bold text-zinc-300">Drop your CSV here or click to browse</p>
              <p className="text-xs text-zinc-600 mt-1 font-medium">Accepts .csv files exported from Google Sheets</p>
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
                {parsed.length} creators found
              </span>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-colors">
              <X className="w-3.5 h-3.5" /> Change file
            </button>
          </div>

          {/* Preview table */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60">
                    {['Discord Handle', 'Name', 'Niche', 'Platforms', 'Posting'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {parsed.slice(0, 50).map((c) => (
                    <tr key={c._row} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-emerald-400 whitespace-nowrap">@{c.discordHandle}</td>
                      <td className="px-4 py-2.5 text-zinc-200 whitespace-nowrap">{c.name}</td>
                      <td className="px-4 py-2.5 text-zinc-400 whitespace-nowrap">{c.profile.niche || '—'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 flex-wrap">
                          {c.accounts.map((a) => (
                            <span key={a.platform} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase">
                              {a.platform.slice(0, 2)}
                            </span>
                          ))}
                          {c.accounts.length === 0 && <span className="text-zinc-600">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 whitespace-nowrap">{c.profile.postingFrequency || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 50 && (
              <div className="px-4 py-3 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 font-medium">Showing first 50 of {parsed.length} creators</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-300">All creators will be imported as <span className="text-yellow-400">Bronze tier</span> with 1% commission rate.</p>
              <p className="text-xs text-zinc-500 font-medium">Creators already in the database (matched by Discord handle) will be skipped. You can update tiers individually after import.</p>
            </div>
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
              disabled={isImporting}
              className="flex items-center gap-2 px-8 h-11 bg-emerald-500 text-black text-[10px] font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest disabled:opacity-50"
            >
              {isImporting
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing…</>
                : <><Users className="w-3.5 h-3.5" /> Import {parsed.length} Creators</>
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
            <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">Import Complete</h3>
            <p className="text-zinc-500 mt-2 font-medium">Your creator roster has been imported successfully.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold font-mono text-emerald-400">{importResult.created}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Created</p>
            </div>
            <div className="w-px h-12 bg-zinc-800" />
            <div className="text-center">
              <p className="text-4xl font-bold font-mono text-zinc-500">{importResult.skipped}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Skipped (duplicates)</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="px-8 h-11 bg-zinc-800 text-zinc-100 text-[10px] font-bold rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest"
          >
            Import Another File
          </button>
        </motion.div>
      )}
    </div>
  );
}
