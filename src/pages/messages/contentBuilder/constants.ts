/**
 * contentBuilder/constants.ts
 * ───────────────────────────
 * Static data: component library definitions, sample customers,
 * personalization variables, theme presets. Zero side-effects.
 */

import type {
  ComponentDefinition,
  SampleDataCustomer,
  BrandSettings,
  PersonalizationVariable,
  ThemePreset,
} from './types';

// ── Component Library ─────────────────────────────────────────────────────────

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // Text
  { kind: 'pageheader',   category: 'text',     label: 'Page Header',   description: 'Top-level header block',           icon: 'Heading1',     defaultText: 'You made a purchase of $831.77' },
  { kind: 'heading',      category: 'text',     label: 'Heading',       description: 'H1-level section title',           icon: 'Heading1',     defaultText: 'Hello, {{CustomerName}}' },
  { kind: 'subheading',   category: 'text',     label: 'Subheading',    description: 'H2 secondary heading',             icon: 'Heading2',     defaultText: 'Your account summary' },
  { kind: 'paragraph',    category: 'text',     label: 'Paragraph',     description: 'Body text block',                  icon: 'AlignLeft',    defaultText: 'Your transaction on {{TransactionDate}} at {{MerchantName}} was successful.' },
  { kind: 'richtext',     category: 'text',     label: 'Rich Text',     description: 'Formatted HTML text editor',       icon: 'FileText',     defaultText: 'Enter rich text content here...' },
  { kind: 'quote',        category: 'text',     label: 'Quote',         description: 'Highlighted quote block',          icon: 'Quote',        defaultText: 'Your satisfaction is our priority.' },
  // Action
  { kind: 'cta',          category: 'action',   label: 'CTA Button',    description: 'Primary call-to-action button',    icon: 'MousePointer', defaultText: 'Go to account',   defaultUrl: 'https://connect.secure.wellsfargo.com/account-summary' },
  { kind: 'link',         category: 'action',   label: 'Link',          description: 'Inline hyperlink',                 icon: 'Link',         defaultText: 'View Details',    defaultUrl: 'https://wellsfargo.com' },
  { kind: 'quickaction',  category: 'action',   label: 'Quick Action',  description: 'Icon + label action button',       icon: 'Zap',          defaultText: 'Quick Pay' },
  // Media
  { kind: 'image',        category: 'media',    label: 'Image',         description: 'Inline image block',               icon: 'Image',        defaultText: 'Image Alt Text' },
  { kind: 'banner',       category: 'media',    label: 'Banner',        description: 'Full-width banner image',          icon: 'LayoutTemplate', defaultText: 'Banner Headline' },
  { kind: 'video',        category: 'media',    label: 'Video',         description: 'Embedded video player',            icon: 'Play',         defaultText: 'Video Title' },
  { kind: 'carousel',     category: 'media',    label: 'Carousel',      description: 'Multi-slide image carousel',       icon: 'GalleryHorizontal', defaultText: 'Slide 1' },
  // Data
  { kind: 'transactionsummary', category: 'data', label: 'Transaction Summary', description: 'Transaction detail card', icon: 'Receipt',      defaultText: 'Transaction Summary' },
  { kind: 'accountdetails',     category: 'data', label: 'Account Details',     description: 'Account info block',     icon: 'CreditCard',   defaultText: 'Account Details' },
  { kind: 'orderdetails',       category: 'data', label: 'Order Details',        description: 'Order info card',        icon: 'ShoppingCart', defaultText: 'Order Details' },
  { kind: 'table',              category: 'data', label: 'Table',               description: 'Data table component',   icon: 'Table2',       defaultText: 'Data Table' },
  { kind: 'keymetrics',         category: 'data', label: 'Key Metrics',          description: 'KPI metric tiles',       icon: 'BarChart3',    defaultText: 'Key Metrics' },
  // Layout
  { kind: 'divider',      category: 'layout',   label: 'Divider',       description: 'Horizontal rule separator',        icon: 'Minus',        defaultText: '' },
  { kind: 'spacer',       category: 'layout',   label: 'Spacer',        description: 'Vertical whitespace block',        icon: 'ArrowUpDown',  defaultText: '' },
  { kind: 'container',    category: 'layout',   label: 'Container',     description: 'Wrapper container block',          icon: 'Box',          defaultText: 'Container' },
  { kind: 'grid',         category: 'layout',   label: 'Grid',          description: '2-column grid layout',            icon: 'LayoutGrid',   defaultText: 'Grid Layout' },
  { kind: 'columns',      category: 'layout',   label: 'Columns',       description: 'Multi-column text layout',         icon: 'Columns',      defaultText: 'Columns' },
  // Advanced
  { kind: 'dynamiccontent',     category: 'advanced', label: 'Dynamic Content',      description: 'Condition-driven content',    icon: 'Sparkles',     defaultText: 'Dynamic Content' },
  { kind: 'conditionalblock',   category: 'advanced', label: 'Conditional Block',    description: 'IF/ELSE content switcher',    icon: 'GitBranch',    defaultText: 'Conditional Block' },
  { kind: 'personalizationblock', category: 'advanced', label: 'Personalization',   description: 'Customer-specific content',   icon: 'User',         defaultText: 'Personalized Content' },
  { kind: 'recommendation',     category: 'advanced', label: 'Recommendation',       description: 'AI-driven product rec',       icon: 'Star',         defaultText: 'Recommended for You' },
  { kind: 'aisummary',          category: 'advanced', label: 'AI Summary',           description: 'AI-generated content block',  icon: 'BrainCircuit', defaultText: 'AI Summary Block' },
];

export const COMPONENT_CATEGORIES = [
  { key: 'text',     label: 'Text Components' },
  { key: 'action',   label: 'Action Components' },
  { key: 'media',    label: 'Media Components' },
  { key: 'data',     label: 'Data Components' },
  { key: 'layout',   label: 'Layout Components' },
  { key: 'advanced', label: 'Advanced Components' },
] as const;

// ── Sample Customers ──────────────────────────────────────────────────────────

export const SAMPLE_CUSTOMERS: SampleDataCustomer[] = [
  {
    id: 'customer_a',
    label: 'Customer A',
    CustomerName: 'John Smith',
    AccountNumber: '****4521',
    Amount: '$831.77',
    TransactionDate: 'Jun 24, 2026',
    MerchantName: 'Amazon.com',
    LOB: 'Retail',
    Region: 'West',
  },
  {
    id: 'customer_b',
    label: 'Customer B',
    CustomerName: 'Sarah Johnson',
    AccountNumber: '****8834',
    Amount: '$2,450.00',
    TransactionDate: 'Jun 24, 2026',
    MerchantName: 'Apple Store',
    LOB: 'Commercial',
    Region: 'East',
  },
  {
    id: 'premium_customer',
    label: 'Premium Customer',
    CustomerName: 'Michael Chen',
    AccountNumber: '****1199',
    Amount: '$12,750.00',
    TransactionDate: 'Jun 24, 2026',
    MerchantName: 'Luxury Travel Co.',
    LOB: 'Wealth Management',
    Region: 'Northeast',
  },
  {
    id: 'vip_customer',
    label: 'VIP Customer',
    CustomerName: 'Elizabeth Warren',
    AccountNumber: '****0087',
    Amount: '$45,000.00',
    TransactionDate: 'Jun 24, 2026',
    MerchantName: 'Real Estate Holdings',
    LOB: 'Investment Banking',
    Region: 'Southeast',
  },
];

// ── Personalization Variables ─────────────────────────────────────────────────

export const PERSONALIZATION_VARIABLES: PersonalizationVariable[] = [
  '{{CustomerName}}',
  '{{AccountNumber}}',
  '{{Amount}}',
  '{{TransactionDate}}',
  '{{MerchantName}}',
  '{{LOB}}',
  '{{Region}}',
];

// ── Theme Presets ─────────────────────────────────────────────────────────────

export const THEME_PRESETS: Record<ThemePreset, BrandSettings> = {
  'Retail': {
    themePreset: 'Retail',
    primaryColor: '#D71E28',
    secondaryColor: '#FFB81C',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    logoUrl: null,
    logoFile: null,
  },
  'Commercial': {
    themePreset: 'Commercial',
    primaryColor: '#0A3E5E',
    secondaryColor: '#00A3AD',
    backgroundColor: '#F8FAFC',
    textColor: '#1E293B',
    logoUrl: null,
    logoFile: null,
  },
  'Corporate': {
    themePreset: 'Corporate',
    primaryColor: '#1E3A5F',
    secondaryColor: '#4A90D9',
    backgroundColor: '#F1F5F9',
    textColor: '#0F172A',
    logoUrl: null,
    logoFile: null,
  },
  'Investment Banking': {
    themePreset: 'Investment Banking',
    primaryColor: '#1B1B2F',
    secondaryColor: '#D4AF37',
    backgroundColor: '#0D0D1A',
    textColor: '#E2E8F0',
    logoUrl: null,
    logoFile: null,
  },
  'Wealth Management': {
    themePreset: 'Wealth Management',
    primaryColor: '#2D5016',
    secondaryColor: '#7CB342',
    backgroundColor: '#FAFDF7',
    textColor: '#1C2B13',
    logoUrl: null,
    logoFile: null,
  },
};

export const DEFAULT_BRAND: BrandSettings = THEME_PRESETS['Retail'];
