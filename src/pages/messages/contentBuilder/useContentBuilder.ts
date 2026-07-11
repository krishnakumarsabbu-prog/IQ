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
import { useMessageFormContext } from '../useMessageForm';

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

// ── Default Components per Channel ────────────────────────────────────────────

const DEFAULT_COMPONENTS_BY_CHANNEL: Record<string, CanvasComponent[]> = {
  Email: [
    {
      id: 'email-1',
      kind: 'pageheader',
      label: 'Page Header',
      text: 'You made a purchase of $831.77',
      order: 0,
      locked: false,
    },
    {
      id: 'email-2',
      kind: 'cta',
      label: 'CTA',
      text: 'Go to account',
      url: 'https://connect.secure.wellsfargo.com/account-summary',
      order: 1,
      locked: false,
    },
  ],
  SecureInbox: [
    {
      id: 'sec-1',
      kind: 'pageheader',
      label: 'Page Header',
      text: 'Security Alert: Transaction Pending Review',
      order: 0,
      locked: false,
    },
    {
      id: 'sec-2',
      kind: 'transactionsummary',
      label: 'Transaction Details',
      text: '',
      order: 1,
      locked: false,
    },
    {
      id: 'sec-3',
      kind: 'paragraph',
      label: 'Paragraph',
      text: 'A transaction of <b>{{Amount}}</b> at <b>{{MerchantName}}</b> on card ending in <b>{{AccountNumber}}</b> is pending your verification.',
      order: 2,
      locked: false,
    },
    {
      id: 'sec-4',
      kind: 'cta',
      label: 'CTA',
      text: 'Verify Transaction',
      url: 'https://connect.secure.wellsfargo.com/verify',
      order: 3,
      locked: false,
    },
  ],
  SMS: [
    {
      id: 'sms-1',
      kind: 'paragraph',
      label: 'SMS Message',
      text: 'Wells Fargo Alert: Transaction of {{Amount}} at {{MerchantName}} on card ending in {{AccountNumber}} was detected. Click link to verify: {{ctaLink}}',
      order: 0,
      locked: false,
    },
  ],
  Push: [
    {
      id: 'push-1',
      kind: 'heading',
      label: 'Push Notification Title',
      text: 'Wells Fargo Purchase Alert',
      order: 0,
      locked: false,
    },
    {
      id: 'push-2',
      kind: 'paragraph',
      label: 'Push Body',
      text: 'You spent {{Amount}} at {{MerchantName}}.',
      order: 1,
      locked: false,
    },
  ],
  WhatsApp: [
    {
      id: 'wa-1',
      kind: 'heading',
      label: 'Header',
      text: 'Wells Fargo Alerts',
      order: 0,
      locked: false,
    },
    {
      id: 'wa-2',
      kind: 'paragraph',
      label: 'Body Text',
      text: 'Hello {{CustomerName}}, we detected a transaction of {{Amount}} at {{MerchantName}} on your card ending in {{AccountNumber}}.',
      order: 1,
      locked: false,
    },
    {
      id: 'wa-3',
      kind: 'cta',
      label: 'CTA Button',
      text: 'Confirm Purchase',
      url: 'https://wf.com/confirm',
      order: 2,
      locked: false,
    },
  ],
};

// ── The Hook ──────────────────────────────────────────────────────────────────

export function useContentBuilder(): ContentBuilderState {
  // Try to access the parent MessageFormContext safely
  let formCtx: any = null;
  try {
    formCtx = useMessageFormContext();
  } catch (e) {
    // No-op (for standalone or tests)
  }

  const selectedMessage = formCtx?.selectedMessage;
  const setValue = formCtx?.setValue;
  const formValues = formCtx?.formValues;

  // Brand state
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);

  // Dynamic component definitions (loaded from service, falls back to built-in)
  const [componentDefs, setComponentDefs] = useState<ComponentDefinition[]>(BUILTIN_LIBRARY);

  useEffect(() => {
    let cancelled = false;
    componentLibraryService.getAll().then(stored => {
      if (cancelled) return;
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

  // Canvas components per channel
  const [componentsByChannel, setComponentsByChannel] = useState<Record<string, CanvasComponent[]>>(() => {
    if (formValues?.componentsByChannel) {
      return formValues.componentsByChannel;
    }
    if (selectedMessage?.formValues?.componentsByChannel) {
      return selectedMessage.formValues.componentsByChannel;
    }
    return DEFAULT_COMPONENTS_BY_CHANNEL;
  });

  const [selectedComponentIdByChannel, setSelectedComponentIdByChannel] = useState<Record<string, string | null>>({
    Email: null,
    SecureInbox: null,
    SMS: null,
    Push: null,
    WhatsApp: null,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Preview controls
  const [previewChannel, setPreviewChannel] = useState<PreviewChannel>('Email');
  const [previewSegment, setPreviewSegment] = useState<PreviewSegment>('Retail');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [sampleDataKey, setSampleDataKey] = useState<string>('customer_a');

  // Synchronise state with message change
  useEffect(() => {
    const saved = formValues?.componentsByChannel || selectedMessage?.formValues?.componentsByChannel;
    if (saved) {
      setComponentsByChannel(saved);
    } else {
      setComponentsByChannel(DEFAULT_COMPONENTS_BY_CHANNEL);
    }
  }, [selectedMessage?.messageId]);

  // Helper to update state and formValues
  const updateComponentsForChannel = useCallback((channel: string, newComps: CanvasComponent[]) => {
    setComponentsByChannel(prev => {
      const updated = { ...prev, [channel]: newComps };
      if (setValue) {
        setValue('componentsByChannel', updated, { shouldDirty: true });
      }
      return updated;
    });
  }, [setValue]);

  // ── Brand helpers ──────────────────────────────────────────────────────────

  const updateBrandField = useCallback(
    <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
      setBrand(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyThemePreset = useCallback((preset: keyof typeof THEME_PRESETS) => {
    setBrand(THEME_PRESETS[preset]);
  }, []);

  // ── Canvas mutations ───────────────────────────────────────────────────────

  const addComponent = useCallback((channel: string, def: ComponentDefinition) => {
    const prev = componentsByChannel[channel] || [];
    const newComp: CanvasComponent = {
      id: genId(),
      kind: def.kind,
      label: def.label,
      text: def.defaultText,
      url: def.defaultUrl,
      order: prev.length,
      locked: false,
    };
    updateComponentsForChannel(channel, [...prev, newComp]);
  }, [componentsByChannel, updateComponentsForChannel]);

  const removeComponent = useCallback((channel: string, id: string) => {
    const prev = componentsByChannel[channel] || [];
    const updated = prev
      .filter(c => c.id !== id)
      .map((c, i) => ({ ...c, order: i }));
    updateComponentsForChannel(channel, updated);

    setSelectedComponentIdByChannel(prevIds => ({
      ...prevIds,
      [channel]: prevIds[channel] === id ? null : prevIds[channel]
    }));
  }, [componentsByChannel, updateComponentsForChannel]);

  const moveComponent = useCallback((channel: string, id: string, direction: 'up' | 'down') => {
    const prev = componentsByChannel[channel] || [];
    const idx = prev.findIndex(c => c.id === id);
    if (idx < 0) return;
    const next = [...prev];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const updated = next.map((c, i) => ({ ...c, order: i }));
    updateComponentsForChannel(channel, updated);
  }, [componentsByChannel, updateComponentsForChannel]);

  const duplicateComponent = useCallback((channel: string, id: string) => {
    const prev = componentsByChannel[channel] || [];
    const idx = prev.findIndex(c => c.id === id);
    if (idx < 0) return;
    const clone: CanvasComponent = {
      ...prev[idx],
      id: genId(),
      order: idx + 1,
      label: prev[idx].label + ' (copy)',
    };
    const next = [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)];
    const updated = next.map((c, i) => ({ ...c, order: i }));
    updateComponentsForChannel(channel, updated);
  }, [componentsByChannel, updateComponentsForChannel]);

  const updateComponent = useCallback((channel: string, id: string, patch: Partial<CanvasComponent>) => {
    const prev = componentsByChannel[channel] || [];
    const updated = prev.map(c => (c.id === id ? { ...c, ...patch } : c));
    updateComponentsForChannel(channel, updated);
  }, [componentsByChannel, updateComponentsForChannel]);

  const reorderComponents = useCallback((channel: string, fromIdx: number, toIdx: number) => {
    const prev = componentsByChannel[channel] || [];
    if (fromIdx === toIdx) return;
    const next = [...prev];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const updated = next.map((c, i) => ({ ...c, order: i }));
    updateComponentsForChannel(channel, updated);
  }, [componentsByChannel, updateComponentsForChannel]);

  // ── Derived Single-Channel compatibility helpers ─────────────────────────

  const components = useMemo(() => {
    return componentsByChannel[previewChannel] || [];
  }, [componentsByChannel, previewChannel]);

  const selectedComponentId = useMemo(() => {
    return selectedComponentIdByChannel[previewChannel] || null;
  }, [selectedComponentIdByChannel, previewChannel]);

  const setSelectedComponentId = useCallback((id: string | null) => {
    setSelectedComponentIdByChannel(prev => ({
      ...prev,
      [previewChannel]: id
    }));
  }, [previewChannel]);

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
    componentsByChannel,
    components,
    addComponent,
    removeComponent,
    moveComponent,
    duplicateComponent,
    updateComponent,
    reorderComponents,
    selectedComponentId,
    setSelectedComponentId,
    selectedComponentIdByChannel,
    setSelectedComponentIdByChannel,
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
