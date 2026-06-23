/**
 * ProjectStatusTab.tsx
 * ────────────────────
 * Compliance metrics cards and sign-off checklist.
 */

import React from 'react';
import { Check } from 'lucide-react';

const METRICS = [
  { label: 'ADA Compliance', val: '98 / 100', status: 'Passed', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'LOB approval', val: 'Signed Off', status: 'Retail Banking', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Sync Status', val: 'Catalog Sync', status: 'Tridion Up-to-date', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Delivery Channels', val: 'Email, SMS', status: 'Dual route active', color: 'text-blue-600 dark:text-blue-400' },
] as const;

const CHECKLIST = [
  { item: 'LOB Business Owner Approval', status: 'completed', desc: 'Approved by Ishika on behalf of Retail Banking.' },
  { item: 'ADA Screen Reader Validation', status: 'completed', desc: 'Passed automated AXE accessibility scanner.' },
  { item: 'DMARC Domain Alignment Validation', status: 'completed', desc: 'Email header matches registered wells-fargo outbound domains.' },
  { item: 'Legal Disclosure Audit sign-off', status: 'pending', desc: 'Pending review of privacy footer under Wealth Management clauses.' },
] as const;

export default function ProjectStatusTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Project Status & compliance checklist</h3>
        <p className="text-xs text-slate-400 mt-0.5">Ensure this campaign conforms to regulatory standards prior to production activation.</p>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => (
          <div key={idx} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-5 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metric.label}</p>
            <p className={`text-base font-black ${metric.color}`}>{metric.val}</p>
            <p className="text-[10px] text-slate-500 font-medium">{metric.status}</p>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-white">Sign-off Checklist</span>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-455 px-2 py-0.5 rounded-full font-bold">3 of 4 Completed</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {CHECKLIST.map((task, idx) => (
            <div key={idx} className="p-4 flex items-start gap-3 hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
              {task.status === 'completed' ? (
                <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5 bg-emerald-50 dark:bg-emerald-950 p-0.5 rounded-full border border-emerald-200" />
              ) : (
                <div className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-950/40 p-0.5 rounded-full border border-amber-200 flex items-center justify-center font-bold text-[9px]">!</div>
              )}
              <div>
                <p className={`font-bold ${task.status === 'completed' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{task.item}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{task.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
