export interface ValidationSettings {
  minLength?: number;
  maxLength?: number;
  regex?: string;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
  errorMessage?: string;
}

export interface AppearanceSettings {
  width?: string; // "25%" | "50%" | "75%" | "100%"
  labelPosition?: 'top' | 'left' | 'right';
  displayStyle?: 'default' | 'outlined' | 'filled';
  backgroundColor?: string;
  borderRadius?: string;
  spacing?: string;
  cssClass?: string;
}

export interface RuleSetting {
  ruleId: string;
  triggerField: string; // Key of trigger field
  operator: '==' | '!=' | '>' | '<' | 'contains' | 'empty';
  value: string;
  action: 'SHOW' | 'HIDE' | 'MAKE_REQUIRED' | 'READ_ONLY';
}

export interface AdvancedSettings {
  apiMapping?: string;
  mongoPropertyName?: string;
  jsonPath?: string;
  auditEnabled?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  versionControlled?: boolean;
}

export interface FormField {
  fieldId: string;
  fieldKey: string;
  fieldType: string; // TextBox, TextArea, RichText, Number, Currency, Date, DateTime, Email, Phone, Checkbox, Toggle, RadioGroup, Dropdown, MultiSelect, FileUpload, ImageUpload, SectionHeader, Divider, HTMLBlock, Grid, UserPicker, GroupPicker, TagControl, ChipControl, JsonEditor, CodeEditor
  label: string;
  placeholder?: string;
  tooltip?: string;
  helpText?: string;
  defaultValue?: string;
  required: boolean;
  readOnly: boolean;
  hidden: boolean;
  
  validation?: ValidationSettings;
  appearance?: AppearanceSettings;
  rules?: RuleSetting[];
  advanced?: AdvancedSettings;
}

export interface FormSection {
  sectionId: string;
  sectionName: string;
  description?: string;
  icon?: string;
  collapsible: boolean;
  expandedByDefault: boolean;
  columns: number; // 1 | 2 | 3 | 4
  backgroundColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  visibilityRule?: string;
  order: number;
  fields: FormField[];
}

export interface FormTab {
  tabId: string;
  tabName: string;
  order: number;
  sections: FormSection[];
}

export interface MessageTemplate {
  id?: string;
  templateId: string;
  templateName: string;
  description?: string;
  tabs: FormTab[];
  version: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface DropdownMaster {
  id?: string;
  masterId: string;
  masterName: string;
  items: { label: string; value: string }[];
}

export interface AuditLog {
  id: string;
  templateId: string;
  templateName: string;
  action: string;
  modifiedBy: string;
  modifiedDate: string;
  changes: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  templateName: string;
  version: string;
  templateMetadataJson: string;
  createdBy: string;
  createdDate: string;
  changeLog: string;
}

export interface MessageNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface MessageInstance {
  id?: string;
  messageId: string;
  messageName: string;
  messageType: string;
  channels: string[];
  status: 'Active' | 'Draft' | string;
  lastModified: string;
  templateId: string;
  formValues: Record<string, any>;
  bookmarks: Record<string, boolean>;
  notes: Record<string, MessageNote[]>;
}
