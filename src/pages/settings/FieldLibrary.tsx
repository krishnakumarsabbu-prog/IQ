import { useState, useEffect } from 'react';
import { Database, Search, ArrowUpRight, Filter } from 'lucide-react';
import { FormField } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';

interface LibraryFieldItem extends FormField {
  templateName: string;
  templateId: string;
  tabName: string;
  sectionName: string;
}

export default function FieldLibrary({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [fields, setFields] = useState<LibraryFieldItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const templates = await formBuilderService.getTemplates();
      const list: LibraryFieldItem[] = [];
      templates.forEach(t => {
        t.tabs.forEach(tab => {
          tab.sections.forEach(sec => {
            sec.fields.forEach(f => {
              list.push({
                ...f,
                templateName: t.templateName,
                templateId: t.templateId,
                tabName: tab.tabName,
                sectionName: sec.sectionName
              });
            });
          });
        });
      });
      setFields(list);
    } catch (e) {
      console.error(e);
    }
  };

  const fieldTypes = ['ALL', ...Array.from(new Set(fields.map(f => f.fieldType)))];

  const filteredFields = fields.filter(f => {
    const matchesSearch = f.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.fieldKey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedTypeFilter === 'ALL' || f.fieldType === selectedTypeFilter;
    return matchesSearch && matchesFilter;
  });

  const content = (
    <div className={isEmbedded ? "text-slate-800 dark:text-gray-100" : "min-h-screen bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-gray-100 p-6"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Field Library
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Central directory of all fields mapped across dynamic form configurations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white outline-none w-56 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400 dark:text-gray-500" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-800 dark:text-white"
              >
                {fieldTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fields list grid */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl shadow-sm dark:shadow-none">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-4">
            Active Registered Fields Catalog ({filteredFields.length})
          </span>

          {filteredFields.length === 0 ? (
            <div className="text-center py-10 text-slate-450 dark:text-gray-500">
              No matching fields found in the catalog directory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-750 text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Field Label</th>
                    <th className="pb-3">Field Key</th>
                    <th className="pb-3">Control Component</th>
                    <th className="pb-3">Parent Section</th>
                    <th className="pb-3">Source Form Template</th>
                    <th className="pb-3">Required</th>
                    <th className="pb-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-750 text-slate-700 dark:text-gray-300">
                  {filteredFields.map((field) => (
                    <tr key={field.fieldId} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-white">{field.label}</td>
                      <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400">{field.fieldKey}</td>
                      <td className="py-3.5">
                        <span className="bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded text-xxs text-indigo-750 dark:text-indigo-300 border border-slate-200 dark:border-slate-700">
                          {field.fieldType}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-gray-450">{field.sectionName}</td>
                      <td className="py-3.5 font-semibold text-slate-600 dark:text-gray-400">{field.templateName}</td>
                      <td className="py-3.5">
                        {field.required ? (
                          <span className="text-red-500 dark:text-red-400 font-bold">YES</span>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500">NO</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 ml-auto">
                          Inspect <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );

  return isEmbedded ? content : <Layout>{content}</Layout>;
}
