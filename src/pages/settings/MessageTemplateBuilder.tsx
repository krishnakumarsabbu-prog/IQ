import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Trash2, Edit, ChevronDown, 
  Smartphone, Tablet, Monitor, Save, Download, Upload, 
  Code, User, Users, Calendar, Clock, DollarSign, Mail, Phone, 
  CheckSquare, AlignLeft, Hash, Bold, ArrowUp, ArrowDown, Copy, CheckSquare as ToggleIcon
} from 'lucide-react';
import { MessageTemplate, FormTab, FormSection, FormField, DropdownMaster, RuleSetting } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';

// Palette items defined globally
const PALETTE_COMPONENTS = [
  { type: 'TextBox', label: 'TextBox', icon: Hash, desc: 'Single-line text' },
  { type: 'TextArea', label: 'TextArea', icon: AlignLeft, desc: 'Multi-line text' },
  { type: 'RichText', label: 'Rich Text Editor', icon: Bold, desc: 'HTML WYSIWYG editor' },
  { type: 'Number', label: 'Number', icon: Hash, desc: 'Numeric values' },
  { type: 'Currency', label: 'Currency', icon: DollarSign, desc: 'Monetary input' },
  { type: 'Date', label: 'Date', icon: Calendar, desc: 'Date picker' },
  { type: 'DateTime', label: 'Date Time', icon: Clock, desc: 'Date and time picker' },
  { type: 'Email', label: 'Email', icon: Mail, desc: 'Email address validation' },
  { type: 'Phone', label: 'Phone', icon: Phone, desc: 'Phone number format' },
  { type: 'Checkbox', label: 'Checkbox', icon: CheckSquare, desc: 'Boolean checklist' },
  { type: 'Toggle', label: 'Toggle', icon: ToggleIcon, desc: 'Switch interface' },
  { type: 'RadioGroup', label: 'Radio Group', icon: CheckSquare, desc: 'Single-select options' },
  { type: 'Dropdown', label: 'Dropdown', icon: ChevronDown, desc: 'Master-list selection' },
  { type: 'MultiSelect', label: 'Multi Select', icon: ChevronDown, desc: 'Multiple items selection' },
  { type: 'FileUpload', label: 'File Upload', icon: Upload, desc: 'Attachment uploader' },
  { type: 'ImageUpload', label: 'Image Upload', icon: Upload, desc: 'Image preview uploader' },
  { type: 'SectionHeader', label: 'Section Header', icon: Layers, desc: 'Visual grouping header' },
  { type: 'Divider', label: 'Divider', icon: AlignLeft, desc: 'Horizontal rule' },
  { type: 'HTMLBlock', label: 'HTML Block', icon: Code, desc: 'Static HTML content' },
  { type: 'Grid', label: 'Table/Grid', icon: Layers, desc: 'Static tabular layout' },
  { type: 'DynamicTable', label: 'Dynamic Row Table', icon: Layers, desc: 'Interactive add-row grid' },
  { type: 'UserPicker', label: 'User Picker', icon: User, desc: 'Single LDAP user selector' },
  { type: 'GroupPicker', label: 'Group Picker', icon: Users, desc: 'LOB LDAP group selector' },
  { type: 'TagControl', label: 'Tag Control', icon: Hash, desc: 'Comma-separated keywords' },
  { type: 'ChipControl', label: 'Chip Control', icon: Hash, desc: 'Visual category chips' },
  { type: 'JsonEditor', label: 'JSON Editor', icon: Code, desc: 'Raw object validator' },
  { type: 'CodeEditor', label: 'Code Editor', icon: Code, desc: 'Vanguard script editor' }
];

export default function MessageTemplateBuilder() {
  // Master lists
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [dropdownMasters, setDropdownMasters] = useState<DropdownMaster[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<MessageTemplate | null>(null);

  // Layout states
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<{ type: 'field' | 'section'; id: string } | null>(null);

  // Property tabs
  const [propertyTab, setPropertyTab] = useState<'general' | 'validation' | 'appearance' | 'rules' | 'advanced'>('general');

  // Modals / Operations
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [modalTargetSectionId, setModalTargetSectionId] = useState<string>('');
  const [newFieldData, setNewFieldData] = useState<Partial<FormField>>({
    label: '', fieldKey: '', fieldType: 'TextBox', required: false, readOnly: false, hidden: false
  });

  // Rules Configuration States
  const [ruleTriggerField, setRuleTriggerField] = useState('');
  const [ruleOperator, setRuleOperator] = useState<'==' | '!=' | '>' | '<' | 'contains' | 'empty'>('==');
  const [ruleValue, setRuleValue] = useState('');
  const [ruleAction, setRuleAction] = useState<'SHOW' | 'HIDE' | 'MAKE_REQUIRED' | 'READ_ONLY'>('SHOW');

  // Version/Audit note modal
  const [saveNote, setSaveNote] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load Initial Data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (dropdownMasters.length > 0) {
      console.log('Loaded Dropdown Masters count:', dropdownMasters.length);
    }
  }, [dropdownMasters]);

  const loadInitialData = async () => {
    try {
      const tmpls = await formBuilderService.getTemplates();
      const masters = await formBuilderService.getDropdowns();
      setTemplates(tmpls);
      setDropdownMasters(masters);
      if (tmpls.length > 0) {
        handleSelectTemplate(tmpls[0].templateId);
      } else {
        handleCreateNewTemplate();
      }
    } catch (error) {
      console.error('Error loading initial configurations:', error);
    }
  };

  const handleSelectTemplate = async (id: string) => {
    try {
      const template = await formBuilderService.getTemplate(id);
      setCurrentTemplate(template);
      setSelectedTemplateId(template.templateId);
      if (template.tabs.length > 0) {
        setActiveTabId(template.tabs[0].tabId);
      }
      setSelectedElement(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewTemplate = () => {
    const newTmpl: MessageTemplate = {
      templateId: 'tmpl_' + Math.random().toString(36).substring(2, 9),
      templateName: 'New Message Form Template',
      description: 'Business requirements config form',
      version: '1.0',
      tabs: [
        {
          tabId: 'tab_' + Math.random().toString(36).substring(2, 9),
          tabName: 'Main Details',
          order: 0,
          sections: [
            {
              sectionId: 'sec_' + Math.random().toString(36).substring(2, 9),
              sectionName: 'General Information',
              collapsible: true,
              expandedByDefault: true,
              columns: 2,
              order: 0,
              fields: []
            }
          ]
        }
      ]
    };
    setCurrentTemplate(newTmpl);
    setSelectedTemplateId(newTmpl.templateId);
    setActiveTabId(newTmpl.tabs[0].tabId);
    setSelectedElement(null);
  };

  // --- SAVE & AUDIT LOGIC ---
  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!currentTemplate) return;
    try {
      const saved = await formBuilderService.saveTemplate({
        ...currentTemplate,
        updatedBy: 'admin',
      });
      // Mock version save note
      if (saved.templateId) {
        formBuilderService.logAuditMock(saved.templateId, saved.templateName, 'SAVE_VERSION', saveNote || 'Saved template structure.');
      }
      setShowSaveModal(false);
      setSaveNote('');
      alert(`Template saved successfully! Version is now ${saved.version}`);
      loadInitialData();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template configuration.');
    }
  };

  // --- COMPONENT HANDLERS ---
  const handleAddFieldClick = (sectionId: string) => {
    setModalTargetSectionId(sectionId);
    setNewFieldData({
      label: 'New Field',
      fieldKey: 'newField_' + Math.random().toString(36).substring(2, 6),
      fieldType: 'TextBox',
      placeholder: 'Enter details...',
      required: false,
      readOnly: false,
      hidden: false,
      validation: { minLength: 0, maxLength: 255 },
      appearance: { width: '100%', borderRadius: '8px' },
      advanced: { auditEnabled: true, searchable: true, exportable: true, versionControlled: true },
      rules: []
    });
    setIsFieldModalOpen(true);
  };

  const handleConfirmAddField = () => {
    if (!currentTemplate || !newFieldData.label || !newFieldData.fieldKey) return;

    const newField: FormField = {
      fieldId: 'fld_' + Math.random().toString(36).substring(2, 9),
      fieldKey: newFieldData.fieldKey,
      fieldType: newFieldData.fieldType || 'TextBox',
      label: newFieldData.label,
      placeholder: newFieldData.placeholder,
      helpText: newFieldData.helpText || '',
      defaultValue: newFieldData.defaultValue || '',
      required: !!newFieldData.required,
      readOnly: !!newFieldData.readOnly,
      hidden: !!newFieldData.hidden,
      validation: newFieldData.validation || {},
      appearance: newFieldData.appearance || { width: '100%' },
      advanced: newFieldData.advanced || { auditEnabled: true },
      rules: newFieldData.rules || []
    };

    const updatedTabs = currentTemplate.tabs.map(tab => {
      return {
        ...tab,
        sections: tab.sections.map(sec => {
          if (sec.sectionId === modalTargetSectionId) {
            return {
              ...sec,
              fields: [...sec.fields, newField]
            };
          }
          return sec;
        })
      };
    });

    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
    setIsFieldModalOpen(false);
    setSelectedElement({ type: 'field', id: newField.fieldId });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!currentTemplate) return;
    if (!confirm('Are you sure you want to delete this field?')) return;

    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => ({
        ...sec,
        fields: sec.fields.filter(f => f.fieldId !== fieldId)
      }))
    }));

    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
    if (selectedElement?.id === fieldId) setSelectedElement(null);
  };

  const handleCloneField = (fieldId: string, sectionId: string) => {
    if (!currentTemplate) return;
    let fieldToClone: FormField | null = null;
    
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        const found = sec.fields.find(f => f.fieldId === fieldId);
        if (found) fieldToClone = found;
      });
    });

    if (!fieldToClone) return;

    const cloned: FormField = {
      ...JSON.parse(JSON.stringify(fieldToClone)),
      fieldId: 'fld_' + Math.random().toString(36).substring(2, 9),
      fieldKey: (fieldToClone as FormField).fieldKey + '_copy',
      label: (fieldToClone as FormField).label + ' (Copy)'
    };

    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => {
        if (sec.sectionId === sectionId) {
          return { ...sec, fields: [...sec.fields, cloned] };
        }
        return sec;
      })
    }));

    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
  };

  // Move fields up/down
  const handleMoveField = (fieldId: string, sectionId: string, direction: 'up' | 'down') => {
    if (!currentTemplate) return;
    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => {
        if (sec.sectionId === sectionId) {
          const idx = sec.fields.findIndex(f => f.fieldId === fieldId);
          if (idx === -1) return sec;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= sec.fields.length) return sec;

          const reordered = [...sec.fields];
          const temp = reordered[idx];
          reordered[idx] = reordered[targetIdx];
          reordered[targetIdx] = temp;

          return { ...sec, fields: reordered };
        }
        return sec;
      })
    }));
    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
  };

  // --- TAB OPERATIONS ---
  const handleAddTab = () => {
    if (!currentTemplate) return;
    const tabName = prompt('Enter new tab name:');
    if (!tabName) return;

    const newTab: FormTab = {
      tabId: 'tab_' + Math.random().toString(36).substring(2, 9),
      tabName,
      order: currentTemplate.tabs.length,
      sections: []
    };

    setCurrentTemplate({
      ...currentTemplate,
      tabs: [...currentTemplate.tabs, newTab]
    });
    setActiveTabId(newTab.tabId);
  };

  const handleRenameTab = (tabId: string) => {
    if (!currentTemplate) return;
    const tab = currentTemplate.tabs.find(t => t.tabId === tabId);
    if (!tab) return;
    const newName = prompt('Rename tab:', tab.tabName);
    if (!newName) return;

    const updated = currentTemplate.tabs.map(t => t.tabId === tabId ? { ...t, tabName: newName } : t);
    setCurrentTemplate({ ...currentTemplate, tabs: updated });
  };

  const handleDeleteTab = (tabId: string) => {
    if (!currentTemplate) return;
    if (currentTemplate.tabs.length <= 1) {
      alert('Templates must contain at least one tab.');
      return;
    }
    if (!confirm('Are you sure you want to delete this tab and all its contents?')) return;

    const updated = currentTemplate.tabs.filter(t => t.tabId !== tabId);
    setCurrentTemplate({ ...currentTemplate, tabs: updated });
    if (activeTabId === tabId) {
      setActiveTabId(updated[0].tabId);
    }
  };

  const handleCloneTab = (tabId: string) => {
    if (!currentTemplate) return;
    const tab = currentTemplate.tabs.find(t => t.tabId === tabId);
    if (!tab) return;

    const cloned: FormTab = JSON.parse(JSON.stringify(tab));
    cloned.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    cloned.tabName = tab.tabName + ' (Clone)';
    cloned.order = currentTemplate.tabs.length;
    // regenerate element IDs
    cloned.sections.forEach(sec => {
      sec.sectionId = 'sec_' + Math.random().toString(36).substring(2, 9);
      sec.fields.forEach(f => {
        f.fieldId = 'fld_' + Math.random().toString(36).substring(2, 9);
        f.fieldKey = f.fieldKey + '_copy';
      });
    });

    setCurrentTemplate({
      ...currentTemplate,
      tabs: [...currentTemplate.tabs, cloned]
    });
    setActiveTabId(cloned.tabId);
  };

  const handleReorderTab = (tabId: string, direction: 'left' | 'right') => {
    if (!currentTemplate) return;
    const idx = currentTemplate.tabs.findIndex(t => t.tabId === tabId);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentTemplate.tabs.length) return;

    const updated = [...currentTemplate.tabs];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // reset orders
    updated.forEach((t, i) => t.order = i);

    setCurrentTemplate({ ...currentTemplate, tabs: updated });
  };

  // --- SECTION OPERATIONS ---
  const handleAddSection = () => {
    if (!currentTemplate || !activeTabId) return;
    const sectionName = prompt('Enter section name:');
    if (!sectionName) return;

    const newSec: FormSection = {
      sectionId: 'sec_' + Math.random().toString(36).substring(2, 9),
      sectionName,
      collapsible: true,
      expandedByDefault: true,
      columns: 2,
      order: 0,
      fields: []
    };

    const updated = currentTemplate.tabs.map(tab => {
      if (tab.tabId === activeTabId) {
        return {
          ...tab,
          sections: [...tab.sections, newSec]
        };
      }
      return tab;
    });

    setCurrentTemplate({ ...currentTemplate, tabs: updated });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!currentTemplate || !activeTabId) return;
    if (!confirm('Are you sure you want to delete this section?')) return;

    const updated = currentTemplate.tabs.map(tab => {
      if (tab.tabId === activeTabId) {
        return {
          ...tab,
          sections: tab.sections.filter(s => s.sectionId !== sectionId)
        };
      }
      return tab;
    });

    setCurrentTemplate({ ...currentTemplate, tabs: updated });
    if (selectedElement?.id === sectionId) setSelectedElement(null);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!currentTemplate || !activeTabId) return;
    const updated = currentTemplate.tabs.map(tab => {
      if (tab.tabId === activeTabId) {
        const idx = tab.sections.findIndex(s => s.sectionId === sectionId);
        if (idx === -1) return tab;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= tab.sections.length) return tab;

        const reordered = [...tab.sections];
        const temp = reordered[idx];
        reordered[idx] = reordered[targetIdx];
        reordered[targetIdx] = temp;

        reordered.forEach((s, i) => s.order = i);
        return { ...tab, sections: reordered };
      }
      return tab;
    });
    setCurrentTemplate({ ...currentTemplate, tabs: updated });
  };

  // --- HTML5 CANVAS DRAG & DROP ---
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('text/plain', componentType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSection = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('text/plain');
    if (!componentType || !currentTemplate) return;

    const paletteComp = PALETTE_COMPONENTS.find(c => c.type === componentType);
    if (!paletteComp) return;

    const newField: FormField = {
      fieldId: 'fld_' + Math.random().toString(36).substring(2, 9),
      fieldKey: paletteComp.type.toLowerCase() + '_' + Math.random().toString(36).substring(2, 6),
      fieldType: paletteComp.type,
      label: paletteComp.label,
      placeholder: 'Enter details...',
      helpText: '',
      required: false,
      readOnly: false,
      hidden: false,
      validation: {},
      appearance: { width: '100%' },
      advanced: { auditEnabled: true },
      rules: []
    };

    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => {
        if (sec.sectionId === sectionId) {
          return {
            ...sec,
            fields: [...sec.fields, newField]
          };
        }
        return sec;
      })
    }));

    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
    setSelectedElement({ type: 'field', id: newField.fieldId });
  };

  // --- RULES & DEPENDENCIES SYSTEM ---
  const getAllOtherFields = (): FormField[] => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'field') return [];
    const fields: FormField[] = [];
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (f.fieldId !== selectedElement.id) {
            fields.push(f);
          }
        });
      });
    });
    return fields;
  };

  const getDependentFields = () => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'field') return [];
    const currentField = getSelectedField();
    if (!currentField) return [];
    const dependents: { field: FormField; rule: RuleSetting }[] = [];
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (f.fieldId !== currentField.fieldId && f.rules) {
            f.rules.forEach(rule => {
              if (rule.triggerField === currentField.fieldKey) {
                dependents.push({ field: f, rule });
              }
            });
          }
        });
      });
    });
    return dependents;
  };

  const handleAddRule = () => {
    if (!ruleTriggerField) return;
    const newRule: RuleSetting = {
      ruleId: `rule_${Date.now()}`,
      triggerField: ruleTriggerField,
      operator: ruleOperator,
      value: ruleValue,
      action: ruleAction
    };
    updateSelectedField(f => {
      f.rules = [...(f.rules || []), newRule];
    });
    setRuleValue('');
  };

  useEffect(() => {
    const fields = getAllOtherFields();
    if (fields.length > 0) {
      setRuleTriggerField(fields[0].fieldKey);
    } else {
      setRuleTriggerField('');
    }
  }, [selectedElement]);

  // --- IMPORT / EXPORT JSON ---
  const handleExportJSON = () => {
    if (!currentTemplate) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTemplate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentTemplate.templateId}_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.templateId && imported.tabs) {
          setCurrentTemplate(imported);
          setSelectedTemplateId(imported.templateId);
          if (imported.tabs.length > 0) {
            setActiveTabId(imported.tabs[0].tabId);
          }
          setSelectedElement(null);
          alert('Template imported successfully!');
        } else {
          alert('Invalid template schema configuration.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // --- HELPERS FOR TARGET EDITING ---
  const getSelectedField = (): FormField | null => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'field') return null;
    let found: FormField | null = null;
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (f.fieldId === selectedElement.id) found = f;
        });
      });
    });
    return found;
  };

  const getFieldDependentsCount = (fieldKey: string) => {
    let count = 0;
    currentTemplate?.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        sec.fields.forEach(f => {
          if (f.rules) {
            f.rules.forEach(rule => {
              if (rule.triggerField === fieldKey) {
                count++;
              }
            });
          }
        });
      });
    });
    return count;
  };

  const getSelectedSection = (): FormSection | null => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'section') return null;
    let found: FormSection | null = null;
    currentTemplate.tabs.forEach(tab => {
      tab.sections.forEach(sec => {
        if (sec.sectionId === selectedElement.id) found = sec;
      });
    });
    return found;
  };

  const updateSelectedField = (updater: (field: FormField) => void) => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'field') return;
    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => ({
        ...sec,
        fields: sec.fields.map(f => {
          if (f.fieldId === selectedElement.id) {
            const copy = { ...f };
            updater(copy);
            return copy;
          }
          return f;
        })
      }))
    }));
    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
  };

  const updateSelectedSection = (updater: (section: FormSection) => void) => {
    if (!currentTemplate || !selectedElement || selectedElement.type !== 'section') return;
    const updatedTabs = currentTemplate.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(sec => {
        if (sec.sectionId === selectedElement.id) {
          const copy = { ...sec };
          updater(copy);
          return copy;
        }
        return sec;
      })
    }));
    setCurrentTemplate({ ...currentTemplate, tabs: updatedTabs });
  };

  // Current active tab object
  const activeTab = currentTemplate?.tabs.find(t => t.tabId === activeTabId) || null;

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-1 text-slate-800 dark:text-slate-100">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <Layers className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                Message Template Builder
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Design fully metadata-driven dynamic workflows
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-wf-red transition-all"
            >
              {templates.map(t => (
                <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
              ))}
            </select>

            <button
              onClick={handleCreateNewTemplate}
              className="bg-slate-55 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700 transition-all font-semibold"
            >
              <Plus className="h-4 w-4" /> New
            </button>

            <button
              onClick={handleSaveClick}
              className="bg-wf-red hover:bg-red-700 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 text-white font-semibold shadow-md shadow-red-500/10 transition-all"
            >
              <Save className="h-4 w-4" /> Save Configuration
            </button>

            <button
              onClick={handleExportJSON}
              className="bg-slate-55 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700 transition-all font-semibold"
              title="Export JSON Metadata"
            >
              <Download className="h-4 w-4" /> Export
            </button>

            <label className="bg-slate-55 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition-all font-semibold">
              <Upload className="h-4 w-4" /> Import
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Components Palette (Drag & Drop) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-450 dark:text-slate-505 uppercase tracking-wider">Components Palette (Drag & Drop)</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 shrink-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {PALETTE_COMPONENTS.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.type)}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-700/60 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap shadow-sm transition-all hover:scale-[1.03] duration-150"
                  title={comp.desc}
                >
                  <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>{comp.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 PANEL WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-270px)] overflow-hidden">
          
          {/* LEFT PANEL: Template Tree */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Template Tree Structure</span>
              <button onClick={handleAddTab} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-blue-500" title="Add Tab">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="font-semibold text-slate-800 dark:text-white truncate">{currentTemplate?.templateName}</div>
              
              {currentTemplate?.tabs.map((tab) => (
                <div key={tab.tabId} className="pl-1 space-y-1">
                  <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${activeTabId === tab.tabId ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}>
                    <span onClick={() => setActiveTabId(tab.tabId)} className="cursor-pointer truncate flex-1 flex items-center gap-1.5">
                      <span className="text-xs">📁</span> {tab.tabName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleReorderTab(tab.tabId, 'left')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleCloneTab(tab.tabId)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleRenameTab(tab.tabId)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-blue-500 transition-colors">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTab(tab.tabId)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sections list in Tab */}
                  {tab.sections.map((sec) => (
                    <div key={sec.sectionId} className="pl-3.5 space-y-1">
                      <div className={`flex items-center justify-between p-1.5 rounded-lg transition-all ${selectedElement?.id === sec.sectionId ? 'bg-slate-50/80 dark:bg-slate-800/40 text-slate-800 dark:text-white font-semibold border-l border-slate-300 dark:border-slate-700' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/20 text-slate-500 dark:text-slate-400'}`}>
                        <span onClick={() => setSelectedElement({ type: 'section', id: sec.sectionId })} className="cursor-pointer truncate flex-1 text-xs flex items-center gap-1">
                          <span className="text-[10px]">🔽</span> {sec.sectionName}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleMoveSection(sec.sectionId, 'up')} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDeleteSection(sec.sectionId)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Fields list in Section */}
                      {sec.fields.map((fld) => (
                        <div
                          key={fld.fieldId}
                          onClick={() => setSelectedElement({ type: 'field', id: fld.fieldId })}
                          className={`flex items-center justify-between pl-6 py-1 pr-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                            selectedElement?.id === fld.fieldId ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500 font-semibold' : 'hover:bg-slate-55 dark:hover:bg-slate-800/10 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <span className="truncate flex-1">• {fld.label}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteField(fld.fieldId); }}
                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500 opacity-60 hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="pl-4 pt-1">
                    <button
                      onClick={handleAddSection}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-1 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER PANEL: Canvas + Drag/Drop Panel */}
          <div className="lg:col-span-6 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Tab strip / headers */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/65 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {currentTemplate?.tabs.map(tab => (
                  <button
                    key={tab.tabId}
                    onClick={() => setActiveTabId(tab.tabId)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                      activeTabId === tab.tabId 
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200/80 dark:border-slate-700 shadow-sm' 
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    {tab.tabName}
                  </button>
                ))}
                <button
                  onClick={handleAddTab}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500 flex items-center gap-1 text-xs"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* View Width Mode Toggles */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl">
                <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`} title="Desktop View">
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`} title="Tablet View">
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`} title="Mobile View">
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Main Canvas Canvas */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/15 flex justify-center">
              <div className={`transition-all duration-300 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm ${
                previewMode === 'desktop' ? 'w-full' : previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}>
                {activeTab ? (
                  <div className="space-y-6">
                    <div className="pb-2 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{activeTab.tabName}</span>
                    </div>

                    {activeTab.sections.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
                        No sections inside this tab. Click "Add Section" on the left panel to begin.
                      </div>
                    ) : (
                      activeTab.sections.map((sec) => (
                        <div
                          key={sec.sectionId}
                          onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'section', id: sec.sectionId }); }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnSection(e, sec.sectionId)}
                          className={`relative border rounded-2xl p-5 transition-all ${
                            selectedElement?.id === sec.sectionId ? 'border-blue-500 bg-blue-50/10 dark:bg-slate-850/40 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/20 hover:border-slate-300 dark:hover:border-slate-705'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200">{sec.sectionName}</h3>
                              {sec.description && <p className="text-xs text-slate-400 dark:text-gray-400">{sec.description}</p>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2.5 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 font-medium">
                                {sec.columns} Column{sec.columns > 1 ? 's' : ''}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddFieldClick(sec.sectionId); }}
                                className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-xs px-3 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-300 flex items-center gap-1 font-semibold transition-all border border-indigo-100 dark:border-indigo-900/40"
                              >
                                <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Field
                              </button>
                            </div>
                          </div>

                          {/* Fields inside Section Grid */}
                          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${sec.columns}, minmax(0, 1fr))` }}>
                            {sec.fields.map((fld) => (
                              <div
                                key={fld.fieldId}
                                onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'field', id: fld.fieldId }); }}
                                className={`relative border rounded-xl p-3.5 transition-all ${
                                  selectedElement?.id === fld.fieldId
                                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-500'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex flex-wrap items-center gap-1.5 max-w-[75%]">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                                      {fld.label} {fld.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {fld.rules && fld.rules.length > 0 && (
                                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 font-bold whitespace-nowrap" title={`${fld.rules.length} rule(s) configured`}>
                                        🔗 Dependent
                                      </span>
                                    )}
                                    {getFieldDependentsCount(fld.fieldKey) > 0 && (
                                      <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40 font-bold whitespace-nowrap" title={`${getFieldDependentsCount(fld.fieldKey)} field(s) depend on this`}>
                                        ⚡ Parent ({getFieldDependentsCount(fld.fieldKey)})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleMoveField(fld.fieldId, sec.sectionId, 'up'); }} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500">
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleMoveField(fld.fieldId, sec.sectionId, 'down'); }} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500">
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleCloneField(fld.fieldId, sec.sectionId); }} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500" title="Clone">
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteField(fld.fieldId); }} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500" title="Delete">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Placeholder visual fields */}
                                {['TextBox', 'Email', 'Phone', 'Number', 'Currency'].includes(fld.fieldType) && (
                                  <input type="text" disabled placeholder={fld.placeholder || 'Text Input'} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full" />
                                )}
                                {fld.fieldType === 'TextArea' && (
                                  <textarea disabled placeholder={fld.placeholder} rows={2} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full resize-none" />
                                )}
                                {fld.fieldType === 'RichText' && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 dark:text-slate-500 w-full h-12 flex items-center justify-between">
                                    <span>WYSIWYG Rich Text Content...</span>
                                    <Bold className="h-4 w-4" />
                                  </div>
                                )}
                                {fld.fieldType === 'Dropdown' && (
                                  <select disabled className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full">
                                    <option>{fld.defaultValue || 'Select Option...'}</option>
                                  </select>
                                )}
                                {fld.fieldType === 'MultiSelect' && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full flex gap-1.5">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300">Option 1</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300">Option 2</span>
                                  </div>
                                )}
                                {fld.fieldType === 'Toggle' && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-4 bg-blue-600 rounded-full relative"><div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5"></div></div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Enabled</span>
                                  </div>
                                )}
                                {fld.fieldType === 'Checkbox' && (
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" disabled checked className="rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Checkmark choice</span>
                                  </div>
                                )}
                                {['Date', 'DateTime'].includes(fld.fieldType) && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full flex justify-between items-center">
                                    <span>Select Calendar date...</span>
                                    <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                  </div>
                                )}
                                {fld.fieldType === 'UserPicker' && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full flex justify-between items-center">
                                    <span>Search LDAP user...</span>
                                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                  </div>
                                )}
                                {fld.fieldType === 'GroupPicker' && (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 w-full flex justify-between items-center">
                                    <span>Search AD group...</span>
                                    <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                  </div>
                                )}
                                {fld.fieldType === 'DynamicTable' && (
                                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[10px]">
                                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-gray-300 font-bold border-b border-slate-200 dark:border-slate-800 flex justify-between">
                                      <span>Dynamic row grid</span>
                                      <span className="text-blue-600 dark:text-blue-400 cursor-pointer">+ Add row</span>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 italic text-center">No rows submitted yet.</div>
                                  </div>
                                )}

                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 italic font-medium">{fld.fieldType} ({fld.fieldKey})</p>
                              </div>
                            ))}
                          </div>

                          {/* Empty section state dropzone */}
                          {sec.fields.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-805 rounded-xl text-slate-450 dark:text-slate-500 text-xs mt-3">
                              Drag components here from the Palette
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-500 font-medium">
                    No active tab selected. Add tabs on the left.
                  </div>
                )}
              </div>
              </div>

          </div>

          {/* RIGHT PANEL: Property Inspector */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">Properties Panel</span>

            {selectedElement ? (
              <div className="flex flex-col h-full">
                {/* Properties Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 text-xs font-semibold">
                  {['general', 'validation', 'appearance', 'rules', 'advanced'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPropertyTab(tab as any)}
                      className={`py-2 flex-1 capitalize border-b-2 text-center transition-all ${
                        propertyTab === tab ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Properties Editors */}
                {selectedElement.type === 'field' && (
                  <div className="space-y-4 text-xs flex-1">
                    {/* General tab */}
                    {propertyTab === 'general' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Field Label</label>
                          <input
                            type="text"
                            value={getSelectedField()?.label || ''}
                            onChange={(e) => updateSelectedField(f => f.label = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Field Key (Binding)</label>
                          <input
                            type="text"
                            value={getSelectedField()?.fieldKey || ''}
                            onChange={(e) => updateSelectedField(f => f.fieldKey = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Field Type</label>
                          <select
                            value={getSelectedField()?.fieldType || 'TextBox'}
                            onChange={(e) => updateSelectedField(f => f.fieldType = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          >
                            {PALETTE_COMPONENTS.map(c => <option key={c.type} value={c.type}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Placeholder</label>
                          <input
                            type="text"
                            value={getSelectedField()?.placeholder || ''}
                            onChange={(e) => updateSelectedField(f => f.placeholder = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Help Text</label>
                          <input
                            type="text"
                            value={getSelectedField()?.helpText || ''}
                            onChange={(e) => updateSelectedField(f => f.helpText = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Default Value</label>
                          <input
                            type="text"
                            value={getSelectedField()?.defaultValue || ''}
                            onChange={(e) => updateSelectedField(f => f.defaultValue = e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.required}
                              onChange={(e) => updateSelectedField(f => f.required = e.target.checked)}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Required
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.readOnly}
                              onChange={(e) => updateSelectedField(f => f.readOnly = e.target.checked)}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Read Only
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.hidden}
                              onChange={(e) => updateSelectedField(f => f.hidden = e.target.checked)}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Hidden
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Validation tab */}
                    {propertyTab === 'validation' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Min Length</label>
                          <input
                            type="number"
                            value={getSelectedField()?.validation?.minLength || ''}
                            onChange={(e) => updateSelectedField(f => f.validation = { ...f.validation, minLength: Number(e.target.value) })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Max Length</label>
                          <input
                            type="number"
                            value={getSelectedField()?.validation?.maxLength || ''}
                            onChange={(e) => updateSelectedField(f => f.validation = { ...f.validation, maxLength: Number(e.target.value) })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Regex Pattern</label>
                          <input
                            type="text"
                            value={getSelectedField()?.validation?.regex || ''}
                            onChange={(e) => updateSelectedField(f => f.validation = { ...f.validation, regex: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Validation Error Message</label>
                          <input
                            type="text"
                            value={getSelectedField()?.validation?.errorMessage || ''}
                            onChange={(e) => updateSelectedField(f => f.validation = { ...f.validation, errorMessage: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Appearance tab */}
                    {propertyTab === 'appearance' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Width Span</label>
                          <select
                            value={getSelectedField()?.appearance?.width || '100%'}
                            onChange={(e) => updateSelectedField(f => f.appearance = { ...f.appearance, width: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          >
                            <option value="25%">25% Width</option>
                            <option value="50%">50% Width</option>
                            <option value="75%">75% Width</option>
                            <option value="100%">100% (Full Row)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">CSS Class Names</label>
                          <input
                            type="text"
                            value={getSelectedField()?.appearance?.cssClass || ''}
                            onChange={(e) => updateSelectedField(f => f.appearance = { ...f.appearance, cssClass: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Border Radius</label>
                          <input
                            type="text"
                            value={getSelectedField()?.appearance?.borderRadius || ''}
                            onChange={(e) => updateSelectedField(f => f.appearance = { ...f.appearance, borderRadius: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Rules (Interactive conditional logic) tab */}
                    {propertyTab === 'rules' && (
                      <div className="space-y-4">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">Configure visual logic rules for this field.</span>
                        
                        {/* Rules list */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Active Rules</span>
                          {(getSelectedField()?.rules || []).length > 0 ? (
                            (getSelectedField()?.rules || []).map((rule) => (
                              <div key={rule.ruleId} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-start justify-between gap-2">
                                <div className="text-[11px] text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">IF</span> <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">{rule.triggerField}</code> <span className="font-bold">{rule.operator}</span> <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">"{rule.value}"</code>
                                  <br/>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">THEN</span> <span className="font-semibold">{rule.action.replace('_', ' ')}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    updateSelectedField(f => {
                                      f.rules = (f.rules || []).filter(r => r.ruleId !== rule.ruleId);
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-650 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Delete Rule"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic block">No active trigger rules.</span>
                          )}
                        </div>

                        {/* Add Rule Form */}
                        {getAllOtherFields().length > 0 ? (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-3">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block border-b border-slate-200 dark:border-slate-800 pb-1">Create New Rule</span>
                            <div>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">IF Field</span>
                              <select
                                value={ruleTriggerField}
                                onChange={(e) => setRuleTriggerField(e.target.value)}
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                {getAllOtherFields().map(f => (
                                  <option key={f.fieldId} value={f.fieldKey}>{f.label} ({f.fieldKey})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">Operator</span>
                              <select
                                value={ruleOperator}
                                onChange={(e) => setRuleOperator(e.target.value as any)}
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="==">equals (==)</option>
                                <option value="!=">not equals (!=)</option>
                                <option value=">">greater than (&gt;)</option>
                                <option value="<">less than (&lt;)</option>
                                <option value="contains">contains</option>
                                <option value="empty">empty</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">Value</span>
                              <input
                                type="text"
                                value={ruleValue}
                                onChange={(e) => setRuleValue(e.target.value)}
                                placeholder="Value to trigger on..."
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">THEN Action</span>
                              <select
                                value={ruleAction}
                                onChange={(e) => setRuleAction(e.target.value as any)}
                                className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="SHOW">Show This Field</option>
                                <option value="HIDE">Hide This Field</option>
                                <option value="MAKE_REQUIRED">Make Required</option>
                                <option value="READ_ONLY">Read Only</option>
                              </select>
                            </div>
                            <button
                              onClick={handleAddRule}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                              + Add Rule Clause
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic block">No other fields available to trigger rules.</span>
                        )}

                        {/* Dependent Fields (Derived) list */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-505 font-bold uppercase tracking-wider block">Dependent Fields (Derived)</span>
                          {getDependentFields().length > 0 ? (
                            <div className="space-y-2">
                              {getDependentFields().map(({ field, rule }) => (
                                <div key={`${field.fieldId}_${rule.ruleId}`} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
                                  <div className="text-[11px] text-slate-700 dark:text-slate-355 leading-relaxed font-semibold">
                                    • {field.label} <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded text-[10px] border border-slate-250 dark:border-slate-805 text-indigo-600 dark:text-indigo-400">({field.fieldKey})</code>
                                  </div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 pl-2.5 font-medium">
                                    Will <span className="font-semibold text-emerald-600 dark:text-emerald-400">{rule.action.replace('_', ' ')}</span> if this field {rule.operator} "{rule.value}"
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 dark:text-slate-505 italic font-medium">
                              No other fields depend on this field.
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Advanced tab */}
                    {propertyTab === 'advanced' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">API Mapping Name</label>
                          <input
                            type="text"
                            value={getSelectedField()?.advanced?.apiMapping || ''}
                            onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, apiMapping: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Mongo Property Name</label>
                          <input
                            type="text"
                            value={getSelectedField()?.advanced?.mongoPropertyName || ''}
                            onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, mongoPropertyName: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">JSON Path Mapping</label>
                          <input
                            type="text"
                            value={getSelectedField()?.advanced?.jsonPath || ''}
                            onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, jsonPath: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.advanced?.auditEnabled}
                              onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, auditEnabled: e.target.checked })}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Audit Trail Enabled
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.advanced?.searchable}
                              onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, searchable: e.target.checked })}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Index & Searchable
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!getSelectedField()?.advanced?.exportable}
                              onChange={(e) => updateSelectedField(f => f.advanced = { ...f.advanced, exportable: e.target.checked })}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            /> Exportable (XML/JSON)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section properties editor */}
                {selectedElement.type === 'section' && (
                  <div className="space-y-4 text-xs flex-1">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Section Name</label>
                      <input
                        type="text"
                        value={getSelectedSection()?.sectionName || ''}
                        onChange={(e) => updateSelectedSection(s => s.sectionName = e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Grid Columns</label>
                      <select
                        value={getSelectedSection()?.columns || 2}
                        onChange={(e) => updateSelectedSection(s => s.columns = Number(e.target.value))}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value={1}>1 Column</option>
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Background Color</label>
                      <input
                        type="text"
                        value={getSelectedSection()?.backgroundColor || ''}
                        onChange={(e) => updateSelectedSection(s => s.backgroundColor = e.target.value)}
                        placeholder="e.g. #1e293b"
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Border Style</label>
                      <select
                        value={getSelectedSection()?.borderStyle || 'none'}
                        onChange={(e) => updateSelectedSection(s => s.borderStyle = e.target.value as any)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value="none">No Border</option>
                        <option value="solid">Solid Border</option>
                        <option value="dashed">Dashed Border</option>
                        <option value="dotted">Dotted Border</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!getSelectedSection()?.collapsible}
                          onChange={(e) => updateSelectedSection(s => s.collapsible = e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        /> Collapsible
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-350 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!getSelectedSection()?.expandedByDefault}
                          onChange={(e) => updateSelectedSection(s => s.expandedByDefault = e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        /> Expanded By Default
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                Select any field or section in the tree/canvas to inspect properties.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SAVE REVISION CONFIRMATION MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Save Template Revision
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Provide a change log message for version audit history:
            </p>
            <textarea
              placeholder="e.g. Added user picker field, updated validation constraints..."
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-white w-full resize-none h-24 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button onClick={() => setShowSaveModal(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-700 dark:text-white transition-all font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmSave} className="bg-wf-red hover:bg-red-700 px-4 py-2 rounded-xl text-white transition-all font-semibold shadow-md shadow-red-500/10">
                Confirm & Create Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW FIELD DIALOG */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Field Definition
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Field Type</label>
                <select
                  value={newFieldData.fieldType}
                  onChange={(e) => setNewFieldData({ ...newFieldData, fieldType: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  {PALETTE_COMPONENTS.map(c => <option key={c.type} value={c.type}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Display Label</label>
                <input
                  type="text"
                  value={newFieldData.label}
                  onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
                  placeholder="e.g. First Name"
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Field Key (JSON property)</label>
                <input
                  type="text"
                  value={newFieldData.fieldKey}
                  onChange={(e) => setNewFieldData({ ...newFieldData, fieldKey: e.target.value })}
                  placeholder="e.g. firstName"
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">Placeholder Text</label>
                <input
                  type="text"
                  value={newFieldData.placeholder}
                  onChange={(e) => setNewFieldData({ ...newFieldData, placeholder: e.target.value })}
                  placeholder="Enter details..."
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white w-full outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
              <button onClick={() => setIsFieldModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-700 dark:text-white transition-all font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmAddField} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-white transition-all font-semibold shadow-md shadow-indigo-500/10">
                Add to Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
