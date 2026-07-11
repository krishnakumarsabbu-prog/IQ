export type ElementType =
  | 'textbox'
  | 'paragraph'
  | 'image'
  | 'table'
  | 'qrcode'
  | 'barcode'
  | 'signature'
  | 'checkbox'
  | 'date'
  | 'currency'
  | 'amount'
  | 'number'
  | 'email'
  | 'phone'
  | 'hline'
  | 'vline'
  | 'rectangle'
  | 'circle'
  | 'richtext'
  | 'statictext'
  | 'dynamicfield'
  | 'section'
  | 'pagebreak'
  | 'header'
  | 'footer'
  | 'logo'
  | 'watermark';

export type Orientation = 'portrait' | 'landscape';
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
  color: string;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  radius: number;
}

export interface DynamicBinding {
  field: string;
  format?: 'uppercase' | 'lowercase' | 'titlecase' | 'dateformat' | 'currency' | 'phone' | 'mask' | 'none';
  formatPattern?: string;
  defaultValue?: string;
  nullValue?: string;
  conditionalExpression?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  binding: string;
  width: number;
}

export interface DocumentElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;

  // Content
  content?: string;
  binding?: DynamicBinding;

  // Style
  textStyle?: TextStyle;
  border?: BorderStyle;
  backgroundColor?: string;
  padding?: number;

  // Table specific
  columns?: TableColumn[];
  arrayBinding?: string;
  tableType?: 'grid' | 'keyvalue';

  // Image specific
  imageUrl?: string;
  maintainAspectRatio?: boolean;

  // Barcode / QR
  barcodeType?: 'Code128' | 'Code39' | 'QR' | 'PDF417';

  // Page number
  pageNumberFormat?: string;

  // Section
  sectionId?: string;
  sectionLabel?: string;
}

export interface DocumentPage {
  id: string;
  elements: DocumentElement[];
  header?: DocumentElement[];
  footer?: DocumentElement[];
}

export interface DocumentTemplate {
  id?: string;
  name: string;
  description?: string;
  paper: PaperSize;
  orientation: Orientation;
  margins: { top: number; right: number; bottom: number; left: number };
  pages: DocumentPage[];
  version?: string;
  status?: 'draft' | 'published';
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface MongoField {
  id: string;
  label: string;
  type: string;
  path?: string;
  arrayPath?: string;
}

export interface ComponentLibraryItem {
  type: ElementType;
  label: string;
  icon: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultContent?: string;
}

export const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  { type: 'statictext', label: 'Static Text', icon: 'Type', category: 'Basic', defaultWidth: 200, defaultHeight: 30, defaultContent: 'Static Text' },
  { type: 'dynamicfield', label: 'Dynamic Field', icon: 'Variable', category: 'Basic', defaultWidth: 200, defaultHeight: 30, defaultContent: '{{fieldName}}' },
  { type: 'paragraph', label: 'Paragraph', icon: 'AlignLeft', category: 'Basic', defaultWidth: 400, defaultHeight: 80, defaultContent: 'Paragraph text here...' },
  { type: 'richtext', label: 'Rich Text', icon: 'FileText', category: 'Basic', defaultWidth: 400, defaultHeight: 100, defaultContent: 'Rich text content...' },
  { type: 'image', label: 'Image', icon: 'Image', category: 'Media', defaultWidth: 150, defaultHeight: 100 },
  { type: 'logo', label: 'Logo', icon: 'Building', category: 'Media', defaultWidth: 150, defaultHeight: 60 },
  { type: 'signature', label: 'Signature', icon: 'PenLine', category: 'Media', defaultWidth: 200, defaultHeight: 60 },
  { type: 'table', label: 'Table', icon: 'Table', category: 'Data', defaultWidth: 500, defaultHeight: 150 },
  { type: 'table', label: 'Fields Table', icon: 'Table', category: 'Data', defaultWidth: 500, defaultHeight: 300 },
  { type: 'qrcode', label: 'QR Code', icon: 'QrCode', category: 'Data', defaultWidth: 80, defaultHeight: 80 },
  { type: 'barcode', label: 'Barcode', icon: 'Barcode', category: 'Data', defaultWidth: 200, defaultHeight: 60 },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', category: 'Input', defaultWidth: 140, defaultHeight: 24 },
  { type: 'date', label: 'Date', icon: 'Calendar', category: 'Input', defaultWidth: 150, defaultHeight: 30, defaultContent: '{{date}}' },
  { type: 'currency', label: 'Currency', icon: 'DollarSign', category: 'Input', defaultWidth: 150, defaultHeight: 30, defaultContent: '{{amount}}' },
  { type: 'email', label: 'Email', icon: 'Mail', category: 'Input', defaultWidth: 200, defaultHeight: 30, defaultContent: '{{email}}' },
  { type: 'phone', label: 'Phone', icon: 'Phone', category: 'Input', defaultWidth: 150, defaultHeight: 30, defaultContent: '{{phone}}' },
  { type: 'number', label: 'Number', icon: 'Hash', category: 'Input', defaultWidth: 120, defaultHeight: 30, defaultContent: '{{number}}' },
  { type: 'amount', label: 'Amount', icon: 'CircleDollarSign', category: 'Input', defaultWidth: 150, defaultHeight: 30, defaultContent: '{{amount}}' },
  { type: 'hline', label: 'Horizontal Line', icon: 'Minus', category: 'Shape', defaultWidth: 400, defaultHeight: 4 },
  { type: 'vline', label: 'Vertical Line', icon: 'GripVertical', category: 'Shape', defaultWidth: 4, defaultHeight: 100 },
  { type: 'rectangle', label: 'Rectangle', icon: 'Square', category: 'Shape', defaultWidth: 200, defaultHeight: 100 },
  { type: 'circle', label: 'Circle', icon: 'Circle', category: 'Shape', defaultWidth: 80, defaultHeight: 80 },
  { type: 'section', label: 'Section', icon: 'LayoutPanel', category: 'Layout', defaultWidth: 500, defaultHeight: 200 },
  { type: 'pagebreak', label: 'Page Break', icon: 'Scissors', category: 'Layout', defaultWidth: 550, defaultHeight: 20 },
  { type: 'header', label: 'Header', icon: 'PanelTop', category: 'Layout', defaultWidth: 550, defaultHeight: 80 },
  { type: 'footer', label: 'Footer', icon: 'PanelBottom', category: 'Layout', defaultWidth: 550, defaultHeight: 80 },
  { type: 'watermark', label: 'Watermark', icon: 'Droplets', category: 'Layout', defaultWidth: 300, defaultHeight: 80, defaultContent: 'CONFIDENTIAL' },
];

export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  A3: { width: 842, height: 1191 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  align: 'left',
  letterSpacing: 0,
  lineHeight: 1.4,
  color: '#1e293b',
};

export const DEFAULT_BORDER: BorderStyle = {
  width: 0,
  color: '#cbd5e1',
  style: 'solid',
  radius: 0,
};
