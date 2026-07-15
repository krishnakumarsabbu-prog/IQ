/**
 * importWordDoc.ts
 * Converts a Microsoft Word (.docx) file into an AIQ DocumentTemplate.
 *
 * Key fixes vs v1:
 *  - Recursive DOM walker so <table> and <img> are found at ANY depth
 *  - Tables: reads all rows (not just header), stores cell data as JSON content
 *  - Images: mammoth embeds base64 data URIs inside <img src="data:…">; we capture them correctly
 *  - Proper column-width distribution across actual column count
 */

import mammoth from 'mammoth';
import {
  DocumentTemplate,
  DocumentElement,
  DocumentPage,
  PaperSize,
  TextStyle,
  DEFAULT_TEXT_STYLE,
} from './types';
import { documentLayoutService } from './documentLayoutService';

// ─── Page constants (A4 at 96 dpi equivalent in logical pixels) ───────────────
const PAGE_DIMS: Record<PaperSize, { w: number; h: number }> = {
  A4:     { w: 595, h: 842  },
  A3:     { w: 842, h: 1191 },
  Letter: { w: 612, h: 792  },
  Legal:  { w: 612, h: 1008 },
};
const MARGIN        = 56;   // left / right / top / bottom margin (px)
const CONTENT_W     = PAGE_DIMS.A4.w - MARGIN * 2;  // 483
const PAGE_H        = PAGE_DIMS.A4.h;
const USABLE_H      = PAGE_H - MARGIN * 2;           // 730
const PARA_GAP      = 8;
const ROW_H         = 26;   // table row height
const MIN_ROW_H     = 22;

// ─── uid ─────────────────────────────────────────────────────────────────────
let _seq = 0;
function uid() {
  return `el_${Date.now()}_${++_seq}_${Math.random().toString(36).slice(2, 5)}`;
}

// ─── Text helpers ─────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&quot;/g,  '"')
    .replace(/&#39;/g,   "'")
    .trim();
}

function parseFontSize(el: Element): number {
  const inlineSize = (el as HTMLElement).style?.fontSize;
  if (inlineSize) {
    const n = parseFloat(inlineSize);
    if (!isNaN(n) && n > 0) return Math.round(n);
  }
  const tag = el.tagName?.toLowerCase();
  const map: Record<string, number> = { h1: 28, h2: 22, h3: 18, h4: 16, h5: 14, h6: 13 };
  return map[tag] ?? 12;
}

function isBold(el: Element): boolean {
  const tag = el.tagName?.toLowerCase();
  if (['h1','h2','h3','h4','h5','h6','strong','b','th'].includes(tag)) return true;
  const fw = (el as HTMLElement).style?.fontWeight;
  return fw === 'bold' || Number(fw) >= 700;
}

function isItalic(el: Element): boolean {
  const tag = el.tagName?.toLowerCase();
  if (['em', 'i'].includes(tag)) return true;
  return (el as HTMLElement).style?.fontStyle === 'italic';
}

function parseColor(el: Element): string {
  const c = (el as HTMLElement).style?.color;
  return c && c !== 'transparent' ? c : '#1e293b';
}

function parseAlign(el: Element): 'left' | 'center' | 'right' | 'justify' {
  const a = (el as HTMLElement).style?.textAlign as string;
  if (a === 'center')  return 'center';
  if (a === 'right')   return 'right';
  if (a === 'justify') return 'justify';
  return 'left';
}

function estimateTextHeight(text: string, fontSize: number, width: number): number {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.6)));
  const rawLines     = text.split('\n').length;
  const wrappedLines = text.split('\n').reduce(
    (acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine)),
    0,
  );
  const lines = Math.max(rawLines, wrappedLines);
  return Math.max(lines * (fontSize * 1.55) + 6, 24);
}

// ─── Page manager ─────────────────────────────────────────────────────────────
class PageManager {
  pages: DocumentPage[] = [];
  current: DocumentElement[] = [];
  cursorY: number = MARGIN;

  private _flush() {
    this.pages.push({
      id: `page_${Date.now()}_${this.pages.length}`,
      elements: this.current,
    });
    this.current = [];
    this.cursorY = MARGIN;
  }

  /** Returns cursorY after ensuring `neededH` fits; starts new page if not. */
  reserve(neededH: number): number {
    if (this.cursorY + neededH > MARGIN + USABLE_H && this.current.length > 0) {
      this._flush();
    }
    return this.cursorY;
  }

  advance(h: number, gap = PARA_GAP) {
    this.cursorY += h + gap;
  }

  push(el: DocumentElement) {
    el.zIndex = this.current.length;
    this.current.push(el);
  }

  finalise() {
    if (this.current.length > 0 || this.pages.length === 0) {
      this._flush();
    }
  }
}

// ─── Table parser ─────────────────────────────────────────────────────────────
/**
 * Extracts rows from a <table> element WITHOUT descending into nested tables.
 * Returns { headers[], rows[][] } where each cell value is plain text.
 */
function parseTable(tableEl: Element): { headers: string[]; rows: string[][] } {
  // Collect only direct <tr> inside the immediate <tbody>/<thead>/<tfoot> children
  // to avoid picking up rows from nested tables.
  const directSections = Array.from(tableEl.children).filter(c =>
    ['thead', 'tbody', 'tfoot', 'tr'].includes(c.tagName.toLowerCase()),
  );

  const allRows: Element[] = [];
  for (const section of directSections) {
    if (section.tagName.toLowerCase() === 'tr') {
      allRows.push(section);
    } else {
      // thead / tbody / tfoot — grab their direct <tr> children only
      allRows.push(
        ...Array.from(section.children).filter(c => c.tagName.toLowerCase() === 'tr'),
      );
    }
  }

  if (allRows.length === 0) return { headers: [], rows: [] };

  const parseRow = (tr: Element): string[] =>
    Array.from(tr.children)
      .filter(c => ['td', 'th'].includes(c.tagName.toLowerCase()))
      .map(c => stripHtml(c.innerHTML));

  // Treat first row as headers
  const headers = parseRow(allRows[0]);
  const rows    = allRows.slice(1).map(parseRow);
  return { headers, rows };
}

// ─── Recursive DOM walker ─────────────────────────────────────────────────────
/**
 * Walks the body's child tree in document order.
 * Returns true if the node was handled as a block element (stops parent from
 * also treating it as inline text).
 */
function walkNode(node: Node, pm: PageManager): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const el  = node as Element;
  const tag = el.tagName.toLowerCase();

  // ── TABLE ──────────────────────────────────────────────────────────────────
  if (tag === 'table') {
    const { headers, rows } = parseTable(el);
    const colCount = Math.max(headers.length, ...rows.map(r => r.length), 1);
    const allRowCount = 1 + rows.length; // header + data rows
    const tableH  = Math.max(allRowCount * ROW_H + 4, MIN_ROW_H * 2);
    const colWidth = Math.floor(CONTENT_W / colCount);

    const y = pm.reserve(tableH);

    // Build columns metadata
    const columns = headers.map((h, ci) => ({
      id:      `col_${uid()}_${ci}`,
      header:  h || `Column ${ci + 1}`,
      binding: (h || `col${ci + 1}`).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      width:   colWidth,
    }));

    // Fallback columns when there's no header row (all rows are data)
    if (columns.length === 0 && colCount > 0) {
      for (let ci = 0; ci < colCount; ci++) {
        columns.push({
          id:      `col_${uid()}_${ci}`,
          header:  `Column ${ci + 1}`,
          binding: `col${ci + 1}`,
          width:   colWidth,
        });
      }
    }

    // Store all row data as JSON in content so the canvas can render it
    const tableData = {
      headers,
      rows,
    };

    const docEl: DocumentElement = {
      id:         uid(),
      type:       'table',
      tableType:  'grid',
      x:          MARGIN,
      y,
      width:      CONTENT_W,
      height:     tableH,
      rotation:   0,
      visible:    true,
      locked:     false,
      opacity:    1,
      zIndex:     0, // set by pm.push
      columns,
      content:    JSON.stringify(tableData),   // row data for rendering
      border:     { width: 1, color: '#94a3b8', style: 'solid', radius: 0 },
      backgroundColor: '#ffffff',
      padding:    0,
    };

    pm.push(docEl);
    pm.advance(tableH, PARA_GAP * 2);
    return true;
  }

  // ── IMAGE ──────────────────────────────────────────────────────────────────
  if (tag === 'img') {
    const imgEl = el as HTMLImageElement;
    const src   = imgEl.getAttribute('src') || '';
    if (!src) return false; // skip empty images

    // Try to infer natural dimensions from the src (data URI) or fallback
    let imgW = CONTENT_W * 0.6;
    let imgH = 160;

    // mammoth sometimes sets width/height attributes
    const attrW = imgEl.getAttribute('width');
    const attrH = imgEl.getAttribute('height');
    if (attrW && attrH) {
      const parsedW = parseFloat(attrW);
      const parsedH = parseFloat(attrH);
      if (!isNaN(parsedW) && !isNaN(parsedH) && parsedW > 0 && parsedH > 0) {
        // Scale to fit content width
        const scale = Math.min(1, CONTENT_W / parsedW);
        imgW = Math.round(parsedW * scale);
        imgH = Math.round(parsedH * scale);
      }
    }

    imgW = Math.min(imgW, CONTENT_W);
    imgH = Math.min(imgH, 400);

    const y = pm.reserve(imgH + PARA_GAP);

    const docEl: DocumentElement = {
      id:                uid(),
      type:              'image',
      x:                 MARGIN,
      y,
      width:             imgW,
      height:            imgH,
      rotation:          0,
      visible:           true,
      locked:            false,
      opacity:           1,
      zIndex:            0,
      imageUrl:          src,       // base64 data URI from mammoth
      maintainAspectRatio: true,
      backgroundColor:   'transparent',
      padding:           0,
    };

    pm.push(docEl);
    pm.advance(imgH, PARA_GAP);
    return true;
  }

  // ── HEADING ────────────────────────────────────────────────────────────────
  if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
    const text = stripHtml(el.innerHTML || '');
    if (!text) return true;

    const fontSize  = parseFontSize(el);
    const h         = Math.max(fontSize * 1.7 + 10, 36);
    const y         = pm.reserve(h);

    const textStyle: TextStyle = {
      ...DEFAULT_TEXT_STYLE,
      fontSize,
      bold:   true,
      italic: isItalic(el),
      color:  parseColor(el),
      align:  parseAlign(el),
    };

    pm.push({
      id: uid(), type: 'statictext',
      x: MARGIN, y, width: CONTENT_W, height: h,
      rotation: 0, visible: true, locked: false, opacity: 1, zIndex: 0,
      content: text, textStyle,
      backgroundColor: 'transparent', padding: 4,
    });
    pm.advance(h, PARA_GAP);
    return true;
  }

  // ── PARAGRAPH — check for embedded images first ────────────────────────────
  if (tag === 'p') {
    // Check if this paragraph contains an <img>
    const imgs = Array.from(el.querySelectorAll('img'));
    if (imgs.length > 0) {
      let handled = false;
      for (const img of imgs) {
        if (walkNode(img, pm)) handled = true;
      }
      // Also render any text content around the image
      const textContent = stripHtml(el.innerHTML.replace(/<img[^>]*>/gi, '').trim());
      if (textContent) {
        renderParagraph(el, textContent, pm);
      }
      return handled;
    }

    const text = stripHtml(el.innerHTML || '');
    if (!text) {
      pm.advance(LINE_H * 0.4, 0);
      return true;
    }
    renderParagraph(el, text, pm);
    return true;
  }

  // ── HORIZONTAL RULE ────────────────────────────────────────────────────────
  if (tag === 'hr') {
    const y = pm.reserve(6);
    pm.push({
      id: uid(), type: 'hline',
      x: MARGIN, y: y + 3, width: CONTENT_W, height: 2,
      rotation: 0, visible: true, locked: false, opacity: 1, zIndex: 0,
      border: { width: 1, color: '#cbd5e1', style: 'solid', radius: 0 },
      backgroundColor: '#cbd5e1', padding: 0,
    });
    pm.advance(6, PARA_GAP * 0.5);
    return true;
  }

  // ── LISTS (ul / ol) ────────────────────────────────────────────────────────
  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(el.children).filter(c => c.tagName.toLowerCase() === 'li');
    items.forEach((li, idx) => {
      const bullet   = tag === 'ol' ? `${idx + 1}. ` : '• ';
      const liText   = bullet + stripHtml(li.innerHTML);
      const fontSize = 12;
      const h        = estimateTextHeight(liText, fontSize, CONTENT_W - 20);
      const y        = pm.reserve(h);
      pm.push({
        id: uid(), type: 'paragraph',
        x: MARGIN + 20, y, width: CONTENT_W - 20, height: h,
        rotation: 0, visible: true, locked: false, opacity: 1, zIndex: 0,
        content: liText,
        textStyle: { ...DEFAULT_TEXT_STYLE, fontSize },
        backgroundColor: 'transparent', padding: 2,
      });
      pm.advance(h, 2);
    });
    pm.advance(0, PARA_GAP);
    return true;
  }

  // ── BLOCKQUOTE ────────────────────────────────────────────────────────────
  if (tag === 'blockquote') {
    const text = stripHtml(el.innerHTML || '');
    if (text) {
      const fontSize = 12;
      const h        = estimateTextHeight(text, fontSize, CONTENT_W - 20);
      const y        = pm.reserve(h);
      pm.push({
        id: uid(), type: 'paragraph',
        x: MARGIN + 10, y, width: CONTENT_W - 10, height: h,
        rotation: 0, visible: true, locked: false, opacity: 1, zIndex: 0,
        content: text,
        textStyle: { ...DEFAULT_TEXT_STYLE, fontSize, italic: true, color: '#475569' },
        backgroundColor: '#f8fafc',
        border: { width: 3, color: '#6366f1', style: 'solid', radius: 0 },
        padding: 10,
      });
      pm.advance(h, PARA_GAP);
    }
    return true;
  }

  // ── GENERIC CONTAINERS — recurse into children ─────────────────────────────
  if (['div', 'section', 'article', 'aside', 'main', 'figure'].includes(tag)) {
    let anyHandled = false;
    for (const child of Array.from(el.childNodes)) {
      if (walkNode(child, pm)) anyHandled = true;
    }
    // If no children were individually handled, treat container text as paragraph
    if (!anyHandled) {
      const text = stripHtml(el.innerHTML || '');
      if (text) renderParagraph(el, text, pm);
    }
    return true;
  }

  return false; // not handled
}

const LINE_H = 20; // blank-line height

function renderParagraph(el: Element, text: string, pm: PageManager) {
  const fontSize  = parseFontSize(el);
  const isDynamic = /\{\{[^}]+\}\}/.test(text);
  const h         = estimateTextHeight(text, fontSize, CONTENT_W);
  const y         = pm.reserve(h);

  const textStyle: TextStyle = {
    ...DEFAULT_TEXT_STYLE,
    fontSize,
    bold:   isBold(el),
    italic: isItalic(el),
    color:  parseColor(el),
    align:  parseAlign(el),
  };

  const docEl: DocumentElement = {
    id:    uid(),
    type:  isDynamic ? 'dynamicfield' : 'paragraph',
    x: MARGIN, y, width: CONTENT_W, height: h,
    rotation: 0, visible: true, locked: false, opacity: 1, zIndex: 0,
    content: text, textStyle,
    backgroundColor: 'transparent', padding: 2,
  };

  if (isDynamic) {
    const match = text.match(/\{\{([^}]+)\}\}/);
    if (match) docEl.binding = { field: match[1].trim(), format: 'none' };
  }

  pm.push(docEl);
  pm.advance(h, PARA_GAP);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export interface ImportResult {
  template: DocumentTemplate;
  warnings: string[];
}

export async function importWordDocument(file: File): Promise<ImportResult> {
  const warnings: string[] = [];
  _seq = 0;

  // 1. Mammoth: .docx → HTML  (with base64 image conversion)
  const arrayBuffer = await file.arrayBuffer();
  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((base64) => ({
          src: `data:${image.contentType};base64,${base64}`,
        }));
      }),
      styleMap: [
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
        "p[style-name='Heading 4'] => h4",
        "p[style-name='Heading 5'] => h5",
        "p[style-name='Heading 6'] => h6",
        "p[style-name='Title']     => h1.title",
        "p[style-name='Subtitle']  => p.subtitle",
        "r[style-name='Strong']    => strong",
      ],
    },
  );
  warnings.push(...mammothResult.messages.map(m => m.message));

  // 2. Parse HTML
  const parser = new DOMParser();
  const dom    = parser.parseFromString(mammothResult.value, 'text/html');
  const body   = dom.body;

  // 3. Walk top-level children
  const pm = new PageManager();
  for (const child of Array.from(body.childNodes)) {
    walkNode(child, pm);
  }
  pm.finalise();

  // 4. Build template
  const docName  = file.name.replace(/\.(docx?|doc)$/i, '');
  const template = documentLayoutService.createEmptyLayout(`${docName} (Imported)`);
  template.paper       = 'A4';
  template.orientation = 'portrait';
  template.pages       = pm.pages;
  template.status      = 'draft';

  return { template, warnings };
}
