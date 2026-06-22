import { useState, useEffect } from 'react';
import { History, Calendar, User, ArrowUpRight } from 'lucide-react';
import { MessageTemplate, AuditLog } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';

export default function AuditHistory({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const tmpls = await formBuilderService.getTemplates();
      setTemplates(tmpls);
      if (tmpls.length > 0) {
        setSelectedTemplateId(tmpls[0].templateId);
        loadAudits(tmpls[0].templateId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAudits = async (templateId: string) => {
    try {
      const data = await formBuilderService.getAudits(templateId);
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    loadAudits(id);
  };

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'SAVE_VERSION':
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'ROLLBACK':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-655 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  const content = (
    <div className={isEmbedded ? "text-slate-800 dark:text-gray-100" : "min-h-screen bg-slate-55 dark:bg-slate-900/30 text-slate-800 dark:text-gray-100 p-6"}>
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-emerald-555 dark:text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Audit History
              </h1>
              <p className="text-xs text-slate-550 dark:text-gray-400">
                Track template configuration revisions and administrative actions
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

        {/* Audit Timeline */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 p-6 rounded-2xl max-w-4xl mx-auto shadow-sm dark:shadow-none">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-6">Activity Logs Timeline</span>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-450 dark:text-gray-500">
              No audit logs recorded for this template. Use the template builder to save new modifications.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-4 space-y-6">
              {auditLogs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline point */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600"></div>

                  <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-750 rounded-xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-705 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xxs font-bold px-2 py-0.5 rounded ${getActionStyles(log.action)}`}>
                          {log.action}
                        </span>
                        <h4 className="text-sm font-bold text-slate-850 dark:text-gray-200">{log.templateName}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xxs text-slate-450 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(log.modifiedDate).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {log.modifiedBy}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-gray-300">
                      {log.changes}
                    </div>

                    <div className="flex justify-between items-center text-xxs text-slate-450 dark:text-gray-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Log ID: {log.id}</span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        View details <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );

  return isEmbedded ? content : <Layout>{content}</Layout>;
}
