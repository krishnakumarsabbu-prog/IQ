import { DocumentTemplate, DocumentElement, PAPER_SIZES } from './types';

export async function exportToDocx(template: DocumentTemplate, previewData?: Record<string, string>): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, AlignmentType, ImageRun, Header, Footer, PageNumber, NumberFormat } = await import('docx');

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

  function getValue(key: string): string {
    if (previewData && previewData[key] !== undefined && previewData[key] !== '') {
      return String(previewData[key]);
    }
    // Smart fallbacks mapping form fields to template fields
    if (key === 'customerId' && previewData?.messageId) return String(previewData.messageId);
    if (key === 'customerName' && previewData?.messageName) return String(previewData.messageName);
    if (key === 'today') return new Date().toLocaleDateString();
    
    return MOCK_FALLBACK[key] !== undefined ? MOCK_FALLBACK[key] : `{{${key}}}`;
  }

  function resolveText(el: DocumentElement): string {
    let text = '';
    if (el.binding?.field) {
      text = getValue(el.binding.field);
    } else {
      text = el.content || '';
    }

    // Replace all inline placeholders like {{customerName}}
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return getValue(trimmedKey);
    });
  }

  function mapAlign(align?: string): typeof AlignmentType[keyof typeof AlignmentType] {
    switch (align) {
      case 'center': return AlignmentType.CENTER;
      case 'right': return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.JUSTIFIED;
      default: return AlignmentType.LEFT;
    }
  }

  const paperConfig = PAPER_SIZES[template.paper];
  const isLandscape = template.orientation === 'landscape';
  const docxPaperW = (isLandscape ? paperConfig.height : paperConfig.width) * 914.4; // EMUs
  const docxPaperH = (isLandscape ? paperConfig.width : paperConfig.height) * 914.4;

  const docxSections = template.pages.map((page) => {
    const paragraphs: (typeof Paragraph.prototype | typeof Table.prototype)[] = [];

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

    // Sort by y position
    const sorted = [...uniqueElements].sort((a, b) => a.y - b.y);

    for (const el of sorted) {
      if (!el.visible) continue;

      if (el.type === 'table') {
        if (el.tableType === 'keyvalue') {
          const rows: (typeof TableRow.prototype)[] = [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Field Name", bold: true, size: 20 })] })],
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  shading: { fill: "F1F5F9" },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Field Value", bold: true, size: 20 })] })],
                  width: { size: 55, type: WidthType.PERCENTAGE },
                  shading: { fill: "F1F5F9" },
                }),
              ],
              tableHeader: true,
            }),
            ...(el.columns || []).map(col => {
              const valStr = getValue(col.binding);
              return new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: col.header, size: 20 })] })],
                    width: { size: 45, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: valStr, size: 20, italics: !previewData })] })],
                    width: { size: 55, type: WidthType.PERCENTAGE },
                  }),
                ]
              });
            })
          ];
          paragraphs.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          continue;
        }

        const rows: (typeof TableRow.prototype)[] = [
          new TableRow({
            children: (el.columns || []).map(col =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: col.header, bold: true, size: 20 })] })],
                width: { size: col.width || 1440, type: WidthType.DXA },
              })
            ),
            tableHeader: true,
          }),
          new TableRow({
            children: (el.columns || []).map(col =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: `{{${col.binding}}}`, size: 20, italics: true })] })],
              })
            ),
          }),
        ];
        paragraphs.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
        continue;
      }

      if (el.type === 'pagebreak') {
        paragraphs.push(new Paragraph({ pageBreakBefore: true, children: [] }));
        continue;
      }

      if (el.type === 'hline') {
        paragraphs.push(
          new Paragraph({
            children: [],
            border: { bottom: { style: 'single', size: 6, color: '94a3b8' } },
          })
        );
        continue;
      }

      const text = resolveText(el);
      if (!text && !['hline', 'vline', 'rectangle', 'circle', 'image', 'logo'].includes(el.type)) {
        continue;
      }

      const textRun = new TextRun({
        text,
        bold: el.textStyle?.bold,
        italics: el.textStyle?.italic,
        underline: el.textStyle?.underline ? {} : undefined,
        strike: el.textStyle?.strikethrough,
        size: (el.textStyle?.fontSize || 12) * 2,
        font: el.textStyle?.fontFamily || 'Arial',
        color: (el.textStyle?.color || '#1e293b').replace('#', ''),
      });

      paragraphs.push(
        new Paragraph({
          children: [textRun],
          alignment: mapAlign(el.textStyle?.align),
          spacing: { line: Math.round((el.textStyle?.lineHeight || 1.4) * 240) },
        })
      );
    }

    if (paragraphs.length === 0) {
      paragraphs.push(new Paragraph({ children: [] }));
    }

    return {
      properties: {
        page: {
          size: { width: docxPaperW, height: docxPaperH, orientation: isLandscape ? 'landscape' : 'portrait' },
          margin: {
            top: template.margins.top * 914.4 / 100,
            right: template.margins.right * 914.4 / 100,
            bottom: template.margins.bottom * 914.4 / 100,
            left: template.margins.left * 914.4 / 100,
          },
        },
      },
      children: paragraphs,
    } as any;
  });

  const doc = new Document({ sections: docxSections });
  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name || 'document'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
