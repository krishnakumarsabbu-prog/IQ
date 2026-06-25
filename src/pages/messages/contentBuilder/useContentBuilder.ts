/**
 * contentBuilder/useContentBuilder.ts
 * ────────────────────────────────────
 * Single custom hook that owns ALL Content Builder state.
 * Components consume this via the ContentBuilderContext —
 * no prop-drilling anywhere in the tree.
 *
 * Follows the same pattern as useMessageForm.ts.
 */

import { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import type {
  CanvasComponent,
  BrandSettings,
  PreviewChannel,
  PreviewSegment,
  PreviewDevice,
  ContentBuilderState,
  ComponentDefinition,
  SampleDataCustomer,
} from './types';
import { DEFAULT_BRAND, SAMPLE_CUSTOMERS, THEME_PRESETS, COMPONENT_LIBRARY as BUILTIN_LIBRARY } from './constants';
import { componentLibraryService } from '../../../services/componentLibraryService';

// ── Context ───────────────────────────────────────────────────────────────────

export const ContentBuilderContext = createContext<ContentBuilderState | null>(null);

export function useContentBuilderContext(): ContentBuilderState {
  const ctx = useContext(ContentBuilderContext);
  if (!ctx) {
    throw new Error('useContentBuilderContext must be used inside <ContentBuilderContext.Provider>');
  }
  return ctx;
}

// ── ID Generator ──────────────────────────────────────────────────────────────

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
}

// ── The Hook ──────────────────────────────────────────────────────────────────

export function useContentBuilder(): ContentBuilderState {
  // Brand state
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);

  // Dynamic component definitions (loaded from service, falls back to built-in)
  const [componentDefs, setComponentDefs] = useState<ComponentDefinition[]>(BUILTIN_LIBRARY);

  useEffect(() => {
    let cancelled = false;
    componentLibraryService.getAll().then(stored => {
      if (cancelled) return;
      // Map StoredComponentDef → ComponentDefinition
      const mapped: ComponentDefinition[] = stored.map(d => ({
        kind:        d.kind as any,
        category:    d.category,
        label:       d.label,
        description: d.description,
        icon:        d.icon,
        defaultText: d.defaultText,
        defaultUrl:  d.defaultUrl,
      }));
      setComponentDefs(mapped);
    }).catch(() => { /* keep built-ins */ });
    return () => { cancelled = true; };
  }, []);

  // Canvas components — seed with the two rows visible in the UX screenshot
  const [components, setComponents] = useState<CanvasComponent[]>([
    {
      id: genId(),
      kind: 'pageheader',
      label: 'Page Header',
      text: 'You made a purchase of $831.77',
      order: 0,
      locked: false,
    },
    {
      id: genId(),
      kind: 'cta',
      label: 'CTA',
      text: 'Go to account',
      url: 'https://connect.secure.wellsfargo.com/account-summary',
      order: 1,
      locked: false,
    },
  ]);

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview controls
  const [previewChannel, setPreviewChannel] = useState<PreviewChannel>('Email');
  const [previewSegment, setPreviewSegment] = useState<PreviewSegment>('Retail');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [sampleDataKey, setSampleDataKey] = useState<string>('customer_a');

  // ── Brand helpers ──────────────────────────────────────────────────────────

  const updateBrandField = useCallback(
    <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
      setBrand(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  // When theme preset changes, reset all brand colors
  const applyThemePreset = useCallback((preset: keyof typeof THEME_PRESETS) => {
    setBrand(THEME_PRESETS[preset]);
  }, []);

  // ── Canvas mutations ───────────────────────────────────────────────────────

  const addComponent = useCallback((def: ComponentDefinition) => {
    setComponents(prev => {
      const newComp: CanvasComponent = {
        id: genId(),
        kind: def.kind,
        label: def.label,
        text: def.defaultText,
        url: def.defaultUrl,
        order: prev.length,
        locked: false,
      };
      return [...prev, newComp];
    });
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents(prev =>
      prev
        .filter(c => c.id !== id)
        .map((c, i) => ({ ...c, order: i }))
    );
    setSelectedComponentId(prev => (prev === id ? null : prev));
  }, []);

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setComponents(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    setComponents(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      const clone: CanvasComponent = {
        ...prev[idx],
        id: genId(),
        order: idx + 1,
        label: prev[idx].label + ' (copy)',
      };
      const next = [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)];
      return next.map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  const updateComponent = useCallback((id: string, patch: Partial<CanvasComponent>) => {
    setComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const reorderComponents = useCallback((fromIdx: number, toIdx: number) => {
    setComponents(prev => {
      if (fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentSampleData: SampleDataCustomer = useMemo(
    () => SAMPLE_CUSTOMERS.find(c => c.id === sampleDataKey) ?? SAMPLE_CUSTOMERS[0],
    [sampleDataKey]
  );

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    brand,
    setBrand,
    updateBrandField,
    componentDefs,
    components,
    addComponent,
    removeComponent,
    moveComponent,
    duplicateComponent,
    updateComponent,
    reorderComponents,
    selectedComponentId,
    setSelectedComponentId,
    previewChannel,
    setPreviewChannel,
    previewSegment,
    setPreviewSegment,
    previewDevice,
    setPreviewDevice,
    sampleDataKey,
    setSampleDataKey,
    currentSampleData,
    isDragging,
    setIsDragging,
  };
}
