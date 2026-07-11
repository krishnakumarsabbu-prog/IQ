import React, { useState, useEffect, useRef } from 'react';
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
import { 
  FileText, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  MoreVertical, 
  Calendar, 
  User, 
  Upload, 
  CheckCircle2, 
  FileEdit, 
  FileCheck, 
  Clock, 
  Trash2, 
  Copy,
  ExternalLink
} from 'lucide-react';

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

  // Redesigned dashboard state variables
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNewDocDropdown, setShowNewDocDropdown] = useState(false);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyPosRef = useRef(-1);
  const clipboard = useRef<DocumentElement[]>([]);
  const autosaveTimer = useRef<ReturnType<typeof setInterval>>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close dropdowns and card menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNewDocDropdown(false);
      }
      if (activeCardMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.card-action-menu-btn') && !target.closest('.card-action-menu-dropdown')) {
          setActiveCardMenu(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCardMenu]);

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
    handleCreateNewTemplate('A4', 'portrait');
  }

  function handleCreateNewTemplate(paper: 'A4' | 'A3' | 'Letter' | 'Legal', orientation: 'portrait' | 'landscape') {
    const t = documentLayoutService.createEmptyLayout('Untitled Document');
    t.paper = paper;
    t.orientation = orientation;
    t.status = 'draft';
    historyRef.current = [];
    historyPosRef.current = -1;
    pushHistory(t);
    setActiveTemplate(t);
    setSelectedIds([]);
    setCurrentPage(0);
    setShowNewDocDropdown(false);
  }

  function handleOpenTemplate(t: DocumentTemplate) {
    historyRef.current = [];
    historyPosRef.current = -1;
    pushHistory(t);
    setActiveTemplate(JSON.parse(JSON.stringify(t)));
    setSelectedIds([]);
    setCurrentPage(0);
  }

  async function handleDeleteTemplate(id: string) {
    if (!window.confirm('Are you sure you want to delete this document layout?')) return;
    try {
      await documentLayoutService.deleteLayout(id);
      const all = await documentLayoutService.getAllLayouts();
      setTemplates(all);
      if (activeTemplate?.id === id) {
        setActiveTemplate(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDuplicateTemplate(template: DocumentTemplate) {
    try {
      const clone: DocumentTemplate = {
        ...JSON.parse(JSON.stringify(template)),
        id: undefined,
        name: `${template.name} (Copy)`,
        status: 'draft',
      };
      await documentLayoutService.saveLayout(clone);
      const all = await documentLayoutService.getAllLayouts();
      setTemplates(all);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleImportTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const layout = JSON.parse(event.target?.result as string) as DocumentTemplate;
        if (!layout.name || !layout.pages) {
          alert('Invalid template format. The JSON file must represent a valid document layout template.');
          return;
        }
        const toSave: DocumentTemplate = {
          ...layout,
          id: undefined,
          name: `${layout.name} (Imported)`,
        };
        await documentLayoutService.saveLayout(toSave);
        const all = await documentLayoutService.getAllLayouts();
        setTemplates(all);
        alert('Document Layout template imported successfully!');
      } catch (err) {
        alert('Failed to parse the imported JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  // Redesigned dashboard when no template active
  if (!activeTemplate) {
    const formatDateTime = (dateStr?: string) => {
      if (!dateStr) return 'No date';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch {
        return dateStr;
      }
    };

    // Filter and sort templates
    const filteredTemplates = templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && t.status === statusFilter;
    });

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedDate || 0).getTime() - new Date(a.updatedDate || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedDate || 0).getTime() - new Date(b.updatedDate || 0).getTime();
      }
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    // Pagination
    const totalItems = sortedTemplates.length;
    const totalPagesCount = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const paginatedTemplates = sortedTemplates.slice(startIndex, startIndex + itemsPerPage);

    const getCardStyle = (index: number) => {
      const styles = [
        { bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
        { bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
        { bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' },
        { bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' },
        { bg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' },
      ];
      return styles[index % styles.length];
    };

    const getStatusBadge = (status?: string) => {
      switch (status) {
        case 'published':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
              Published
            </span>
          );
        case 'draft':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50">
              Draft
            </span>
          );
        case 'generated':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              Generated
            </span>
          );
        case 'in progress':
        case 'in_progress':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50">
              In Progress
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border border-slate-100 dark:border-slate-900/50">
              {status || 'Draft'}
            </span>
          );
      }
    };

    return (
      <Layout>
        <div className="px-6 py-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100 font-sans">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Welcome back, Padma! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                Create, manage and organize all your documents in one place.
              </p>
            </div>
            
            <div className="flex items-center gap-3 relative">
              {/* Hidden file input for import */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportTemplate} 
                accept=".json" 
                className="hidden" 
              />

              {/* New Document Button with Dropdown */}
              <div className="flex items-center" ref={dropdownRef}>
                <button
                  onClick={handleNewTemplate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-l-xl transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  New Document
                </button>
                <button
                  onClick={() => setShowNewDocDropdown(v => !v)}
                  className="px-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-l border-blue-500 rounded-r-xl transition-all shadow-sm"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showNewDocDropdown && (
                  <div className="absolute right-[160px] top-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 w-48 z-30">
                    <button
                      onClick={() => handleCreateNewTemplate('A4', 'portrait')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>A4 Document</span>
                      <span className="text-[10px] text-slate-400">Portrait</span>
                    </button>
                    <button
                      onClick={() => handleCreateNewTemplate('A4', 'landscape')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>A4 Document</span>
                      <span className="text-[10px] text-slate-400">Landscape</span>
                    </button>
                    <button
                      onClick={() => handleCreateNewTemplate('Letter', 'portrait')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>Letter Document</span>
                      <span className="text-[10px] text-slate-400">Portrait</span>
                    </button>
                    <button
                      onClick={() => handleCreateNewTemplate('Legal', 'portrait')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span>Legal Document</span>
                      <span className="text-[10px] text-slate-400">Portrait</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Import Document Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all shadow-sm"
              >
                <Upload className="h-4 w-4 text-slate-500" />
                Import Document
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">All Documents</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{templates.length}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Total documents</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <FileEdit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Templates</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                  {templates.filter(t => t.status === 'published').length + 47}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Reusable templates</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Message Specs</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">32</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Generated specs</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tridion Published</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">21</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Published items</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drafts</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                  {templates.filter(t => t.status === 'draft').length + 22}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">In progress</p>
              </div>
            </div>
          </div>

          {/* Main Area Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 mt-8 shadow-sm">
            
            {/* Toolbar row inside main box */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">All Documents</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* View toggles */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageNum(1); }}
                    placeholder="Search documents..."
                    className="pl-9 pr-4 py-2 w-56 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPageNum(1); }}
                    className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:text-white cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:text-white cursor-pointer"
                  >
                    <option value="newest">Updated (Newest)</option>
                    <option value="oldest">Updated (Oldest)</option>
                    <option value="az">Name (A-Z)</option>
                    <option value="za">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List / Grid content */}
            {totalItems === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No documents found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Try adjusting your search query, status filters, or create a brand new layout document.
                </p>
                <button
                  onClick={handleNewTemplate}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-all"
                >
                  Create Document
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                {paginatedTemplates.map((t, idx) => {
                  const cardStyle = getCardStyle(idx);
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleOpenTemplate(t)}
                      className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left relative flex flex-col justify-between h-[220px] group cursor-pointer"
                    >
                      {/* Top section: Icon and Options Menu */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cardStyle.bg}`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveCardMenu(activeCardMenu === t.id ? null : t.id!); }}
                              className="p-1 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 card-action-menu-btn"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {/* Card menu popup */}
                            {activeCardMenu === t.id && (
                              <div className="absolute right-0 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 w-40 z-20 card-action-menu-dropdown">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenTemplate(t); setActiveCardMenu(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <FileEdit className="h-3.5 w-3.5 text-slate-400" />
                                  Open Editor
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(t); setActiveCardMenu(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); setActiveCardMenu(null); await exportToPdf(t, PREVIEW_DATA); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                  Export PDF
                                </button>
                                <button
                                  onClick={async (e) => { e.stopPropagation(); setActiveCardMenu(null); await exportToDocx(t, PREVIEW_DATA); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                  Export DOCX
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id!); setActiveCardMenu(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-850 dark:text-white line-clamp-2 mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          {t.paper} • {t.orientation} • {t.pages?.length || 1} {t.pages?.length === 1 ? 'page' : 'pages'}
                        </p>
                      </div>

                      {/* Bottom section: Badge & Meta info */}
                      <div>
                        <div className="mt-2.5">
                          {getStatusBadge(t.status)}
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {t.createdBy || 'Padma N'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t.updatedDate ? formatDateTime(t.updatedDate).split(',')[0] : 'No date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Paper Specs</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {paginatedTemplates.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => handleOpenTemplate(t)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-950/40 transition-colors`}>
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <span>{t.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {t.paper} • {t.orientation} • {t.pages?.length || 1} pages
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {t.createdBy || 'Padma N'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDateTime(t.updatedDate)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(t.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenTemplate(t)}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:text-slate-200 text-xs rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateTemplate(t)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t.id!)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPagesCount > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <div>
                  Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {Math.min(startIndex + itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-600 dark:text-slate-300">{totalItems}</span> documents
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPageNum === 1}
                    onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPagesCount }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPageNum(page)}
                        className={`w-7.5 h-7.5 flex items-center justify-center font-medium rounded-lg text-xs transition-all ${
                          currentPageNum === page
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    disabled={currentPageNum === totalPagesCount}
                    onClick={() => setCurrentPageNum(p => Math.min(totalPagesCount, p + 1))}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
              const updated: DocumentTemplate = {
                ...activeTemplate,
                ...updates,
                paper: (updates.paper || activeTemplate.paper) as any,
                orientation: (updates.orientation || activeTemplate.orientation) as any,
              };
              updateTemplate(updated);
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DocumentLayoutDesigner;
