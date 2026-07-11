import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { DocumentElement, DocumentTemplate, PAPER_SIZES } from './types';
import { documentLayoutService } from './documentLayoutService';

interface DocumentCanvasProps {
  template: DocumentTemplate;
  selectedIds: string[];
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  showMargins: boolean;
  currentPage: number;
  onSelectElement: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
  onAddElement: (element: DocumentElement) => void;
  previewMode: boolean;
  previewData?: Record<string, string>;
}

const RULER_SIZE = 24;
const GRID_SIZE = 20;
const PT_TO_PX = 1.33; // approximate screen px per pt

function resolveContent(el: DocumentElement, previewMode: boolean, previewData?: Record<string, string>): string {
  if (!previewMode) return el.content || '';
  if (el.binding?.field && previewData) {
    const val = previewData[el.binding.field];
    if (val !== undefined) {
      const fmt = el.binding.format;
      if (fmt === 'uppercase') return val.toUpperCase();
      if (fmt === 'lowercase') return val.toLowerCase();
      if (fmt === 'titlecase') return val.replace(/\b\w/g, c => c.toUpperCase());
      return val;
    }
    return el.binding.defaultValue || `{{${el.binding.field}}}`;
  }
  return el.content || '';
}

function CanvasElement({
  el,
  isSelected,
  previewMode,
  previewData,
  onSelect,
  onChange,
  scale,
}: {
  el: DocumentElement;
  isSelected: boolean;
  previewMode: boolean;
  previewData?: Record<string, string>;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onChange: (updates: Partial<DocumentElement>) => void;
  scale: number;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !el.locked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, el.locked]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!el.locked) {
      onChange({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(Math.max(10, node.width() * scaleX)),
      height: Math.round(Math.max(10, node.height() * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  };

  const content = resolveContent(el, previewMode, previewData);
  const opacity = el.opacity ?? 1;
  const visible = el.visible ?? true;
  const border = el.border;
  const textStyle = el.textStyle;

  const commonProps = {
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    opacity,
    visible,
    rotation: el.rotation || 0,
    draggable: !el.locked && !previewMode,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
  };

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

  const getValue = (key: string): string => {
    if (previewData && previewData[key] !== undefined && previewData[key] !== '') {
      return String(previewData[key]);
    }
    if (key === 'customerId' && previewData?.messageId) return String(previewData.messageId);
    if (key === 'customerName' && previewData?.messageName) return String(previewData.messageName);
    if (key === 'today') return new Date().toLocaleDateString();

    return MOCK_FALLBACK[key] !== undefined ? MOCK_FALLBACK[key] : `{{${key}}}`;
  };

  const resolveText = (el: DocumentElement): string => {
    let text = '';
    if (el.binding?.field) {
      const val = getValue(el.binding.field);
      const fmt = el.binding.format;
      if (fmt === 'uppercase') text = val.toUpperCase();
      else if (fmt === 'lowercase') text = val.toLowerCase();
      else if (fmt === 'titlecase') text = val.replace(/\b\w/g, c => c.toUpperCase());
      else text = val;
    } else {
      text = el.content || '';
    }

    if (previewMode) {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return getValue(trimmedKey);
      });
    }
    return text;
  };

  const renderShape = () => {
    const bw = border?.width ?? 0;
    const bc = border?.color ?? '#cbd5e1';
    const fill = el.backgroundColor === 'transparent' ? undefined : el.backgroundColor;

    switch (el.type) {
      case 'statictext':
      case 'dynamicfield':
      case 'paragraph':
      case 'richtext':
      case 'date':
      case 'currency':
      case 'amount':
      case 'number':
      case 'email':
      case 'phone':
      case 'textbox':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            {fill && <Rect width={el.width} height={el.height} fill={fill} cornerRadius={border?.radius || 0} stroke={bw > 0 ? bc : undefined} strokeWidth={bw} />}
            <Text
              width={el.width}
              height={el.height}
              text={
                previewMode
                  ? resolveText(el)
                  : el.binding?.field
                  ? `{{${el.binding.field}}}`
                  : el.content || 'Text'
              }
              fontFamily={textStyle?.fontFamily || 'Arial'}
              fontSize={textStyle?.fontSize || 12}
              fontStyle={`${textStyle?.bold ? 'bold' : ''} ${textStyle?.italic ? 'italic' : ''}`.trim() || 'normal'}
              textDecoration={textStyle?.underline ? 'underline' : textStyle?.strikethrough ? 'line-through' : ''}
              align={textStyle?.align || 'left'}
              fill={textStyle?.color || '#1e293b'}
              letterSpacing={textStyle?.letterSpacing || 0}
              lineHeight={textStyle?.lineHeight || 1.4}
              padding={el.padding || 4}
              wrap="word"
            />
          </Group>
        );

      case 'hline':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Line points={[0, el.height / 2, el.width, el.height / 2]} stroke={bc} strokeWidth={bw > 0 ? bw : 1} />
          </Group>
        );

      case 'vline':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Line points={[el.width / 2, 0, el.width / 2, el.height]} stroke={bc} strokeWidth={bw > 0 ? bw : 1} />
          </Group>
        );

      case 'rectangle':
      case 'section':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect
              width={el.width}
              height={el.height}
              fill={fill || 'rgba(248,250,252,0.8)'}
              stroke={bw > 0 ? bc : el.type === 'section' ? '#e2e8f0' : undefined}
              strokeWidth={bw > 0 ? bw : el.type === 'section' ? 1 : 0}
              dash={border?.style === 'dashed' ? [6, 4] : border?.style === 'dotted' ? [2, 3] : []}
              cornerRadius={border?.radius || 0}
            />
            {el.type === 'section' && el.sectionLabel && (
              <Text x={6} y={4} text={el.sectionLabel} fontSize={10} fill="#94a3b8" fontStyle="italic" />
            )}
          </Group>
        );

      case 'circle':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Circle
              x={el.width / 2}
              y={el.height / 2}
              radius={Math.min(el.width, el.height) / 2}
              fill={fill || '#f8fafc'}
              stroke={bw > 0 ? bc : undefined}
              strokeWidth={bw}
            />
          </Group>
        );

      case 'pagebreak':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="rgba(59,130,246,0.06)" />
            <Line points={[0, el.height / 2, el.width, el.height / 2]} stroke="#3b82f6" strokeWidth={1} dash={[8, 4]} />
            <Text x={0} y={2} width={el.width} text="--- PAGE BREAK ---" align="center" fontSize={9} fill="#3b82f6" fontStyle="italic" />
          </Group>
        );

      case 'header':
      case 'footer':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill={fill || '#f8fafc'} stroke="#e2e8f0" strokeWidth={1} />
            <Text
              x={0} y={0}
              width={el.width} height={el.height}
              text={content || (el.type === 'header' ? 'Header' : 'Footer')}
              fontFamily={textStyle?.fontFamily || 'Arial'}
              fontSize={textStyle?.fontSize || 11}
              align={textStyle?.align || 'left'}
              fill={textStyle?.color || '#64748b'}
              padding={6}
              wrap="word"
            />
          </Group>
        );

      case 'logo':
      case 'image':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />
            <Text
              x={0} y={0}
              width={el.width} height={el.height}
              text={el.type === 'logo' ? 'LOGO' : 'IMAGE'}
              align="center"
              verticalAlign="middle"
              fontSize={12}
              fill="#94a3b8"
              fontStyle="bold"
            />
          </Group>
        );

      case 'qrcode':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#fff" stroke="#e2e8f0" strokeWidth={1} />
            <Text x={0} y={0} width={el.width} height={el.height} text="QR" align="center" verticalAlign="middle" fontSize={14} fill="#475569" fontStyle="bold" />
          </Group>
        );

      case 'barcode':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#fff" stroke="#e2e8f0" strokeWidth={1} />
            <Text x={0} y={4} width={el.width} text="| | || | ||| | || |" align="center" fontSize={8} fill="#1e293b" letterSpacing={2} />
            <Text x={0} y={el.height - 16} width={el.width} text={content || '1234567890'} align="center" fontSize={9} fill="#1e293b" />
          </Group>
        );

      case 'signature':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#fff" stroke="#e2e8f0" strokeWidth={1} cornerRadius={4} />
            <Line points={[10, el.height - 10, el.width - 10, el.height - 10]} stroke="#94a3b8" strokeWidth={1} />
            <Text x={0} y={el.height - 22} width={el.width} text="Signature" align="center" fontSize={9} fill="#94a3b8" fontStyle="italic" />
          </Group>
        );

      case 'checkbox':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect x={0} y={2} width={16} height={16} fill="#fff" stroke="#94a3b8" strokeWidth={1} cornerRadius={2} />
            <Text x={22} y={2} text={content || 'Checkbox label'} fontSize={textStyle?.fontSize || 12} fill={textStyle?.color || '#1e293b'} />
          </Group>
        );

      case 'watermark':
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Text
              x={0} y={0}
              width={el.width} height={el.height}
              text={content || 'CONFIDENTIAL'}
              align="center" verticalAlign="middle"
              fontSize={textStyle?.fontSize || 48}
              fill={textStyle?.color || '#94a3b8'}
              fontStyle="bold"
              rotation={-30}
            />
          </Group>
        );

      case 'table':
        if (el.tableType === 'keyvalue') {
          const rowH = 24;
          const col1W = el.width * 0.45;
          const col2W = el.width * 0.55;
          const items = el.columns || [];

          return (
            <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
              {/* Background */}
              <Rect width={el.width} height={el.height} fill="#fff" stroke="#cbd5e1" strokeWidth={1} />
              
              {/* Header row background */}
              <Rect x={0} y={0} width={el.width} height={rowH} fill="#f1f5f9" />
              
              {/* Header Texts */}
              <Text x={6} y={6} width={col1W - 12} text="Field Name" fontSize={10} fill="#334155" fontStyle="bold" />
              <Text x={col1W + 6} y={6} width={col2W - 12} text="Field Value" fontSize={10} fill="#334155" fontStyle="bold" />
              
              {/* Header separation line */}
              <Line points={[0, rowH, el.width, rowH]} stroke="#cbd5e1" strokeWidth={1} />
              
              {/* Rows */}
              {items.map((col, idx) => {
                const yPos = rowH + idx * rowH;
                const isVisible = yPos + rowH <= el.height;

                // Resolve preview value
                const valStr = previewMode ? getValue(col.binding) : `{{${col.binding}}}`;

                return (
                  <Group key={col.id} visible={isVisible}>
                    {/* Row separator */}
                    <Line points={[0, yPos + rowH, el.width, yPos + rowH]} stroke="#e2e8f0" strokeWidth={1} />
                    {/* Field label (Col 1) */}
                    <Text x={6} y={yPos + 6} width={col1W - 12} text={col.header} fontSize={10} fill="#475569" />
                    {/* Field value (Col 2) */}
                    <Text x={col1W + 6} y={yPos + 6} width={col2W - 12} text={valStr} fontSize={10} fill="#0f172a" fontStyle={previewMode ? "normal" : "italic"} />
                  </Group>
                );
              })}

              {/* Vertical separation line */}
              <Line points={[col1W, 0, col1W, el.height]} stroke="#cbd5e1" strokeWidth={1} />
            </Group>
          );
        }

        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#fff" stroke="#e2e8f0" strokeWidth={1} />
            {/* Header row */}
            <Rect x={0} y={0} width={el.width} height={28} fill="#f1f5f9" />
            {(el.columns || []).map((col, i) => {
              const colW = col.width || el.width / (el.columns?.length || 1);
              const colX = (el.columns || []).slice(0, i).reduce((s, c) => s + (c.width || 80), 0);
              return (
                <Group key={col.id}>
                  <Line points={[colX, 0, colX, el.height]} stroke="#e2e8f0" strokeWidth={1} />
                  <Text x={colX + 4} y={6} width={colW - 8} text={col.header} fontSize={10} fill="#475569" fontStyle="bold" />
                  <Text x={colX + 4} y={36} width={colW - 8} text={previewMode ? getValue(col.binding || '') : `{{${col.binding}}}`} fontSize={10} fill="#94a3b8" fontStyle="italic" />
                </Group>
              );
            })}
            <Line points={[0, 28, el.width, 28]} stroke="#e2e8f0" strokeWidth={1} />
            {el.arrayBinding && (
              <Text x={4} y={el.height - 18} text={`Repeats: ${el.arrayBinding}[]`} fontSize={8} fill="#3b82f6" fontStyle="italic" />
            )}
          </Group>
        );

      default:
        return (
          <Group ref={shapeRef} {...commonProps} onTransformEnd={handleTransformEnd}>
            <Rect width={el.width} height={el.height} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} cornerRadius={2} />
            <Text x={4} y={4} width={el.width - 8} text={el.type} fontSize={11} fill="#64748b" />
          </Group>
        );
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && !el.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
          }
          rotateEnabled={true}
          enabledAnchors={['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center']}
        />
      )}
    </>
  );
}

const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  template,
  selectedIds,
  zoom,
  showGrid,
  showRulers,
  showMargins,
  currentPage,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  previewMode,
  previewData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 900, height: 700 });

  const paperConfig = PAPER_SIZES[template.paper];
  const isLandscape = template.orientation === 'landscape';
  const paperW = (isLandscape ? paperConfig.height : paperConfig.width) * PT_TO_PX;
  const paperH = (isLandscape ? paperConfig.width : paperConfig.height) * PT_TO_PX;

  const scale = zoom / 100;
  const scaledW = paperW * scale;
  const scaledH = paperH * scale;

  const offsetX = RULER_SIZE + Math.max(20, (stageSize.width - scaledW) / 2);
  const offsetY = RULER_SIZE + 20;

  const margins = template.margins;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setStageSize({ width: e.contentRect.width, height: e.contentRect.height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const page = template.pages[currentPage];

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'paper-bg') {
      onSelectElement([]);
    }
  }, [onSelectElement]);

  const handleStageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('elementType');
    const tableType = e.dataTransfer.getData('tableType');
    if (!type || !stageRef.current) return;
    const stage = stageRef.current;
    stage.setPointersPositions(e.nativeEvent);
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const relX = Math.round((pos.x - offsetX) / scale);
    const relY = Math.round((pos.y - offsetY) / scale);
    if (relX < 0 || relY < 0 || relX > paperW || relY > paperH) return;
    const newEl = documentLayoutService.createDefaultElement(type, relX, relY);
    if (tableType) {
      newEl.tableType = tableType as any;
    }
    onAddElement(newEl);
  }, [offsetX, offsetY, scale, paperW, paperH, onAddElement]);

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  if (showGrid) {
    for (let x = 0; x <= paperW; x += GRID_SIZE) {
      gridLines.push(
        <Line key={`gv${x}`} points={[offsetX + x * scale, offsetY, offsetX + x * scale, offsetY + scaledH]} stroke="#e2e8f0" strokeWidth={0.5} />
      );
    }
    for (let y = 0; y <= paperH; y += GRID_SIZE) {
      gridLines.push(
        <Line key={`gh${y}`} points={[offsetX, offsetY + y * scale, offsetX + scaledW, offsetY + y * scale]} stroke="#e2e8f0" strokeWidth={0.5} />
      );
    }
  }

  // Ruler ticks
  const rulerTicksH: React.ReactNode[] = [];
  const rulerTicksV: React.ReactNode[] = [];
  if (showRulers) {
    for (let x = 0; x <= paperW; x += 50) {
      const sx = offsetX + x * scale;
      rulerTicksH.push(
        <React.Fragment key={`rt${x}`}>
          <Line points={[sx, RULER_SIZE - 6, sx, RULER_SIZE]} stroke="#94a3b8" strokeWidth={1} />
          <Text x={sx + 2} y={4} text={String(x)} fontSize={7} fill="#94a3b8" />
        </React.Fragment>
      );
    }
    for (let y = 0; y <= paperH; y += 50) {
      const sy = offsetY + y * scale;
      rulerTicksV.push(
        <React.Fragment key={`rv${y}`}>
          <Line points={[RULER_SIZE - 6, sy, RULER_SIZE, sy]} stroke="#94a3b8" strokeWidth={1} />
          <Text x={2} y={sy + 2} text={String(y)} fontSize={7} fill="#94a3b8" />
        </React.Fragment>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-100 dark:bg-slate-800 overflow-auto relative"
      onDragOver={e => e.preventDefault()}
      onDrop={handleStageDrop}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={Math.max(stageSize.height, scaledH + offsetY + 40)}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Paper shadow */}
          <Rect
            x={offsetX + 4}
            y={offsetY + 4}
            width={scaledW}
            height={scaledH}
            fill="rgba(0,0,0,0.08)"
            cornerRadius={2}
          />
          {/* Paper background */}
          <Rect
            name="paper-bg"
            x={offsetX}
            y={offsetY}
            width={scaledW}
            height={scaledH}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {/* Grid */}
          {gridLines}
          {/* Margins */}
          {showMargins && (
            <Rect
              x={offsetX + margins.left * scale}
              y={offsetY + margins.top * scale}
              width={scaledW - (margins.left + margins.right) * scale}
              height={scaledH - (margins.top + margins.bottom) * scale}
              stroke="#93c5fd"
              strokeWidth={0.5}
              dash={[4, 3]}
              listening={false}
            />
          )}
          {/* Elements */}
          {(() => {
            const uniqueElements: typeof page.elements = [];
            let hasKeyValueTable = false;
            for (const el of page?.elements || []) {
              if (el.type === 'table' && el.tableType === 'keyvalue') {
                if (hasKeyValueTable) continue;
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
              if (isDuplicate) continue;
              uniqueElements.push(el);
            }
            return uniqueElements.map(el => (
              <Group key={el.id} x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} clipX={0} clipY={0} clipWidth={paperW} clipHeight={paperH}>
                <CanvasElement
                  el={el}
                  isSelected={selectedIds.includes(el.id)}
                  previewMode={previewMode}
                  previewData={previewData}
                  onSelect={(e) => {
                    e.cancelBubble = true;
                    if (e.evt.shiftKey) {
                      if (selectedIds.includes(el.id)) {
                        onSelectElement(selectedIds.filter(id => id !== el.id));
                      } else {
                        onSelectElement([...selectedIds, el.id]);
                      }
                    } else {
                      onSelectElement([el.id]);
                    }
                  }}
                  onChange={(updates) => onUpdateElement(el.id, updates)}
                  scale={scale}
                />
              </Group>
            ));
          })()}
          {/* Rulers */}
          {showRulers && (
            <>
              <Rect x={0} y={0} width={stageSize.width} height={RULER_SIZE} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
              <Rect x={0} y={0} width={RULER_SIZE} height={Math.max(stageSize.height, scaledH + offsetY + 40)} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
              {rulerTicksH}
              {rulerTicksV}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default DocumentCanvas;
