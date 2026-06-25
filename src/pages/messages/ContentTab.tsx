/**
 * ContentTab.tsx
 * ──────────────
 * Root orchestrator for the two-panel Content Builder layout.
 *
 * Pixel-perfect layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  WHITE:  [Create FR]  [↑ Export]  [💾 Save]   (right-align) │
 *   ├──────────────────────┬───────────────────────────────────────┤
 *   │ GRAY: |CONTENT BLDR  │ GRAY: |LIVE PREVIEW [Retail▾][Cust▾][↺]│
 *   ├──────────────────────┼───────────────────────────────────────┤
 *   │  Brand bar           │                                       │
 *   │ |COMPONENTS  B I {} ▾│         Email preview card            │
 *   │  row 1               │                                       │
 *   │  row 2               │                                       │
 *   │  [+ Add Component]   │                                       │
 *   └──────────────────────┴───────────────────────────────────────┘
 */

import React from 'react';
import { Download, Save, FileText } from 'lucide-react';
import { useContentBuilder, ContentBuilderContext } from './contentBuilder/useContentBuilder';
import ContentBuilderPanel from './contentBuilder/ContentBuilderPanel';
import LivePreview from './contentBuilder/LivePreview';

// ── Action bar — pure white, visually separated from the gray panel headers ───

function ContentActionBar() {
  const { components } = React.useContext(ContentBuilderContext)!;

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      components: components.map(c => ({
        kind: c.kind, label: c.label, text: c.text, url: c.url, order: c.order,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `content_template_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    /* ⬇ bg-white — NOT bg-slate-100, so it visually separates from the gray panel header bar below */
    <div className="flex items-center justify-end gap-2 px-4 py-2.5
      bg-white dark:bg-slate-950
      border-b border-slate-200 dark:border-slate-800/80">

      <button type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
          border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
          text-slate-600 dark:text-slate-300
          hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300
          transition-all duration-150 shadow-sm">
        <FileText className="h-3.5 w-3.5 text-slate-400" />
        Create FR
      </button>

      <button type="button" onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
          border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
          text-slate-600 dark:text-slate-300
          hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300
          transition-all duration-150 shadow-sm">
        <Download className="h-3.5 w-3.5 text-slate-400" />
        Export
      </button>

      <button type="button"
        className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold rounded-lg
          bg-blue-600 hover:bg-blue-500 active:bg-blue-700
          text-white transition-all duration-150 shadow-sm shadow-blue-600/30">
        <Save className="h-3.5 w-3.5" />
        Save
      </button>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function ContentTab() {
  const contentBuilderState = useContentBuilder();

  return (
    <ContentBuilderContext.Provider value={contentBuilderState}>
      {/*
        Height: fill the remaining viewport after the page chrome.
        Using a CSS variable approach with flex-col ensures the panels
        fill equally without overflow.
      */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 176px)', minHeight: 480 }}>

        {/* ── Action bar (white bg) ── */}
        <ContentActionBar />

        {/*
          ── Two-panel grid ──
          CSS grid with fixed columns ensures both panels are ALWAYS the same height.
          The gray header bars inside each panel are part of the panel, not a shared row,
          so they naturally align when both panels are the same height.
        */}
        <div
          className="flex-1 min-h-0 grid"
          style={{ gridTemplateColumns: '55fr 45fr' }}
        >
          {/* LEFT — Content Builder */}
          <div className="flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-800">
            <ContentBuilderPanel />
          </div>

          {/* RIGHT — Live Preview */}
          <div className="flex flex-col min-h-0">
            <LivePreview />
          </div>
        </div>

      </div>
    </ContentBuilderContext.Provider>
  );
}
