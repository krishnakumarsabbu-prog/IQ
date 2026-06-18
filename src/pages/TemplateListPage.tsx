import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileCode, Calendar, Moon, Sun } from 'lucide-react';
import { EmailTemplate } from '../types/template';
import { templateService } from '../services/templateService';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleTheme } from '../store/slices/themeSlice';
import Layout from '../components/Layout';
import { setPageInfo } from '../store/slices/uiSlice';

export default function TemplateListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.theme);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setPageInfo({ title: 'Email Template Manager', tagline: 'Create and manage email templates' }));
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeleting(id);
    try {
      await templateService.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    navigate('/editor', {
      state: {
        html: template.template_html,
        name: template.name,
        description: template.description,
        templateId: template.id,
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-16 text-center">
            <FileCode size={80} className="mx-auto text-gray-300 dark:text-slate-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              No Templates Yet
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8 text-lg">
              Create your first email template to get started
            </p>

            <button
              onClick={() => navigate('/import')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-wf-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-semibold text-lg shadow-sm"
            >
              <Plus size={24} />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="p-6">

                  {/* Title + Description */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500 my-6 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      {formatDate(template.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCode size={16} />
                      {template.variables?.length || 0} vars
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold shadow-sm"
                    >
                      <Edit size={18} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleting === template.id}
                      className="px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      {deleting === template.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 dark:border-slate-300 border-t-transparent"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {formatDate(template.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
