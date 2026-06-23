/**
 * DeployTab.tsx
 * ─────────────
 * SRE deployment pipeline visualisation — deployment stages
 * and console log output.
 */

import React from 'react';
import { Check } from 'lucide-react';

const PIPELINE_STAGES = [
  { label: 'Config Draft', state: 'done', desc: 'Metadata initialized' },
  { label: 'ADA Validation', state: 'done', desc: 'ADA Compliance signed' },
  { label: 'QA Staging Deploy', state: 'active', desc: 'Routing tests active' },
  { label: 'SecOps Audit', state: 'pending', desc: 'Vulnerability scan' },
  { label: 'Production Route', state: 'pending', desc: 'Active routing' },
] as const;

export default function DeployTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Orchestrated Deployment Pipeline</h3>
        <p className="text-xs text-slate-400 mt-0.5">Deploy this metadata layout configuration into Dev, QA, and Production clusters.</p>
      </div>

      {/* Pipeline graph */}
      <div className="grid grid-cols-5 gap-3 pt-2">
        {PIPELINE_STAGES.map((step, idx) => (
          <div key={idx} className="relative border border-slate-150 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-sm bg-slate-50/20 dark:bg-slate-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 0{idx + 1}</span>
              {step.state === 'done' ? (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
              ) : step.state === 'active' ? (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs animate-pulse">●</span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs">○</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{step.label}</p>
            <p className="text-[10px] text-slate-400">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Console logs */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deployment Console Output</span>
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-emerald-400 space-y-1.5 overflow-x-auto max-h-72 shadow-inner">
          <p className="text-slate-500">[15 Jun 2026 - 10:15:32] INIT: Configuration loader targeting Alert ID MSG-001 started.</p>
          <p className="text-slate-500">[15 Jun 2026 - 16:07:11] AUDIT: Metadata validation successful. Schema verified version 2.0.</p>
          <p className="text-slate-500">[18 Jun 2026 - 15:22:01] SEC: ADA Compliance scanning completed. Score: 98/100.</p>
          <p className="text-blue-400">[18 Jun 2026 - 15:22:04] STAGING: Launching pod instance alertsiq-wf-msg-001-pod...</p>
          <p className="text-blue-400">[18 Jun 2026 - 15:22:05] STAGING: Syncing Kafka adaptation filters for retail business units...</p>
          <p className="text-emerald-400 animate-pulse font-bold">[18 Jun 2026 - 15:22:06] STAGING: Webhook route active at http://localhost:8080/api/v1/messages/trigger</p>
        </div>
      </div>
    </div>
  );
}
