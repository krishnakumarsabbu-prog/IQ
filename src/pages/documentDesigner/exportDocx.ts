import { DocumentTemplate, DocumentElement, PAPER_SIZES } from './types';

export async function exportToDocx(template: DocumentTemplate, previewData?: Record<string, string>): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, AlignmentType, ImageRun, Header, Footer, PageNumber, NumberFormat } = await import('docx');

  function resolveText(el: DocumentElement): string {
    if (previewData && el.binding?.field) {
      const val = previewData[el.binding.field];
      if (val) return val;
    }
    return el.content || (el.binding?.field ? `{{${el.binding.field}}}` : '');
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

    // Sort by y position
    const sorted = [...page.elements].sort((a, b) => a.y - b.y);

    for (const el of sorted) {
      if (!el.visible) continue;

      if (el.type === 'table') {
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
