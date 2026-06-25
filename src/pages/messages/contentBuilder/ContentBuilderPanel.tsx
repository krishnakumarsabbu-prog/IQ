/**
 * ContentBuilderPanel.tsx — Premium canvas panel
 * Key fixes:
 *  • text editing uses <textarea> (not <input>) → word selection works perfectly
 *  • "eye feast" premium row cards with gradient accents
 *  • header bars bg-slate-100 (gray), rest bg-white — visually separated
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GripVertical, Trash2, Plus, Link, Image,
  Upload, ChevronDown, ChevronUp, Copy,
} from 'lucide-react';
import { useContentBuilderContext } from './useContentBuilder';
import { PERSONALIZATION_VARIABLES, THEME_PRESETS } from './constants';
import type { CanvasComponent, ComponentKind } from './types';

// ── Badge colours per kind ────────────────────────────────────────────────────

const KIND_COLORS: Record<string, { bg: string; ring: string }> = {
  pageheader: { bg: 'bg-blue-600',   ring: 'ring-blue-400/40' },
  heading:    { bg: 'bg-blue-500',   ring: 'ring-blue-300/40' },
  subheading: { bg: 'bg-sky-500',    ring: 'ring-sky-300/40' },
  paragraph:  { bg: 'bg-slate-500',  ring: 'ring-slate-300/40' },
  richtext:   { bg: 'bg-indigo-500', ring: 'ring-indigo-300/40' },
  quote:      { bg: 'bg-violet-500', ring: 'ring-violet-300/40' },
  cta:        { bg: 'bg-amber-500',  ring: 'ring-amber-300/40' },
  link:       { bg: 'bg-purple-500', ring: 'ring-purple-300/40' },
  quickaction:{ bg: 'bg-orange-500', ring: 'ring-orange-300/40' },
  image:      { bg: 'bg-pink-500',   ring: 'ring-pink-300/40' },
  banner:     { bg: 'bg-rose-500',   ring: 'ring-rose-300/40' },
  video:      { bg: 'bg-red-500',    ring: 'ring-red-300/40' },
  divider:    { bg: 'bg-slate-400',  ring: 'ring-slate-200/40' },
  spacer:     { bg: 'bg-slate-300',  ring: 'ring-slate-200/40' },
};
const kindColor = (k: string) => KIND_COLORS[k] ?? { bg: 'bg-slate-500', ring: 'ring-slate-300/40' };

// ── Category colour accent stripe ─────────────────────────────────────────────

const CAT_STRIPE: Record<string, string> = {
  text:     'bg-blue-500',
  action:   'bg-amber-500',
  media:    'bg-pink-500',
  data:     'bg-emerald-500',
  layout:   'bg-slate-400',
  advanced: 'bg-violet-500',
};

// ── Placeholder popup ─────────────────────────────────────────────────────────

function PlaceholderPopup({ anchor, onClose }: { anchor: HTMLElement; onClose: () => void }) {
  const { components, selectedComponentId, updateComponent } = useContentBuilderContext();
  const rect = anchor.getBoundingClientRect();

  const insert = (v: string) => {
    if (!selectedComponentId) return;
    const comp = components.find(c => c.id === selectedComponentId);
    if (!comp) return;
    updateComponent(selectedComponentId, { text: comp.text + ' ' + v });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
          rounded-2xl shadow-2xl shadow-black/10 py-2 min-w-[220px] overflow-hidden"
        style={{ top: rect.bottom + 8, left: rect.left }}
      >
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-1.5">
          Personalization Variables
        </p>
        <div className="max-h-52 overflow-y-auto">
          {PERSONALIZATION_VARIABLES.map(v => (
            <button key={v} type="button" onClick={() => insert(v)}
              className="w-full text-left px-4 py-2 text-[11px] font-mono text-slate-600 dark:text-slate-300
                hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400
                transition-colors flex items-center gap-2">
              <span className="text-indigo-400 font-bold">{'{'}</span>
              {v.replace(/\{\{|\}\}/g, '')}
              <span className="text-indigo-400 font-bold">{'}'}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

interface CanvasRowProps {
  comp: CanvasComponent;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver:  (e: React.DragEvent, idx: number) => void;
  onDrop:      (e: React.DragEvent, idx: number) => void;
  onDragEnd:   () => void;
}

function CanvasRow({
  comp, index, total, isSelected, onSelect,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: CanvasRowProps) {
  const { removeComponent, moveComponent, duplicateComponent, updateComponent, componentDefs } =
    useContentBuilderContext();

  const [showKind, setShowKind] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isSelected]);

  const hasUrl  = ['cta', 'link', 'quickaction'].includes(comp.kind);
  const isFirst = index === 0;
  const isLast  = index === total - 1;
  const kc = kindColor(comp.kind);

  // Find category for the accent stripe
  const def = componentDefs.find(d => d.kind === comp.kind);
  const catStripe = CAT_STRIPE[def?.category ?? ''] ?? 'bg-slate-400';

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e  => onDragOver(e, index)}
      onDrop={e      => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`group relative rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden
        ${isSelected
          ? 'border-indigo-300/60 dark:border-indigo-600/40 shadow-md shadow-indigo-500/8 bg-white dark:bg-slate-900'
          : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
        }`}
    >
      {/* ── Left accent stripe (category colour) ── */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${catStripe} transition-all duration-150
        ${isSelected ? 'w-[3px]' : 'opacity-0 group-hover:opacity-60'}`} />

      {/* ── Selected highlight glow ── */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl bg-indigo-500/[0.03] dark:bg-indigo-400/[0.05] pointer-events-none" />
      )}

      {/* ── Main content grid layout ── */}
      <div className="grid grid-cols-[auto_128px_4px_1fr_auto] items-center gap-x-3 gap-y-2.5 p-3">

        {/* Row 1 Col 1: Drag handle + badge */}
        <div className="flex items-center gap-3">
          <GripVertical className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0
            cursor-grab active:cursor-grabbing hover:text-slate-505 transition-colors" />
          <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center
            text-[10px] font-bold text-white flex-shrink-0 ring-2 ${kc.bg} ${kc.ring}`}>
            {index + 1}
          </div>
        </div>

        {/* Row 1 Col 2: Kind dropdown (same fixed width for alignment) */}
        <div className="relative">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setShowKind(v => !v); }}
            className="flex items-center justify-between gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-300
              bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700
              px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700
              transition-all duration-100 w-32 flex-shrink-0"
          >
            <span className="truncate">{comp.label}</span>
            <ChevronDown className="h-3 w-3 text-slate-505 flex-shrink-0" />
          </button>

          {showKind && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowKind(false)} />
              <div className="absolute z-50 top-full left-0 mt-1.5
                bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                rounded-2xl shadow-2xl shadow-black/10 py-1.5 w-52 max-h-64 overflow-y-auto">
                {componentDefs.map(d => (
                  <button key={d.kind} type="button"
                    onClick={e => {
                      e.stopPropagation();
                      updateComponent(comp.id, {
                        kind: d.kind as ComponentKind, label: d.label,
                        text: d.defaultText, url: d.defaultUrl,
                      });
                      setShowKind(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[11px] transition-colors
                      ${d.kind === comp.kind
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Row 1 Col 3: empty spacer */}
        <div />

        {/* Row 1 Col 4: Top input box / select dropdown */}
        <div className="flex-1 min-h-0 border border-slate-200 dark:border-slate-800/80
          bg-slate-50/45 dark:bg-slate-900/45 rounded-lg px-3 py-1.5
          hover:border-slate-300 dark:hover:border-slate-750 transition-colors flex items-center min-w-0">
          {comp.kind === 'cta' ? (
            <select
              value={comp.text || 'Go to account'}
              onChange={e => updateComponent(comp.id, { text: e.target.value })}
              onClick={e => e.stopPropagation()}
              className="flex-1 text-xs text-slate-750 dark:text-slate-200 bg-transparent
                outline-none border-none py-0 w-full cursor-pointer font-semibold"
            >
              {['Go to account', 'View Details', 'Quick Pay', 'Sign In', 'Register Now', 'Learn More'].map(opt => (
                <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-755">
                  {opt}
                </option>
              ))}
            </select>
          ) : isSelected ? (
            <textarea
              ref={textareaRef}
              rows={1}
              data-comp-id={comp.id}
              className="flex-1 text-xs text-slate-750 dark:text-slate-200 bg-transparent
                outline-none resize-none leading-5 min-w-0
                placeholder-slate-300 dark:placeholder-slate-700 py-0"
              value={comp.text}
              onChange={e => {
                updateComponent(comp.id, { text: e.target.value });
                // auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 text-xs text-slate-750 dark:text-slate-400 truncate min-w-0
                hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-text"
              title="Click to edit"
            >
              {comp.text || (
                <span className="italic text-slate-300 dark:text-slate-700">
                  Click to edit…
                </span>
              )}
            </span>
          )}
        </div>

        {/* Row 1 Col 5: Actions toolbar */}
        <div
          className="flex items-center gap-0.5 flex-shrink-0 transition-all duration-150 opacity-100"
          onClick={e => e.stopPropagation()}
        >
          <button type="button" title="Move up" disabled={isFirst}
            onClick={() => moveComponent(comp.id, 'up')}
            className="w-6 h-6 flex items-center justify-center rounded-lg
              hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400
              hover:text-slate-655 dark:hover:text-slate-200 transition-colors
              disabled:opacity-25 disabled:cursor-not-allowed">
            <ChevronUp className="h-3 w-3" />
          </button>

          <button type="button" title="Move down" disabled={isLast}
            onClick={() => moveComponent(comp.id, 'down')}
            className="w-6 h-6 flex items-center justify-center rounded-lg
              hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400
              hover:text-slate-655 dark:hover:text-slate-200 transition-colors
              disabled:opacity-25 disabled:cursor-not-allowed">
            <ChevronDown className="h-3 w-3" />
          </button>

          <button type="button" title="Duplicate"
            onClick={() => duplicateComponent(comp.id)}
            className="w-6 h-6 flex items-center justify-center rounded-lg
              hover:bg-emerald-50 dark:hover:bg-emerald-950/30
              text-slate-400 hover:text-emerald-500 transition-colors">
            <Copy className="h-3 w-3" />
          </button>

          <button type="button" title="Delete"
            onClick={() => removeComponent(comp.id)}
            className="w-6 h-6 flex items-center justify-center rounded-lg
              hover:bg-rose-50 dark:hover:bg-rose-950/30
              text-slate-400 hover:text-rose-500 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Row 2 (if hasUrl like cta/link/quickaction) */}
        {hasUrl && (
          <>
            <div />
            <div className="flex justify-end pr-2 text-indigo-405">
              <Link className="h-3.5 w-3.5" />
            </div>
            <div />
            <div className="border border-slate-200 dark:border-slate-800/80
              bg-slate-50/45 dark:bg-slate-900/45 rounded-lg px-3 py-1.5
              hover:border-slate-300 dark:hover:border-slate-750 transition-colors flex items-center min-w-0">
              <input
                type="url"
                className="flex-1 text-xs text-slate-750 dark:text-slate-200 bg-transparent
                  outline-none border-none py-0 min-w-0"
                placeholder="https://..."
                value={comp.url ?? ''}
                onChange={e => updateComponent(comp.id, { url: e.target.value })}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div />
          </>
        )}

        {/* Row 2 (if image or banner component) */}
        {(comp.kind === 'image' || comp.kind === 'banner') && (
          <>
            <div />
            <div className="flex justify-end pr-2 text-pink-405">
              <Image className="h-3.5 w-3.5" />
            </div>
            <div />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); imageInputRef.current?.click(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                  text-indigo-650 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60
                  rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                Browse Image
              </button>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    updateComponent(comp.id, { url });
                  }
                }}
              />
              {comp.url && (
                <img
                  src={comp.url}
                  alt={comp.text || "Preview"}
                  className="h-8 object-contain rounded border border-slate-200 bg-white p-0.5"
                />
              )}
            </div>
            <div />
          </>
        )}
      </div>
    </div>
  );
}

// ── Brand Bar ─────────────────────────────────────────────────────────────────

function BrandBar() {
  const { brand, updateBrandField } = useContentBuilderContext();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4 px-4 py-2.5
      bg-white dark:bg-slate-950
      border-b border-slate-200/60 dark:border-slate-800/60">

      {/* Color swatch + theme dropdown */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 cursor-pointer"
          style={{ backgroundColor: brand.primaryColor }}
          title={brand.primaryColor}
        />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Color</span>
        <select
          value={brand.themePreset}
          onChange={e => {
            const p = THEME_PRESETS[e.target.value as keyof typeof THEME_PRESETS];
            if (!p) return;
            updateBrandField('themePreset', p.themePreset);
            updateBrandField('primaryColor', p.primaryColor);
            updateBrandField('secondaryColor', p.secondaryColor);
            updateBrandField('backgroundColor', p.backgroundColor);
            updateBrandField('textColor', p.textColor);
          }}
          className="text-[11px] font-semibold bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700 rounded-lg
            px-2 py-0.5 text-slate-700 dark:text-slate-200
            outline-none focus:border-indigo-400 cursor-pointer transition-all"
        >
          {Object.keys(THEME_PRESETS).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Logo browse */}
      <div className="flex items-center gap-2">
        <Image className="h-3.5 w-3.5 text-slate-400" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300
            hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <Upload className="h-3 w-3" />
          Browse Logo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;
            updateBrandField('logoUrl', URL.createObjectURL(f));
            updateBrandField('logoFile', f);
          }} />
      </div>

      {brand.logoUrl && (
        <img src={brand.logoUrl} alt="Brand logo"
          className="h-5 object-contain rounded border border-slate-200 dark:border-slate-700 bg-white px-1.5" />
      )}
    </div>
  );
}

// ── Canvas toolbar ────────────────────────────────────────────────────────────

function CanvasToolbar({ onPlaceholder }: { onPlaceholder: (btn: HTMLButtonElement) => void }) {
  const { selectedComponentId, updateComponent, components } = useContentBuilderContext();

  const wrap = (tag: string) => {
    // Find the active focused textarea in the document
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea && textarea.tagName === 'TEXTAREA') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const before = val.substring(0, start);
      const sel = val.substring(start, end);
      const after = val.substring(end);

      const tagOpen = `<${tag}>`;
      const tagClose = `</${tag}>`;
      const placeholderText = tag === 'strong' ? 'bold' : tag === 'em' ? 'italic' : 'code';
      const wrapped = `${tagOpen}${sel || placeholderText}${tagClose}`;
      const newVal = before + wrapped + after;

      const compId = textarea.getAttribute('data-comp-id');
      if (compId) {
        updateComponent(compId, { text: newVal });
        // Refocus and set selection range after updating DOM
        setTimeout(() => {
          textarea.focus();
          const newStart = start + tagOpen.length;
          const newEnd = newStart + (sel || placeholderText).length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 50);
      }
    } else if (selectedComponentId) {
      // Fallback: wrap entire component text if no textarea is actively focused
      const c = components.find(x => x.id === selectedComponentId);
      if (!c) return;
      updateComponent(selectedComponentId, { text: `<${tag}>${c.text}</${tag}>` });
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[
        { label: 'B', title: 'Bold',   cls: 'font-black',  tag: 'strong' },
        { label: 'I', title: 'Italic', cls: 'italic',      tag: 'em' },
        { label: '{}', title: 'Code',  cls: 'font-mono text-[10px]', tag: 'code' },
      ].map(b => (
        <button key={b.label} type="button" title={b.title}
          onMouseDown={e => e.preventDefault()}
          onClick={() => wrap(b.tag)}
          className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px]
            text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700
            transition-colors ${b.cls}`}>
          {b.label}
        </button>
      ))}
      <button type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={e => onPlaceholder(e.currentTarget as HTMLButtonElement)}
        className="flex items-center gap-1 h-6 px-2 text-[10px] font-bold
          text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40
          hover:bg-indigo-100 dark:hover:bg-indigo-950/60
          border border-indigo-200/60 dark:border-indigo-700/40
          rounded-lg transition-colors">
        {'{ }'} Placeholder
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function ContentBuilderPanel() {
  const {
    components, addComponent, reorderComponents,
    selectedComponentId, setSelectedComponentId, componentDefs,
  } = useContentBuilderContext();

  const [phAnchor, setPhAnchor] = useState<HTMLButtonElement | null>(null);
  const dragIdx = useRef<number | null>(null);

  const onDragStart = useCallback((e: React.DragEvent, i: number) => {
    dragIdx.current = i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(from) && from !== toIdx) reorderComponents(from, toIdx);
    dragIdx.current = null;
  }, [reorderComponents]);

  const onDragEnd = useCallback(() => { dragIdx.current = null; }, []);

  const handleAdd = useCallback(() => {
    const def = componentDefs.find(d => d.kind === 'paragraph') ?? componentDefs[0];
    if (def) addComponent(def);
  }, [componentDefs, addComponent]);

  const sorted = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950">

      {/* ── CONTENT BUILDER label bar — gray ── */}
      <div className="flex items-center gap-2.5 px-4 h-12
        bg-slate-100 dark:bg-slate-900/80
        border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <span className="w-[3px] h-4 rounded-full bg-indigo-600" />
        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          Content Builder
        </span>
      </div>

      {/* ── Brand controls bar — white ── */}
      <BrandBar />

      {/* ── COMPONENTS label + formatting toolbar — gray ── */}
      <div className="flex items-center justify-between px-4 h-11
        bg-slate-100 dark:bg-slate-900/80
        border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-[3px] h-4 rounded-full bg-slate-500" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Components
          </span>
        </div>
        <CanvasToolbar onPlaceholder={btn => setPhAnchor(btn)} />
      </div>

      {/* ── Scrollable canvas ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2
        bg-white dark:bg-slate-950">

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 rounded-2xl
            border-2 border-dashed border-slate-200 dark:border-slate-800
            text-slate-400 dark:text-slate-600 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900
              flex items-center justify-center">
              <Plus className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold">No components yet</p>
            <p className="text-[10px] text-slate-300 dark:text-slate-700">
              Click "+ Add Component" below to start
            </p>
          </div>
        ) : (
          sorted.map((comp, idx) => (
            <CanvasRow
              key={comp.id}
              comp={comp}
              index={idx}
              total={sorted.length}
              isSelected={comp.id === selectedComponentId}
              onSelect={() => setSelectedComponentId(
                comp.id === selectedComponentId ? null : comp.id
              )}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>

      {/* ── Add Component button ── */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-950">
        <button type="button" onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            border border-dashed border-slate-300 dark:border-slate-700
            text-[11px] font-bold text-slate-500 dark:text-slate-400
            hover:border-indigo-400 dark:hover:border-indigo-600
            hover:text-indigo-600 dark:hover:text-indigo-400
            hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20
            transition-all duration-150 group">
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800
            group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60
            flex items-center justify-center transition-colors">
            <Plus className="h-3 w-3 text-slate-400 group-hover:text-indigo-500" />
          </div>
          Add Component
        </button>
      </div>

      {/* Placeholder popup */}
      {phAnchor && (
        <PlaceholderPopup anchor={phAnchor} onClose={() => setPhAnchor(null)} />
      )}
    </div>
  );
}
