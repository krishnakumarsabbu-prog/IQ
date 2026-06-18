import { useState, useEffect } from 'react';
import { X, Play, Save, CheckCircle } from 'lucide-react';
import {
  Variable,
  FieldType,
  PopulationSource,
  InboundFormat,
  DisplayFormat,
  ConditionDefinition,
} from '../../types/template';
import DynamicFieldChatPanel from '../DynamicFieldChatPanel';

interface FieldSetupModalProps {
  variable: Variable | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Variable, condition?: ConditionDefinition) => void;
  allVariables?: Variable[];
}

const CURRENCY_INBOUND_OPTIONS: { value: InboundFormat; label: string; example: string }[] = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
  { value: '$#,###.##', label: '$#,###.##', example: 'e.g. $5,999.99' },
  { value: '$#,###', label: '$#,###', example: 'e.g. $5,999' },
];

const CURRENCY_DISPLAY_OPTIONS: { value: DisplayFormat; label: string; example: string }[] = [
  { value: '$#,###.##', label: '$#,###.##', example: 'e.g. $5,999.99' },
  { value: '$#,###', label: '$#,###', example: 'e.g. $5,999' },
];

const DATE_INBOUND_OPTIONS: { value: InboundFormat; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: 'e.g. 03/15/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: 'e.g. 2026-03-15' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', example: 'e.g. 03-15-2026' },
  { value: 'YYYYMMDD', label: 'YYYYMMDD', example: 'e.g. 20260315' },
];

const DATE_DISPLAY_OPTIONS: { value: DisplayFormat; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: 'e.g. 03/15/2026' },
  { value: 'MMMM D, YYYY', label: 'MMMM D, YYYY', example: 'e.g. March 15, 2026' },
  { value: 'MMM D, YYYY', label: 'MMM D, YYYY', example: 'e.g. Mar 15, 2026' },
  { value: 'M/D/YYYY', label: 'M/D/YYYY', example: 'e.g. 3/15/2026' },
];

const NUMBER_INBOUND_OPTIONS: { value: InboundFormat; label: string; example: string }[] = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
  { value: '#,###', label: '#,###', example: 'e.g. 5,999' },
  { value: '#,###.##', label: '#,###.##', example: 'e.g. 5,999.99' },
];

const NUMBER_DISPLAY_OPTIONS: { value: DisplayFormat; label: string; example: string }[] = [
  { value: '####', label: '####', example: 'e.g. 5999' },
  { value: '#,###', label: '#,###', example: 'e.g. 5,999' },
  { value: '#,###.##', label: '#,###.##', example: 'e.g. 5,999.99' },
  { value: '####.##', label: '####.##', example: 'e.g. 5999.99' },
];

const TEXT_DISPLAY_OPTIONS: { value: DisplayFormat; label: string; example: string }[] = [
  { value: 'none', label: 'As-is', example: 'e.g. hello world' },
  { value: 'uppercase', label: 'UPPERCASE', example: 'e.g. HELLO WORLD' },
  { value: 'lowercase', label: 'lowercase', example: 'e.g. hello world' },
  { value: 'capitalize', label: 'Capitalize', example: 'e.g. Hello World' },
];

function generateTridionSyntax(
  fieldName: string,
  fieldType: FieldType,
  inboundFormat: InboundFormat,
  displayFormat: DisplayFormat
): string {
  if (fieldType === 'Currency') {
    let decimals = displayFormat.includes('.##') ? '2' : '0';
    return `<tcdl:format type="currency" field="${fieldName}" inbound="${inboundFormat}" pattern="${displayFormat}" decimals="${decimals}" />`;
  }
  if (fieldType === 'Date') {
    return `<tcdl:format type="date" field="${fieldName}" inbound="${inboundFormat}" pattern="${displayFormat}" />`;
  }
  if (fieldType === 'Number') {
    return `<tcdl:format type="number" field="${fieldName}" inbound="${inboundFormat}" pattern="${displayFormat}" />`;
  }
  if (fieldType === 'Text') {
    if (displayFormat === 'none') {
      return `<tcdl:variable name="${fieldName}" />`;
    }
    return `<tcdl:format type="text" field="${fieldName}" transform="${displayFormat}" />`;
  }
  return `<tcdl:variable name="${fieldName}" />`;
}

function runTestValue(
  fieldType: FieldType,
  inboundFormat: InboundFormat,
  displayFormat: DisplayFormat
): string {
  const sampleValues: Record<string, string> = {
    '####': '5999',
    '####.##': '5999.99',
    '$#,###.##': '$5,999.99',
    '$#,###': '$5,999',
    'MM/DD/YYYY': '03/15/2026',
    'YYYY-MM-DD': '2026-03-15',
    'MM-DD-YYYY': '03-15-2026',
    'YYYYMMDD': '20260315',
    '#,###': '5,999',
    '#,###.##': '5,999.99',
  };

  const raw = sampleValues[inboundFormat] || '5999';

  if (fieldType === 'Currency') {
    const numStr = raw.replace(/[$,]/g, '');
    const num = parseFloat(numStr);
    if (displayFormat === '$#,###.##') {
      return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    return `$${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  if (fieldType === 'Date') {
    const cleanDate = raw.replace(/[-/]/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
    const d = new Date(raw.includes('-') ? raw : `${raw.slice(6,10)}-${raw.slice(0,2)}-${raw.slice(3,5)}`);
    if (isNaN(d.getTime())) return raw;
    if (displayFormat === 'MMMM D, YYYY') return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (displayFormat === 'MMM D, YYYY') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (displayFormat === 'M/D/YYYY') return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
  }

  if (fieldType === 'Number') {
    const num = parseFloat(raw.replace(/,/g, ''));
    if (displayFormat === '#,###') return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (displayFormat === '#,###.##') return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (displayFormat === '####.##') return num.toFixed(2);
    return String(Math.round(num));
  }

  if (fieldType === 'Text') {
    const sample = 'hello world';
    if (displayFormat === 'uppercase') return sample.toUpperCase();
    if (displayFormat === 'lowercase') return sample.toLowerCase();
    if (displayFormat === 'capitalize') return sample.replace(/\b\w/g, c => c.toUpperCase());
    return sample;
  }

  return raw;
}

export default function FieldSetupModal({ variable, isOpen, onClose, onSave, allVariables = [] }: FieldSetupModalProps) {
  const [populationSource, setPopulationSource] = useState<PopulationSource>('upstream');
  const [fieldType, setFieldType] = useState<FieldType>('Text');
  const [inboundFormat, setInboundFormat] = useState<InboundFormat>('####');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('none');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [dynamicCondition, setDynamicCondition] = useState<ConditionDefinition | null>(null);
  const [businessRequirement, setBusinessRequirement] = useState('');

  useEffect(() => {
    if (variable) {
      setPopulationSource(variable.populationSource || 'upstream');
      setFieldType(variable.fieldType || 'Text');
      setInboundFormat(variable.inboundFormat || '####');
      setDisplayFormat(variable.displayFormat || 'none');
      setTestResult(null);
      setIsSaved(false);
      setDynamicCondition(null);
      setBusinessRequirement('');
    }
  }, [variable]);

  useEffect(() => {
    const inboundOptions = getInboundOptions();
    if (inboundOptions.length > 0 && !inboundOptions.find(o => o.value === inboundFormat)) {
      setInboundFormat(inboundOptions[0].value);
    }
  }, [fieldType]);

  useEffect(() => {
    const displayOptions = getDisplayOptions();
    if (displayOptions.length > 0 && !displayOptions.find(o => o.value === displayFormat)) {
      setDisplayFormat(displayOptions[0].value);
    }
  }, [fieldType, inboundFormat]);

  const getInboundOptions = () => {
    switch (fieldType) {
      case 'Currency': return CURRENCY_INBOUND_OPTIONS;
      case 'Date': return DATE_INBOUND_OPTIONS;
      case 'Number': return NUMBER_INBOUND_OPTIONS;
      default: return [];
    }
  };

  const getDisplayOptions = () => {
    switch (fieldType) {
      case 'Currency': return CURRENCY_DISPLAY_OPTIONS;
      case 'Date': return DATE_DISPLAY_OPTIONS;
      case 'Number': return NUMBER_DISPLAY_OPTIONS;
      default: return TEXT_DISPLAY_OPTIONS;
    }
  };

  const handleRunTest = () => {
    const result = runTestValue(fieldType, inboundFormat, displayFormat);
    setTestResult(result);
  };

  const handleSave = () => {
    if (!variable) return;
    const syntax = populationSource === 'upstream'
      ? generateTridionSyntax(variable.name, fieldType, inboundFormat, displayFormat)
      : `<tcdl:variable name="${variable.name}" dynamic="true" />`;

    const formatterMap: Record<FieldType, string> = {
      Currency: 'currency',
      Date: 'date',
      Number: 'none',
      Text: displayFormat === 'none' ? 'none' : displayFormat as string,
    };

    onSave({
      ...variable,
      populationSource,
      fieldType,
      inboundFormat: fieldType !== 'Text' ? inboundFormat : undefined,
      displayFormat,
      tridionSyntax: syntax,
      formatter: formatterMap[fieldType] as any,
      isConfigured: true,
    }, dynamicCondition || undefined);
    setIsSaved(true);
    setTimeout(() => onClose(), 800);
  };

  if (!isOpen || !variable) return null;

  const inboundOptions = getInboundOptions();
  const displayOptions = getDisplayOptions();
  const showFormatOptions = populationSource === 'upstream';
  const showDynamicChat = populationSource === 'dynamic';
  const modalMaxW = showDynamicChat ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${modalMaxW} mx-4 overflow-hidden flex flex-col`} style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Set Up Field: <span className="text-wf-red font-mono">{variable.name}</span></h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">How will this field be populated?</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  populationSource === 'dynamic'
                    ? 'border-wf-red bg-wf-red'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {populationSource === 'dynamic' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <input
                  type="radio"
                  name="populationSource"
                  value="dynamic"
                  checked={populationSource === 'dynamic'}
                  onChange={() => setPopulationSource('dynamic')}
                  className="sr-only"
                />
                <span className="text-sm text-gray-700">Alerts will dynamically create the value</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  populationSource === 'upstream'
                    ? 'border-wf-red bg-wf-red'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {populationSource === 'upstream' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <input
                  type="radio"
                  name="populationSource"
                  value="upstream"
                  checked={populationSource === 'upstream'}
                  onChange={() => setPopulationSource('upstream')}
                  className="sr-only"
                />
                <span className="text-sm text-gray-700">Upstream will send it in the message request</span>
              </label>
            </div>
          </div>

          {showDynamicChat && (
            <div style={{ height: '420px' }}>
              <DynamicFieldChatPanel
                key={variable.id}
                variable={variable}
                existingVariables={allVariables}
                businessRequirement={businessRequirement}
                onConditionGenerated={(cond, br) => {
                  setDynamicCondition(cond);
                  setBusinessRequirement(br);
                }}
              />
            </div>
          )}

          {showFormatOptions && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What type of field is this?
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FieldType)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                >
                  <option value="Text">Text</option>
                  <option value="Currency">Currency</option>
                  <option value="Number">Number</option>
                  <option value="Date">Date</option>
                </select>
              </div>

              {fieldType !== 'Text' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What format will we receive the data in?
                  </label>
                  <select
                    value={inboundFormat}
                    onChange={(e) => setInboundFormat(e.target.value as InboundFormat)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                  >
                    {inboundOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.example})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How should we use to display the data to the customer?
                </label>
                <select
                  value={displayFormat}
                  onChange={(e) => setDisplayFormat(e.target.value as DisplayFormat)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-wf-red focus:border-transparent bg-white"
                >
                  {displayOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.example})
                    </option>
                  ))}
                </select>
              </div>

              {testResult !== null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Test Result</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{testResult}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sample inbound value converted using selected formats
                  </p>
                </div>
              )}

              {variable && populationSource === 'upstream' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Generated Tridion Syntax</p>
                  <code className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                    {generateTridionSyntax(variable.name, fieldType, inboundFormat, displayFormat)}
                  </code>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {showFormatOptions && fieldType !== 'Text' && (
            <button
              onClick={handleRunTest}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Play size={14} />
              Run Test
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex items-center gap-2 px-5 py-2 bg-wf-red text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-green-600 transition-colors shadow-sm"
          >
            {isSaved ? (
              <>
                <CheckCircle size={14} />
                Saved!
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
