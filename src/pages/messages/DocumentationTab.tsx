/**
 * DocumentationTab.tsx
 * ────────────────────
 * API integration documentation — REST payload JSON
 * and cURL command snippet, both live-bound to formValues.
 */

import React from 'react';
import { useMessageFormContext } from './useMessageForm';

export default function DocumentationTab() {
  const { selectedTemplateId, formValues } = useMessageFormContext();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">API Integration Documentation</h3>
        <p className="text-xs text-slate-400 mt-0.5">Integrate this dynamic message into your upstream microservices using REST endpoints.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">REST Request Payload JSON</span>
          <span className="text-[10px] text-slate-500 font-mono">POST /api/v1/messages/trigger</span>
        </div>
        <pre className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 shadow-inner">
          {JSON.stringify(
            {
              templateId: selectedTemplateId,
              alertCode: formValues.messageId || 'MSG-001',
              payload: formValues,
            },
            null,
            2
          )}
        </pre>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">cURL Command Snippet</span>
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-blue-400 overflow-x-auto shadow-inner whitespace-pre-wrap">
            {`curl -X POST http://localhost:8080/api/v1/messages/trigger \\
  -H "Content-Type: application/json" \\
  -d '{"templateId":"${selectedTemplateId}","alertCode":"${formValues.messageId || 'MSG-001'}","payload":${JSON.stringify(formValues)}}'`}
          </div>
        </div>
      </div>
    </div>
  );
}
