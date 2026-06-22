import { useState } from 'react';
import { ListChecks, Trash2, Edit, Save, CheckCircle2, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  regex: string;
  errorMessage: string;
}

export default function ValidationRules({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [rules, setRules] = useState<ValidationRule[]>([
    {
      id: 'val_email',
      name: 'Corporate Email Address',
      description: 'Matches standard corporate email format with strict domain validation.',
      regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      errorMessage: 'Please enter a valid email address.'
    },
    {
      id: 'val_ssn',
      name: 'Social Security Number (SSN)',
      description: 'Matches standard US SSN layout (XXX-XX-XXXX).',
      regex: '^\\d{3}-\\d{2}-\\d{4}$',
      errorMessage: 'SSN must match XXX-XX-XXXX formatting.'
    },
    {
      id: 'val_phone_us',
      name: 'US Phone Number',
      description: 'Matches typical 10-digit US telephone numbers with/without dashes.',
      regex: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
      errorMessage: 'Phone number must be a valid 10-digit US number.'
    },
    {
      id: 'val_wf_routing',
      name: 'WF Fedwire Routing Number',
      description: 'Strict 9-digit financial routing transit format.',
      regex: '^\\d{9}$',
      errorMessage: 'Routing Transit Number must be exactly 9 numeric digits.'
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRegex, setEditRegex] = useState('');
  const [editError, setEditError] = useState('');

  // Interactive Sandbox state
  const [testText, setTestText] = useState('');
  const [testRegex, setTestRegex] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleEditClick = (rule: ValidationRule) => {
    setEditingId(rule.id);
    setEditName(rule.name);
    setEditDesc(rule.description);
    setEditRegex(rule.regex);
    setEditError(rule.errorMessage);
  };

  const handleCreateNew = () => {
    setEditingId('new');
    setEditName('New Rule');
    setEditDesc('A validation rule description');
    setEditRegex('^.*$');
    setEditError('Validation failed.');
  };

  const handleSave = () => {
    if (!editName.trim() || !editRegex.trim()) return;

    if (editingId === 'new') {
      const newRule: ValidationRule = {
        id: 'val_' + Math.random().toString(36).substring(2, 9),
        name: editName,
        description: editDesc,
        regex: editRegex,
        errorMessage: editError
      };
      setRules([...rules, newRule]);
    } else {
      setRules(rules.map(r => r.id === editingId ? {
        ...r,
        name: editName,
        description: editDesc,
        regex: editRegex,
        errorMessage: editError
      } : r));
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this validation master rule?')) return;
    setRules(rules.filter(r => r.id !== id));
  };

  const testRegexMatch = () => {
    if (!testRegex) {
      setTestResult(null);
      return;
    }
    try {
      const reg = new RegExp(testRegex);
      setTestResult(reg.test(testText));
    } catch (e) {
      setTestResult(false);
    }
  };

  const content = (
    <div className={isEmbedded ? "text-slate-805 dark:text-gray-100" : "min-h-screen bg-slate-55 dark:bg-slate-900/30 text-slate-805 dark:text-gray-100 p-6"}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Validation Rules Library
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Configure global regex validation constraints and error patterns
              </p>
            </div>
          </div>
          {!editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-lg text-white font-semibold shadow-sm transition-all"
            >
              + Create Validation Rule
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rules List */}
          <div className={`${editingId ? 'lg:col-span-7' : 'lg:col-span-8'} bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl shadow-sm dark:shadow-none`}>
            <span className="text-xs font-bold text-slate-500 dark:text-gray-450 uppercase tracking-wider block mb-4">Regex Rules Repository</span>

            <div className="divide-y divide-slate-150 dark:divide-slate-750">
              {rules.map((rule) => (
                <div key={rule.id} className="py-4 space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-gray-200">{rule.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{rule.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 p-2 rounded text-blue-600 dark:text-blue-400"
                        title="Edit rule"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 p-2 rounded text-red-500 dark:text-red-400"
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-150 dark:border-slate-750/50 text-xs">
                    <div>
                      <span className="text-slate-450 dark:text-gray-500 block font-semibold">Regex Expression:</span>
                      <code className="text-indigo-600 dark:text-indigo-400 font-mono block mt-1">{rule.regex}</code>
                    </div>
                    <div>
                      <span className="text-slate-455 dark:text-gray-500 block font-semibold">Validation Message:</span>
                      <span className="text-red-500 dark:text-red-400 block mt-1">{rule.errorMessage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Sidebar */}
          {editingId && (
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl space-y-4 shadow-xl h-fit text-slate-800 dark:text-gray-100">
              <span className="text-xs font-bold text-slate-700 dark:text-indigo-200 uppercase tracking-wider block border-b border-slate-150 dark:border-slate-750 pb-2">
                {editingId === 'new' ? 'New Validation Pattern' : 'Edit Validation Pattern'}
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 dark:text-gray-400 block mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-800 dark:text-white w-full outline-none focus:border-indigo-550"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-800 dark:text-white w-full h-16 resize-none outline-none focus:border-indigo-550"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-gray-400 block mb-1">Regex Pattern</label>
                  <input
                    type="text"
                    value={editRegex}
                    onChange={(e) => setEditRegex(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-indigo-600 dark:text-indigo-400 font-mono w-full outline-none focus:border-indigo-550"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-gray-400 block mb-1">Error Message</label>
                  <input
                    type="text"
                    value={editError}
                    onChange={(e) => setEditError(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-red-500 dark:text-red-400 w-full outline-none focus:border-indigo-550"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-150 dark:border-slate-750">
                  <button onClick={() => setEditingId(null)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 px-4 py-2 rounded text-slate-700 dark:text-white transition-all font-semibold">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-indigo-650 hover:bg-indigo-600 px-4 py-2 rounded text-white flex items-center gap-1 font-semibold">
                    <Save className="h-4 w-4" /> Save Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sandbox Testing Tool (Always visible for helper validations) */}
          <div className={`${editingId ? 'lg:col-span-12' : 'lg:col-span-4'} bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl h-fit text-slate-800 dark:text-gray-100 shadow-sm dark:shadow-none`}>
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-4">Interactive Regex Sandbox</span>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-550 dark:text-gray-400 block mb-1">Regex Pattern to test</label>
                <input
                  type="text"
                  placeholder="e.g. ^[0-9]{5}$"
                  value={testRegex}
                  onChange={(e) => { setTestRegex(e.target.value); setTestResult(null); }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-indigo-600 dark:text-indigo-300 font-mono w-full outline-none focus:border-indigo-550"
                />
              </div>

              <div>
                <label className="text-slate-550 dark:text-gray-400 block mb-1">Test String value</label>
                <input
                  type="text"
                  placeholder="Enter sample input..."
                  value={testText}
                  onChange={(e) => { setTestText(e.target.value); setTestResult(null); }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-800 dark:text-white w-full outline-none focus:border-indigo-550"
                />
              </div>

              <button
                onClick={testRegexMatch}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 py-2 rounded font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 transition-all"
              >
                Execute Test Check
              </button>

              {testResult !== null && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                  testResult ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400'
                }`}>
                  {testResult ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Input successfully passes validation check!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span>Input fails regex validation criteria!</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );

  return isEmbedded ? content : <Layout>{content}</Layout>;
}
