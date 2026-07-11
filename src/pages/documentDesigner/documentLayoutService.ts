import {
  DocumentTemplate,
  DocumentPage,
  DocumentElement,
  MongoField,
  PaperSize,
  Orientation,
  DEFAULT_TEXT_STYLE,
  DEFAULT_BORDER,
  COMPONENT_LIBRARY,
} from './types';

const API_BASE = 'http://localhost:8089/api';

const STORAGE_KEY = 'document_layouts';

function getStoredLayouts(): DocumentTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredLayouts(layouts: DocumentTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
}

export const documentLayoutService = {
  async getAllLayouts(): Promise<DocumentTemplate[]> {
    try {
      const res = await fetch(`${API_BASE}/document-layouts`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // fall through to localStorage
    }
    const local = getStoredLayouts();
    if (local.length > 0) {
      return local;
    }
    // Seed default template
    const defaultLayout = this.createDefaultWelcomeLetter();
    setStoredLayouts([defaultLayout]);
    return [defaultLayout];
  },

  async getLayout(id: string): Promise<DocumentTemplate | null> {
    try {
      const res = await fetch(`${API_BASE}/document-layouts/${id}`);
      if (res.ok) return res.json();
    } catch {
      // fall through
    }
    const layouts = getStoredLayouts();
    return layouts.find(l => l.id === id) || null;
  },

  async saveLayout(layout: DocumentTemplate): Promise<DocumentTemplate> {
    const now = new Date().toISOString();
    const toSave: DocumentTemplate = {
      ...layout,
      updatedDate: now,
      id: layout.id || `layout_${Date.now()}`,
      createdDate: layout.createdDate || now,
    };

    try {
      const url = toSave.id && layout.id
        ? `${API_BASE}/document-layouts/${toSave.id}`
        : `${API_BASE}/document-layouts`;
      const method = layout.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      if (res.ok) return res.json();
    } catch {
      // fall through
    }

    // localStorage fallback
    const layouts = getStoredLayouts();
    const idx = layouts.findIndex(l => l.id === toSave.id);
    if (idx >= 0) {
      layouts[idx] = toSave;
    } else {
      layouts.push(toSave);
    }
    setStoredLayouts(layouts);
    return toSave;
  },

  async deleteLayout(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/document-layouts/${id}`, { method: 'DELETE' });
    } catch {
      // fall through
    }
    const layouts = getStoredLayouts().filter(l => l.id !== id);
    setStoredLayouts(layouts);
  },

  async getMongoFields(templateId?: string): Promise<MongoField[]> {
    try {
      const url = templateId
        ? `${API_BASE}/document-layouts/fields?templateId=${templateId}`
        : `${API_BASE}/document-layouts/fields`;
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      // fall through
    }
    // Return mock fields when backend not available
    return [
      { id: 'customerName', label: 'Customer Name', type: 'text' },
      { id: 'customerId', label: 'Customer ID', type: 'text' },
      { id: 'customerAddress', label: 'Customer Address', type: 'text' },
      { id: 'customerNumber', label: 'Customer Number', type: 'text' },
      { id: 'loanNumber', label: 'Loan Number', type: 'text' },
      { id: 'loanAmount', label: 'Loan Amount', type: 'currency' },
      { id: 'interestRate', label: 'Interest Rate', type: 'number' },
      { id: 'loanStatus', label: 'Loan Status', type: 'text' },
      { id: 'companyName', label: 'Company Name', type: 'text' },
      { id: 'companyAddress', label: 'Company Address', type: 'text' },
      { id: 'companyPhone', label: 'Company Phone', type: 'phone' },
      { id: 'companyEmail', label: 'Company Email', type: 'email' },
      { id: 'today', label: 'Today Date', type: 'date' },
      { id: 'pageNumber', label: 'Page Number', type: 'number' },
      { id: 'totalPages', label: 'Total Pages', type: 'number' },
      { id: 'employeeId', label: 'Employee ID', type: 'text' },
      { id: 'branchCode', label: 'Branch Code', type: 'text' },
      { id: 'accountBalance', label: 'Account Balance', type: 'currency' },
      { id: 'dueDate', label: 'Due Date', type: 'date' },
      { id: 'referenceNumber', label: 'Reference Number', type: 'text' },
    ];
  },

  createEmptyLayout(name: string = 'Untitled Document'): DocumentTemplate {
    return {
      name,
      paper: 'A4',
      orientation: 'portrait',
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
      status: 'draft',
      pages: [
        {
          id: `page_${Date.now()}`,
          elements: [],
        },
      ],
    };
  },

  createDefaultElement(
    type: string,
    x: number,
    y: number
  ): DocumentElement {
    const lib = COMPONENT_LIBRARY.find(c => c.type === type);
    const base: DocumentElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: type as DocumentElement['type'],
      x,
      y,
      width: lib?.defaultWidth || 200,
      height: lib?.defaultHeight || 30,
      rotation: 0,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 0,
      content: lib?.defaultContent || '',
      textStyle: { ...DEFAULT_TEXT_STYLE },
      border: { ...DEFAULT_BORDER },
      backgroundColor: 'transparent',
      padding: 4,
    };

    if (type === 'dynamicfield') {
      base.binding = { field: '', format: 'none' };
    }
    if (type === 'table') {
      base.columns = [
        { id: 'col1', header: 'Column 1', binding: 'field1', width: 120 },
        { id: 'col2', header: 'Column 2', binding: 'field2', width: 120 },
        { id: 'col3', header: 'Column 3', binding: 'field3', width: 120 },
      ];
      base.arrayBinding = '';
    }
    if (type === 'hline' || type === 'vline') {
      base.border = { width: 1, color: '#94a3b8', style: 'solid', radius: 0 };
    }
    if (type === 'rectangle') {
      base.border = { width: 1, color: '#94a3b8', style: 'solid', radius: 4 };
      base.backgroundColor = '#f8fafc';
    }
    if (type === 'section') {
      base.border = { width: 1, color: '#e2e8f0', style: 'dashed', radius: 4 };
      base.backgroundColor = '#f8fafc';
    }
    if (type === 'header' || type === 'footer') {
      base.border = { width: 1, color: '#e2e8f0', style: 'solid', radius: 0 };
      base.backgroundColor = '#f8fafc';
    }
    if (type === 'watermark') {
      base.opacity = 0.15;
      base.textStyle = { ...DEFAULT_TEXT_STYLE, fontSize: 48, bold: true, color: '#94a3b8' };
    }
    if (type === 'pagebreak') {
      base.border = { width: 1, color: '#3b82f6', style: 'dashed', radius: 0 };
    }
    if (type === 'logo') {
      base.imageUrl = '';
      base.maintainAspectRatio = true;
    }
    if (type === 'image') {
      base.imageUrl = '';
      base.maintainAspectRatio = true;
    }

    return base;
  },

  createDefaultWelcomeLetter(): DocumentTemplate {
    const layout = this.createEmptyLayout('Welcome Letter Layout');
    const page = layout.pages[0];
    
    // Add a title header
    const title = this.createDefaultElement('statictext', 40, 40);
    title.width = 515;
    title.height = 40;
    title.content = 'LOAN ACCOUNT AGREEMENT & WELCOME LETTER';
    title.textStyle = {
      fontFamily: 'Arial',
      fontSize: 16,
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#1e3a8a',
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 0
    };
    
    // Add today's date
    const dateField = this.createDefaultElement('dynamicfield', 40, 100);
    dateField.width = 150;
    dateField.height = 20;
    dateField.binding = { field: 'today', format: 'none' };
    dateField.textStyle = {
      fontFamily: 'Arial',
      fontSize: 10,
      bold: false,
      italic: true,
      underline: false,
      strikethrough: false,
      color: '#475569',
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0
    };
    
    // Add text body
    const body = this.createDefaultElement('statictext', 40, 130);
    body.width = 515;
    body.height = 80;
    body.content = 'Dear {{customerName}},\n\nWe are pleased to inform you that your application for a loan with Wells Fargo Bank, N.A. has been approved. Below is a summary of your account details. Please review this information carefully and contact your support representative if you have any questions.';
    body.textStyle = {
      fontFamily: 'Arial',
      fontSize: 11,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#334155',
      align: 'left',
      lineHeight: 1.4,
      letterSpacing: 0
    };

    // Add a key-value Fields Table
    const table = this.createDefaultElement('table', 40, 230);
    table.tableType = 'keyvalue';
    table.width = 515;
    table.height = 150;
    table.columns = [
      { id: 'col_1', header: 'Customer Name', binding: 'customerName', width: 250 },
      { id: 'col_2', header: 'Customer ID', binding: 'customerId', width: 250 },
      { id: 'col_3', header: 'Loan Number', binding: 'loanNumber', width: 250 },
      { id: 'col_4', header: 'Loan Amount', binding: 'loanAmount', width: 250 },
      { id: 'col_5', header: 'Interest Rate', binding: 'interestRate', width: 250 },
    ];

    // Add signature area
    const sigLabel = this.createDefaultElement('statictext', 40, 400);
    sigLabel.width = 250;
    sigLabel.height = 20;
    sigLabel.content = 'Authorized Representative Signature:';
    sigLabel.textStyle = {
      fontFamily: 'Arial',
      fontSize: 10,
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#334155',
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0
    };

    const sigLine = this.createDefaultElement('hline', 40, 450);
    sigLine.width = 200;
    sigLine.height = 10;

    const companyName = this.createDefaultElement('statictext', 40, 465);
    companyName.width = 200;
    companyName.height = 20;
    companyName.content = 'Wells Fargo Bank, N.A.';
    companyName.textStyle = {
      fontFamily: 'Arial',
      fontSize: 10,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#475569',
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0
    };

    page.elements = [title, dateField, body, table, sigLabel, sigLine, companyName];
    return layout;
  }
};
