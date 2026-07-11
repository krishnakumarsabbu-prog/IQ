import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { setPageInfo } from '../../store/slices/uiSlice';
import Layout from '../../components/Layout';
import DocumentCanvas from './DocumentCanvas';
import DesignerToolbar from './DesignerToolbar';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { DocumentTemplate, DocumentElement, MongoField } from './types';
import { documentLayoutService } from './documentLayoutService';
import { exportToDocx } from './exportDocx';
import { exportToPdf } from './exportPdf';
import { TreeNode } from './LeftPanel';
import { FileText, Plus, FolderOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PREVIEW_DATA: Record<string, string> = {
  customerName: 'John Smith',
  customerId: 'CUST-001234',
  customerAddress: '1234 Main Street, Charlotte, NC 28201',
  customerNumber: '7891234560',
  loanNumber: 'LN-2024-98765',
  loanAmount: '$125,000.00',
  interestRate: '6.75%',
  loanStatus: 'Active',
  companyName: 'Wells Fargo Bank, N.A.',
  companyAddress: '420 Montgomery Street, San Francisco, CA 94104',
  companyPhone: '1-800-869-3557',
  companyEmail: 'support@wellsfargo.com',
  today: new Date().toLocaleDateString(),
  pageNumber: '1',
  totalPages: '2',
  employeeId: 'EMP-4521',
  branchCode: 'WF-SF-001',
  accountBalance: '$45,231.50',
  dueDate: '2025-12-31',
  referenceNumber: 'REF-20240701-001',
};

const MAX_HISTORY = 50;

type HistoryEntry = DocumentTemplate;

function buildTree(elements: DocumentElement[]): TreeNode[] {
  return elements.map(el => ({
    id: el.id,
    label: el.content || el.binding?.field || el.type,
    type: el.type,
  }));
}

const DocumentLayoutDesigner: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageInfo({ title: 'Document Layout Designer', tagline: 'Design printable document templates with drag-and-drop' }));
  }, [dispatch]);

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [showMargins, setShowMargins] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [mongoFields, setMongoFields] = useState<MongoField[]>([]);
  const [showTemplateList, setShowTemplateList] = useState(false);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyPosRef = useRef(-1);
  const clipboard = useRef<DocumentElement[]>([]);
  const autosaveTimer = useRef<ReturnType<typeof setInterval>>();

  // Load templates and fields on mount
  useEffect(() => {
    documentLayoutService.getAllLayouts().then(setTemplates);
    documentLayoutService.getMongoFields().then(setMongoFields);
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      if (activeTemplate) {
        documentLayoutService.saveLayout(activeTemplate).catch(() => {});
      }
    }, 30000);
    return () => { if (autosaveTimer.current) clearInterval(autosaveTimer.current); };
  }, [activeTemplate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z': e.preventDefault(); handleUndo(); break;
          case 'y': e.preventDefault(); handleRedo(); break;
          case 'c': e.preventDefault(); handleCopy(); break;
          case 'v': e.preventDefault(); handlePaste(); break;
          case 'd': e.preventDefault(); handleDuplicate(); break;
          case 's': e.preventDefault(); handleSave(); break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) handleDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function pushHistory(t: DocumentTemplate) {
    const newHistory = historyRef.current.slice(0, historyPosRef.current + 1);
    newHistory.push(JSON.parse(JSON.stringify(t)));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    historyRef.current = newHistory;
    historyPosRef.current = newHistory.length - 1;
  }

  function updateTemplate(t: DocumentTemplate, pushToHistory = true) {
    setActiveTemplate(t);
    if (pushToHistory) pushHistory(t);
  }

  function handleUndo() {
    if (historyPosRef.current <= 0) return;
    historyPosRef.current--;
    const prev = historyRef.current[historyPosRef.current];
    setActiveTemplate(JSON.parse(JSON.stringify(prev)));
  }

  function handleRedo() {
    if (historyPosRef.current >= historyRef.current.length - 1) return;
    historyPosRef.current++;
    const next = historyRef.current[historyPosRef.current];
    setActiveTemplate(JSON.parse(JSON.stringify(next)));
  }

  function getPage(t: DocumentTemplate) {
    return t.pages[currentPage] || t.pages[0];
  }

  function updatePageElements(t: DocumentTemplate, elements: DocumentElement[]): DocumentTemplate {
    const pages = t.pages.map((p, i) =>
      i === currentPage ? { ...p, elements } : p
    );
    return { ...t, pages };
  }

  function handleUpdateElement(id: string, updates: Partial<DocumentElement>) {
    if (!activeTemplate) return;
    const page = getPage(activeTemplate);
    const elements = page.elements.map(el => el.id === id ? { ...el, ...updates } : el);
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAddElement(el: DocumentElement) {
    if (!activeTemplate) return;
    
    // If it's a keyvalue table, populate it with all mongo fields!
    if (el.type === 'table' && el.tableType === 'keyvalue') {
      el.columns = mongoFields.map(f => ({
        id: `col_${f.id}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        header: f.label,
        binding: f.id,
        width: 250,
      }));
      el.height = Math.max(150, 30 + mongoFields.length * 24);
    }

    const page = getPage(activeTemplate);
    const elements = [...page.elements, { ...el, zIndex: page.elements.length }];
    const updated = updatePageElements(activeTemplate, elements);
    updateTemplate(updated);
    setSelectedIds([el.id]);
  }

  function handleSelectElement(ids: string[]) {
    setSelectedIds(ids);
  }

  function handleCopy() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    clipboard.current = page.elements.filter(el => selectedIds.includes(el.id));
  }

  function handlePaste() {
    if (!activeTemplate || clipboard.current.length === 0) return;
    const page = getPage(activeTemplate);
    const newEls = clipboard.current.map(el => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: el.x + 20,
      y: el.y + 20,
    }));
    const elements = [...page.elements, ...newEls];
    const updated = updatePageElements(activeTemplate, elements);
    updateTemplate(updated);
    setSelectedIds(newEls.map(e => e.id));
  }

  function handleDuplicate() {
    handleCopy();
    setTimeout(() => handlePaste(), 0);
  }

  function handleDelete() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const elements = page.elements.filter(el => !selectedIds.includes(el.id));
    updateTemplate(updatePageElements(activeTemplate, elements));
    setSelectedIds([]);
  }

  function handleBringFront() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const maxZ = Math.max(...page.elements.map(e => e.zIndex));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, zIndex: maxZ + 1 } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleSendBack() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const minZ = Math.min(...page.elements.map(e => e.zIndex));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, zIndex: minZ - 1 } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAlignLeft() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const minX = Math.min(...page.elements.filter(e => selectedIds.includes(e.id)).map(e => e.x));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, x: minX } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAlignRight() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const maxX = Math.max(...page.elements.filter(e => selectedIds.includes(e.id)).map(e => e.x + e.width));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, x: maxX - el.width } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAlignCenter() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const sel = page.elements.filter(e => selectedIds.includes(e.id));
    const minX = Math.min(...sel.map(e => e.x));
    const maxX = Math.max(...sel.map(e => e.x + e.width));
    const midX = (minX + maxX) / 2;
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, x: Math.round(midX - el.width / 2) } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAlignTop() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const minY = Math.min(...page.elements.filter(e => selectedIds.includes(e.id)).map(e => e.y));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, y: minY } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleAlignBottom() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const maxY = Math.max(...page.elements.filter(e => selectedIds.includes(e.id)).map(e => e.y + e.height));
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, y: maxY - el.height } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleToggleLock() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const allLocked = page.elements.filter(e => selectedIds.includes(e.id)).every(e => e.locked);
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, locked: !allLocked } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  function handleRotate() {
    if (!activeTemplate || selectedIds.length === 0) return;
    const page = getPage(activeTemplate);
    const elements = page.elements.map(el =>
      selectedIds.includes(el.id) ? { ...el, rotation: ((el.rotation || 0) + 90) % 360 } : el
    );
    updateTemplate(updatePageElements(activeTemplate, elements));
  }

  async function handleSave() {
    if (!activeTemplate) return;
    setIsSaving(true);
    try {
      const saved = await documentLayoutService.saveLayout(activeTemplate);
      setActiveTemplate(saved);
      const all = await documentLayoutService.getAllLayouts();
      setTemplates(all);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExportDocx() {
    if (!activeTemplate) return;
    setIsSaving(true);
    let templateToExport = activeTemplate;
    try {
      const saved = await documentLayoutService.saveLayout(activeTemplate);
      setActiveTemplate(saved);
      templateToExport = saved;
      const all = await documentLayoutService.getAllLayouts();
      setTemplates(all);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
    await exportToDocx(templateToExport, previewMode ? PREVIEW_DATA : undefined);
  }

  async function handleExportPdf() {
    if (!activeTemplate) return;
    setIsSaving(true);
    let templateToExport = activeTemplate;
    try {
      const saved = await documentLayoutService.saveLayout(activeTemplate);
      setActiveTemplate(saved);
      templateToExport = saved;
      const all = await documentLayoutService.getAllLayouts();
      setTemplates(all);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
    await exportToPdf(templateToExport, previewMode ? PREVIEW_DATA : undefined);
  }

  function handleNewTemplate() {
    const t = documentLayoutService.createEmptyLayout('Untitled Document');
    historyRef.current = [];
    historyPosRef.current = -1;
    pushHistory(t);
    setActiveTemplate(t);
    setSelectedIds([]);
    setCurrentPage(0);
    setShowTemplateList(false);
  }

  function handleOpenTemplate(t: DocumentTemplate) {
    historyRef.current = [];
    historyPosRef.current = -1;
    pushHistory(t);
    setActiveTemplate(JSON.parse(JSON.stringify(t)));
    setSelectedIds([]);
    setCurrentPage(0);
    setShowTemplateList(false);
  }

  function handleAddPage() {
    if (!activeTemplate) return;
    const newPage = { id: `page_${Date.now()}`, elements: [] };
    const updated = { ...activeTemplate, pages: [...activeTemplate.pages, newPage] };
    updateTemplate(updated);
    setCurrentPage(updated.pages.length - 1);
  }

  const canUndo = historyPosRef.current > 0;
  const canRedo = historyPosRef.current < historyRef.current.length - 1;

  const selectedEl = activeTemplate
    ? getPage(activeTemplate).elements.find(el => el.id === selectedIds[0]) || null
    : null;

  const isLocked = selectedIds.length > 0 && activeTemplate
    ? getPage(activeTemplate).elements.filter(e => selectedIds.includes(e.id)).every(e => e.locked)
    : false;

  const documentTree: TreeNode[] = activeTemplate
    ? buildTree(getPage(activeTemplate).elements)
    : [];

  // Splash screen when no template active
  if (!activeTemplate) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Document Layout Designer</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
              Create and manage printable document templates. Drag components onto the canvas, bind dynamic fields, and export to DOCX or PDF.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleNewTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Document
            </button>
            {templates.length > 0 && (
              <button
                onClick={() => setShowTemplateList(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow-sm transition-all"
              >
                <FolderOpen className="h-5 w-5" />
                Open Existing ({templates.length})
              </button>
            )}
          </div>

          {/* Recent templates */}
          {templates.length > 0 && (
            <div className="w-full max-w-2xl">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Recent Documents</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.slice(0, 6).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleOpenTemplate(t)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-left transition-all group"
                  >
                    <div className="w-10 h-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">{t.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{t.paper} • {t.orientation} • {t.pages?.length || 0} pages</div>
                      <div className={`text-[10px] mt-0.5 font-medium ${t.status === 'published' ? 'text-green-600' : 'text-amber-500'}`}>{t.status}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template list modal */}
        {showTemplateList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">Open Document</h3>
                <button onClick={() => setShowTemplateList(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleOpenTemplate(t)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.paper} • {t.orientation} • {t.updatedDate ? new Date(t.updatedDate).toLocaleDateString() : 'No date'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full -m-6 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Toolbar */}
        <DesignerToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={selectedIds.length > 0}
          isLocked={isLocked}
          zoom={zoom}
          showGrid={showGrid}
          showRulers={showRulers}
          showMargins={showMargins}
          previewMode={previewMode}
          isSaving={isSaving}
          templateName={activeTemplate.name}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDelete={handleDelete}
          onBringFront={handleBringFront}
          onSendBack={handleSendBack}
          onDuplicate={handleDuplicate}
          onAlignLeft={handleAlignLeft}
          onAlignRight={handleAlignRight}
          onAlignCenter={handleAlignCenter}
          onAlignTop={handleAlignTop}
          onAlignBottom={handleAlignBottom}
          onGroup={() => {}}
          onUngroup={() => {}}
          onToggleLock={handleToggleLock}
          onRotate={handleRotate}
          onZoomChange={setZoom}
          onToggleGrid={() => setShowGrid(v => !v)}
          onToggleRulers={() => setShowRulers(v => !v)}
          onToggleMargins={() => setShowMargins(v => !v)}
          onTogglePreview={() => setPreviewMode(v => !v)}
          onSave={handleSave}
          onExportDocx={handleExportDocx}
          onExportPdf={handleExportPdf}
          onTemplateNameChange={name => updateTemplate({ ...activeTemplate, name }, false)}
        />

        {/* Main designer area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <LeftPanel
            mongoFields={mongoFields}
            selectedIds={selectedIds}
            documentTree={documentTree}
            onSelectElement={id => setSelectedIds([id])}
            onAddElement={handleAddElement}
          />

          {/* Canvas area with page controls */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-800">
            {/* Page tabs */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-xs">
              {activeTemplate.pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setCurrentPage(i); setSelectedIds([]); }}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    currentPage === i
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Page {i + 1}
                </button>
              ))}
              <button
                onClick={handleAddPage}
                className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Add page"
              >
                + Add Page
              </button>
              {previewMode && (
                <span className="ml-auto text-blue-600 dark:text-blue-400 font-semibold animate-pulse">PREVIEW MODE</span>
              )}
              <button
                onClick={() => { setActiveTemplate(null); setSelectedIds([]); }}
                className="ml-auto flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Back to template list"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            <DocumentCanvas
              template={activeTemplate}
              selectedIds={selectedIds}
              zoom={zoom}
              showGrid={showGrid}
              showRulers={showRulers}
              showMargins={showMargins}
              currentPage={currentPage}
              onSelectElement={handleSelectElement}
              onUpdateElement={handleUpdateElement}
              onAddElement={handleAddElement}
              previewMode={previewMode}
              previewData={previewMode ? PREVIEW_DATA : undefined}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-slate-200 dark:bg-slate-800/80 border-t border-slate-300 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>{activeTemplate.paper} • {activeTemplate.orientation}</span>
                <span>Page {currentPage + 1} of {activeTemplate.pages.length}</span>
                {selectedEl && (
                  <span>
                    {selectedEl.type} — x:{selectedEl.x} y:{selectedEl.y} w:{selectedEl.width} h:{selectedEl.height}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span>{getPage(activeTemplate).elements.length} elements</span>
                <span className={activeTemplate.status === 'published' ? 'text-green-600' : 'text-amber-500'}>
                  {activeTemplate.status || 'draft'}
                </span>
                {isSaving && <span className="text-blue-500 animate-pulse">Saving...</span>}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <RightPanel
            selectedElement={selectedEl}
            mongoFields={mongoFields}
            template={{
              paper: activeTemplate.paper,
              orientation: activeTemplate.orientation,
              margins: activeTemplate.margins,
            }}
            onUpdateElement={handleUpdateElement}
            onUpdateTemplate={updates => {
              const updated = { ...activeTemplate, ...updates };
              updateTemplate(updated);
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DocumentLayoutDesigner;
