/**
 * contentBuilder/ComponentLibrary.tsx
 * ─────────────────────────────────────
 * LEFT PANEL — "CONTENT BUILDER"
 *
 * Sections:
 *  1. Branding Controls  (Color picker, Image/Browse, Theme preset)
 *  2. Component Library  (Accordion-grouped draggable component cards)
 *
 * Each component card is draggable and, on click, calls addComponent()
 * to insert it into the canvas.
 */

import React, { useState, useRef } from 'react';
import {
  Palette, Image, ChevronDown, ChevronUp, GripVertical,
  Heading1, Heading2, AlignLeft, FileText, Quote,
  MousePointer, Link, Zap, Play, LayoutTemplate,
  GalleryHorizontal, Receipt, CreditCard, ShoppingCart,
  Table2, BarChart3, Minus, ArrowUpDown, Box,
  LayoutGrid, Columns, Sparkles, GitBranch, User,
  Star, BrainCircuit, Plus,
} from 'lucide-react';
import { useContentBuilderContext } from './useContentBuilder';
import { COMPONENT_LIBRARY, COMPONENT_CATEGORIES, THEME_PRESETS } from './constants';
import type { ComponentDefinition, ComponentCategory } from './types';

// ── Icon resolver (maps lucide icon name string → component) ─────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Heading1, Heading2, AlignLeft, FileText, Quote,
  MousePointer, Link, Zap, Play, LayoutTemplate, Image,
  GalleryHorizontal, Receipt, CreditCard, ShoppingCart,
  Table2, BarChart3, Minus, ArrowUpDown, Box,
  LayoutGrid, Columns, Sparkles, GitBranch, User,
  Star, BrainCircuit,
};

function ComponentIcon({ name, className = 'h-3.5 w-3.5' }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Box;
  return <Icon className={className} />;
}

// ── Category badge colours ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  text:     'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  action:   'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  media:    'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  data:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  layout:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

// ── Draggable Component Card ───────────────────────────────────────────────────

interface ComponentCardProps {
  def: ComponentDefinition;
}

function ComponentCard({ def }: ComponentCardProps) {
  const { addComponent, setIsDragging } = useContentBuilderContext();
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-component-kind', def.kind);
    e.dataTransfer.setData('application/x-component-label', def.label);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => addComponent(def)}
      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800/80
        bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60
        hover:border-blue-400/60 dark:hover:border-blue-500/40
        cursor-grab active:cursor-grabbing transition-all duration-150 select-none"
      title={def.description}
    >
      {/* Drag handle */}
      <GripVertical className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 flex-shrink-0" />

      {/* Icon */}
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[def.category]}`}>
        <ComponentIcon name={def.icon} className="h-3 w-3" />
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">
          {def.label}
        </p>
      </div>

      {/* Add icon on hover */}
      <Plus className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
}

// ── Accordion Section ─────────────────────────────────────────────────────────

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200/60 dark:border-slate-800/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400
          hover:text-slate-700 dark:hover:text-slate-200 transition-colors uppercase tracking-wider"
      >
        {title}
        {open
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        }
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Branding Section ──────────────────────────────────────────────────────────

function BrandingSection() {
  const { brand, updateBrandField } = useContentBuilderContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBrandField('logoUrl', url);
    updateBrandField('logoFile', file);
  };

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Theme preset selector */}
      <div>
        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Theme
        </label>
        <select
          value={brand.themePreset}
          onChange={e => {
            const preset = e.target.value as keyof typeof THEME_PRESETS;
            // Apply full preset
            const p = THEME_PRESETS[preset];
            updateBrandField('themePreset', p.themePreset);
            updateBrandField('primaryColor', p.primaryColor);
            updateBrandField('secondaryColor', p.secondaryColor);
            updateBrandField('backgroundColor', p.backgroundColor);
            updateBrandField('textColor', p.textColor);
          }}
          className="w-full text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
            text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 transition-all"
        >
          {Object.keys(THEME_PRESETS).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Color row */}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'primaryColor', label: 'Primary' },
            { key: 'secondaryColor', label: 'Secondary' },
            { key: 'backgroundColor', label: 'Background' },
            { key: 'textColor', label: 'Text' },
          ] as { key: keyof typeof brand; label: string }[]
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="color"
              value={brand[key] as string}
              onChange={e => updateBrandField(key, e.target.value)}
              className="w-5 h-5 rounded border-0 cursor-pointer"
              title={label}
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
          </label>
        ))}
      </div>

      {/* Logo upload */}
      <div>
        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Logo
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border
              border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Image className="h-3 w-3" />
            Image
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border
              border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Browse
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
        {brand.logoUrl && (
          <img
            src={brand.logoUrl}
            alt="Logo preview"
            className="mt-2 h-8 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white p-1"
          />
        )}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function ComponentLibrary() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
        <span className="w-0.5 h-3.5 bg-blue-600 rounded-full" />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Content Builder
        </span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Branding accordion */}
        <AccordionSection title="Brand Settings" defaultOpen>
          <BrandingSection />
        </AccordionSection>

        {/* Component library accordion — one section per category */}
        <AccordionSection title="Components" defaultOpen>
          <div className="space-y-4">
            {COMPONENT_CATEGORIES.map(cat => {
              const defs = COMPONENT_LIBRARY.filter(d => d.category === cat.key);
              return (
                <div key={cat.key}>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 px-1">
                    {cat.label}
                  </p>
                  <div className="space-y-0.5">
                    {defs.map(def => (
                      <ComponentCard key={def.kind} def={def} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
