import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Search, Plus, ArrowLeft, Bookmark, MessageSquare, HelpCircle, 
  Download, Save, Trash2, Calendar, Upload, User, Users, 
  CheckCircle2, AlertCircle, FileText, ChevronRight, Send, 
  Layers, Settings, Code, Activity, Info, Bold, Clock, RefreshCw,
  TrendingUp, ExternalLink, Check, Play, ShieldAlert, Monitor, Smartphone,
  BookOpen, Terminal, ClipboardCheck
} from 'lucide-react';
import { MessageTemplate, FormTab, FormSection, FormField, MessageInstance, MessageNote as Note } from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import Layout from '../../components/Layout';
import FollowUpTab from './FollowUpTab';

// Custom rich template built to match the wireframe and rules exactly
const wireframeTemplate: MessageTemplate = {
  templateId: 'tmpl_welcome_email',
  templateName: 'Welcome Email Template',
  description: 'Standard welcome email sent to onboarded customer segments.',
  version: '2.0',
  createdDate: new Date().toISOString(),
  updatedDate: new Date().toISOString(),
  tabs: [
    {
      tabId: 'tab_main',
      tabName: 'New Message',
      order: 0,
      sections: [
        {
          sectionId: 'sec_basic_info',
          sectionName: 'Basic Information',
          description: 'Core messaging fields',
          icon: 'Info',
          collapsible: true,
          expandedByDefault: true,
          columns: 2,
          order: 0,
          fields: [
            {
              fieldId: 'fld_msg_name',
              fieldKey: 'messageName',
              fieldType: 'TextBox',
              label: 'Message Name',
              placeholder: 'e.g., Welcome Email Campaign',
              helpText: 'Provide a clear, descriptive name following the WF Naming Standard (e.g., RET_ONB_WELCOME_EMAIL_V1). Avoid spaces or special characters in the key code.',
              defaultValue: 'Welcome Email Campaign',
              required: true,
              readOnly: false,
              hidden: false
            },
            {
              fieldId: 'fld_msg_id',
              fieldKey: 'messageId',
              fieldType: 'TextBox',
              label: 'Message ID',
              placeholder: 'e.g., MSG-001',
              helpText: 'This unique alphanumeric ID is auto-assigned or matched with your Tridion catalog key.',
              defaultValue: 'MSG-001',
              required: true,
              readOnly: false,
              hidden: false
            },
            {
              fieldId: 'fld_msg_type',
              fieldKey: 'messageType',
              fieldType: 'Dropdown',
              label: 'Message Type',
              placeholder: 'Select message type...',
              helpText: `We do not have "legacy, v22, v23 shells." The appropriate terminology to use is "shell channel."\n\nLegacy channel: Line of Business/Upstream application(s) maintain the email design and body content and are responsible for ADA compliance. Uses the legacy template.\n\nModernized/Kafka channel: Line of Business/Upstream application(s) maintain the email design and content and are responsible for ADA compliance. The email content sent by the upstream includes the entire email (including logo, header, footer). Alerts or the upstream system can host the static images. Upstream systems can use Kafka or ANG Kafka adaptors. Uses the v23 template.\n\nV22 Shell: A few alerts were created using v22, but v22 shells are not supported.`,
              defaultValue: 'Shell',
              required: true,
              readOnly: false,
              hidden: false,
              validation: { allowedValues: ['Shell', 'Regular'] }
            },
            {
              fieldId: 'fld_desc',
              fieldKey: 'description',
              fieldType: 'TextArea',
              label: 'Description',
              placeholder: 'Enter message description...',
              helpText: 'Detailed summary of the business intent, frequency, and audience segment.',
              defaultValue: 'Welcome notification for retail customers onboarding to alerts.',
              required: false,
              readOnly: false,
              hidden: false
            }
          ]
        },
        {
          sectionId: 'sec_msg_conf',
          sectionName: 'Message Configuration',
          description: 'Operational parameters',
          icon: 'Settings',
          collapsible: true,
          expandedByDefault: true,
          columns: 2,
          order: 1,
          fields: [
            {
              fieldId: 'fld_priority',
              fieldKey: 'priority',
              fieldType: 'Dropdown',
              label: 'Priority Level',
              placeholder: 'Select priority...',
              helpText: 'Select the SRE routing priority. Critical alerts bypass non-operational queues.',
              defaultValue: 'Medium',
              required: true,
              readOnly: false,
              hidden: false,
              validation: { allowedValues: ['High', 'Medium', 'Low', 'Critical'] }
            },
            {
              fieldId: 'fld_business_unit',
              fieldKey: 'businessUnit',
              fieldType: 'Dropdown',
              label: 'Business Unit',
              placeholder: 'Select business unit...',
              helpText: 'The originating Line of Business responsible for auditing and content approval.',
              defaultValue: 'Retail Banking',
              required: true,
              readOnly: false,
              hidden: false,
              validation: { allowedValues: ['Retail Banking', 'Wealth Management', 'Corporate Investment', 'Consumer Lending'] }
            },
            {
              fieldId: 'fld_new_branding',
              fieldKey: 'newBranding',
              fieldType: 'Toggle',
              label: 'New Branding',
              helpText: 'Toggle Yes to override default template themes with customized logo placements and CSS colors.',
              defaultValue: 'false',
              required: false,
              readOnly: false,
              hidden: false
            }
          ]
        },
        {
          sectionId: 'sec_branding_details',
          sectionName: 'Branding Details',
          description: 'Custom brand styling parameters',
          icon: 'Palette',
          collapsible: true,
          expandedByDefault: true,
          columns: 3,
          order: 2,
          fields: [
            {
              fieldId: 'fld_brand_template',
              fieldKey: 'brandTemplate',
              fieldType: 'Dropdown',
              label: 'Brand Template',
              placeholder: 'Select template...',
              helpText: 'The master layout framework for styling components.',
              defaultValue: 'Standard Email',
              required: true,
              readOnly: false,
              hidden: false,
              rules: [
                {
                  ruleId: 'r_brand_show',
                  triggerField: 'newBranding',
                  operator: '==',
                  value: 'true',
                  action: 'SHOW'
                },
                {
                  ruleId: 'r_brand_hide',
                  triggerField: 'newBranding',
                  operator: '!=',
                  value: 'true',
                  action: 'HIDE'
                }
              ],
              validation: { allowedValues: ['Standard Email', 'High Net Worth', 'Corporate Alert'] }
            },
            {
              fieldId: 'fld_color_scheme',
              fieldKey: 'colorScheme',
              fieldType: 'Dropdown',
              label: 'Color Scheme',
              placeholder: 'Select color scheme...',
              helpText: 'Theme color palette for buttons, borders, and header bars.',
              defaultValue: 'Wells Red/Gold',
              required: true,
              readOnly: false,
              hidden: false,
              rules: [
                {
                  ruleId: 'r_color_show',
                  triggerField: 'newBranding',
                  operator: '==',
                  value: 'true',
                  action: 'SHOW'
                },
                {
                  ruleId: 'r_color_hide',
                  triggerField: 'newBranding',
                  operator: '!=',
                  value: 'true',
                  action: 'HIDE'
                }
              ],
              validation: { allowedValues: ['Wells Red/Gold', 'Corporate Slate', 'Emerald Safe'] }
            },
            {
              fieldId: 'fld_logo_version',
              fieldKey: 'logoVersion',
              fieldType: 'Dropdown',
              label: 'Logo Version',
              placeholder: 'Select logo...',
              helpText: 'High-res image asset version for header scaling.',
              defaultValue: 'V2 Modernized',
              required: true,
              readOnly: false,
              hidden: false,
              rules: [
                {
                  ruleId: 'r_logo_show',
                  triggerField: 'newBranding',
                  operator: '==',
                  value: 'true',
                  action: 'SHOW'
                },
                {
                  ruleId: 'r_logo_hide',
                  triggerField: 'newBranding',
                  operator: '!=',
                  value: 'true',
                  action: 'HIDE'
                }
              ],
              validation: { allowedValues: ['V1 Classic', 'V2 Modernized', 'V3 Flat Minimal'] }
            }
          ]
        }
      ]
    },
    {
      tabId: 'tab_recipients',
      tabName: 'Recipients',
      order: 1,
      sections: [
        {
          sectionId: 'sec_rec_details',
          sectionName: 'Recipient Details',
          collapsible: false,
          expandedByDefault: true,
          columns: 2,
          order: 0,
          fields: [
            {
              fieldId: 'fld_email',
              fieldKey: 'email',
              fieldType: 'Email',
              label: 'Destination Email',
              placeholder: 'e.g. user@wellsfargo.com',
              helpText: 'Direct destination for validation alerts.',
              required: true,
              readOnly: false,
              hidden: false,
              validation: { regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', errorMessage: 'Must be a valid Wells Fargo email address.' }
            },
            {
              fieldId: 'fld_user_grp',
              fieldKey: 'userGroup',
              fieldType: 'GroupPicker',
              label: 'User Group Access',
              helpText: 'Active directory group mapped for template permissions.',
              defaultValue: 'RETAIL_CUSTOMERS',
              required: true,
              readOnly: false,
              hidden: false
            }
          ]
        }
      ]
    },
    {
      tabId: 'tab_links',
      tabName: 'Links',
      order: 2,
      sections: [
        {
          sectionId: 'sec_links_details',
          sectionName: 'Link Configuration',
          columns: 1,
          fields: [
            {
              fieldId: 'fld_cta_link',
              fieldKey: 'ctaLink',
              fieldType: 'TextBox',
              label: 'Call to Action Link',
              placeholder: 'https://...',
              helpText: 'Deep link routing target (must be https)',
              defaultValue: 'https://online.wellsfargo.com',
              required: false,
              readOnly: false,
              hidden: false
            }
          ]
        }
      ]
    },
    {
      tabId: 'tab_processing',
      tabName: 'Processing',
      order: 3,
      sections: [
        {
          sectionId: 'sec_proc_details',
          sectionName: 'Processing Logic',
          columns: 2,
          fields: [
            {
              fieldId: 'fld_retry_count',
              fieldKey: 'retryCount',
              fieldType: 'Number',
              label: 'Retry Count Limit',
              placeholder: 'e.g., 3',
              helpText: 'Max delivery attempts before dropping to dead-letter queue.',
              defaultValue: '3',
              required: true,
              readOnly: false,
              hidden: false
            }
          ]
        }
      ]
    },
    {
      tabId: 'tab_downstream',
      tabName: 'Downstream',
      order: 4,
      sections: [
        {
          sectionId: 'sec_downstream_details',
          sectionName: 'Downstream Integrations',
          columns: 2,
          fields: [
            {
              fieldId: 'fld_kafka_topic',
              fieldKey: 'kafkaTopic',
              fieldType: 'TextBox',
              label: 'Kafka Output Topic',
              placeholder: 'wf-alerts-topic',
              helpText: 'Downstream message queue destination.',
              defaultValue: 'wf-retail-alerts-outbound',
              required: true,
              readOnly: false,
              hidden: false
            }
          ]
        }
      ]
    },
    {
      tabId: 'tab_followup',
      tabName: 'Follow Up',
      order: 5,
      sections: [
        {
          sectionId: 'sec_followup_details',
          sectionName: 'Follow Up Tasks',
          columns: 2,
          fields: [
            {
              fieldId: 'fld_followup_email',
              fieldKey: 'followupEmail',
              fieldType: 'Email',
              label: 'Escalation Email',
              placeholder: 'sre-alerts@wellsfargo.com',
              helpText: 'Secondary mailbox notified if primary delivery fails.',
              defaultValue: 'alerts-support@wellsfargo.com',
              required: false,
              readOnly: false,
              hidden: false
            }
          ]
        }
      ]
    }
  ]
};

export default function NewMessageDynamic() {
  // Navigation: list or create
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('tmpl_welcome_email');
  const [currentTemplate, setCurrentTemplate] = useState<MessageTemplate | null>(null);
  const [messages, setMessages] = useState<MessageInstance[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageInstance | null>(null);

  // Layout tabs
  const [activeMainTab, setActiveMainTab] = useState<'Requirements' | 'Content' | 'Deploy' | 'Project Status' | 'Documentation' | 'Follow Up'>('Requirements');
  const [activeSubTabId, setActiveSubTabId] = useState('tab_main');

  // Bookmarks, Notes, and Help states
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [activeHelp, setActiveHelp] = useState<Record<string, boolean>>({});

  // Notes Modal state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesModalFieldKey, setNotesModalFieldKey] = useState('');
  const [notesModalFieldLabel, setNotesModalFieldLabel] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Ishika');
  const [newNoteText, setNewNoteText] = useState('');

  // Live preview device
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form engine
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm();
  const formValues = watch();

  useEffect(() => {
    // Seed templates failsafe
    const tList = localStorage.getItem('alertsiq_dynamic_templates');
    let templatesData = [];
    if (tList) {
      try {
        templatesData = JSON.parse(tList);
      } catch (e) {
        templatesData = [];
      }
    }

    const hasRichTemplate = templatesData.some(
      (t: any) => t.templateId === 'tmpl_welcome_email' && t.tabs && t.tabs.length >= 6
    );

    if (!hasRichTemplate) {
      const filtered = templatesData.filter((t: any) => t.templateId !== 'tmpl_welcome_email');
      filtered.push(wireframeTemplate);
      localStorage.setItem('alertsiq_dynamic_templates', JSON.stringify(filtered));
    }

    // Seed Messages Database
    const mList = localStorage.getItem('alertsiq_created_messages');
    let seededMsg: MessageInstance[] = [];
    if (!mList) {
      seededMsg = [
        {
          messageId: 'MSG-001',
          messageName: 'Welcome Email Campaign',
          messageType: 'Shell',
          channels: ['Email', 'SMS'],
          status: 'Active',
          lastModified: '2026-06-01',
          templateId: 'tmpl_welcome_email',
          formValues: {
            messageName: 'Welcome Email Campaign',
            messageId: 'MSG-001',
            messageType: 'Shell',
            description: 'Welcome notification for retail customers onboarding to retail alerts.',
            priority: 'Medium',
            businessUnit: 'Retail Banking',
            newBranding: false
          },
          bookmarks: {
            messageName: true
          },
          notes: {
            messageName: [
              {
                id: 'n1',
                author: 'Ishika',
                text: 'Hello',
                timestamp: '15 Jun 2026 - 16:07'
              },
              {
                id: 'n2',
                author: 'Ishika',
                text: 'hello',
                timestamp: '15 Jun 2026 - 16:07'
              }
            ]
          }
        },
        {
          messageId: 'MSG-002',
          messageName: 'Payment Reminder',
          messageType: 'Regular',
          channels: ['Email'],
          status: 'Active',
          lastModified: '2026-05-28',
          templateId: 'tmpl_welcome_email',
          formValues: {
            messageName: 'Payment Reminder',
            messageId: 'MSG-002',
            messageType: 'Regular',
            description: 'Reminder message to settle outstanding credit balances.',
            priority: 'High',
            businessUnit: 'Consumer Lending',
            newBranding: false
          },
          bookmarks: {},
          notes: {}
        },
        {
          messageId: 'MSG-003',
          messageName: 'Monthly Newsletter',
          messageType: 'Shell',
          channels: ['Email', 'Push'],
          status: 'Draft',
          lastModified: '2026-05-25',
          templateId: 'tmpl_welcome_email',
          formValues: {
            messageName: 'Monthly Newsletter',
            messageId: 'MSG-003',
            messageType: 'Shell',
            description: 'Standard monthly retail newsletter update.',
            priority: 'Low',
            businessUnit: 'Wealth Management',
            newBranding: false
          },
          bookmarks: {},
          notes: {}
        },
        {
          messageId: 'MSG-004',
          messageName: 'Order Confirmation',
          messageType: 'Regular',
          channels: ['Email', 'SMS'],
          status: 'Active',
          lastModified: '2026-05-20',
          templateId: 'tmpl_welcome_email',
          formValues: {
            messageName: 'Order Confirmation',
            messageId: 'MSG-004',
            messageType: 'Regular',
            description: 'Sent upon successful checkout completion.',
            priority: 'High',
            businessUnit: 'Retail Banking',
            newBranding: false
          },
          bookmarks: {},
          notes: {}
        }
      ];
      localStorage.setItem('alertsiq_created_messages', JSON.stringify(seededMsg));
    } else {
      try {
        seededMsg = JSON.parse(mList);
      } catch (e) {
        seededMsg = [];
      }
    }
    setMessages(seededMsg);

    // Initial load
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await formBuilderService.getTemplates();
      setTemplates(data);
      const initialTemplateId = data.some(t => t.templateId === 'tmpl_welcome_email') 
        ? 'tmpl_welcome_email' 
        : (data[0]?.templateId || '');
      setSelectedTemplateId(initialTemplateId);
      loadTemplate(initialTemplateId);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      const template = await formBuilderService.getTemplate(id);
      setCurrentTemplate(template);
      if (template.tabs.length > 0) {
        setActiveSubTabId(template.tabs[0].tabId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    loadTemplate(id);
  };

  // Helper date formatter
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d} ${m} ${y} - ${hr}:${min}`;
  };

  // Bookmark actions
  const handleToggleBookmark = async (fieldKey: string) => {
    const nextVal = !bookmarks[fieldKey];
    const newBookmarks = { ...bookmarks, [fieldKey]: nextVal };
    setBookmarks(newBookmarks);

    if (selectedMessage) {
      const updated = { ...selectedMessage, bookmarks: newBookmarks };
      setSelectedMessage(updated);
      await updateMessageInstance(updated);
    }
  };

  // Notes Modal actions
  const handleOpenNotes = (fieldKey: string, fieldLabel: string) => {
    setNotesModalFieldKey(fieldKey);
    setNotesModalFieldLabel(fieldLabel);
    setNewNoteText('');
    setIsNotesModalOpen(true);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      author: newNoteAuthor || 'Ishika',
      text: newNoteText,
      timestamp: formatDate(new Date())
    };

    const currentFieldNotes = notes[notesModalFieldKey] || [];
    const newNotes = { ...notes, [notesModalFieldKey]: [...currentFieldNotes, newNote] };
    setNotes(newNotes);
    setNewNoteText('');

    if (selectedMessage) {
      const updated = { ...selectedMessage, notes: newNotes };
      setSelectedMessage(updated);
      await updateMessageInstance(updated);
    }
  };

  const handleDeleteNote = async (fieldKey: string, noteId: string) => {
    const currentFieldNotes = notes[fieldKey] || [];
    const newNotes = { ...notes, [fieldKey]: currentFieldNotes.filter(n => n.id !== noteId) };
    setNotes(newNotes);

    if (selectedMessage) {
      const updated = { ...selectedMessage, notes: newNotes };
      setSelectedMessage(updated);
      await updateMessageInstance(updated);
    }
  };

  // Help panel toggler
  const handleToggleHelp = (fieldKey: string) => {
    setActiveHelp(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // Stepper count of bookmarks/notes in secondary tabs
  const getTabBadgeCount = (tab: FormTab) => {
    let count = 0;
    tab.sections.forEach(sec => {
      sec.fields.forEach(f => {
        if (bookmarks[f.fieldKey]) count++;
        if (notes[f.fieldKey] && notes[f.fieldKey].length > 0) {
          count += notes[f.fieldKey].length;
        }
      });
    });
    return count;
  };

  // Rule Evaluation Engine
  const getFieldState = (field: FormField) => {
    let isHidden = !!field.hidden;
    let isReadOnly = !!field.readOnly;
    let isRequired = !!field.required;

    if (field.rules && field.rules.length > 0) {
      field.rules.forEach(rule => {
        const triggerValue = formValues[rule.triggerField];
        let conditionMet = false;

        const val1 = String(triggerValue).toLowerCase();
        const val2 = String(rule.value).toLowerCase();

        switch (rule.operator) {
          case '==':
            conditionMet = val1 === val2;
            break;
          case '!=':
            conditionMet = val1 !== val2;
            break;
          case 'contains':
            conditionMet = val1.includes(val2);
            break;
          case 'empty':
            conditionMet = !triggerValue || triggerValue === '';
            break;
          default:
            break;
        }

        if (conditionMet) {
          if (rule.action === 'SHOW') isHidden = false;
          if (rule.action === 'HIDE') isHidden = true;
          if (rule.action === 'MAKE_REQUIRED') isRequired = true;
          if (rule.action === 'READ_ONLY') isReadOnly = true;
        }
      });
    }

    return { isHidden, isReadOnly, isRequired };
  };

  const getValidationRules = (field: FormField, isRequired: boolean) => {
    const validationRules: any = {};
    if (isRequired) {
      validationRules.required = `${field.label} is required.`;
    }
    if (field.validation) {
      if (field.validation.minLength) {
        validationRules.minLength = {
          value: field.validation.minLength,
          message: field.validation.errorMessage || `${field.label} must be at least ${field.validation.minLength} characters.`
        };
      }
      if (field.validation.maxLength) {
        validationRules.maxLength = {
          value: field.validation.maxLength,
          message: field.validation.errorMessage || `${field.label} cannot exceed ${field.validation.maxLength} characters.`
        };
      }
      if (field.validation.regex) {
        validationRules.pattern = {
          value: new RegExp(field.validation.regex),
          message: field.validation.errorMessage || `${field.label} does not match validation format.`
        };
      }
    }
    return validationRules;
  };

  // Save or Create submit handler
  const onSubmit = async (data: any) => {
    const newMsg: MessageInstance = {
      id: selectedMessage?.id,
      messageId: data.messageId || selectedMessage?.messageId || `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      messageName: data.messageName || 'Unnamed Message',
      messageType: data.messageType || 'Shell',
      channels: data.messageType === 'Shell' ? ['Email', 'SMS'] : ['Email'],
      status: selectedMessage ? selectedMessage.status : 'Active',
      lastModified: new Date().toISOString().split('T')[0],
      templateId: selectedTemplateId,
      formValues: data,
      bookmarks: bookmarks,
      notes: notes
    };

    try {
      const saved = await formBuilderService.saveMessage(newMsg);
      if (selectedMessage) {
        setMessages(prev => prev.map(m => (m.messageId === saved.messageId || m.id === saved.id) ? saved : m));
      } else {
        setMessages(prev => [saved, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save message:', e);
    }
    
    // Reset view
    setSelectedMessage(null);
    setBookmarks({});
    setNotes({});
    setActiveHelp({});
    setView('list');
  };

  // Navigating to Edit message
  const handleEditMessage = (msg: MessageInstance) => {
    setSelectedMessage(msg);
    setBookmarks(msg.bookmarks || {});
    setNotes(msg.notes || {});
    setActiveHelp({});
    setSelectedTemplateId(msg.templateId || 'tmpl_welcome_email');
    loadTemplate(msg.templateId || 'tmpl_welcome_email');
    reset(msg.formValues);
    setActiveMainTab('Requirements');
    setActiveSubTabId('tab_main');
    setView('create');
  };

  // Navigating to New message
  const handleNewMessage = () => {
    setSelectedMessage(null);
    setBookmarks({});
    setNotes({});
    setActiveHelp({});
    setSelectedTemplateId('tmpl_welcome_email');
    loadTemplate('tmpl_welcome_email');
    
    // Seed default form values
    reset({
      messageName: 'Welcome Email Campaign',
      messageId: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      messageType: 'Shell',
      description: 'Welcome notification for retail customers onboarding to retail alerts.',
      priority: 'Medium',
      businessUnit: 'Retail Banking',
      newBranding: false
    });
    
    setActiveMainTab('Requirements');
    setActiveSubTabId('tab_main');
    setView('create');
  };

  const handleDeleteMessage = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete message ID ${msgId}?`)) {
      try {
        await formBuilderService.deleteMessage(msgId);
        setMessages(prev => prev.filter(m => m.messageId !== msgId));
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  // Search filter
  const filteredMessages = messages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.messageId.toLowerCase().includes(query) ||
      m.messageName.toLowerCase().includes(query) ||
      m.messageType.toLowerCase().includes(query)
    );
  });

  const activeSubTab = currentTemplate?.tabs.find(t => t.tabId === activeSubTabId) || null;

  return (
    <Layout>
      {view === 'list' ? (
        // --- START VIEW: MESSAGE MANAGEMENT (LIST OF MESSAGES) ---
        <div className="w-full space-y-6 animate-fadeIn py-4 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                Message Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create and manage your messaging campaigns
              </p>
            </div>
            <button
              onClick={handleNewMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all duration-200"
            >
              <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
              Create New Message
            </button>
          </div>

          {/* Search bar bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by message name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none text-slate-700 dark:text-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            />
          </div>

          {/* Messages Grid Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-850 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Message ID</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Channels</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Last Modified</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                      <tr
                        key={msg.messageId}
                        onClick={() => handleEditMessage(msg)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors duration-150"
                      >
                        <td className="py-4.5 px-6 font-semibold text-slate-700 dark:text-slate-300">
                          {msg.messageId}
                        </td>
                        <td className="py-4.5 px-6 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{msg.messageName}</span>
                            {/* Render bookmark ribbon if bookmarked */}
                            {Object.values(msg.bookmarks || {}).some(Boolean) && (
                              <Bookmark className="h-3.5 w-3.5 text-blue-500 fill-current" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                          {msg.messageType}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            {msg.channels.map((chan, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
                                  chan === 'Email'
                                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-350 border-sky-100 dark:border-sky-900/30'
                                    : chan === 'SMS'
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 border-indigo-100 dark:border-indigo-900/30'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 border-emerald-100 dark:border-emerald-900/30'
                                }`}
                              >
                                {chan}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                              msg.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700'
                            }`}
                          >
                            {msg.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                          {msg.lastModified}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => handleDeleteMessage(e, msg.messageId)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No messages found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // --- CREATE/EDIT VIEW: NEW MESSAGE GUIDED SETUP ---
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 animate-fadeIn py-2 px-4">
          {/* Top Navigation Row (Back Button and Main Centered Stepper Navigation) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Message Management
              </button>
            </div>

            {/* Centered Main Phase Stepper Navigation (Fixed Tabs) */}
            <div className="flex gap-6 justify-center flex-1 md:justify-center flex-wrap">
              {(['Requirements', 'Content', 'Deploy', 'Project Status', 'Documentation', 'Follow Up'] as const).map(tab => {
                const bookmarkCount = tab === 'Follow Up' ? Object.values(bookmarks).filter(Boolean).length : 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveMainTab(tab)}
                    className={`py-3 text-sm font-bold border-b-2 transition-all relative -mb-[14px] flex items-center gap-1.5 ${
                      activeMainTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                    }`}
                  >
                    {tab}
                    {tab === 'Requirements' && (
                      <span className="absolute -top-1 -right-4 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    )}
                    {tab === 'Follow Up' && bookmarkCount > 0 && (
                      <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black shadow">
                        {bookmarkCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hidden spacer on desktop to balance the layout and keep tabs perfectly centered */}
            <div className="w-48 hidden md:block"></div>
          </div>

          {/* Tab Content Router */}
          <div className={activeMainTab === 'Requirements' ? 'block' : 'hidden'}>
            {/* --- REQUIREMENTS TAB: MAIN METADATA FORM BUILDER --- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">
              
              {/* Header toolbar (Rendered inside the Requirements Tab Panel) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 p-6 bg-slate-50/20 dark:bg-slate-950/10">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {selectedMessage ? 'Edit Message Details' : 'Create New Message'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete the guided setup process
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Template Scheme:</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 mr-4"
                  >
                    {templates.map(t => (
                      <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formValues, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `message_setup_${formValues.messageId || 'draft'}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.02)]"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
                  >
                    <Save className="h-4 w-4" />
                    Save Message
                  </button>
                </div>
              </div>
              
              {/* Secondary tab row (Dynamic Template tabs: e.g. New Message, Recipients, etc.) */}
              {currentTemplate && currentTemplate.tabs.length > 0 && (
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/80 px-6 py-4 flex flex-wrap gap-2.5">
                  {currentTemplate.tabs.map(tab => {
                    const badgeCount = getTabBadgeCount(tab);
                    return (
                      <button
                        key={tab.tabId}
                        type="button"
                        onClick={() => setActiveSubTabId(tab.tabId)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center gap-1.5 ${
                          activeSubTabId === tab.tabId
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {tab.tabName}
                        {badgeCount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black scale-95 shadow">
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Form Canvas Render */}
              <div className="p-8">
                {currentTemplate ? (
                  <div className="space-y-8">
                    {activeSubTab && (
                      <div className="space-y-8 animate-fadeIn">
                        {activeSubTab.sections.map((sec) => {
                          // Check if section fields are all hidden or not
                          const visibleFields = sec.fields.filter(f => !getFieldState(f).isHidden);
                          if (visibleFields.length === 0) return null;

                          return (
                            <div key={sec.sectionId} className="space-y-5">
                              <div className="pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                  {sec.sectionName}
                                </h3>
                                {sec.description && (
                                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    {sec.description}
                                  </p>
                                )}
                              </div>

                              <div 
                                className="grid gap-6" 
                                style={{ gridTemplateColumns: `repeat(${sec.columns}, minmax(0, 1fr))` }}
                              >
                                {sec.fields.map((fld) => {
                                  const { isHidden, isReadOnly, isRequired } = getFieldState(fld);
                                  if (isHidden) return null;

                                  const isBookmarked = !!bookmarks[fld.fieldKey];
                                  const fieldNotes = notes[fld.fieldKey] || [];
                                  const notesCount = fieldNotes.length;

                                  return (
                                    <div 
                                      key={fld.fieldId} 
                                      className={`space-y-1.5 transition-all p-2 rounded-xl ${
                                        isBookmarked 
                                          ? 'bg-blue-50/10 dark:bg-blue-950/5 ring-1 ring-blue-500/20' 
                                          : ''
                                      }`}
                                    >
                                      {/* Field Header: Label on Left, Bookmarks/Notes/Help on Right */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {fld.label} {isRequired && <span className="text-red-500">*</span>}
                                          </label>
                                          {isBookmarked && (
                                            <span className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/40 font-bold whitespace-nowrap">
                                              • Bookmarked
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Action Bar */}
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleBookmark(fld.fieldKey)}
                                            title="Bookmark field"
                                            className={`p-1 hover:text-blue-600 transition-colors rounded ${
                                              isBookmarked ? 'text-blue-600' : 'text-slate-350 dark:text-slate-600'
                                            }`}
                                          >
                                            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                                          </button>
                                          
                                          <button
                                            type="button"
                                            onClick={() => handleOpenNotes(fld.fieldKey, fld.label)}
                                            title="Add a note"
                                            className={`p-1 hover:text-blue-600 transition-colors rounded relative ${
                                              notesCount > 0 ? 'text-blue-600 font-bold' : 'text-slate-350 dark:text-slate-600'
                                            }`}
                                          >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            {notesCount > 0 && (
                                              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] px-1 rounded-full min-w-3 h-3 flex items-center justify-center font-black">
                                                {notesCount}
                                              </span>
                                            )}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleToggleHelp(fld.fieldKey)}
                                            title="Show help"
                                            className={`p-1 hover:text-blue-600 transition-colors rounded ${
                                              activeHelp[fld.fieldKey] ? 'text-blue-600' : 'text-slate-350 dark:text-slate-600'
                                            }`}
                                          >
                                            <HelpCircle className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Rendering inputs based on type */}
                                      {['TextBox', 'Email', 'Phone', 'Number', 'Currency'].includes(fld.fieldType) && (
                                        <input
                                          type={fld.fieldType === 'Number' ? 'number' : 'text'}
                                          disabled={isReadOnly}
                                          placeholder={fld.placeholder || 'Type here...'}
                                          defaultValue={fld.defaultValue}
                                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                          className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                                            isBookmarked 
                                              ? 'border-blue-300 dark:border-blue-800' 
                                              : 'border-slate-200 dark:border-slate-800'
                                          }`}
                                        />
                                      )}

                                      {fld.fieldType === 'TextArea' && (
                                        <textarea
                                          disabled={isReadOnly}
                                          placeholder={fld.placeholder}
                                          defaultValue={fld.defaultValue}
                                          rows={3}
                                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                          className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none ${
                                            isBookmarked 
                                              ? 'border-blue-300 dark:border-blue-800' 
                                              : 'border-slate-200 dark:border-slate-800'
                                          }`}
                                        />
                                      )}

                                      {fld.fieldType === 'Dropdown' && (
                                        <select
                                          disabled={isReadOnly}
                                          defaultValue={fld.defaultValue || ''}
                                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                          className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                                            isBookmarked 
                                              ? 'border-blue-300 dark:border-blue-800' 
                                              : 'border-slate-200 dark:border-slate-800'
                                          }`}
                                        >
                                          <option value="">{fld.placeholder || 'Select option...'}</option>
                                          {fld.validation?.allowedValues?.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                      )}

                                      {fld.fieldType === 'Toggle' && (
                                        <Controller
                                          name={fld.fieldKey}
                                          control={control}
                                          defaultValue={fld.defaultValue === 'true'}
                                          render={({ field: { value, onChange } }) => (
                                            <div className="flex items-center gap-3 pt-1">
                                              <button
                                                type="button"
                                                disabled={isReadOnly}
                                                onClick={() => onChange(!value)}
                                                className={`w-11 h-6 bg-slate-250 dark:bg-slate-800 rounded-full relative transition-colors duration-200 border ${
                                                  value 
                                                    ? 'bg-blue-600 border-blue-600' 
                                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}
                                              >
                                                <div 
                                                  className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-200 shadow-sm ${
                                                    value ? 'translate-x-5' : 'translate-x-0'
                                                  }`}
                                                ></div>
                                              </button>
                                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                {value ? 'Yes' : 'No'}
                                              </span>
                                            </div>
                                          )}
                                        />
                                      )}

                                      {fld.fieldType === 'Checkbox' && (
                                        <label className="flex items-center gap-2 pt-1">
                                          <input
                                            type="checkbox"
                                            disabled={isReadOnly}
                                            {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 text-blue-600"
                                          />
                                          <span className="text-xs text-slate-500 dark:text-slate-400">Enabled</span>
                                        </label>
                                      )}

                                      {['Date', 'DateTime'].includes(fld.fieldType) && (
                                        <input
                                          type={fld.fieldType === 'Date' ? 'date' : 'datetime-local'}
                                          disabled={isReadOnly}
                                          defaultValue={fld.defaultValue}
                                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                          className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                                            isBookmarked 
                                              ? 'border-blue-300 dark:border-blue-800' 
                                              : 'border-slate-200 dark:border-slate-800'
                                          }`}
                                        />
                                      )}

                                      {fld.fieldType === 'UserPicker' && (
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            disabled={isReadOnly}
                                            placeholder="WF LAN ID (e.g. S123456)"
                                            defaultValue={fld.defaultValue}
                                            {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                            className={`flex-1 bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                                              isBookmarked 
                                                ? 'border-blue-300 dark:border-blue-800' 
                                                : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                          />
                                          <button type="button" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                                            <User className="h-4 w-4" />
                                          </button>
                                        </div>
                                      )}

                                      {fld.fieldType === 'GroupPicker' && (
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            disabled={isReadOnly}
                                            placeholder="WF AD Group (e.g. WF_IT_ADMINS)"
                                            defaultValue={fld.defaultValue}
                                            {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                                            className={`flex-1 bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                                              isBookmarked 
                                                ? 'border-blue-300 dark:border-blue-800' 
                                                : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                          />
                                          <button type="button" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                                            <Users className="h-4 w-4" />
                                          </button>
                                        </div>
                                      )}

                                      {/* Inline Help Box (collapsible card) */}
                                      {fld.helpText && activeHelp[fld.fieldKey] && (
                                        <div className="mt-2 text-xs bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-xl p-4 text-slate-600 dark:text-slate-350 space-y-2.5 animate-fadeIn">
                                          <div className="flex items-start gap-2.5">
                                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="space-y-2">
                                              {fld.helpText.split('\n\n').map((para, idx) => (
                                                <p key={idx} className="leading-relaxed text-[11px]">
                                                  {para.includes('Confluence') ? (
                                                    <span>
                                                      Share this page with the tech team who will be creating the message request:{' '}
                                                      <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 inline-flex">
                                                        Modernized Shell Alert - Digital Notification Platform - Enterprise Confluence <ExternalLink className="h-3 w-3" />
                                                      </a>
                                                    </span>
                                                  ) : (
                                                    para
                                                  )}
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {errors[fld.fieldKey] && (
                                        <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          <span>{errors[fld.fieldKey]?.message as string}</span>
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">Loading form template configuration...</div>
                )}
              </div>
            </div>
          </div>

          <div className={activeMainTab === 'Content' ? 'block' : 'hidden'}>
            {/* --- CONTENT TAB: LIVE EMAIL WORKSPACE PREVIEW --- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-850 dark:text-white">Email Layout Engine</h3>
                  <p className="text-xs text-slate-400">Preview how variables interpolate inside the HTML shell in real time.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      previewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </button>
                  <button 
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      previewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                </div>
              </div>

              {/* simulated email client viewport */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl flex justify-center border border-slate-200/50 dark:border-slate-900">
                <div 
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md transition-all duration-300 rounded-xl overflow-hidden ${
                    previewDevice === 'desktop' ? 'w-full' : 'w-80'
                  }`}
                >
                  {/* email header mock bar */}
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xxs text-slate-500 font-mono">
                    <span className="font-bold text-slate-400">FROM:</span>
                    <span className="text-slate-600 dark:text-slate-350">wells-fargo-alerts@wellsfargo.com</span>
                    <span className="font-bold text-slate-400 ml-4">SUBJECT:</span>
                    <span className="text-blue-600 dark:text-blue-400 truncate">
                      {formValues.messageName || 'Welcome Onboarding Campaign'}
                    </span>
                  </div>

                  {/* Wells Fargo corporate header */}
                  <div className={`p-4 flex items-center justify-between border-b-4 ${
                    formValues.newBranding === true && formValues.colorScheme === 'Corporate Slate'
                      ? 'bg-slate-700 border-slate-500'
                      : formValues.newBranding === true && formValues.colorScheme === 'Emerald Safe'
                      ? 'bg-emerald-800 border-emerald-600'
                      : 'bg-red-700 border-yellow-500'
                  } text-white`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-lg text-white">
                        W
                      </div>
                      <span className="font-bold text-sm tracking-wide">WELLS FARGO</span>
                    </div>
                    <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                      {formValues.messageType || 'Shell'} Alert
                    </span>
                  </div>

                  {/* HTML body preview */}
                  <div className="p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white">Dear Wells Fargo Customer,</p>
                    
                    <p className="leading-relaxed">
                      {formValues.description || 'Welcome notification for retail customers onboarding to retail alerts.'}
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-medium space-y-1.5">
                      <p className="text-slate-500">Alert Operational Identifiers:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-mono">
                        <li>Message ID: <strong className="text-slate-800 dark:text-slate-200">{formValues.messageId || 'MSG-001'}</strong></li>
                        <li>Routing Priority: <strong className="text-slate-800 dark:text-slate-200">{formValues.priority || 'Medium'}</strong></li>
                        <li>Originating LOB: <strong className="text-slate-800 dark:text-slate-200">{formValues.businessUnit || 'Retail Banking'}</strong></li>
                      </ul>
                    </div>

                    <div className="flex justify-center pt-2">
                      <a 
                        href={formValues.ctaLink || 'https://online.wellsfargo.com'}
                        target="_blank" 
                        rel="noreferrer"
                        className={`px-5 py-2.5 text-xs font-semibold rounded-lg text-white shadow-sm inline-block transition-all ${
                          formValues.newBranding === true && formValues.colorScheme === 'Corporate Slate'
                            ? 'bg-slate-700 hover:bg-slate-850'
                            : formValues.newBranding === true && formValues.colorScheme === 'Emerald Safe'
                            ? 'bg-emerald-800 hover:bg-emerald-900'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Access Account Portal
                      </a>
                    </div>
                  </div>

                  {/* mock compliance footer */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 border-t border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
                    <p>© 2026 Wells Fargo & Co. All rights reserved. Member FDIC.</p>
                    <p className="mt-1">This is an automated notification. To manage your delivery channels, log into secure portal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={activeMainTab === 'Deploy' ? 'block' : 'hidden'}>
            {/* --- DEPLOY TAB: SRE PIPELINE STAGES --- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Orchestrated Deployment Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Deploy this metadata layout configuration into Dev, QA, and Production clusters.</p>
              </div>

              {/* Horizontal deployment pipeline graph */}
              <div className="grid grid-cols-5 gap-3 pt-2">
                {[
                  { label: 'Config Draft', state: 'done', desc: 'Metadata initialized' },
                  { label: 'ADA Validation', state: 'done', desc: 'ADA Compliance signed' },
                  { label: 'QA Staging Deploy', state: 'active', desc: 'Routing tests active' },
                  { label: 'SecOps Audit', state: 'pending', desc: 'Vulnerability scan' },
                  { label: 'Production Route', state: 'pending', desc: 'Active routing' }
                ].map((step, idx) => (
                  <div key={idx} className="relative border border-slate-150 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-sm bg-slate-50/20 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 0{idx + 1}</span>
                      {step.state === 'done' ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                      ) : step.state === 'active' ? (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs animate-pulse">●</span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs">○</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{step.label}</p>
                    <p className="text-[10px] text-slate-400">{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* SRE deployment console logs */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deployment Console Output</span>
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-emerald-400 space-y-1.5 overflow-x-auto max-h-72 shadow-inner">
                  <p className="text-slate-500">[15 Jun 2026 - 10:15:32] INIT: Configuration loader targeting Alert ID MSG-001 started.</p>
                  <p className="text-slate-500">[15 Jun 2026 - 16:07:11] AUDIT: Metadata validation successful. Schema verified version 2.0.</p>
                  <p className="text-slate-500">[18 Jun 2026 - 15:22:01] SEC: ADA Compliance scanning completed. Score: 98/100.</p>
                  <p className="text-blue-400">[18 Jun 2026 - 15:22:04] STAGING: Launching pod instance alertsiq-wf-msg-001-pod...</p>
                  <p className="text-blue-400">[18 Jun 2026 - 15:22:05] STAGING: Syncing Kafka adaptation filters for retail business units...</p>
                  <p className="text-emerald-400 animate-pulse font-bold">[18 Jun 2026 - 15:22:06] STAGING: Webhook route active at http://localhost:8080/api/v1/messages/trigger</p>
                </div>
              </div>
            </div>
          </div>

          <div className={activeMainTab === 'Project Status' ? 'block' : 'hidden'}>
            {/* --- PROJECT STATUS TAB: COMPLIANCE METRICS --- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Project Status & compliance checklist</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ensure this campaign conforms to regulatory standards prior to production activation.</p>
              </div>

              {/* Metrics cards grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'ADA Compliance', val: '98 / 100', status: 'Passed', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'LOB approval', val: 'Signed Off', status: 'Retail Banking', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Sync Status', val: 'Catalog Sync', status: 'Tridion Up-to-date', color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Delivery Channels', val: 'Email, SMS', status: 'Dual route active', color: 'text-blue-600 dark:text-blue-400' }
                ].map((metric, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-5 rounded-xl space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metric.label}</p>
                    <p className={`text-base font-black ${metric.color}`}>{metric.val}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{metric.status}</p>
                  </div>
                ))}
              </div>

              {/* Compliance tasks Checklist */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-white">Sign-off Checklist</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-455 px-2 py-0.5 rounded-full font-bold">3 of 4 Completed</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {[
                    { item: 'LOB Business Owner Approval', status: 'completed', desc: 'Approved by Ishika on behalf of Retail Banking.' },
                    { item: 'ADA Screen Reader Validation', status: 'completed', desc: 'Passed automated AXE accessibility scanner.' },
                    { item: 'DMARC Domain Alignment Validation', status: 'completed', desc: 'Email header matches registered wells-fargo outbound domains.' },
                    { item: 'Legal Disclosure Audit sign-off', status: 'pending', desc: 'Pending review of privacy footer under Wealth Management clauses.' }
                  ].map((task, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3 hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
                      {task.status === 'completed' ? (
                        <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5 bg-emerald-50 dark:bg-emerald-950 p-0.5 rounded-full border border-emerald-200" />
                      ) : (
                        <div className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-950/40 p-0.5 rounded-full border border-amber-200 flex items-center justify-center font-bold text-[9px]">!</div>
                      )}
                      <div>
                        <p className={`font-bold ${task.status === 'completed' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{task.item}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{task.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={activeMainTab === 'Documentation' ? 'block' : 'hidden'}>
            {/* --- DOCUMENTATION TAB: API DOCS & JSON SCHEMAS --- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">API Integration Documentation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Integrate this dynamic message into your upstream microservices using REST endpoints.</p>
              </div>

              {/* code display tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">REST Request Payload JSON</span>
                  <span className="text-[10px] text-slate-500 font-mono">POST /api/v1/messages/trigger</span>
                </div>
                <pre className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 shadow-inner">
                  {JSON.stringify({
                    templateId: selectedTemplateId,
                    alertCode: formValues.messageId || 'MSG-001',
                    payload: formValues
                  }, null, 2)}
                </pre>

                {/* integration snippet */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">cURL Command Snippet</span>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-blue-400 overflow-x-auto shadow-inner whitespace-pre-wrap">
                    {`curl -X POST http://localhost:8080/api/v1/messages/trigger \\
  -H "Content-Type: application/json" \\
  -d '{"templateId":"${selectedTemplateId}","alertCode":"${formValues.messageId || 'MSG-001'}","payload":${JSON.stringify(formValues)}}'`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── FOLLOW UP TAB (Fixed — shows all bookmarked fields) ─── */}
          <div className={activeMainTab === 'Follow Up' ? 'block' : 'hidden'}>
            <FollowUpTab
              bookmarks={bookmarks}
              notes={notes}
              formValues={formValues}
              currentTemplateFields={
                currentTemplate
                  ? currentTemplate.tabs.flatMap(tab =>
                      tab.sections.flatMap(sec =>
                        sec.fields.map(f => ({ field: f, tabId: tab.tabId, tabName: tab.tabName }))
                      )
                    )
                  : []
              }
              onToggleBookmark={handleToggleBookmark}
              onOpenNotes={handleOpenNotes}
              onGoToField={(tabId) => {
                setActiveMainTab('Requirements');
                setActiveSubTabId(tabId);
              }}
            />
          </div>

        </form>
      )}

      {/* --- FLOATING NOTES MODAL --- */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 transform transition-all">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Notes — {notesModalFieldLabel}
              </h3>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Previous Notes Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                Previous Notes
              </span>
              
              <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                {(notes[notesModalFieldKey] || []).length > 0 ? (
                  (notes[notesModalFieldKey] || []).map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/60 dark:border-slate-800/80 p-3.5 rounded-xl relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">{note.author}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                          <span>{note.timestamp}</span>
                          <button
                            onClick={() => handleDeleteNote(notesModalFieldKey, note.id)}
                            className="text-red-400 hover:text-red-500 ml-1 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete note"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                        {note.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 italic text-xs font-semibold">
                    No notes yet. Add one below.
                  </div>
                )}
              </div>
            </div>

            {/* Note editor form */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                Write New Note
              </span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newNoteAuthor}
                  onChange={(e) => setNewNoteAuthor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                
                <textarea
                  placeholder="Type your note here... (Ctrl+Enter to save)"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      handleAddNote();
                    }
                  }}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850/80">
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(false)}
                className="border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                Add Note
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}
