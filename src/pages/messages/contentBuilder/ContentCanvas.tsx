/**
 * contentBuilder/ContentCanvas.tsx
 * ─────────────────────────────────
 * CENTER PANEL — Drag-and-Drop Content Canvas
 *
 * Features:
 *  - Drop zone for new components dragged from the library
 *  - Ordered list of canvas components (each row is editable inline)
 *  - Per-row toolbar: move up/down, duplicate, delete, lock
 *  - Inline text & URL editing
 *  - "Add Component" footer button
 *  - Keyboard-accessible
 *
 * Uses native HTML5 DnD (no extra package required beyond what the
 * project already has) for reordering existing canvas rows.
 */

import React, { useState, useRef } from 'react';
import {
  GripVertical, ChevronUp, ChevronDown, Copy, Trash2,
  Lock, Unlock, Plus, LayoutTemplate, Pencil, Link,
} from 'lucide-react';
import { useContentBuilderContext } from './useContentBuilder';
import type { CanvasComponent } from './types';
import { COMPONENT_LIBRARY } from './constants';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format the badge number shown in the left circle (1-based) */
function rowBadge(order: number, color: string) {
  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 ${color}`}
    >
      {order + 1}
    </div>
  );
}

const KIND_BADGE_COLORS: Record<string, string> = {
  pageheader: 'bg-blue-600',
  heading:    'bg-blue-500',
  subheading: 'bg-sky-500',
  paragraph:  'bg-slate-400',
  cta:        'bg-amber-500',
  link:       'bg-purple-500',
  image:      'bg-pink-500',
  banner:     'bg-rose-500',
  divider:    'bg-slate-300',
  spacer:     'bg-slate-300',
};

function badgeColor(kind: string) {
  return KIND_BADGE_COLORS[kind] ?? 'bg-slate-500';
}

// ── Single Canvas Row ─────────────────────────────────────────────────────────

interface CanvasRowProps {
  comp: CanvasComponent;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent) => void;
    onDragOver:  (e: React.DragEvent) => void;
    onDrop:      (e: React.DragEvent) => void;
    onDragEnd:   () => void;
  };
}

function CanvasRow({ comp, isFirst, isLast, isSelected, onSelect, dragHandlers }: CanvasRowProps) {
  const {
    removeComponent,
    moveComponent,
    duplicateComponent,
    updateComponent,
  } = useContentBuilderContext();

  const [editingText, setEditingText] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);
  const urlRef  = useRef<HTMLInputElement>(null);

  const hasUrl = comp.kind === 'cta' || comp.kind === 'link' || comp.kind === 'quickaction';

  return (
    <div
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      onDragEnd={dragHandlers.onDragEnd}
      onClick={onSelect}
      className={`group relative rounded-xl border transition-all duration-150 cursor-pointer
        ${isSelected
          ? 'border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]'
          : 'border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        {/* Drag handle */}
        <GripVertical className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 flex-shrink-0 cursor-grab" />

        {/* Row number badge */}
        {rowBadge(comp.order, badgeColor(comp.kind))}

        {/* Kind label chip */}
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800
          px-2 py-0.5 rounded-md flex-shrink-0 min-w-[60px] text-center">
          {comp.label}
        </span>

        {/* Inline text editor */}
        {editingText ? (
          <input
            ref={textRef}
            autoFocus
            className="flex-1 text-xs text-slate-700 dark:text-slate-200 bg-transparent border-b border-blue-500
              outline-none pb-0.5 min-w-0"
            value={comp.text}
            onChange={e => updateComponent(comp.id, { text: e.target.value })}
            onBlur={() => setEditingText(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingText(false); }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate"
            onDoubleClick={e => { e.stopPropagation(); setEditingText(true); }}
          >
            {comp.text || <span className="text-slate-300 dark:text-slate-600 italic">Empty — double-click to edit</span>}
          </span>
        )}

        {/* Row toolbar (visible on hover or when selected) */}
        <div className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            type="button"
            title="Edit text"
            onClick={e => { e.stopPropagation(); setEditingText(true); setTimeout(() => textRef.current?.focus(), 0); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Move up"
            disabled={isFirst}
            onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'up'); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Move down"
            disabled={isLast}
            onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'down'); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Duplicate"
            onClick={e => { e.stopPropagation(); duplicateComponent(comp.id); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            type="button"
            title={comp.locked ? 'Unlock' : 'Lock'}
            onClick={e => { e.stopPropagation(); updateComponent(comp.id, { locked: !comp.locked }); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
          >
            {comp.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
          <button
            type="button"
            title="Delete"
            onClick={e => { e.stopPropagation(); removeComponent(comp.id); }}
            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* URL sub-row (CTA / Link) */}
      {hasUrl && (
        <div className="flex items-center gap-2 px-2.5 pb-2 pl-14">
          <Link className="h-3 w-3 text-slate-400 flex-shrink-0" />
          {editingUrl ? (
            <input
              ref={urlRef}
              autoFocus
              className="flex-1 text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-b border-blue-500
                outline-none pb-0.5 font-mono min-w-0"
              value={comp.url ?? ''}
              onChange={e => updateComponent(comp.id, { url: e.target.value })}
              onBlur={() => setEditingUrl(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditingUrl(false); }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate cursor-pointer hover:text-blue-500 transition-colors"
              onDoubleClick={e => { e.stopPropagation(); setEditingUrl(true); }}
              title={comp.url}
            >
              {comp.url || 'https://...'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Canvas Toolbar Bar (above canvas rows) ────────────────────────────────────

function CanvasToolbar() {
  return (
    <div className="flex items-center justify-end gap-2 px-1 pb-2">
      {(['B', 'I', '{ }', 'Placeholder'].map(btn => (
        <button
          key={btn}
          type="button"
          className="px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400
            hover:text-slate-700 dark:hover:text-slate-200
            bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
            rounded-md transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          {btn}
        </button>
      )))}
    </div>
  );
}

// ── Empty Drop Zone ───────────────────────────────────────────────────────────

function EmptyDropZone({ onDragOver, onDrop }: {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed
        border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30
        text-slate-400 dark:text-slate-600 gap-2 transition-all"
    >
      <LayoutTemplate className="h-8 w-8" />
      <p className="text-sm font-semibold">Drop components here</p>
      <p className="text-xs">Drag from the left panel or click any component</p>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function ContentCanvas() {
  const {
    components,
    addComponent,
    reorderComponents,
    selectedComponentId,
    setSelectedComponentId,
    setIsDragging,
  } = useContentBuilderContext();

  // Track which index is being dragged for reordering
  const dragFromIdx = useRef<number | null>(null);

  // ── Drop from library ────────────────────────────────────────────────────

  const handleDropFromLibrary = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData('application/x-component-kind');
    if (!kind) return;
    const def = COMPONENT_LIBRARY.find(d => d.kind === kind);
    if (def) addComponent(def);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // ── Reorder existing rows ────────────────────────────────────────────────

  const makeRowDragHandlers = (idx: number) => ({
    onDragStart: (e: React.DragEvent) => {
      dragFromIdx.current = idx;
      e.dataTransfer.effectAllowed = 'move';
      // Clear library kind so we know this is a reorder
      e.dataTransfer.setData('application/x-reorder', String(idx));
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const fromStr = e.dataTransfer.getData('application/x-reorder');
      if (!fromStr) return; // library drop handled by canvas wrapper
      const from = parseInt(fromStr, 10);
      if (!isNaN(from) && from !== idx) {
        reorderComponents(from, idx);
      }
    },
    onDragEnd: () => {
      dragFromIdx.current = null;
    },
  });

  const sorted = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="w-0.5 h-3.5 bg-slate-500 rounded-full" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Components
          </span>
        </div>
        <CanvasToolbar />
      </div>

      {/* Drop area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-1.5"
        onDragOver={handleDragOver}
        onDrop={handleDropFromLibrary}
      >
        {sorted.length === 0 ? (
          <EmptyDropZone onDragOver={handleDragOver} onDrop={handleDropFromLibrary} />
        ) : (
          <>
            {sorted.map((comp, idx) => (
              <CanvasRow
                key={comp.id}
                comp={comp}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                isSelected={comp.id === selectedComponentId}
                onSelect={() => setSelectedComponentId(comp.id === selectedComponentId ? null : comp.id)}
                dragHandlers={makeRowDragHandlers(idx)}
              />
            ))}
          </>
        )}
      </div>

      {/* Add Component footer */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => {
            // Add a paragraph as a quick default
            const def = COMPONENT_LIBRARY.find(d => d.kind === 'paragraph');
            if (def) addComponent(def);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold
            rounded-xl border border-dashed border-slate-300 dark:border-slate-700
            text-slate-500 dark:text-slate-400
            hover:border-blue-400 dark:hover:border-blue-600
            hover:text-blue-600 dark:hover:text-blue-400
            hover:bg-blue-50/30 dark:hover:bg-blue-950/20
            transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Component
        </button>
      </div>
    </div>
  );
}
