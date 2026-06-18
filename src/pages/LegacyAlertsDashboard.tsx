import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Table2, Grid3x3, FileCode } from 'lucide-react';
import { useLegacyAlertStore } from '../store/legacyAlertStore';
import Layout from '../components/Layout';
import { useAppDispatch } from '../hooks/useRedux';
import { setPageInfo } from '../store/slices/uiSlice';

export default function LegacyAlertsDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    alerts,
    isLoading,
    error,
    searchQuery,
    viewMode,
    fetchAlerts,
    setSearchQuery,
    setViewMode,
  } = useLegacyAlertStore();

  useEffect(() => {
    dispatch(setPageInfo({ title: 'Legacy Alerts', tagline: 'Browse and inspect legacy system alert definitions' }));
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = useMemo(() => {
    const alertEntries = Object.entries(alerts);
    if (!searchQuery.trim()) return alertEntries;

    return alertEntries.filter(([alertId]) =>
      alertId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [alerts, searchQuery]);

  const handleOpenAlert = (alertId: string) => {
    navigate(`/legacy-alerts/${alertId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wf-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading legacy alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-bold mb-2">Error Loading Alerts</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileCode size={32} className="text-wf-red" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Legacy Alerts catalog</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-wf-red dark:text-white shadow-sm font-bold'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              <Table2 size={18} />
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-wf-red dark:text-white shadow-sm font-bold'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
              }`}
            >
              <Grid3x3 size={18} />
              Cards
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Alert ID (e.g., 900, 9001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-wf-red focus:border-transparent dark:bg-slate-900 dark:text-white"
          />
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <FileCode size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search query' : 'No legacy alerts available'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Alert ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Process Classes</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-slate-300">Renderer Classes</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredAlerts.map(([alertId, alert]) => (
                  <tr key={alertId} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-gray-900 dark:text-slate-100">{alertId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        {alert.processClasses.length} files
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                        {alert.rendererClasses.length} files
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAlert(alertId)}
                        className="px-4 py-2 bg-wf-red text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map(([alertId, alert]) => (
              <div
                key={alertId}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-slate-800 hover:border-wf-red p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Alert {alertId}</h3>
                    <p className="text-sm text-gray-500 font-mono">{alert.completeInfo.MessageKey}</p>
                  </div>
                  <FileCode size={24} className="text-wf-red" />
                </div>

                <div className="space-y-3 mb-4 text-gray-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Process Classes</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {alert.processClasses.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Renderer Classes</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                      {alert.rendererClasses.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAlert(alertId)}
                  className="w-full px-4 py-2.5 bg-wf-red text-white rounded-lg hover:bg-red-700 font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Open Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
