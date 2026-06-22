/**
 * ContentTab.tsx
 * ──────────────
 * Live email preview workspace — renders a simulated email client
 * with real-time variable interpolation from formValues.
 */

import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useMessageFormContext } from './useMessageForm';

export default function ContentTab() {
  const { formValues, previewDevice, setPreviewDevice } = useMessageFormContext();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-850 dark:text-white">Email Layout Engine</h3>
          <p className="text-xs text-slate-400">Preview how variables interpolate inside the HTML shell in real time.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-400'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-400'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
        </div>
      </div>

      {/* Simulated email client viewport */}
      <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl flex justify-center border border-slate-200/50 dark:border-slate-900">
        <div
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md transition-all duration-300 rounded-xl overflow-hidden ${
            previewDevice === 'desktop' ? 'w-full' : 'w-80'
          }`}
        >
          {/* Email header mock bar */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xxs text-slate-500 font-mono">
            <span className="font-bold text-slate-400">FROM:</span>
            <span className="text-slate-600 dark:text-slate-350">wells-fargo-alerts@wellsfargo.com</span>
            <span className="font-bold text-slate-400 ml-4">SUBJECT:</span>
            <span className="text-blue-600 dark:text-blue-400 truncate">
              {formValues.messageName || 'Welcome Onboarding Campaign'}
            </span>
          </div>

          {/* Corporate header */}
          <div
            className={`p-4 flex items-center justify-between border-b-4 ${
              formValues.newBranding === true && formValues.colorScheme === 'Corporate Slate'
                ? 'bg-slate-700 border-slate-500'
                : formValues.newBranding === true && formValues.colorScheme === 'Emerald Safe'
                ? 'bg-emerald-800 border-emerald-600'
                : 'bg-red-700 border-yellow-500'
            } text-white`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-lg text-white">
                W
              </div>
              <span className="font-bold text-sm tracking-wide">WELLS FARGO</span>
            </div>
            <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
              {formValues.messageType || 'Shell'} Alert
            </span>
          </div>

          {/* HTML body preview */}
          <div className="p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">Dear Wells Fargo Customer,</p>
            <p className="leading-relaxed">
              {formValues.description || 'Welcome notification for retail customers onboarding to retail alerts.'}
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-medium space-y-1.5">
              <p className="text-slate-500">Alert Operational Identifiers:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-mono">
                <li>Message ID: <strong className="text-slate-800 dark:text-slate-200">{formValues.messageId || 'MSG-001'}</strong></li>
                <li>Routing Priority: <strong className="text-slate-800 dark:text-slate-200">{formValues.priority || 'Medium'}</strong></li>
                <li>Originating LOB: <strong className="text-slate-800 dark:text-slate-200">{formValues.businessUnit || 'Retail Banking'}</strong></li>
              </ul>
            </div>

            <div className="flex justify-center pt-2">
              <a
                href={formValues.ctaLink || 'https://online.wellsfargo.com'}
                target="_blank"
                rel="noreferrer"
                className={`px-5 py-2.5 text-xs font-semibold rounded-lg text-white shadow-sm inline-block transition-all ${
                  formValues.newBranding === true && formValues.colorScheme === 'Corporate Slate'
                    ? 'bg-slate-700 hover:bg-slate-850'
                    : formValues.newBranding === true && formValues.colorScheme === 'Emerald Safe'
                    ? 'bg-emerald-800 hover:bg-emerald-900'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Access Account Portal
              </a>
            </div>
          </div>

          {/* Compliance footer */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 border-t border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
            <p>© 2026 Wells Fargo & Co. All rights reserved. Member FDIC.</p>
            <p className="mt-1">This is an automated notification. To manage your delivery channels, log into secure portal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
