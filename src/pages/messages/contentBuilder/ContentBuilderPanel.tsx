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
  Upload, ChevronDown, ChevronUp, Copy, Pencil,
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code, Eraser, FileCode
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

function PlaceholderPopup({
  anchor,
  onClose,
  onInsert,
}: {
  anchor: HTMLElement;
  onClose: () => void;
  onInsert: (v: string) => void;
}) {
  const rect = anchor.getBoundingClientRect();

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
            <button key={v} type="button" onClick={() => { onInsert(v); onClose(); }}
              className="w-full text-left px-4 py-2 text-[11px] font-mono text-slate-600 dark:text-slate-300
                hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-650 dark:hover:text-indigo-400
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
  channel: string;
  comp: CanvasComponent;
  index: number;
  total: number;
  isSelected: boolean;
  htmlViewActive: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver:  (e: React.DragEvent, idx: number) => void;
  onDrop:      (e: React.DragEvent, idx: number) => void;
  onDragEnd:   () => void;
}

function CanvasRow({
  channel,
  comp, index, total, isSelected, htmlViewActive, onSelect,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: CanvasRowProps) {
  const { removeComponent, moveComponent, duplicateComponent, updateComponent, componentDefs } =
    useContentBuilderContext();

  const [showKind, setShowKind] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && !htmlViewActive && contentEditableRef.current) {
      const el = contentEditableRef.current;
      if (el.innerHTML !== comp.text) {
        el.innerHTML = comp.text || '';
      }
      el.focus();

      // Place cursor at the end of the text
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isSelected, htmlViewActive]);

  useEffect(() => {
    if (contentEditableRef.current) {
      if (document.activeElement !== contentEditableRef.current) {
        if (contentEditableRef.current.innerHTML !== comp.text) {
          contentEditableRef.current.innerHTML = comp.text || '';
        }
      }
    }
  }, [comp.text]);

  const hasUrl  = ['cta', 'link', 'quickaction'].includes(comp.kind);
  const isFirst = index === 0;
  const isLast  = index === total - 1;
  const kc = kindColor(comp.kind);

  // Find category for the accent stripe
  const def = componentDefs.find(d => d.kind === comp.kind);
  const catStripe = CAT_STRIPE[def?.category ?? ''] ?? 'bg-slate-400';
  const isTextKind = ['pageheader', 'heading', 'subheading', 'paragraph', 'richtext', 'quote'].includes(comp.kind);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e  => onDragOver(e, index)}
      onDrop={e      => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            className="flex items-center justify-between gap-1.5 text-xs font-bold text-slate-755 dark:text-slate-300
              bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700
              px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700
              transition-all duration-100 w-32 flex-shrink-0"
          >
            <span className="truncate">{comp.label}</span>
            <ChevronDown className="h-3 w-3 text-slate-550 flex-shrink-0" />
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
                      updateComponent(channel, comp.id, {
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
        <div className="flex-1 min-h-0 flex flex-col justify-center min-w-0" onClick={e => e.stopPropagation()}>

          {/* Actual content input box */}
          <div className="border border-slate-200 dark:border-slate-800/80
            bg-slate-50/45 dark:bg-slate-900/45 rounded-lg px-3 py-1.5
            hover:border-slate-300 dark:hover:border-slate-750 transition-colors flex items-center min-w-0">
            {comp.kind === 'cta' ? (
              <div className="relative flex-1 min-w-0 flex items-center">
                <select
                  value={comp.text || 'Go to account'}
                  onChange={e => updateComponent(channel, comp.id, { text: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 text-xs text-slate-755 dark:text-slate-200 bg-transparent
                    outline-none border-none py-0 w-full cursor-pointer font-semibold appearance-none pr-6"
                >
                  {['Go to account', 'View Details', 'Quick Pay', 'Sign In', 'Register Now', 'Learn More', 'Verify Transaction', 'Confirm Purchase'].map(opt => (
                    <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-755">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            ) : isSelected ? (
              htmlViewActive ? (
                <textarea
                  value={comp.text || ''}
                  onChange={e => updateComponent(channel, comp.id, { text: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  rows={1}
                  className="flex-1 text-xs text-indigo-650 dark:text-indigo-400 bg-transparent
                    outline-none border-none py-0.5 min-w-0 font-mono resize-none leading-5 min-h-[1.25rem] w-full"
                  placeholder="Enter HTML source code..."
                />
              ) : (
                <div
                  ref={contentEditableRef}
                  contentEditable
                  data-component-id={comp.id}
                  onInput={e => updateComponent(channel, comp.id, { text: e.currentTarget.innerHTML })}
                  onPaste={e => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                  className="flex-1 text-xs text-slate-755 dark:text-slate-200 bg-transparent
                    outline-none min-w-0 leading-5 py-0.5 cursor-text min-h-[1.25rem]
                    [&_code]:bg-indigo-50 [&_code]:text-indigo-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px]
                    dark:[&_code]:bg-indigo-950/40 dark:[&_code]:text-indigo-400"
                  onClick={e => e.stopPropagation()}
                />
              )
            ) : (
              <span
                className="flex-1 text-xs text-slate-755 dark:text-slate-400 truncate min-w-0
                  hover:text-slate-800 dark:hover:text-slate-250 transition-colors cursor-text
                  [&_code]:bg-indigo-50 [&_code]:text-indigo-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px]
                  dark:[&_code]:bg-indigo-950/40 dark:[&_code]:text-indigo-400"
                title="Click to edit"
                dangerouslySetInnerHTML={{
                  __html: comp.text || '<span class="italic text-slate-350 dark:text-slate-700">Click to edit…</span>'
                }}
              />
            )}
          </div>
        </div>

        {/* Row 1 Col 5: Actions toolbar */}
        <div
          className="flex items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50
            rounded-lg p-0.5 flex-shrink-0 transition-all duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Edit icon */}
          <button type="button" title="Edit text"
            onClick={onSelect}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150
              ${isSelected
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-200/80 dark:bg-slate-700/60 mx-0.5" />

          {/* Move up */}
          <button type="button" title="Move up" disabled={isFirst}
            onClick={() => moveComponent(channel, comp.id, 'up')}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150
              hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>

          {/* Move down */}
          <button type="button" title="Move down" disabled={isLast}
            onClick={() => moveComponent(channel, comp.id, 'down')}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150
              hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-200/80 dark:bg-slate-700/60 mx-0.5" />

          {/* Duplicate */}
          <button type="button" title="Duplicate"
            onClick={() => duplicateComponent(channel, comp.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150
              hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-500 dark:text-slate-400
              hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Delete */}
          <button type="button" title="Delete"
            onClick={() => removeComponent(channel, comp.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150
              hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400
              hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
              hover:border-slate-300 dark:hover:border-slate-750 transition-colors flex items-center min-w-0"
              onClick={e => e.stopPropagation()}>
              <input
                type="url"
                className="flex-1 text-xs text-slate-755 dark:text-slate-200 bg-transparent
                  outline-none border-none py-0 min-w-0"
                placeholder="https://..."
                value={comp.url ?? ''}
                onChange={e => updateComponent(channel, comp.id, { url: e.target.value })}
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
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); imageInputRef.current?.click(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                  text-indigo-655 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60
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
                    updateComponent(channel, comp.id, { url });
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

function CanvasToolbar({
  channel,
  onPlaceholder,
  htmlViewActive,
  setHtmlViewActive,
}: {
  channel: string;
  onPlaceholder: (btn: HTMLButtonElement) => void;
  htmlViewActive: boolean;
  setHtmlViewActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { selectedComponentIdByChannel, updateComponent, componentsByChannel } = useContentBuilderContext();

  const [enabledSymbols, setEnabledSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('alertsiq:ckeditor:symbols');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ['bold', 'italic', 'code', 'link', 'clear', 'source'];
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      const saved = localStorage.getItem('alertsiq:ckeditor:symbols');
      if (saved) {
        try {
          setEnabledSymbols(JSON.parse(saved));
          return;
        } catch (e) {}
      }
      setEnabledSymbols(['bold', 'italic', 'code', 'link', 'clear', 'source']);
    };
    window.addEventListener('alertsiq:ckeditor:settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('alertsiq:ckeditor:settings_changed', handleSettingsChange);
    };
  }, []);

  const selectedComponentId = selectedComponentIdByChannel[channel] || null;
  const components = componentsByChannel[channel] || [];
  const activeComp = components.find(c => c.id === selectedComponentId);
  const isTextKind = activeComp && ['pageheader', 'heading', 'subheading', 'paragraph', 'richtext', 'quote'].includes(activeComp.kind);
  const isEnabled = !!isTextKind;

  const getActiveEditable = () => {
    if (!selectedComponentId) return null;
    return document.querySelector(`[data-component-id="${selectedComponentId}"]`) as HTMLElement | null;
  };

  const handleAction = (id: string) => {
    const activeEl = getActiveEditable();
    if (activeEl && document.activeElement !== activeEl) {
      activeEl.focus();
    }

    if (id === 'bold') {
      document.execCommand('bold', false);
    } else if (id === 'italic') {
      document.execCommand('italic', false);
    } else if (id === 'underline') {
      document.execCommand('underline', false);
    } else if (id === 'strikethrough') {
      document.execCommand('strikeThrough', false);
    } else if (id === 'superscript') {
      document.execCommand('superscript', false);
    } else if (id === 'subscript') {
      document.execCommand('subscript', false);
    } else if (id === 'code') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        const codeElem = document.createElement('code');
        codeElem.textContent = selectedText || 'code';
        range.deleteContents();
        range.insertNode(codeElem);

        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(codeElem);
        selection.addRange(newRange);
      }
    } else if (id === 'link') {
      const url = window.prompt('Enter Link URL:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (id === 'clear') {
      document.execCommand('removeFormat', false);
    }

    if (activeEl && selectedComponentId) {
      updateComponent(channel, selectedComponentId, { text: activeEl.innerHTML });
    }
  };

  const toolbarItems = [
    { id: 'bold', title: 'Bold', icon: Bold },
    { id: 'italic', title: 'Italic', icon: Italic },
    { id: 'underline', title: 'Underline', icon: Underline },
    { id: 'strikethrough', title: 'Strikethrough', icon: Strikethrough },
    { id: 'superscript', title: 'Superscript', icon: Superscript },
    { id: 'subscript', title: 'Subscript', icon: Subscript },
    { id: 'code', title: 'Code', icon: Code },
    { id: 'link', title: 'Link', icon: Link },
    { id: 'clear', title: 'Clear Formatting', icon: Eraser },
    { id: 'source', title: 'Source HTML', icon: FileCode },
  ];

  return (
    <div className="flex items-center gap-0.5">
      {toolbarItems
        .filter(b => enabledSymbols.includes(b.id))
        .map(b => {
          const Icon = b.icon;
          const isButtonDisabled = !isEnabled || (htmlViewActive && b.id !== 'source');
          const isBtnActive = b.id === 'source' && htmlViewActive;
          return (
            <button key={b.id} type="button" title={b.title}
              disabled={isButtonDisabled}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={e => {
                e.stopPropagation();
                if (b.id === 'source') {
                  setHtmlViewActive(v => !v);
                } else {
                  handleAction(b.id);
                }
              }}
              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors
                ${isBtnActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isButtonDisabled
                    ? 'opacity-40 cursor-not-allowed pointer-events-none text-slate-400 dark:text-slate-600'
                    : 'text-slate-505 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })
      }
      {toolbarItems.filter(b => enabledSymbols.includes(b.id)).length > 0 && (
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1.5" />
      )}
      <button type="button"
        disabled={!isEnabled || htmlViewActive}
        onMouseDown={e => e.preventDefault()}
        onClick={e => onPlaceholder(e.currentTarget as HTMLButtonElement)}
        className={`flex items-center gap-1 h-6 px-2 text-[10px] font-bold rounded-lg transition-colors border
          ${isEnabled && !htmlViewActive
            ? 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-700/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60'
            : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed pointer-events-none'
          }`}
      >
        {'{ }'} Placeholder
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function ContentBuilderPanel({ channel }: { channel: string }) {
  const {
    componentsByChannel, addComponent, reorderComponents,
    selectedComponentIdByChannel, setSelectedComponentIdByChannel, componentDefs,
  } = useContentBuilderContext();

  const [phAnchor, setPhAnchor] = useState<HTMLButtonElement | null>(null);
  const [htmlViewActive, setHtmlViewActive] = useState<boolean>(false);
  const dragIdx = useRef<number | null>(null);

  const components = componentsByChannel[channel] || [];
  const selectedComponentId = selectedComponentIdByChannel[channel] || null;
  const setSelectedComponentId = useCallback((id: string | null) => {
    setSelectedComponentIdByChannel(channel, id);
  }, [channel, setSelectedComponentIdByChannel]);

  useEffect(() => {
    setHtmlViewActive(false);
  }, [selectedComponentId]);

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
    if (!isNaN(from) && from !== toIdx) reorderComponents(channel, from, toIdx);
    dragIdx.current = null;
  }, [reorderComponents, channel]);

  const onDragEnd = useCallback(() => { dragIdx.current = null; }, []);

  const handleAdd = useCallback(() => {
    const def = componentDefs.find(d => d.kind === 'paragraph') ?? componentDefs[0];
    if (def) addComponent(channel, def);
  }, [componentDefs, addComponent, channel]);

  const sorted = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950">

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
        <CanvasToolbar
          channel={channel}
          onPlaceholder={btn => setPhAnchor(btn)}
          htmlViewActive={htmlViewActive}
          setHtmlViewActive={setHtmlViewActive}
        />
      </div>

      {/* ── Scrollable canvas ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2
        bg-slate-100/50 dark:bg-slate-950/60">

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
              channel={channel}
              comp={comp}
              index={idx}
              total={sorted.length}
              isSelected={comp.id === selectedComponentId}
              htmlViewActive={htmlViewActive}
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
            text-[11px] font-bold text-slate-550 dark:text-slate-400
            hover:border-indigo-400 dark:hover:border-indigo-600
            hover:text-indigo-650 dark:hover:text-indigo-400
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
        <PlaceholderPopup
          anchor={phAnchor}
          onClose={() => setPhAnchor(null)}
          onInsert={v => {
            const activeComp = components.find(c => c.id === selectedComponentId);
            const activeEl = document.querySelector(`[data-component-id="${selectedComponentId}"]`) as HTMLElement | null;
            if (activeEl) {
              activeEl.focus();
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                const textNode = document.createTextNode(' ' + v + ' ');
                range.insertNode(textNode);
                
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                updateComponent(channel, selectedComponentId!, { text: activeEl.innerHTML });
              } else {
                const compText = activeComp?.text || '';
                const newVal = compText + ' ' + v + ' ';
                updateComponent(channel, selectedComponentId!, { text: newVal });
                activeEl.innerHTML = newVal;
              }
            } else if (selectedComponentId) {
              const compText = activeComp?.text || '';
              updateComponent(channel, selectedComponentId, { text: compText + ' ' + v + ' ' });
            }
          }}
        />
      )}
    </div>
  );
}
