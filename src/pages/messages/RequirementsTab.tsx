/**
 * RequirementsTab.tsx
 * ───────────────────
 * The main form builder panel: template selector toolbar,
 * sub-tab navigation (inner template tabs), and the dynamic form canvas.
 */

import React from 'react';
import { Download, Save } from 'lucide-react';
import { useMessageFormContext } from './useMessageForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import FollowUpTab from './FollowUpTab';

export default function RequirementsTab() {
  const {
    selectedMessage,
    templates,
    selectedTemplateId,
    handleTemplateChange,
    currentTemplate,
    activeSubTabId,
    setActiveSubTabId,
    activeSubTab,
    formValues,
    getTabBadgeCount,
    bookmarks,
    notes,
    handleToggleBookmark,
    handleOpenNotes,
    setActiveMainTab,
  } = useMessageFormContext();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">

      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 p-6 bg-slate-50/20 dark:bg-slate-950/10">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {selectedMessage ? 'Edit Message Details' : 'Create New Message'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete the guided setup process
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Template Scheme:</span>
          <select
            value={selectedTemplateId}
            onChange={e => handleTemplateChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 mr-4"
          >
            {templates.map(t => (
              <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formValues, null, 2));
              const a = document.createElement('a');
              a.setAttribute('href', dataStr);
              a.setAttribute('download', `message_setup_${formValues.messageId || 'draft'}.json`);
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.02)]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
          >
            <Save className="h-4 w-4" />
            Save Message
          </button>
        </div>
      </div>

      {/* Sub-tab navigation (dynamic template tabs) */}
      {currentTemplate && currentTemplate.tabs.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 flex flex-wrap gap-2.5">
          {currentTemplate.tabs.map(tab => {
            const badgeCount = getTabBadgeCount(tab);
            return (
              <button
                key={tab.tabId}
                type="button"
                onClick={() => setActiveSubTabId(tab.tabId)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center gap-1.5 ${
                  activeSubTabId === tab.tabId
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                {tab.tabName}
                {badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black scale-95 shadow">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Form canvas */}
      <div className="p-8">
        {currentTemplate ? (
          <div className="space-y-8">
            {activeSubTab && (
              activeSubTabId === 'tab_followup' ? (
                <FollowUpTab
                  bookmarks={bookmarks}
                  notes={notes}
                  formValues={formValues}
                  currentTemplateFields={
                    currentTemplate
                      ? currentTemplate.tabs.flatMap(tab =>
                          tab.sections.flatMap(sec =>
                            sec.fields.map(f => ({ field: f, tabId: tab.tabId, tabName: tab.tabName }))
                          )
                        )
                      : []
                  }
                  onToggleBookmark={handleToggleBookmark}
                  onOpenNotes={handleOpenNotes}
                  onGoToField={(tabId) => {
                    setActiveSubTabId(tabId);
                  }}
                />
              ) : (
                <DynamicFormRenderer sections={activeSubTab.sections} />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">Loading form template configuration...</div>
        )}
      </div>
    </div>
  );
}
