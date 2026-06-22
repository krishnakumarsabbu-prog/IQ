import { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Edit, Save, X, List } from 'lucide-react';
import { DropdownMaster } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';

export default function DropdownMasters({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [masters, setMasters] = useState<DropdownMaster[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Current edit state
  const [editName, setEditName] = useState('');
  const [editItems, setEditItems] = useState<{ label: string; value: string }[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemValue, setNewItemValue] = useState('');

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const data = await formBuilderService.getDropdowns();
      setMasters(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    setEditingId('new');
    setEditName('New Pick List');
    setEditItems([{ label: 'Choice 1', value: 'choice_1' }]);
  };

  const handleEditClick = (master: DropdownMaster) => {
    setEditingId(master.masterId || master.id || '');
    setEditName(master.masterName);
    setEditItems([...master.items]);
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim() || !newItemValue.trim()) return;
    setEditItems([...editItems, { label: newItemLabel.trim(), value: newItemValue.trim() }]);
    setNewItemLabel('');
    setNewItemValue('');
  };

  const handleRemoveItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!editName.trim()) return;

    try {
      const payload: DropdownMaster = {
        masterId: editingId === 'new' ? '' : (editingId as string),
        masterName: editName.trim(),
        items: editItems
      };
      
      await formBuilderService.saveDropdown(payload);
      setEditingId(null);
      alert('Dropdown Master saved successfully!');
      loadDropdowns();
    } catch (e) {
      alert('Error saving Dropdown Master');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Dropdown Master?')) return;
    try {
      await formBuilderService.deleteDropdown(id);
      loadDropdowns();
    } catch (e) {
      alert('Error deleting master list');
    }
  };

  const content = (
    <div className={isEmbedded ? "text-slate-805 dark:text-gray-150" : "min-h-screen bg-slate-55 dark:bg-slate-900/30 text-slate-805 dark:text-gray-150 p-6"}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dropdown Masters
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Manage reusable reference lists and select option values
              </p>
            </div>
          </div>
          {!editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Dropdown Master
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main List */}
          <div className={`${editingId ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl shadow-sm dark:shadow-none`}>
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-4">Master Reference Directories</span>
            {masters.length === 0 ? (
              <div className="text-center py-10 text-slate-450 dark:text-gray-500">No dropdown masters configured. Click Create to add.</div>
            ) : (
              <div className="divide-y divide-slate-150 dark:divide-slate-750">
                {masters.map(master => (
                  <div key={master.masterId || master.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200">{master.masterName}</h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{master.masterId}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {master.items.map((it, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded text-xxs text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700/50">
                            {it.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(master)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 p-2 rounded-lg text-blue-600 dark:text-blue-400"
                        title="Edit List"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(master.masterId || master.id || '')}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 p-2 rounded-lg text-red-500 dark:text-red-400"
                        title="Delete List"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Panel */}
          {editingId && (
            <div className="lg:col-span-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-indigo-500/20 p-6 rounded-2xl space-y-4 shadow-xl text-slate-800 dark:text-gray-100">
              <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-750">
                <h3 className="text-sm font-bold text-slate-700 dark:text-indigo-250 flex items-center gap-1.5">
                  <List className="h-4 w-4 text-indigo-550 dark:text-indigo-400" /> {editingId === 'new' ? 'New Dropdown Master' : 'Edit Dropdown Master'}
                </h3>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-gray-400 block mb-1">Master Directory Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-850 dark:text-white w-full outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-150 dark:border-slate-750">
                  <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 block mb-2">Options & Values ({editItems.length})</label>
                  
                  <div className="max-h-56 overflow-y-auto space-y-2 mb-3">
                    {editItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded border border-slate-150 dark:border-slate-750/50 flex items-center justify-between text-xs text-slate-805 dark:text-gray-200">
                        <div>
                          <span className="text-slate-800 dark:text-gray-200 font-medium">{item.label}</span>
                          <span className="text-slate-400 dark:text-gray-500 mx-2">→</span>
                          <span className="text-indigo-650 dark:text-indigo-400 font-mono">{item.value}</span>
                        </div>
                        <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Display label (e.g. Critical)"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      className="bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-xxs text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Stored value (e.g. critical)"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      className="bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded p-2 text-xxs text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-xs py-1.5 rounded font-semibold text-indigo-700 dark:text-indigo-400 border border-slate-250 dark:border-indigo-500/20 transition-colors"
                  >
                    + Add Selection Item
                  </button>
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-4 border-t border-slate-150 dark:border-slate-750">
                  <button onClick={() => setEditingId(null)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 px-4 py-2 rounded text-slate-700 dark:text-white font-semibold transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white flex items-center gap-1 font-semibold">
                    <Save className="h-4 w-4" /> Save Master List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );

  return isEmbedded ? content : <Layout>{content}</Layout>;
}
