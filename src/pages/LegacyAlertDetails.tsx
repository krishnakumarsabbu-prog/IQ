import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, FileCode } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLegacyAlertStore } from '../store/legacyAlertStore';
import { LegacyAlert } from '../types/legacyAlert';
import Layout from '../components/Layout';
import { useAppDispatch } from '../hooks/useRedux';
import { setPageInfo } from '../store/slices/uiSlice';

export default function LegacyAlertDetails() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { alerts, fetchAlerts, fetchFileContent, fileContent, selectedFileName, clearFileContent } = useLegacyAlertStore();

  const [alert, setAlert] = useState<LegacyAlert | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['properties', 'baseProperties']));

  useEffect(() => {
    dispatch(setPageInfo({ title: `Alert ${alertId} details`, tagline: 'Legacy Alert schema properties & Java source code files' }));
    if (Object.keys(alerts).length === 0) {
      fetchAlerts();
    }
  }, [alerts, fetchAlerts, alertId]);

  useEffect(() => {
    if (alertId && alerts[alertId]) {
      setAlert(alerts[alertId]);
    }
  }, [alertId, alerts]);

  const handleFileClick = (fileName: string) => {
    if (alertId) {
      setSelectedFile(fileName);
      fetchFileContent(alertId, fileName);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wf-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  const allJavaFiles = [...alert.processClasses, ...alert.rendererClasses];

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/legacy-alerts')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-400 hover:text-wf-red hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="h-8 w-px bg-gray-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <FileCode size={28} className="text-wf-red" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Alert {alertId}</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{alert.completeInfo.MessageKey}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Alert JSON</h2>
            </div>
            <div className="p-4">
              <JsonViewer data={alert} />
            </div>
          </div>

          <div className="w-1/3 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Java File Content</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Process Classes</h3>
                  {alert.processClasses.map((fileName, idx) => (
                    <button
                      key={`process-${idx}`}
                      onClick={() => handleFileClick(fileName)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                        selectedFile === fileName
                          ? 'bg-wf-red text-white font-bold'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-750'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Renderer Classes</h3>
                  {alert.rendererClasses.map((fileName, idx) => (
                    <button
                      key={`renderer-${idx}`}
                      onClick={() => handleFileClick(fileName)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                        selectedFile === fileName
                          ? 'bg-wf-red text-white font-bold'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-750'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                {selectedFileName && fileContent && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{selectedFileName}</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {fileContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {!selectedFileName && (
                  <div className="mt-6 text-center py-8 text-gray-400 dark:text-slate-500">
                    <FileCode size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a file to view its content</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-1/3 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Properties</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('properties')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white">Properties</span>
                  {expandedSections.has('properties') ? (
                    <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />
                  )}
                </button>
                {expandedSections.has('properties') && (
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <div className="space-y-2">
                      {Object.entries(alert.completeInfo.properties).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-100 dark:border-slate-800 pb-2 last:border-0">
                          <div className="text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">{key}</div>
                          <div className="text-sm text-gray-900 dark:text-slate-100 font-mono">
                            {typeof value === 'object' ? (
                              <JsonViewer data={value} />
                            ) : (
                              String(value)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('baseProperties')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white">Base Properties</span>
                  {expandedSections.has('baseProperties') ? (
                    <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />
                  )}
                </button>
                {expandedSections.has('baseProperties') && (
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <div className="space-y-3">
                      {Object.entries(alert.completeInfo.baseProperties).map(([key, value]) => (
                        <div key={key} className="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="text-xs font-bold text-wf-red mb-2">{key}</div>
                          <div className="space-y-1">
                            {Object.entries(value).map(([propKey, propValue]) => (
                              <div key={propKey} className="flex items-start gap-2">
                                <span className="text-xs text-gray-600 dark:text-slate-400 min-w-20">{propKey}:</span>
                                <span className="text-xs text-gray-900 dark:text-slate-100 font-mono flex-1">
                                  {typeof propValue === 'object' ? JSON.stringify(propValue) : String(propValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
