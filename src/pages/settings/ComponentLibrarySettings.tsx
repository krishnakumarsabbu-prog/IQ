/**
 * settings/ComponentLibrarySettings.tsx
 * ──────────────────────────────────────
 * "Components" tab inside Settings > Messages.
 *
 * Features:
 *  - Table of all component definitions (built-in + custom)
 *  - Add New Component form (kind, label, description, category, defaultText, defaultUrl)
 *  - Edit existing custom components inline
 *  - Delete custom components (built-ins are protected)
 *  - Changes persist via componentLibraryService (localStorage / REST)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Pencil, Save, X, CheckCircle,
  Package, AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  componentLibraryService,
  type StoredComponentDef,
} from '../../services/componentLibraryService';

// ── Category options ──────────────────────────────────────────────────────────

const CATEGORIES = ['text', 'action', 'media', 'data', 'layout', 'advanced'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  text:     'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  action:   'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  media:    'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  data:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  layout:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

// ── Empty form ────────────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<StoredComponentDef, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> = {
  kind: '',
  label: '',
  description: '',
  category: 'text',
  icon: 'Box',
  defaultText: '',
  defaultUrl: '',
};

// ── Helper: slugify label → kind ──────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComponentLibrarySettings({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [defs, setDefs]         = useState<StoredComponentDef[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [toast, setToast]       = useState<string | null>(null);

  // Add-new-component form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState({ ...EMPTY_FORM });

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await componentLibraryService.getAll();
      setDefs(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load component library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Toast helper ─────────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Auto-slug ────────────────────────────────────────────────────────────────

  const handleFormLabelChange = (label: string) => {
    setForm(prev => ({
      ...prev,
      label,
      kind: slugify(label),
    }));
  };

  // ── Save new ─────────────────────────────────────────────────────────────────

  const handleSaveNew = async () => {
    if (!form.label.trim()) { setFormError('Label is required.'); return; }
    if (!form.kind.trim())  { setFormError('Kind (auto-slug) must be non-empty.'); return; }
    if (defs.some(d => d.kind === form.kind)) {
      setFormError(`Kind "${form.kind}" already exists. Change the label.`);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const now = new Date().toISOString();
      const created = await componentLibraryService.save({
        id: form.kind,
        ...form,
        isCustom: true,
        createdAt: now,
        updatedAt: now,
      });
      setDefs(prev => [...prev, created]);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      showToast(`Component "${created.label}" added successfully.`);
    } catch (e: any) {
      setFormError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const handleDelete = async (def: StoredComponentDef) => {
    if (!def.isCustom) return; // guard built-ins
    if (!window.confirm(`Delete component "${def.label}"? This cannot be undone.`)) return;
    try {
      await componentLibraryService.delete(def.id);
      setDefs(prev => prev.filter(d => d.id !== def.id));
      showToast(`Component "${def.label}" deleted.`);
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  // ── Edit save ─────────────────────────────────────────────────────────────────

  const handleStartEdit = (def: StoredComponentDef) => {
    setEditingId(def.id);
    setEditForm({
      kind: def.kind,
      label: def.label,
      description: def.description,
      category: def.category,
      icon: def.icon,
      defaultText: def.defaultText,
      defaultUrl: def.defaultUrl ?? '',
    });
  };

  const handleSaveEdit = async (def: StoredComponentDef) => {
    setSaving(true);
    try {
      const updated = await componentLibraryService.save({
        ...def,
        ...editForm,
        updatedAt: new Date().toISOString(),
      });
      setDefs(prev => prev.map(d => d.id === updated.id ? updated : d));
      setEditingId(null);
      showToast(`Component "${updated.label}" updated.`);
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col gap-4 ${isEmbedded ? '' : 'p-6'}`}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold animate-fadeIn">
          <CheckCircle className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" />
            Content Component Library
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage built-in and custom component types available in the Content Builder.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(v => !v); setFormError(null); }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl
              bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Component Type
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add new form */}
      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">New Component Type</h4>

          {formError && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{formError}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Label */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Label *</label>
              <input
                type="text"
                value={form.label}
                onChange={e => handleFormLabelChange(e.target.value)}
                placeholder="e.g. Offer Banner"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Kind (auto-slugified) */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Kind (auto)</label>
              <input
                type="text"
                value={form.kind}
                onChange={e => setForm(prev => ({ ...prev, kind: slugify(e.target.value) }))}
                placeholder="offer_banner"
                className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value as Category }))}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Icon (lucide name)</label>
              <input
                type="text"
                value={form.icon}
                onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g. Star, Box, Zap"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Short description of what this component does"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Default text */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Default Text</label>
              <input
                type="text"
                value={form.defaultText}
                onChange={e => setForm(prev => ({ ...prev, defaultText: e.target.value }))}
                placeholder="Placeholder text shown in canvas"
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Default URL */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Default URL (optional)</label>
              <input
                type="text"
                value={form.defaultUrl}
                onChange={e => setForm(prev => ({ ...prev, defaultUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); setForm({ ...EMPTY_FORM }); }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800
                text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg
                bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 transition-all shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Component'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading component library…
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Label</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kind</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Text</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {defs.map(def => (
                <tr
                  key={def.id}
                  className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {editingId === def.id ? (
                    /* ── Inline edit row ── */
                    <>
                      <td className="px-4 py-2" colSpan={5}>
                        <div className="grid grid-cols-5 gap-2">
                          <input
                            type="text"
                            value={editForm.label}
                            onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))}
                            className="col-span-1 text-xs bg-white dark:bg-slate-900 border border-indigo-400 rounded-lg px-2 py-1 outline-none"
                          />
                          <select
                            value={editForm.category}
                            onChange={e => setEditForm(p => ({ ...p, category: e.target.value as Category }))}
                            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none cursor-pointer"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Description"
                            className="col-span-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none"
                          />
                          <input
                            type="text"
                            value={editForm.defaultText}
                            onChange={e => setEditForm(p => ({ ...p, defaultText: e.target.value }))}
                            placeholder="Default text"
                            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">—</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(def)}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            title="Save"
                          >
                            <Save className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* ── Normal row ── */
                    <>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{def.label}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{def.kind}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_COLORS[def.category as Category] ?? 'bg-slate-100 text-slate-600'}`}>
                          {def.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{def.description}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{def.defaultText || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          def.isCustom
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {def.isCustom ? 'Custom' : 'Built-in'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {def.isCustom && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(def)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(def)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {!def.isCustom && (
                            <span className="px-2 py-1 text-[10px] text-slate-400 italic">Protected</span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {defs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No component definitions found. Click "Add Component Type" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-slate-400 dark:text-slate-600">
        {defs.filter(d => d.isCustom).length} custom · {defs.filter(d => !d.isCustom).length} built-in · {defs.length} total
      </p>
    </div>
  );
}
