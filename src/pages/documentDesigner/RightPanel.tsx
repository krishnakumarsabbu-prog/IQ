import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DocumentElement, MongoField, TextStyle, BorderStyle } from './types';

interface RightPanelProps {
  selectedElement: DocumentElement | null;
  mongoFields: MongoField[];
  template: { paper: string; orientation: string; margins: { top: number; right: number; bottom: number; left: number } };
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
  onUpdateTemplate: (updates: Partial<{ paper: string; orientation: string; margins: { top: number; right: number; bottom: number; left: number } }>) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        {title}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2">
    <label className="text-[11px] text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const NumInput: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> = ({
  value, onChange, min, max, step = 1
}) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={e => onChange(Number(e.target.value))}
    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400"
  />
);

const TextInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400"
  />
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    <input type="color" value={value?.startsWith('#') ? value : '#000000'} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent" />
    <TextInput value={value || ''} onChange={onChange} placeholder="#000000" />
  </div>
);

const SelectInput: React.FC<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const ToggleBtn: React.FC<{ active: boolean; onClick: () => void; title: string; children: React.ReactNode }> = ({ active, onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`px-2 py-1 text-xs rounded border transition-all ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
    }`}
  >
    {children}
  </button>
);

const RightPanel: React.FC<RightPanelProps> = ({ selectedElement, mongoFields, template, onUpdateElement, onUpdateTemplate }) => {
  if (!selectedElement) {
    return (
      <div className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto">
        {/* Document settings when nothing selected */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Settings</h3>
        </div>
        <div className="p-3 space-y-3">
          <Field label="Paper">
            <SelectInput
              value={template.paper}
              onChange={v => onUpdateTemplate({ paper: v })}
              options={[
                { value: 'A4', label: 'A4' },
                { value: 'A3', label: 'A3' },
                { value: 'Letter', label: 'Letter' },
                { value: 'Legal', label: 'Legal' },
              ]}
            />
          </Field>
          <Field label="Orient.">
            <SelectInput
              value={template.orientation}
              onChange={v => onUpdateTemplate({ orientation: v })}
              options={[
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
            />
          </Field>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-3 mb-1">Margins (px)</div>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map(side => (
              <div key={side}>
                <div className="text-[10px] text-slate-400 capitalize mb-0.5">{side}</div>
                <NumInput
                  value={template.margins[side]}
                  onChange={v => onUpdateTemplate({ margins: { ...template.margins, [side]: v } })}
                  min={0}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Select an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const el = selectedElement;

  const updateEl = (updates: Partial<DocumentElement>) => {
    onUpdateElement(el.id, updates);
  };

  const updateText = (updates: Partial<TextStyle>) => {
    updateEl({ textStyle: { ...(el.textStyle || {}), ...updates } as TextStyle });
  };

  const updateBorder = (updates: Partial<BorderStyle>) => {
    updateEl({ border: { ...(el.border || {}), ...updates } as BorderStyle });
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{el.type} Properties</h3>
        <p className="text-[10px] text-slate-400 font-mono">{el.id}</p>
      </div>

      {/* General */}
      <Section title="General">
        <Field label="Width">
          <NumInput value={el.width} onChange={v => updateEl({ width: v })} min={1} />
        </Field>
        <Field label="Height">
          <NumInput value={el.height} onChange={v => updateEl({ height: v })} min={1} />
        </Field>
        <Field label="X">
          <NumInput value={el.x} onChange={v => updateEl({ x: v })} />
        </Field>
        <Field label="Y">
          <NumInput value={el.y} onChange={v => updateEl({ y: v })} />
        </Field>
        <Field label="Rotation">
          <NumInput value={el.rotation || 0} onChange={v => updateEl({ rotation: v })} min={-360} max={360} />
        </Field>
        <Field label="Opacity">
          <NumInput value={el.opacity || 1} onChange={v => updateEl({ opacity: Math.min(1, Math.max(0, v)) })} min={0} max={1} step={0.1} />
        </Field>
        <Field label="Padding">
          <NumInput value={el.padding || 0} onChange={v => updateEl({ padding: v })} min={0} />
        </Field>
        <div className="flex gap-2 pt-1">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={el.visible} onChange={e => updateEl({ visible: e.target.checked })} className="accent-blue-600" />
            Visible
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={el.locked} onChange={e => updateEl({ locked: e.target.checked })} className="accent-blue-600" />
            Locked
          </label>
        </div>
      </Section>

      {/* Content */}
      {!['table', 'hline', 'vline', 'rectangle', 'circle', 'section', 'pagebreak', 'qrcode', 'barcode', 'logo', 'image', 'signature'].includes(el.type) && (
        <Section title="Content">
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400">Content</label>
            <textarea
              value={el.content || ''}
              onChange={e => updateEl({ content: e.target.value })}
              rows={3}
              className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </Section>
      )}

      {/* Dynamic Binding */}
      {['dynamicfield', 'date', 'currency', 'amount', 'number', 'email', 'phone', 'textbox'].includes(el.type) && (
        <Section title="Dynamic Binding">
          <Field label="Field">
            <SelectInput
              value={el.binding?.field || ''}
              onChange={v => updateEl({ binding: { ...(el.binding || { format: 'none' }), field: v } })}
              options={[
                { value: '', label: '-- Select field --' },
                ...mongoFields.map(f => ({ value: f.id, label: f.label })),
              ]}
            />
          </Field>
          {el.binding?.field && (
            <div className="text-[10px] text-blue-500 font-mono bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
              {`{{${el.binding.field}}}`}
            </div>
          )}
          <Field label="Format">
            <SelectInput
              value={el.binding?.format || 'none'}
              onChange={v => updateEl({ binding: { ...(el.binding || { field: '' }), format: v as any } })}
              options={[
                { value: 'none', label: 'None' },
                { value: 'uppercase', label: 'UPPERCASE' },
                { value: 'lowercase', label: 'lowercase' },
                { value: 'titlecase', label: 'Title Case' },
                { value: 'dateformat', label: 'Date Format' },
                { value: 'currency', label: 'Currency' },
                { value: 'phone', label: 'Phone' },
                { value: 'mask', label: 'Mask' },
              ]}
            />
          </Field>
          <Field label="Default">
            <TextInput
              value={el.binding?.defaultValue || ''}
              onChange={v => updateEl({ binding: { ...(el.binding || { field: '', format: 'none' }), defaultValue: v } })}
              placeholder="Default value"
            />
          </Field>
          <Field label="Null Val.">
            <TextInput
              value={el.binding?.nullValue || ''}
              onChange={v => updateEl({ binding: { ...(el.binding || { field: '', format: 'none' }), nullValue: v } })}
              placeholder="Null display"
            />
          </Field>
        </Section>
      )}

      {/* Table */}
      {el.type === 'table' && (
        <Section title={el.tableType === 'keyvalue' ? "Fields Table Settings" : "Table Settings"}>
          {el.tableType !== 'keyvalue' && (
            <Field label="Binding">
              <TextInput
                value={el.arrayBinding || ''}
                onChange={v => updateEl({ arrayBinding: v })}
                placeholder="loanAccounts[]"
              />
            </Field>
          )}
          
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 mb-1">
            {el.tableType === 'keyvalue' ? "Table Rows (Key-Value)" : "Columns"}
          </div>
          
          {(el.columns || []).map((col, i) => (
            <div key={col.id} className="bg-slate-50 dark:bg-slate-800 rounded p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {el.tableType === 'keyvalue' ? `Row ${i + 1}` : `Column ${i + 1}`}
                </span>
                <button
                  onClick={() => updateEl({ columns: el.columns?.filter((_, idx) => idx !== i) })}
                  className="text-[10px] text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <TextInput
                value={col.header}
                onChange={v => {
                  const cols = [...(el.columns || [])];
                  cols[i] = { ...cols[i], header: v };
                  updateEl({ columns: cols });
                }}
                placeholder={el.tableType === 'keyvalue' ? "Field Name" : "Header"}
              />
              {el.tableType === 'keyvalue' ? (
                <select
                  value={col.binding}
                  onChange={e => {
                    const cols = [...(el.columns || [])];
                    cols[i] = { ...cols[i], binding: e.target.value };
                    updateEl({ columns: cols });
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400"
                >
                  <option value="">-- Select Field --</option>
                  {mongoFields.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              ) : (
                <TextInput
                  value={col.binding}
                  onChange={v => {
                    const cols = [...(el.columns || [])];
                    cols[i] = { ...cols[i], binding: v };
                    updateEl({ columns: cols });
                  }}
                  placeholder="Field binding"
                />
              )}
            </div>
          ))}
          
          <button
            onClick={() => updateEl({
              columns: [
                ...(el.columns || []),
                {
                  id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                  header: el.tableType === 'keyvalue' ? 'New Field' : 'New Column',
                  binding: '',
                  width: el.tableType === 'keyvalue' ? 250 : 120
                }
              ]
            })}
            className="w-full text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {el.tableType === 'keyvalue' ? "+ Add Row" : "+ Add Column"}
          </button>

          {el.tableType === 'keyvalue' && (
            <button
              onClick={() => {
                const confirmReset = window.confirm("Are you sure you want to reset the table to all available fields?");
                if (!confirmReset) return;
                updateEl({
                  columns: mongoFields.map(f => ({
                    id: `col_${f.id}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                    header: f.label,
                    binding: f.id,
                    width: 250
                  })),
                  height: Math.max(150, 30 + mongoFields.length * 24)
                });
              }}
              className="w-full mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 border border-dashed border-slate-200 dark:border-slate-800 rounded py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset to All Fields
            </button>
          )}
        </Section>
      )}

      {/* Image / Logo */}
      {['image', 'logo'].includes(el.type) && (
        <Section title="Image">
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400">Image URL or Base64</label>
            <textarea
              value={el.imageUrl || ''}
              onChange={e => updateEl({ imageUrl: e.target.value })}
              rows={3}
              className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-400 resize-none"
              placeholder="https://... or {{imageField}}"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={el.maintainAspectRatio} onChange={e => updateEl({ maintainAspectRatio: e.target.checked })} className="accent-blue-600" />
            Maintain Aspect Ratio
          </label>
        </Section>
      )}

      {/* Barcode */}
      {el.type === 'barcode' && (
        <Section title="Barcode">
          <Field label="Type">
            <SelectInput
              value={el.barcodeType || 'Code128'}
              onChange={v => updateEl({ barcodeType: v as any })}
              options={[
                { value: 'Code128', label: 'Code 128' },
                { value: 'Code39', label: 'Code 39' },
                { value: 'QR', label: 'QR' },
                { value: 'PDF417', label: 'PDF417' },
              ]}
            />
          </Field>
          <Field label="Value">
            <TextInput value={el.content || ''} onChange={v => updateEl({ content: v })} placeholder="{{barcodeField}}" />
          </Field>
        </Section>
      )}

      {/* Typography */}
      {!['hline', 'vline', 'rectangle', 'circle', 'table', 'qrcode', 'barcode', 'logo', 'image', 'signature', 'pagebreak'].includes(el.type) && (
        <Section title="Typography">
          <Field label="Font">
            <SelectInput
              value={el.textStyle?.fontFamily || 'Arial'}
              onChange={v => updateText({ fontFamily: v })}
              options={[
                { value: 'Arial', label: 'Arial' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Courier New', label: 'Courier New' },
                { value: 'Helvetica', label: 'Helvetica' },
                { value: 'Georgia', label: 'Georgia' },
                { value: 'Verdana', label: 'Verdana' },
              ]}
            />
          </Field>
          <Field label="Size">
            <NumInput value={el.textStyle?.fontSize || 12} onChange={v => updateText({ fontSize: v })} min={6} max={200} />
          </Field>
          <Field label="Color">
            <ColorInput value={el.textStyle?.color || '#1e293b'} onChange={v => updateText({ color: v })} />
          </Field>
          <div className="flex gap-1 flex-wrap pt-1">
            <ToggleBtn active={!!el.textStyle?.bold} onClick={() => updateText({ bold: !el.textStyle?.bold })} title="Bold">B</ToggleBtn>
            <ToggleBtn active={!!el.textStyle?.italic} onClick={() => updateText({ italic: !el.textStyle?.italic })} title="Italic"><i>I</i></ToggleBtn>
            <ToggleBtn active={!!el.textStyle?.underline} onClick={() => updateText({ underline: !el.textStyle?.underline })} title="Underline"><u>U</u></ToggleBtn>
            <ToggleBtn active={!!el.textStyle?.strikethrough} onClick={() => updateText({ strikethrough: !el.textStyle?.strikethrough })} title="Strikethrough"><s>S</s></ToggleBtn>
          </div>
          <Field label="Align">
            <div className="flex gap-1">
              {(['left', 'center', 'right', 'justify'] as const).map(a => (
                <ToggleBtn key={a} active={el.textStyle?.align === a} onClick={() => updateText({ align: a })} title={`Align ${a}`}>
                  {a[0].toUpperCase()}
                </ToggleBtn>
              ))}
            </div>
          </Field>
          <Field label="Line H.">
            <NumInput value={el.textStyle?.lineHeight || 1.4} onChange={v => updateText({ lineHeight: v })} min={0.5} max={5} step={0.1} />
          </Field>
          <Field label="Spacing">
            <NumInput value={el.textStyle?.letterSpacing || 0} onChange={v => updateText({ letterSpacing: v })} min={-5} max={20} />
          </Field>
        </Section>
      )}

      {/* Background */}
      {!['hline', 'vline', 'pagebreak'].includes(el.type) && (
        <Section title="Background">
          <Field label="Fill">
            <div className="flex items-center gap-1.5">
              <ColorInput value={el.backgroundColor === 'transparent' ? '#ffffff' : (el.backgroundColor || '#ffffff')} onChange={v => updateEl({ backgroundColor: v })} />
              <button
                onClick={() => updateEl({ backgroundColor: 'transparent' })}
                className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded whitespace-nowrap"
              >
                None
              </button>
            </div>
          </Field>
        </Section>
      )}

      {/* Border */}
      <Section title="Border">
        <Field label="Width">
          <NumInput value={el.border?.width || 0} onChange={v => updateBorder({ width: v })} min={0} max={20} />
        </Field>
        <Field label="Color">
          <ColorInput value={el.border?.color || '#e2e8f0'} onChange={v => updateBorder({ color: v })} />
        </Field>
        <Field label="Style">
          <SelectInput
            value={el.border?.style || 'solid'}
            onChange={v => updateBorder({ style: v as any })}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'none', label: 'None' },
            ]}
          />
        </Field>
        <Field label="Radius">
          <NumInput value={el.border?.radius || 0} onChange={v => updateBorder({ radius: v })} min={0} max={100} />
        </Field>
      </Section>
    </div>
  );
};

export default RightPanel;
