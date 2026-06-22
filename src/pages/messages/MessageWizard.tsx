/**
 * MessageWizard.tsx
 * ─────────────────
 * Top-level wizard for the create/edit view.
 * Contains:
 *   - Back button
 *   - Main phase stepper navigation (5 tabs — NO Follow Up here,
 *     because Follow Up already lives in the inner template sub-tabs)
 *   - Tab content router
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMessageFormContext, MainTab } from './useMessageForm';
import RequirementsTab from './RequirementsTab';
import ContentTab from './ContentTab';
import DeployTab from './DeployTab';
import ProjectStatusTab from './ProjectStatusTab';
import DocumentationTab from './DocumentationTab';

const MAIN_TABS: MainTab[] = [
  'Requirements',
  'Content',
  'Deploy',
  'Project Status',
  'Documentation',
];

export default function MessageWizard() {
  const {
    setView,
    activeMainTab,
    setActiveMainTab,
    handleSubmit,
    onSubmit,
  } = useMessageFormContext();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 animate-fadeIn py-2 px-4">
      {/* Top nav row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Message Management
          </button>
        </div>

        {/* Centered main phase stepper */}
        <div className="flex gap-6 justify-center flex-1 md:justify-center flex-wrap">
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveMainTab(tab)}
              className={`py-3 text-sm font-bold border-b-2 transition-all relative -mb-[14px] flex items-center gap-1.5 ${
                activeMainTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              {tab}
              {tab === 'Requirements' && (
                <span className="absolute -top-1 -right-4 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer to balance layout */}
        <div className="w-48 hidden md:block" />
      </div>

      {/* Tab content router */}
      <div className={activeMainTab === 'Requirements' ? 'block' : 'hidden'}>
        <RequirementsTab />
      </div>
      <div className={activeMainTab === 'Content' ? 'block' : 'hidden'}>
        <ContentTab />
      </div>
      <div className={activeMainTab === 'Deploy' ? 'block' : 'hidden'}>
        <DeployTab />
      </div>
      <div className={activeMainTab === 'Project Status' ? 'block' : 'hidden'}>
        <ProjectStatusTab />
      </div>
      <div className={activeMainTab === 'Documentation' ? 'block' : 'hidden'}>
        <DocumentationTab />
      </div>
    </form>
  );
}
