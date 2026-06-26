import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Superscript, Subscript, Code, Link, 
  Eraser, Check, Save, Sparkles, FileCode
} from 'lucide-react';

interface SymbolDef {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const ALL_SYMBOLS: SymbolDef[] = [
  { id: 'bold', label: 'B', title: 'Bold', description: 'Make selection bold (<strong>)', icon: Bold },
  { id: 'italic', label: 'I', title: 'Italic', description: 'Make selection italic (<em>)', icon: Italic },
  { id: 'underline', label: 'U', title: 'Underline', description: 'Underline selected text (<u>)', icon: Underline },
  { id: 'strikethrough', label: 'S', title: 'Strikethrough', description: 'Strikethrough selected text (<s>)', icon: Strikethrough },
  { id: 'superscript', label: 'x²', title: 'Superscript', description: 'Format text as superscript (<sup>)', icon: Superscript },
  { id: 'subscript', label: 'x₂', title: 'Subscript', description: 'Format text as subscript (<sub>)', icon: Subscript },
  { id: 'code', label: '{}', title: 'Code', description: 'Format selection as inline code (<code>)', icon: Code },
  { id: 'link', label: 'Link', title: 'Link', description: 'Insert web link (<a>)', icon: Link },
  { id: 'clear', label: 'Clear', title: 'Clear Formatting', description: 'Remove all inline formatting styles', icon: Eraser },
  { id: 'source', label: '</>', title: 'Source HTML', description: 'Toggle raw HTML source code view', icon: FileCode },
];

const DEFAULT_SYMBOLS = ['bold', 'italic', 'code', 'link', 'clear', 'source'];

export default function SmartEditorSettings({ isEmbedded }: { isEmbedded?: boolean }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SYMBOLS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('alertsiq:ckeditor:symbols');
    if (saved) {
      try {
        setSelectedIds(JSON.parse(saved));
      } catch (e) {
        setSelectedIds(DEFAULT_SYMBOLS);
      }
    }
  }, []);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const handleSave = () => {
    localStorage.setItem('alertsiq:ckeditor:symbols', JSON.stringify(selectedIds));
    // Dispatch a custom event to notify open tabs/editor panels
    window.dispatchEvent(new Event('alertsiq:ckeditor:settings_changed'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSelectAll = () => {
    setSelectedIds(ALL_SYMBOLS.map(s => s.id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
            Smart Editor Formatting Options (CKEditor Toolbar)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose which rich-text formatting buttons appear in the message template inline builder toolbar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold
              hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold
              hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Dynamic Toolbar Live Preview */}
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <span className="text-xxs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 block mb-2.5">
          Live Toolbar Preview
        </span>
        <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm w-max min-w-[200px]">
          {selectedIds.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-600 italic px-2">No formatting tools enabled</span>
          ) : (
            ALL_SYMBOLS.filter(s => selectedIds.includes(s.id)).map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    title={s.title}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {idx < selectedIds.length - 1 && (idx === 3 || idx === 6) && (
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grid checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_SYMBOLS.map(symbol => {
          const Icon = symbol.icon;
          const isChecked = selectedIds.includes(symbol.id);
          return (
            <div
              key={symbol.id}
              onClick={() => handleToggle(symbol.id)}
              className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3.5
                ${isChecked
                  ? 'border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02] shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/20'
                }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                  ${isChecked 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>

              {/* Icon & Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all
                    ${isChecked
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{symbol.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Tag: {symbol.label}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {symbol.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full mt-4" />

      {/* Save action button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10"
        >
          {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save Editor Settings'}</span>
        </button>
      </div>
    </div>
  );
}
