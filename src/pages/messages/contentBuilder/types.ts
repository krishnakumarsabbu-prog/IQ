/**
 * contentBuilder/types.ts
 * ───────────────────────
 * All TypeScript interfaces, enums and type aliases for the
 * Content Builder module. No runtime logic lives here.
 */

// ── Component Types ──────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'text'
  | 'action'
  | 'media'
  | 'data'
  | 'layout'
  | 'advanced';

export type ComponentKind =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'richtext'
  | 'quote'
  | 'cta'
  | 'link'
  | 'quickaction'
  | 'image'
  | 'banner'
  | 'video'
  | 'carousel'
  | 'transactionsummary'
  | 'accountdetails'
  | 'orderdetails'
  | 'table'
  | 'keymetrics'
  | 'divider'
  | 'spacer'
  | 'container'
  | 'grid'
  | 'columns'
  | 'dynamiccontent'
  | 'conditionalblock'
  | 'personalizationblock'
  | 'recommendation'
  | 'aisummary'
  | 'pageheader'; // shortcut used in the UX screenshot

// ── Canvas Component Instance ─────────────────────────────────────────────────

export interface CanvasComponent {
  /** Unique runtime id (crypto.randomUUID or fallback) */
  id: string;
  kind: ComponentKind;
  /** Display label shown in the canvas row */
  label: string;
  /** Inline-editable display text / headline */
  text: string;
  /** Optional CTA / link URL */
  url?: string;
  /** Optional: sub-label (e.g. "Go to account" for CTA) */
  sublabel?: string;
  /** Position index in canvas (used for ordering) */
  order: number;
  /** Whether this component is locked from editing */
  locked?: boolean;
  /** Component-level config (open-ended for future props) */
  config?: Record<string, unknown>;
}

// ── Branding ─────────────────────────────────────────────────────────────────

export type ThemePreset = 'Retail' | 'Commercial' | 'Corporate' | 'Investment Banking' | 'Wealth Management';
export type ColorSchemeKey = 'primary' | 'secondary' | 'background' | 'text';

export interface BrandSettings {
  themePreset: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string | null;
  logoFile: File | null;
}

// ── Preview ───────────────────────────────────────────────────────────────────

export type PreviewChannel = 'Email' | 'SecureInbox' | 'SMS' | 'Push' | 'In-App' | 'WhatsApp';
export type PreviewSegment = 'Retail' | 'Corporate' | 'Premium' | 'Commercial';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface SampleDataCustomer {
  id: string;
  label: string;
  CustomerName: string;
  AccountNumber: string;
  Amount: string;
  TransactionDate: string;
  MerchantName: string;
  LOB: string;
  Region: string;
}

// ── Personalization variables ─────────────────────────────────────────────────

export type PersonalizationVariable =
  | '{{CustomerName}}'
  | '{{AccountNumber}}'
  | '{{Amount}}'
  | '{{TransactionDate}}'
  | '{{MerchantName}}'
  | '{{LOB}}'
  | '{{Region}}';

// ── Component Library Definition ──────────────────────────────────────────────

export interface ComponentDefinition {
  kind: ComponentKind;
  category: ComponentCategory;
  label: string;
  description: string;
  icon: string; // lucide icon name (string, resolved at runtime)
  defaultText: string;
  defaultUrl?: string;
}

// ── Content Builder State (hook interface) ────────────────────────────────────

export interface ContentBuilderState {
  // Brand
  brand: BrandSettings;
  setBrand: (b: BrandSettings) => void;
  updateBrandField: <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => void;

  // Dynamic component definitions (loaded from service)
  componentDefs: ComponentDefinition[];

  // Canvas per channel
  componentsByChannel: Record<string, CanvasComponent[]>;
  addComponent: (channel: string, def: ComponentDefinition) => void;
  removeComponent: (channel: string, id: string) => void;
  moveComponent: (channel: string, id: string, direction: 'up' | 'down') => void;
  duplicateComponent: (channel: string, id: string) => void;
  updateComponent: (channel: string, id: string, patch: Partial<CanvasComponent>) => void;
  reorderComponents: (channel: string, from: number, to: number) => void;

  // Single-channel compatibility helpers (resolves to previewChannel)
  components: CanvasComponent[];
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;

  // Channel-specific selections
  selectedComponentIdByChannel: Record<string, string | null>;
  setSelectedComponentIdByChannel: (channel: string, id: string | null) => void;

  // Preview
  previewChannel: PreviewChannel;
  setPreviewChannel: (c: PreviewChannel) => void;
  previewSegment: PreviewSegment;
  setPreviewSegment: (s: PreviewSegment) => void;
  previewDevice: PreviewDevice;
  setPreviewDevice: (d: PreviewDevice) => void;
  sampleDataKey: string;
  setSampleDataKey: (k: string) => void;
  currentSampleData: SampleDataCustomer;

  // UI flags
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}
