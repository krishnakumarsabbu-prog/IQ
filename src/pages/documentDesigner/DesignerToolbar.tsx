import React from 'react';
import { Undo2, Redo2, Copy, Clipboard, Trash2, BringToFront, SendToBack, Copy as Duplicate, AlignLeft, AlignRight, AlignCenter, AlignHorizontalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, Group, Ungroup, Lock, Unlock, RotateCw, ZoomIn, ZoomOut, Save, Eye, Download, FileDown, Grid3x3 as Grid3X3, Ruler, Maximize, ChevronDown } from 'lucide-react';

interface DesignerToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  isLocked: boolean;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  showMargins: boolean;
  previewMode: boolean;
  isSaving: boolean;
  templateName: string;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onBringFront: () => void;
  onSendBack: () => void;
  onDuplicate: () => void;
  onAlignLeft: () => void;
  onAlignRight: () => void;
  onAlignCenter: () => void;
  onAlignTop: () => void;
  onAlignBottom: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onToggleLock: () => void;
  onRotate: () => void;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleMargins: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  onTemplateNameChange: (name: string) => void;
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

const ToolbarBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ onClick, disabled, active, title, children, danger }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center ${
      disabled
        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
        : active
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
        : danger
        ? 'text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />;

const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
  canUndo, canRedo, hasSelection, isLocked, zoom,
  showGrid, showRulers, showMargins, previewMode, isSaving,
  templateName,
  onUndo, onRedo, onCopy, onPaste, onDelete,
  onBringFront, onSendBack, onDuplicate,
  onAlignLeft, onAlignRight, onAlignCenter, onAlignTop, onAlignBottom,
  onGroup, onUngroup, onToggleLock, onRotate,
  onZoomChange, onToggleGrid, onToggleRulers, onToggleMargins,
  onTogglePreview, onSave, onExportDocx, onExportPdf,
  onTemplateNameChange,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center gap-0.5 flex-wrap shadow-sm">
      {/* Template name */}
      <input
        value={templateName}
        onChange={e => onTemplateNameChange(e.target.value)}
        className="text-sm font-semibold text-slate-800 dark:text-white bg-transparent border-none outline-none w-52 mr-2 truncate focus:bg-slate-50 dark:focus:bg-slate-800 focus:px-2 rounded"
        placeholder="Document name..."
      />
      <Divider />

      {/* History */}
      <ToolbarBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo2 className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Clipboard */}
      <ToolbarBtn onClick={onCopy} disabled={!hasSelection} title="Copy (Ctrl+C)">
        <Copy className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onPaste} title="Paste (Ctrl+V)">
        <Clipboard className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onDuplicate} disabled={!hasSelection} title="Duplicate (Ctrl+D)">
        <Duplicate className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onDelete} disabled={!hasSelection} title="Delete" danger>
        <Trash2 className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Z-order */}
      <ToolbarBtn onClick={onBringFront} disabled={!hasSelection} title="Bring to Front">
        <BringToFront className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onSendBack} disabled={!hasSelection} title="Send to Back">
        <SendToBack className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Align */}
      <ToolbarBtn onClick={onAlignLeft} disabled={!hasSelection} title="Align Left">
        <AlignLeft className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onAlignCenter} disabled={!hasSelection} title="Align Center">
        <AlignHorizontalJustifyCenter className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onAlignRight} disabled={!hasSelection} title="Align Right">
        <AlignRight className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onAlignTop} disabled={!hasSelection} title="Align Top">
        <AlignVerticalJustifyStart className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onAlignBottom} disabled={!hasSelection} title="Align Bottom">
        <AlignVerticalJustifyEnd className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Group / Lock / Rotate */}
      <ToolbarBtn onClick={onGroup} disabled={!hasSelection} title="Group">
        <Group className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onUngroup} disabled={!hasSelection} title="Ungroup">
        <Ungroup className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onToggleLock} disabled={!hasSelection} title={isLocked ? 'Unlock' : 'Lock'}>
        {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </ToolbarBtn>
      <ToolbarBtn onClick={onRotate} disabled={!hasSelection} title="Rotate 90°">
        <RotateCw className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* View toggles */}
      <ToolbarBtn onClick={onToggleGrid} active={showGrid} title="Toggle Grid">
        <Grid3X3 className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onToggleRulers} active={showRulers} title="Toggle Rulers">
        <Ruler className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={onToggleMargins} active={showMargins} title="Toggle Margins">
        <Maximize className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Zoom */}
      <ToolbarBtn onClick={() => onZoomChange(Math.max(25, zoom - 25))} title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </ToolbarBtn>
      <select
        value={zoom}
        onChange={e => onZoomChange(Number(e.target.value))}
        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 w-20 cursor-pointer"
      >
        {ZOOM_PRESETS.map(z => (
          <option key={z} value={z}>{z}%</option>
        ))}
      </select>
      <ToolbarBtn onClick={() => onZoomChange(Math.min(400, zoom + 25))} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Preview */}
      <ToolbarBtn onClick={onTogglePreview} active={previewMode} title="Preview Mode">
        <Eye className="h-4 w-4" />
      </ToolbarBtn>
      <Divider />

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
      >
        <Save className="h-3.5 w-3.5" />
        {isSaving ? 'Saving...' : 'Save'}
      </button>

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Export
          <ChevronDown className="h-3 w-3" />
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-8 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden w-40">
            <button
              onClick={() => { onExportDocx(); setShowExportMenu(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FileDown className="h-4 w-4 text-blue-500" />
              Export DOCX
            </button>
            <button
              onClick={() => { onExportPdf(); setShowExportMenu(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FileDown className="h-4 w-4 text-red-500" />
              Export PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerToolbar;
