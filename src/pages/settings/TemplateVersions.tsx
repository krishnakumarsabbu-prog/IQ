import { useState, useEffect } from 'react';
import { GitCommit, RotateCcw, Calendar, User, ChevronRight } from 'lucide-react';
import { MessageTemplate, TemplateVersion } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';

export default function TemplateVersions({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await formBuilderService.getTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplateId(data[0].templateId);
        loadVersions(data[0].templateId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadVersions = async (templateId: string) => {
    try {
      const data = await formBuilderService.getVersions(templateId);
      setVersions(data);
      setSelectedVersion(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    loadVersions(id);
  };

  const handleRollback = async (versionStr: string) => {
    if (!confirm(`Are you sure you want to rollback this template to version ${versionStr}? All active fields will revert to this snapshot.`)) return;

    try {
      await formBuilderService.rollbackVersion(selectedTemplateId, versionStr);
      alert(`Successfully rolled back to version ${versionStr}!`);
      loadVersions(selectedTemplateId);
    } catch (e) {
      alert('Error during version rollback.');
    }
  };

  const content = (
    <div className={isEmbedded ? "text-slate-800 dark:text-gray-100" : "min-h-screen bg-slate-55 dark:bg-slate-900/30 text-slate-800 dark:text-gray-100 p-6"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <GitCommit className="h-8 w-8 text-blue-550 dark:text-blue-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Template Versions
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Track full snapshot history and perform rollbacks
              </p>
            </div>
          </div>
          <div>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-white"
            >
              {templates.map(t => (
                <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Versions List */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-4">Snapshots Catalog</span>

            {versions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-gray-500">
                No archived versions found. Make edits and save template builder configurations to auto-create versions.
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedVersion?.id === v.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-gray-205">Version {v.version}</span>
                        <span className="text-xxs bg-slate-100 dark:bg-slate-750 text-indigo-650 dark:text-indigo-400 font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {v.templateId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 italic">"{v.changeLog}"</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xxs text-slate-450 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(v.createdDate).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {v.createdBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRollback(v.version); }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 p-2 rounded text-blue-600 dark:text-blue-400 flex items-center gap-1 transition-all"
                        title="Rollback to this snapshot"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="text-xxs font-semibold">Rollback</span>
                      </button>
                      <ChevronRight className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details / JSON Comparator */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl flex flex-col h-fit shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-4">Snapshot Metadata Inspector</span>
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-750 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Overview</h4>
                  <div className="grid grid-cols-2 gap-2 text-xxs text-slate-600 dark:text-gray-400">
                    <div>Version code:</div>
                    <div className="text-slate-850 dark:text-white font-semibold">{selectedVersion.version}</div>
                    <div>Created on:</div>
                    <div className="text-slate-850 dark:text-white font-semibold">{new Date(selectedVersion.createdDate).toLocaleString()}</div>
                    <div>Archived by:</div>
                    <div className="text-slate-850 dark:text-white font-semibold">{selectedVersion.createdBy}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xxs text-slate-500 dark:text-gray-400 block font-semibold">Config Schema JSON</span>
                  <pre className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl p-3 text-xxs text-slate-700 dark:text-gray-300 overflow-x-auto max-h-96 font-mono">
                    {JSON.stringify(JSON.parse(selectedVersion.templateMetadataJson), null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-450 dark:text-gray-500 text-xs">
                Select any version snapshot on the left to inspect its schema metadata.
              </div>
            )}
          </div>
        </div>
    </div>
  );

  return isEmbedded ? content : <Layout>{content}</Layout>;
}
