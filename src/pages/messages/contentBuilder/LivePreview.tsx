/**
 * LivePreview.tsx — Premium email preview panel
 *
 * Layout (matches source image exactly):
 *  ┌─────────────────────────────────────────────────────┐
 *  │ GRAY: | LIVE PREVIEW   [Retail▾] [Customer A▾]  [↺] │
 *  ├─────────────────────────────────────────────────────┤
 *  │  light bg with centered email card                   │
 *  │  ┌─ WF Wells Fargo — Retail ─────────────────────┐  │
 *  │  │  ████ red header banner ████████████████████  │  │
 *  │  │  You made a purchase…                         │  │
 *  │  │         [Go to account]                       │  │
 *  │  │  Your transaction on…                         │  │
 *  │  │  © 2025 Wells Fargo Bank                      │  │
 *  │  └───────────────────────────────────────────────┘  │
 *  └─────────────────────────────────────────────────────┘
 *
 * NO channel icons. NO device icons. Just the clean email card.
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useContentBuilderContext } from './useContentBuilder';
import { SAMPLE_CUSTOMERS } from './constants';
import type { CanvasComponent } from './types';

// ── Variable interpolation ────────────────────────────────────────────────────

function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

// ── Component → rendered email element ───────────────────────────────────────

function EmailBlock({
  comp,
  primaryColor,
  vars,
}: {
  comp: CanvasComponent;
  primaryColor: string;
  vars: Record<string, string>;
}) {
  const text = interpolate(comp.text, vars);
  const url = comp.url ? interpolate(comp.url, vars) : '#';

  switch (comp.kind) {
    case 'pageheader':
    case 'heading':
    case 'banner':
      return (
        <div
          className="py-6 px-5 font-bold text-white text-center text-sm leading-snug tracking-tight"
          style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor})` }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'subheading':
      return (
        <h2
          className="text-[13px] font-bold text-slate-800 px-5 pt-4 pb-1"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'paragraph':
    case 'richtext':
      return (
        <p
          className="text-[12px] text-slate-655 px-5 py-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'quote':
      return (
        <blockquote
          className="mx-5 my-3 pl-4 border-l-[3px] text-[12px] italic text-slate-500 leading-relaxed"
          style={{ borderColor: primaryColor }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'cta':
    case 'quickaction':
      return (
        <div className="flex justify-center px-5 py-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-7 py-2.5 text-[12px] font-bold text-white rounded-lg shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );

    case 'link':
      return (
        <div className="px-5 py-1.5">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-semibold underline underline-offset-2"
            style={{ color: primaryColor }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="px-5 py-2">
          {comp.url ? (
            <img
              src={url}
              alt={text}
              className="w-full h-auto max-h-48 object-contain rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-full h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
              📷 {text || 'Image Placeholder'}
            </div>
          )}
        </div>
      );

    case 'divider':
      return <hr className="mx-5 my-2 border-slate-200" />;

    case 'spacer':
      return <div className="h-4" />;

    case 'transactionsummary':
    case 'accountdetails':
      return (
        <div className="mx-5 my-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
          <p className="font-bold text-slate-700 text-xs">{comp.label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-0.5">
            <span className="text-slate-400">Account</span>
            <span>{vars.AccountNumber ?? '****XXXX'}</span>
            <span className="text-slate-400">Amount</span>
            <span className="font-semibold">{vars.Amount ?? '$0.00'}</span>
            <span className="text-slate-400">Date</span>
            <span>{vars.TransactionDate ?? '—'}</span>
          </div>
        </div>
      );

    case 'keymetrics':
      return (
        <div className="mx-5 my-2 grid grid-cols-3 gap-2">
          {['Transactions', 'Balance', 'Rewards'].map(l => (
            <div key={l} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">{l}</p>
              <p className="text-[13px] font-bold text-slate-700 mt-0.5">—</p>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="mx-5 my-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-400 italic">
          [{comp.label}: {text}]
        </div>
      );
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LivePreview() {
  const {
    components,
    brand,
    previewSegment,
    setPreviewSegment,
    sampleDataKey,
    setSampleDataKey,
    currentSampleData,
  } = useContentBuilderContext();

  const sorted = [...components].sort((a, b) => a.order - b.order);

  const vars: Record<string, string> = {
    CustomerName: currentSampleData.CustomerName,
    AccountNumber: currentSampleData.AccountNumber,
    Amount: currentSampleData.Amount,
    TransactionDate: currentSampleData.TransactionDate,
    MerchantName: currentSampleData.MerchantName,
    LOB: currentSampleData.LOB,
    Region: currentSampleData.Region,
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950">
      {/* ── Header bar — GRAY, same as Content Builder headers ── */}
      <div
        className="flex items-center justify-between px-4 h-12
        bg-slate-100 dark:bg-slate-900/80
        border-b border-slate-200 dark:border-slate-800 flex-shrink-0"
      >
        {/* Label */}
        <div className="flex items-center gap-2.5">
          <span className="w-[3px] h-4 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
            Live Preview
          </span>
        </div>

        {/* Controls: same bar as the label */}
        <div className="flex items-center gap-2">
          <select
            value={previewSegment}
            onChange={e => setPreviewSegment(e.target.value as any)}
            className="text-[11px] font-semibold bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700 rounded-lg
              px-2 py-1 text-slate-700 dark:text-slate-200
              outline-none focus:border-indigo-400 cursor-pointer transition-all"
          >
            {['Retail', 'Corporate', 'Premium', 'Commercial'].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sampleDataKey}
            onChange={e => setSampleDataKey(e.target.value)}
            className="text-[11px] font-semibold bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700 rounded-lg
              px-2 py-1 text-slate-700 dark:text-slate-200
              outline-none focus:border-indigo-400 cursor-pointer transition-all"
          >
            {SAMPLE_CUSTOMERS.map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            title="Refresh"
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-slate-200 dark:hover:bg-slate-800
              text-slate-505 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Preview viewport ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-5
        bg-white dark:bg-slate-950"
      >
        {/* Email card */}
        <div
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/60
          dark:shadow-slate-900/60 overflow-hidden border border-slate-200/60
          dark:border-slate-800/60 dark:bg-slate-900 max-w-lg mx-auto"
        >
          {/* Email "from" strip */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800"
            style={{ backgroundColor: brand.primaryColor + '10' }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center
              text-[10px] font-black text-white shadow-sm"
              style={{ backgroundColor: brand.primaryColor }}
            >
              WF
            </div>
            <div>
              <p className="text-[11px] font-bold" style={{ color: brand.primaryColor }}>
                Wells Fargo — {previewSegment}
              </p>
              <p className="text-[9px] text-slate-400">noreply@wellsfargo.com</p>
            </div>
          </div>

          {/* Component blocks */}
          {sorted.length === 0 ? (
            <div className="py-16 text-center text-[12px] text-slate-400">
              <div className="text-3xl mb-2 opacity-30">📧</div>
              <p className="font-semibold">Empty canvas</p>
              <p className="text-[10px] text-slate-300 mt-1">Add components to see the preview</p>
            </div>
          ) : (
            <div className="pb-1">
              {sorted.map(comp => (
                <EmailBlock
                  key={comp.id}
                  comp={comp}
                  primaryColor={brand.primaryColor}
                  vars={vars}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="px-5 py-4 border-t border-slate-100 dark:border-slate-800
            text-center bg-slate-50/50 dark:bg-slate-900/50"
          >
            <p className="text-[10px] text-slate-400 leading-relaxed">
              © 2025 Wells Fargo Bank, N.A. All rights reserved.
              <br />
              <span className="text-slate-300">This is an automated message. Please do not reply.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
