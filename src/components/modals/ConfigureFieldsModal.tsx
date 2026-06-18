import { useState, useEffect } from 'react';
import { X, CheckCircle, Settings, ChevronRight } from 'lucide-react';
import {
  Variable,
  ConditionDefinition,
  FieldType,
  PopulationSource,
  InboundFormat,
  DisplayFormat,
} from '../../types/template';
import DynamicFieldChatPanel from '../DynamicFieldChatPanel';

interface ConfigureFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: Variable[];
  conditions: ConditionDefinition[];
  onVariablesChange: (variables: Variable[]) => void;
  onConditionsChange: (conditions: ConditionDefinition[]) => void;
}

const CURRENCY_INBOUND_OPTIONS = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
  { value: '$#,###.##', label: '$#,###.##', example: 'e.g. $5,999.99' },
  { value: '$#,###', label: '$#,###', example: 'e.g. $5,999' },
];
const CURRENCY_DISPLAY_OPTIONS = [
  { value: '$#,###.##', label: '$#,###.##', example: 'e.g. $5,999.99' },
  { value: '$#,###', label: '$#,###', example: 'e.g. $5,999' },
];
const DATE_INBOUND_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: 'e.g. 03/15/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: 'e.g. 2026-03-15' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', example: 'e.g. 03-15-2026' },
  { value: 'YYYYMMDD', label: 'YYYYMMDD', example: 'e.g. 20260315' },
];
const DATE_DISPLAY_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: 'e.g. 03/15/2026' },
  { value: 'MMMM D, YYYY', label: 'MMMM D, YYYY', example: 'e.g. March 15, 2026' },
  { value: 'MMM D, YYYY', label: 'MMM D, YYYY', example: 'e.g. Mar 15, 2026' },
  { value: 'M/D/YYYY', label: 'M/D/YYYY', example: 'e.g. 3/15/2026' },
];
const NUMBER_INBOUND_OPTIONS = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
  { value: '#,###', label: '#,###', example: 'e.g. 5,999' },
  { value: '#,###.##', label: '#,###.##', example: 'e.g. 5,999.99' },
];
const NUMBER_DISPLAY_OPTIONS = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '#,###', label: '#,###', example: 'e.g. 5,999' },
  { value: '#,###.##', label: '#,###.##', example: 'e.g. 5,999.99' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
];
const TEXT_DISPLAY_OPTIONS = [
  { value: 'none', label: 'As-is', example: 'e.g. hello world' },
  { value: 'uppercase', label: 'UPPERCASE', example: 'e.g. HELLO WORLD' },
  { value: 'lowercase', label: 'lowercase', example: 'e.g. hello world' },
  { value: 'capitalize', label: 'Capitalize', example: 'e.g. Hello World' },
];

function generateTridionSyntax(name: string, fieldType: FieldType, inbound: InboundFormat, display: DisplayFormat): string {
  if (fieldType === 'Currency') {
    return `<tcdl:format type="currency" field="${name}" inbound="${inbound}" pattern="${display}" decimals="${display.includes('.##') ? '2' : '0'}" />`;
  }
  if (fieldType === 'Date') return `<tcdl:format type="date" field="${name}" inbound="${inbound}" pattern="${display}" />`;
  if (fieldType === 'Number') return `<tcdl:format type="number" field="${name}" inbound="${inbound}" pattern="${display}" />`;
  if (fieldType === 'Text') {
    return display === 'none' ? `<tcdl:variable name="${name}" />` : `<tcdl:format type="text" field="${name}" transform="${display}" />`;
  }
  return `<tcdl:variable name="${name}" />`;
}

function runTest(fieldType: FieldType, inbound: InboundFormat, display: DisplayFormat): string {
  const samples: Record<string, string> = { '####': '5999', '####.##': '5999.99', '$#,###.##': '$5,999.99', '$#,###': '$5,999', 'MM/DD/YYYY': '03/15/2026', 'YYYY-MM-DD': '2026-03-15', 'MM-DD-YYYY': '03-15-2026', 'YYYYMMDD': '20260315', '#,###': '5,999', '#,###.##': '5,999.99' };
  const raw = samples[inbound] || '5999';
  if (fieldType === 'Currency') {
    const n = parseFloat(raw.replace(/[$,]/g, ''));
    return display === '$#,###' ? `$${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  if (fieldType === 'Date') {
    const d = new Date(raw.includes('-') ? raw : `${raw.slice(6)}-${raw.slice(0,2)}-${raw.slice(3,5)}`);
    if (isNaN(d.getTime())) return raw;
    if (display === 'MMMM D, YYYY') return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (display === 'MMM D, YYYY') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (display === 'M/D/YYYY') return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
  }
  if (fieldType === 'Number') {
    const n = parseFloat(raw.replace(/,/g, ''));
    if (display === '#,###') return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (display === '#,###.##') return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (display === '####.##') return n.toFixed(2);
    return String(Math.round(n));
  }
  if (fieldType === 'Text') {
    const s = 'hello world';
    if (display === 'uppercase') return s.toUpperCase();
    if (display === 'lowercase') return s.toLowerCase();
    if (display === 'capitalize') return s.replace(/\b\w/g, c => c.toUpperCase());
    return s;
  }
  return raw;
}

interface FieldConfig {
  populationSource: PopulationSource;
  fieldType: FieldType;
  inboundFormat: InboundFormat;
  displayFormat: DisplayFormat;
  testResult: string | null;
  businessRequirement: string;
  dynamicCondition: ConditionDefinition | null;
  saved: boolean;
}

function defaultConfig(v: Variable): FieldConfig {
  return {
    populationSource: v.populationSource || 'upstream',
    fieldType: v.fieldType || 'Text',
    inboundFormat: v.inboundFormat || '####',
    displayFormat: v.displayFormat || 'none',
    testResult: null,
    businessRequirement: '',
    dynamicCondition: null,
    saved: v.isConfigured || false,
  };
}

export default function ConfigureFieldsModal({
  isOpen,
  onClose,
  variables,
  conditions,
  onVariablesChange,
  onConditionsChange,
}: ConfigureFieldsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, FieldConfig>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, FieldConfig> = {};
      variables.forEach((v) => { initial[v.id] = defaultConfig(v); });
      setConfigs(initial);
      setSelectedIds(new Set());
      setActiveId(null);
    }
  }, [isOpen, variables]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (activeId === id) setActiveId(null);
      } else {
        next.add(id);
        setActiveId(id);
      }
      return next;
    });
  };

  const handleConfigure = () => {
    if (selectedIds.size > 0 && !activeId) {
      setActiveId([...selectedIds][0]);
    }
  };

  const updateConfig = (id: string, patch: Partial<FieldConfig>) => {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const getInboundOptions = (ft: FieldType) => {
    if (ft === 'Currency') return CURRENCY_INBOUND_OPTIONS;
    if (ft === 'Date') return DATE_INBOUND_OPTIONS;
    if (ft === 'Number') return NUMBER_INBOUND_OPTIONS;
    return [];
  };

  const getDisplayOptions = (ft: FieldType) => {
    if (ft === 'Currency') return CURRENCY_DISPLAY_OPTIONS;
    if (ft === 'Date') return DATE_DISPLAY_OPTIONS;
    if (ft === 'Number') return NUMBER_DISPLAY_OPTIONS;
    return TEXT_DISPLAY_OPTIONS;
  };

  const handleSaveField = (id: string) => {
    const v = variables.find((vv) => vv.id === id);
    const cfg = configs[id];
    if (!v || !cfg) return;

    const syntax = cfg.populationSource === 'upstream'
      ? generateTridionSyntax(v.name, cfg.fieldType, cfg.inboundFormat, cfg.displayFormat)
      : `<tcdl:variable name="${v.name}" dynamic="true" />`;

    const formatterMap: Record<FieldType, string> = {
      Currency: 'currency',
      Date: 'date',
      Number: 'none',
      Text: cfg.displayFormat === 'none' ? 'none' : (cfg.displayFormat as string),
    };

    const updatedVar: Variable = {
      ...v,
      populationSource: cfg.populationSource,
      fieldType: cfg.fieldType,
      inboundFormat: cfg.fieldType !== 'Text' ? cfg.inboundFormat : undefined,
      displayFormat: cfg.displayFormat,
      tridionSyntax: syntax,
      formatter: formatterMap[cfg.fieldType] as any,
      isConfigured: true,
    };

    onVariablesChange(variables.map((vv) => (vv.id === id ? updatedVar : vv)));

    if (cfg.dynamicCondition) {
      const exists = conditions.find((c) => c.id === cfg.dynamicCondition!.id);
      if (!exists) {
        onConditionsChange([...conditions, cfg.dynamicCondition]);
      }
    }

    updateConfig(id, { saved: true });

    const remaining = [...selectedIds].filter((sid) => sid !== id && !configs[sid]?.saved);
    if (remaining.length > 0) setActiveId(remaining[0]);
    else setActiveId(null);
  };

  const handleConditionGenerated = (id: string, cond: ConditionDefinition, br: string) => {
    updateConfig(id, { dynamicCondition: cond, businessRequirement: br });
  };

  if (!isOpen) return null;

  const activeVariable = activeId ? variables.find((v) => v.id === activeId) : null;
  const activeCfg = activeId ? configs[activeId] : null;

  const configuredCount = variables.filter((v) => v.isConfigured || configs[v.id]?.saved).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Configure Data Placeholders</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {configuredCount} of {variables.length} fields configured
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Select variables to configure</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {variables.map((v) => {
                const isSelected = selectedIds.has(v.id);
                const isActive = activeId === v.id;
                const isSaved = v.isConfigured || configs[v.id]?.saved;

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      if (!selectedIds.has(v.id)) toggleSelect(v.id);
                      setActiveId(v.id);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : isSelected
                        ? 'bg-white border-gray-300'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleSelect(v.id); }}
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ width: 18, height: 18 }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-mono text-gray-800 flex-1 truncate">{v.name}</span>
                    {isSaved && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                    {isActive && !isSaved && <ChevronRight size={14} className="text-blue-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleConfigure}
                disabled={selectedIds.size === 0}
                className="w-full py-2 px-4 bg-wf-red text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Configure ({selectedIds.size})
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeVariable && activeCfg ? (
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Set Up Field: <span className="text-wf-red font-mono">{activeVariable.name}</span>
                    </h3>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">How will this field be populated?</p>
                    <div className="space-y-2.5">
                      {(['dynamic', 'upstream'] as PopulationSource[]).map((src) => (
                        <label key={src} className="flex items-center gap-3 cursor-pointer group">
                          <div
                            onClick={() => updateConfig(activeVariable.id, { populationSource: src })}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              activeCfg.populationSource === src ? 'border-wf-red bg-wf-red' : 'border-gray-300 group-hover:border-gray-400'
                            }`}
                          >
                            {activeCfg.populationSource === src && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm text-gray-700">
                            {src === 'dynamic' ? 'Alerts will dynamically create the value' : 'Upstream will send it in the message request'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {activeCfg.populationSource === 'dynamic' && (
                    <div className="space-y-4">
                      <div className="h-px bg-gray-200" />
                      <div style={{ height: '420px' }}>
                        <DynamicFieldChatPanel
                          key={activeVariable.id}
                          variable={activeVariable}
                          existingVariables={variables}
                          businessRequirement={activeCfg.businessRequirement}
                          onConditionGenerated={(cond, br) =>
                            handleConditionGenerated(activeVariable.id, cond, br)
                          }
                        />
                      </div>

                      {activeCfg.businessRequirement && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Business Requirement</p>
                          <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{activeCfg.businessRequirement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeCfg.populationSource === 'upstream' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">What type of field is this?</label>
                        <select
                          value={activeCfg.fieldType}
                          onChange={(e) => {
                            const ft = e.target.value as FieldType;
                            const inbOpts = getInboundOptions(ft);
                            const dispOpts = getDisplayOptions(ft);
                            updateConfig(activeVariable.id, {
                              fieldType: ft,
                              inboundFormat: inbOpts[0]?.value as InboundFormat || '####',
                              displayFormat: dispOpts[0]?.value as DisplayFormat || 'none',
                              testResult: null,
                            });
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                        >
                          <option value="Text">Text</option>
                          <option value="Currency">Currency</option>
                          <option value="Number">Number</option>
                          <option value="Date">Date</option>
                        </select>
                      </div>

                      {activeCfg.fieldType !== 'Text' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">What format will we receive the data in?</label>
                          <select
                            value={activeCfg.inboundFormat}
                            onChange={(e) => updateConfig(activeVariable.id, { inboundFormat: e.target.value as InboundFormat, testResult: null })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                          >
                            {getInboundOptions(activeCfg.fieldType).map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label} ({opt.example})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">How should we display the data to the customer?</label>
                        <select
                          value={activeCfg.displayFormat}
                          onChange={(e) => updateConfig(activeVariable.id, { displayFormat: e.target.value as DisplayFormat, testResult: null })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                        >
                          {getDisplayOptions(activeCfg.fieldType).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label} ({opt.example})</option>
                          ))}
                        </select>
                      </div>

                      {activeCfg.testResult !== null && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                          <p className="text-xs text-gray-500 mb-1">Test Result</p>
                          <p className="text-sm font-mono font-semibold text-gray-900">{activeCfg.testResult}</p>
                          <p className="text-xs text-gray-400 mt-1">Sample inbound value converted using selected formats</p>
                        </div>
                      )}

                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Generated Tridion Syntax</p>
                        <code className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                          {generateTridionSyntax(activeVariable.name, activeCfg.fieldType, activeCfg.inboundFormat, activeCfg.displayFormat)}
                        </code>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Settings size={40} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Select a variable to configure</p>
                  <p className="text-xs text-gray-400 mt-1">Check a variable from the list and click Configure</p>
                </div>
              </div>
            )}

            {activeVariable && activeCfg && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  {activeCfg.saved && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle size={14} />
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activeCfg.populationSource === 'upstream' && activeCfg.fieldType !== 'Text' && (
                    <button
                      onClick={() => {
                        const result = runTest(activeCfg.fieldType, activeCfg.inboundFormat, activeCfg.displayFormat);
                        updateConfig(activeVariable.id, { testResult: result });
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Run Test
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveField(activeVariable.id)}
                    disabled={activeCfg.saved}
                    className="flex items-center gap-2 px-5 py-2 bg-wf-red text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-emerald-600 transition-colors shadow-sm"
                  >
                    {activeCfg.saved ? (
                      <>
                        <CheckCircle size={14} />
                        Saved!
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
