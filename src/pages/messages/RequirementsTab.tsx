/**
 * RequirementsTab.tsx
 * ───────────────────
 * Rendered inside the main Wizard Card in MessageWizard.tsx.
 * Displays:
 *   - Action Toolbar (Follow Up, Import, Export, Save/Update) right-aligned.
 *   - Sub-tab navigation (inner template tabs).
 *   - Dynamic form canvas.
 */

import { useState, useMemo, useEffect } from 'react';
import { Download, Save, Bookmark, Search, X, Check, ArrowRight, FileText } from 'lucide-react';
import { useMessageFormContext } from './useMessageForm';
import DynamicFormRenderer from './DynamicFormRenderer';
import FollowUpTab from './FollowUpTab';
import { documentLayoutService } from '../documentDesigner/documentLayoutService';
import { exportToDocx } from '../documentDesigner/exportDocx';
import { exportToPdf } from '../documentDesigner/exportPdf';
import { DocumentTemplate } from '../documentDesigner/types';

export default function RequirementsTab() {
  const {
    isEditingExistingMessage,
    messages,
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
    reset,
    handleSubmit,
    onSubmit,
    onSubmitAsNew,
  } = useMessageFormContext();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [layouts, setLayouts] = useState<DocumentTemplate[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  useEffect(() => {
    async function loadLayouts() {
      try {
        const list = await documentLayoutService.getAllLayouts();
        setLayouts(list);
        if (list.length > 0) {
          setSelectedLayoutId(list[0].id || '');
        }
      } catch (e) {
        console.error('Failed to load document layouts:', e);
      }
    }
    loadLayouts();
  }, []);

  const handleDownloadDocx = async () => {
    const layout = layouts.find(l => l.id === selectedLayoutId);
    if (!layout) {
      alert('Please select a document layout first.');
      return;
    }
    const populatedValues = {
      today: new Date().toLocaleDateString(),
      ...formValues
    };
    await exportToDocx(layout, populatedValues);
  };

  const handleDownloadPdf = async () => {
    const layout = layouts.find(l => l.id === selectedLayoutId);
    if (!layout) {
      alert('Please select a document layout first.');
      return;
    }
    const populatedValues = {
      today: new Date().toLocaleDateString(),
      ...formValues
    };
    await exportToPdf(layout, populatedValues);
  };

  // Filter messages for the import modal
  const filteredImportMessages = useMemo(() => {
    return messages.filter(msg => {
      const q = importSearch.toLowerCase();
      return (
        msg.messageId.toLowerCase().includes(q) ||
        (msg.messageName && msg.messageName.toLowerCase().includes(q)) ||
        (msg.messageType && msg.messageType.toLowerCase().includes(q))
      );
    });
  }, [messages, importSearch]);

  // Handle importing a message's values
  const handleImportMessage = (msg: any) => {
    if (msg.templateId) {
      handleTemplateChange(msg.templateId);
    }
    
    // Fill the fields with imported values
    reset(msg.formValues || {});

    // Show visual confirmation
    setSuccessBanner(`Imported configuration from "${msg.messageName || msg.messageId}"`);
    setTimeout(() => setSuccessBanner(null), 3000);
    setIsImportModalOpen(false);
  };

  // Calculate total bookmarks and notes for Follow Up badge
  const totalFollowUpCount = useMemo(() => {
    let count = 0;
    if (!currentTemplate) return 0;
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (bookmarks[f.fieldKey]) count++;
          if (notes[f.fieldKey] && notes[f.fieldKey].length > 0) {
            count += notes[f.fieldKey].length;
          }
        });
      });
    });
    return count;
  }, [currentTemplate, bookmarks, notes]);

  return (
    <div className="relative">
      
      {/* Toast Notification */}
      {successBanner && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-500 dark:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fadeIn">
          <Check className="h-4 w-4" />
          {successBanner}
        </div>
      )}

      {/* Action Toolbar: All buttons aligned to the right: followup, import, export, update, save */}
      <div className="flex items-center justify-end border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 bg-slate-50/5 dark:bg-slate-950/5">
        <div className="flex flex-wrap items-center gap-2.5 justify-end">
          
          {/* 1. Follow Up Button */}
          <button
            type="button"
            onClick={() => setActiveSubTabId('tab_followup')}
            className={`border px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.02)] ${
              activeSubTabId === 'tab_followup'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${activeSubTabId === 'tab_followup' ? 'text-white' : 'text-amber-500'}`} />
            Follow Up
            {totalFollowUpCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black scale-90 shadow ${
                activeSubTabId === 'tab_followup' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
              }`}>
                {totalFollowUpCount}
              </span>
            )}
          </button>

          {/* 2. Import Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.02)]"
          >
            <Download className="h-4 w-4 rotate-180 text-blue-500" />
            Import
          </button>

          {/* 3. Export Button */}
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
            <Download className="h-4 w-4 text-emerald-500" />
            Export Config
          </button>

          {/* Document Generator Section */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <select
              value={selectedLayoutId}
              onChange={(e) => setSelectedLayoutId(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-white text-xs font-bold px-2.5 py-1 outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="" disabled className="bg-white dark:bg-slate-900">Choose Layout</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id} className="bg-white dark:bg-slate-900">{layout.name}</option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={handleDownloadDocx}
              className="bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              title="Download Word Document"
            >
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              Word
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              title="Download PDF Document"
            >
              <FileText className="h-3.5 w-3.5 text-red-500" />
              PDF
            </button>
          </div>

          {/* 4. Update Message (Only visible when editing an existing message) */}
          {isEditingExistingMessage && (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
            >
              <Save className="h-4 w-4" />
              Update Message
            </button>
          )}

          {/* 5. Save Message Button */}
          <button
            type="button"
            onClick={handleSubmit(onSubmitAsNew)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
          >
            <Save className="h-4 w-4" />
            Save Message
          </button>
        </div>
      </div>

      {currentTemplate && currentTemplate.tabs.length > 0 && (
        <div className="border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 bg-slate-50/20 dark:bg-slate-950/5">
          <div className="bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full flex w-full items-center gap-1 shadow-inner">
            {currentTemplate.tabs
              .filter(tab => tab.tabId !== 'tab_followup')
              .map(tab => {
                const badgeCount = getTabBadgeCount(tab);
                const isActive = activeSubTabId === tab.tabId;
                return (
                  <button
                    key={tab.tabId}
                    type="button"
                    onClick={() => setActiveSubTabId(tab.tabId)}
                    className={`flex-1 justify-center px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-250/20 dark:border-slate-800/40'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
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
        </div>
      )}

      {/* Form canvas */}
      <div className="p-8">
        {currentTemplate ? (
          <div className="space-y-8">
            {activeSubTabId === 'tab_followup' ? (
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
              activeSubTab && <DynamicFormRenderer sections={activeSubTab.sections} />
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">Loading form template configuration...</div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Existing Message Config</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select an existing message layout configuration to pre-populate form fields.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-6 border-b border-slate-150 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages by ID, name, or type..."
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[250px]">
              {filteredImportMessages.length > 0 ? (
                filteredImportMessages.map((msg) => (
                  <div
                    key={msg.messageId}
                    onClick={() => handleImportMessage(msg)}
                    className="group border border-slate-150 dark:border-slate-800/85 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                          {msg.messageId}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {msg.messageType}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          msg.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {msg.messageName}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Last modified: {msg.lastModified}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all">
                      Import Config
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-slate-450 dark:text-slate-505">No messages found matching search criteria</p>
                  <p className="text-xs text-slate-400">Try searching for another term or create a custom message config.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
