import Konva from 'konva';
import { jsPDF } from 'jspdf';
import { DocumentTemplate, DocumentElement, PAPER_SIZES } from './types';

const PT_TO_PX = 1.33;

const MOCK_FALLBACK: Record<string, string> = {
  customerName: 'John Smith',
  customerId: 'CUST-001234',
  customerAddress: '1234 Main Street, Charlotte, NC 28201',
  customerNumber: '7891234560',
  loanNumber: 'LN-2024-98765',
  loanAmount: '$125,000.00',
  interestRate: '6.75%',
  loanStatus: 'Active',
  companyName: 'Wells Fargo Bank, N.A.',
  companyAddress: '420 Montgomery Street, San Francisco, CA 94104',
  companyPhone: '1-800-869-3557',
  companyEmail: 'support@wellsfargo.com',
  today: new Date().toLocaleDateString(),
  employeeId: 'EMP-9988',
  branchCode: 'BR-304',
  accountBalance: '$45,230.15',
  dueDate: '08/15/2026',
  referenceNumber: 'REF-8827-X'
};

function getValue(key: string, previewData?: Record<string, string>): string {
  if (previewData && previewData[key] !== undefined && previewData[key] !== '') {
    return String(previewData[key]);
  }
  // Smart fallbacks mapping form fields to template fields
  if (key === 'customerId' && previewData?.messageId) return String(previewData.messageId);
  if (key === 'customerName' && previewData?.messageName) return String(previewData.messageName);
  if (key === 'today') return new Date().toLocaleDateString();

  return MOCK_FALLBACK[key] !== undefined ? MOCK_FALLBACK[key] : `{{${key}}}`;
}

function resolveText(el: DocumentElement, previewData?: Record<string, string>): string {
  let text = '';
  if (el.binding?.field) {
    const val = getValue(el.binding.field, previewData);
    const fmt = el.binding.format;
    if (fmt === 'uppercase') text = val.toUpperCase();
    else if (fmt === 'lowercase') text = val.toLowerCase();
    else if (fmt === 'titlecase') text = val.replace(/\b\w/g, c => c.toUpperCase());
    else text = val;
  } else {
    text = el.content || '';
  }

  // Replace all inline placeholders like {{customerName}}
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return getValue(trimmedKey, previewData);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function exportToPdf(template: DocumentTemplate, previewData?: Record<string, string>): Promise<void> {
  // Pre-load images
  const imageCache: Record<string, HTMLImageElement> = {};
  for (const page of template.pages) {
    for (const el of page.elements) {
      if (el.imageUrl && !imageCache[el.imageUrl]) {
        try {
          imageCache[el.imageUrl] = await loadImage(el.imageUrl);
        } catch (e) {
          console.error('Failed to load image:', el.imageUrl, e);
        }
      }
    }
  }

  const paperConfig = PAPER_SIZES[template.paper];
  const isLandscape = template.orientation === 'landscape';
  const pdfW = isLandscape ? paperConfig.height : paperConfig.width;
  const pdfH = isLandscape ? paperConfig.width : paperConfig.height;

  const paperW = pdfW * PT_TO_PX;
  const paperH = pdfH * PT_TO_PX;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [pdfW, pdfH]
  });

  // Create temporary container for Konva stage
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  for (let pageIdx = 0; pageIdx < template.pages.length; pageIdx++) {
    const page = template.pages[pageIdx];

    if (pageIdx > 0) {
      pdf.addPage([pdfW, pdfH], isLandscape ? 'landscape' : 'portrait');
    }

    const stage = new Konva.Stage({
      container: container,
      width: paperW,
      height: paperH
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Draw page background
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: paperW,
      height: paperH,
      fill: 'white'
    });
    layer.add(bg);

    // Filter out duplicate/overlapping elements of the same type at the exact same position
    // and restrict to at most one key-value table per page to prevent duplicates.
    const uniqueElements: typeof page.elements = [];
    let hasKeyValueTable = false;

    for (const el of page.elements) {
      if (el.type === 'table' && el.tableType === 'keyvalue') {
        if (hasKeyValueTable) {
          continue;
        }
        hasKeyValueTable = true;
      }

      const isDuplicate = uniqueElements.some(other => {
        if (el.type === 'table') {
          return other.type === 'table' &&
            Math.abs(other.x - el.x) < 40 &&
            Math.abs(other.y - el.y) < 40;
        }
        return other.type === el.type &&
          Math.abs(other.x - el.x) < 10 &&
          Math.abs(other.y - el.y) < 10;
      });

      if (isDuplicate) {
        continue;
      }
      uniqueElements.push(el);
    }

    // Sort elements by zIndex
    const sortedElements = [...uniqueElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const el of sortedElements) {
      if (!el.visible) continue;

      const group = new Konva.Group({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation || 0,
        opacity: el.opacity ?? 1
      });

      const bw = el.border?.width ?? 0;
      const bc = el.border?.color ?? '#cbd5e1';
      const fill = el.backgroundColor === 'transparent' ? undefined : el.backgroundColor;

      // Handle element types
      if (['statictext', 'dynamicfield', 'paragraph', 'richtext', 'date', 'currency', 'amount', 'number', 'email', 'phone', 'textbox'].includes(el.type)) {
        if (fill) {
          group.add(new Konva.Rect({
            width: el.width,
            height: el.height,
            fill: fill,
            cornerRadius: el.border?.radius || 0,
            stroke: bw > 0 ? bc : undefined,
            strokeWidth: bw
          }));
        }

        const textVal = resolveText(el, previewData);
        group.add(new Konva.Text({
          width: el.width,
          height: el.height,
          text: textVal || (el.binding ? `{{${el.binding.field || 'field'}}}` : ''),
          fontFamily: el.textStyle?.fontFamily || 'Arial',
          fontSize: el.textStyle?.fontSize || 12,
          fontStyle: `${el.textStyle?.bold ? 'bold' : ''} ${el.textStyle?.italic ? 'italic' : ''}`.trim() || 'normal',
          textDecoration: el.textStyle?.underline ? 'underline' : el.textStyle?.strikethrough ? 'line-through' : '',
          align: el.textStyle?.align || 'left',
          fill: el.textStyle?.color || '#1e293b',
          letterSpacing: el.textStyle?.letterSpacing || 0,
          lineHeight: el.textStyle?.lineHeight || 1.4,
          padding: el.padding || 4,
          wrap: 'word'
        }));
      } else if (el.type === 'hline') {
        group.add(new Konva.Line({
          points: [0, el.height / 2, el.width, el.height / 2],
          stroke: bc,
          strokeWidth: bw > 0 ? bw : 1
        }));
      } else if (el.type === 'vline') {
        group.add(new Konva.Line({
          points: [el.width / 2, 0, el.width / 2, el.height],
          stroke: bc,
          strokeWidth: bw > 0 ? bw : 1
        }));
      } else if (el.type === 'rectangle' || el.type === 'section') {
        group.add(new Konva.Rect({
          width: el.width,
          height: el.height,
          fill: fill || (el.type === 'section' ? 'rgba(248,250,252,0.8)' : undefined),
          stroke: bw > 0 ? bc : el.type === 'section' ? '#e2e8f0' : undefined,
          strokeWidth: bw > 0 ? bw : el.type === 'section' ? 1 : 0,
          cornerRadius: el.border?.radius || 0
        }));
        if (el.type === 'section' && el.sectionLabel) {
          group.add(new Konva.Text({
            x: 6,
            y: 4,
            text: el.sectionLabel,
            fontSize: 10,
            fill: '#94a3b8',
            fontStyle: 'italic'
          }));
        }
      } else if (el.type === 'circle') {
        group.add(new Konva.Circle({
          x: el.width / 2,
          y: el.height / 2,
          radius: Math.min(el.width, el.height) / 2,
          fill: fill || '#f8fafc',
          stroke: bw > 0 ? bc : undefined,
          strokeWidth: bw
        }));
      } else if (el.type === 'table') {
        if (el.tableType === 'keyvalue') {
          const rowH = 24;
          const col1W = el.width * 0.45;
          const col2W = el.width * 0.55;
          const items = el.columns || [];

          group.add(new Konva.Rect({
            width: el.width,
            height: el.height,
            fill: '#fff',
            stroke: '#cbd5e1',
            strokeWidth: 1
          }));

          group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: el.width,
            height: rowH,
            fill: '#f1f5f9'
          }));

          group.add(new Konva.Text({
            x: 6,
            y: 6,
            width: col1W - 12,
            text: 'Field Name',
            fontSize: 10,
            fill: '#334155',
            fontStyle: 'bold'
          }));

          group.add(new Konva.Text({
            x: col1W + 6,
            y: 6,
            width: col2W - 12,
            text: 'Field Value',
            fontSize: 10,
            fill: '#334155',
            fontStyle: 'bold'
          }));

          group.add(new Konva.Line({
            points: [0, rowH, el.width, rowH],
            stroke: '#cbd5e1',
            strokeWidth: 1
          }));

          items.forEach((col, idx) => {
            const yPos = rowH + idx * rowH;
            if (yPos + rowH > el.height) return;

            const valStr = getValue(col.binding, previewData);

            group.add(new Konva.Line({
              points: [0, yPos + rowH, el.width, yPos + rowH],
              stroke: '#e2e8f0',
              strokeWidth: 1
            }));

            group.add(new Konva.Text({
              x: 6,
              y: yPos + 6,
              width: col1W - 12,
              text: col.header,
              fontSize: 10,
              fill: '#475569'
            }));

            group.add(new Konva.Text({
              x: col1W + 6,
              y: yPos + 6,
              width: col2W - 12,
              text: valStr,
              fontSize: 10,
              fill: '#0f172a',
              fontStyle: previewData ? 'normal' : 'italic'
            }));
          });

          group.add(new Konva.Line({
            points: [col1W, 0, col1W, el.height],
            stroke: '#cbd5e1',
            strokeWidth: 1
          }));
        } else {
          // Standard table
          group.add(new Konva.Rect({
            width: el.width,
            height: el.height,
            fill: '#fff',
            stroke: '#e2e8f0',
            strokeWidth: 1
          }));

          group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: el.width,
            height: 28,
            fill: '#f1f5f9'
          }));

          (el.columns || []).forEach((col, i) => {
            const colW = col.width || el.width / (el.columns?.length || 1);
            const colX = (el.columns || []).slice(0, i).reduce((s, c) => s + (c.width || 80), 0);

            group.add(new Konva.Line({
              points: [colX, 0, colX, el.height],
              stroke: '#e2e8f0',
              strokeWidth: 1
            }));

            group.add(new Konva.Text({
              x: colX + 4,
              y: 6,
              width: colW - 8,
              text: col.header,
              fontSize: 10,
              fill: '#475569',
              fontStyle: 'bold'
            }));

            const valStr = getValue(col.binding || '', previewData);
            group.add(new Konva.Text({
              x: colX + 4,
              y: 36,
              width: colW - 8,
              text: valStr,
              fontSize: 10,
              fill: '#94a3b8',
              fontStyle: 'italic'
            }));
          });

          group.add(new Konva.Line({
            points: [0, 28, el.width, 28],
            stroke: '#e2e8f0',
            strokeWidth: 1
          }));

          if (el.arrayBinding) {
            group.add(new Konva.Text({
              x: 4,
              y: el.height - 18,
              text: `Repeats: ${el.arrayBinding}[]`,
              fontSize: 8,
              fill: '#3b82f6',
              fontStyle: 'italic'
            }));
          }
        }
      } else if (['image', 'logo', 'signature'].includes(el.type)) {
        const imgObj = el.imageUrl ? imageCache[el.imageUrl] : null;
        if (imgObj) {
          group.add(new Konva.Image({
            image: imgObj,
            width: el.width,
            height: el.height
          }));
        } else {
          // Fallback box
          group.add(new Konva.Rect({
            width: el.width,
            height: el.height,
            fill: '#f8fafc',
            stroke: '#cbd5e1',
            strokeWidth: 1,
            dash: [4, 4]
          }));
          group.add(new Konva.Text({
            x: 4,
            y: el.height / 2 - 5,
            width: el.width - 8,
            text: el.type.toUpperCase(),
            align: 'center',
            fontSize: 9,
            fill: '#94a3b8'
          }));
        }
      } else if (el.type === 'qrcode' || el.type === 'barcode') {
        group.add(new Konva.Rect({
          width: el.width,
          height: el.height,
          fill: '#f8fafc',
          stroke: '#cbd5e1',
          strokeWidth: 1
        }));
        group.add(new Konva.Text({
          x: 4,
          y: el.height / 2 - 5,
          width: el.width - 8,
          text: el.type === 'qrcode' ? '[QR Code]' : '[Barcode]',
          align: 'center',
          fontSize: 9,
          fill: '#64748b'
        }));
      } else if (el.type === 'checkbox') {
        const isChecked = previewData && el.binding?.field && previewData[el.binding.field] === 'true';
        group.add(new Konva.Rect({
          x: 0,
          y: el.height / 2 - 7,
          width: 14,
          height: 14,
          stroke: '#cbd5e1',
          strokeWidth: 1,
          fill: isChecked ? '#3b82f6' : '#fff',
          cornerRadius: 2
        }));
        if (isChecked) {
          group.add(new Konva.Line({
            points: [3, el.height / 2 - 1, 6, el.height / 2 + 2, 11, el.height / 2 - 3],
            stroke: '#fff',
            strokeWidth: 2
          }));
        }
        if (el.content) {
          group.add(new Konva.Text({
            x: 20,
            y: el.height / 2 - 6,
            text: el.content,
            fontSize: 11,
            fill: '#334155'
          }));
        }
      } else {
        // Fallback
        group.add(new Konva.Rect({
          width: el.width,
          height: el.height,
          fill: '#f8fafc',
          stroke: '#cbd5e1',
          strokeWidth: 1
        }));
        group.add(new Konva.Text({
          x: 4,
          y: 4,
          text: el.type,
          fontSize: 9,
          fill: '#64748b'
        }));
      }

      layer.add(group);
    }

    layer.draw();

    // Export layer to Image
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    
    // Clean up stage
    stage.destroy();

    // Add image to PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
  }

  // Clean up container
  document.body.removeChild(container);

  // Save the PDF
  pdf.save(`${template.name || 'document'}.pdf`);
}
