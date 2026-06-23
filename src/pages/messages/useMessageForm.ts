/**
 * useMessageForm.ts
 * ─────────────────
 * Custom hook: single source of truth for all message form state.
 * Encapsulates template loading, message CRUD, bookmarks, notes,
 * form engine (react-hook-form), and rule evaluation.
 *
 * Components consume this via React Context — zero prop drilling.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';
import {
  MessageTemplate,
  FormTab,
  FormField,
  MessageInstance,
  MessageNote as Note,
} from '../../types/formBuilder';
import { formBuilderService } from '../../services/formBuilderService';
import { wireframeTemplate, seedMessages } from './messageTemplateData';

// ─── Public interface exposed by the hook ────────────────────────────────────

export interface MessageFormState {
  // Navigation
  view: 'list' | 'create';
  setView: (v: 'list' | 'create') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Templates
  templates: MessageTemplate[];
  selectedTemplateId: string;
  currentTemplate: MessageTemplate | null;
  handleTemplateChange: (id: string) => void;

  // Messages
  messages: MessageInstance[];
  selectedMessage: MessageInstance | null;
  isEditingExistingMessage: boolean;
  filteredMessages: MessageInstance[];
  handleNewMessage: () => Promise<void>;
  handleEditMessage: (msg: MessageInstance) => void;
  handleDeleteMessage: (e: React.MouseEvent, msgId: string) => Promise<void>;

  // Main tabs (top bar — no Follow Up here)
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;

  // Sub tabs (template-driven inner tabs)
  activeSubTabId: string;
  setActiveSubTabId: (id: string) => void;
  activeSubTab: FormTab | null;

  // Bookmarks & Notes
  bookmarks: Record<string, boolean>;
  notes: Record<string, Note[]>;
  handleToggleBookmark: (fieldKey: string) => Promise<void>;
  handleOpenNotes: (fieldKey: string, fieldLabel: string) => void;
  handleAddNote: () => Promise<void>;
  handleDeleteNote: (fieldKey: string, noteId: string) => Promise<void>;

  // Notes modal state
  isNotesModalOpen: boolean;
  setIsNotesModalOpen: (v: boolean) => void;
  notesModalFieldKey: string;
  notesModalFieldLabel: string;
  newNoteAuthor: string;
  setNewNoteAuthor: (v: string) => void;
  newNoteText: string;
  setNewNoteText: (v: string) => void;

  // Help panel
  activeHelp: Record<string, boolean>;
  handleToggleHelp: (fieldKey: string) => void;

  // Live preview
  previewDevice: 'desktop' | 'mobile';
  setPreviewDevice: (d: 'desktop' | 'mobile') => void;

  // Form engine (react-hook-form)
  register: ReturnType<typeof useForm>['register'];
  handleSubmit: ReturnType<typeof useForm>['handleSubmit'];
  control: ReturnType<typeof useForm>['control'];
  formValues: Record<string, any>;
  setValue: ReturnType<typeof useForm>['setValue'];
  reset: ReturnType<typeof useForm>['reset'];
  errors: Record<string, any>;

  // Rule engine
  getFieldState: (field: FormField) => { isHidden: boolean; isReadOnly: boolean; isRequired: boolean };
  getValidationRules: (field: FormField, isRequired: boolean) => any;
  getTabBadgeCount: (tab: FormTab) => number;

  // Submit handler
  onSubmit: (data: any) => Promise<void>;
  onSubmitAsNew: (data: any) => Promise<void>;
}

export type MainTab = 'Requirements' | 'Content' | 'Deploy' | 'Project Status' | 'Documentation';

// ─── React Context ───────────────────────────────────────────────────────────

export const MessageFormContext = createContext<MessageFormState | null>(null);

export function useMessageFormContext(): MessageFormState {
  const ctx = useContext(MessageFormContext);
  if (!ctx) throw new Error('useMessageFormContext must be used inside <MessageFormContext.Provider>');
  return ctx;
}

// ─── The Hook ────────────────────────────────────────────────────────────────

export function useMessageForm(): MessageFormState {
  // ── Navigation ──
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Data ──
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('tmpl_welcome_email');
  const [currentTemplate, setCurrentTemplate] = useState<MessageTemplate | null>(null);
  const [messages, setMessages] = useState<MessageInstance[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageInstance | null>(null);
  const [isEditingExistingMessage, setIsEditingExistingMessage] = useState(false);

  // ── Tabs ──
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Requirements');
  const [activeSubTabId, setActiveSubTabId] = useState('tab_main');

  // ── Bookmarks & Notes ──
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [activeHelp, setActiveHelp] = useState<Record<string, boolean>>({});

  // ── Notes Modal ──
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesModalFieldKey, setNotesModalFieldKey] = useState('');
  const [notesModalFieldLabel, setNotesModalFieldLabel] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Ishika');
  const [newNoteText, setNewNoteText] = useState('');

  // ── Preview ──
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // ── React Hook Form ──
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const formValues = watch();

  // ── Helpers ──

  const formatDate = useCallback((date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d} ${m} ${y} - ${hr}:${min}`;
  }, []);

  // ── Template loading ──

  const loadTemplate = useCallback(async (id: string) => {
    try {
      const template = await formBuilderService.getTemplate(id);
      setCurrentTemplate(template);
      if (template.tabs.length > 0) {
        setActiveSubTabId(template.tabs[0].tabId);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await formBuilderService.getTemplates();
      setTemplates(data);
      const initialTemplateId = data.some(t => t.templateId === 'tmpl_welcome_email')
        ? 'tmpl_welcome_email'
        : (data[0]?.templateId || '');
      setSelectedTemplateId(initialTemplateId);
      loadTemplate(initialTemplateId);

      const msgData = await formBuilderService.getMessages();
      if (msgData && msgData.length > 0) {
        setMessages(msgData);
      }
    } catch (e) {
      console.error('Error loading templates/messages:', e);
    }
  }, [loadTemplate]);

  // ── Initialisation ──

  useEffect(() => {
    // Seed localStorage if needed
    const tList = localStorage.getItem('alertsiq_dynamic_templates');
    let templatesData: any[] = [];
    if (tList) {
      try { templatesData = JSON.parse(tList); } catch { templatesData = []; }
    }

    const hasRichTemplate = templatesData.some(
      (t: any) => t.templateId === 'tmpl_welcome_email' && t.tabs && t.tabs.length >= 6
    );

    if (!hasRichTemplate) {
      const filtered = templatesData.filter((t: any) => t.templateId !== 'tmpl_welcome_email');
      filtered.push(wireframeTemplate);
      localStorage.setItem('alertsiq_dynamic_templates', JSON.stringify(filtered));
    }

    const mList = localStorage.getItem('alertsiq_created_messages');
    let seededMsg: MessageInstance[] = [];
    if (!mList) {
      seededMsg = [...seedMessages];
      localStorage.setItem('alertsiq_created_messages', JSON.stringify(seededMsg));
    } else {
      try { seededMsg = JSON.parse(mList); } catch { seededMsg = []; }
    }
    setMessages(seededMsg);

    loadTemplates();
  }, [loadTemplates]);

  // ── CRUD handlers ──

  const updateMessageInstance = useCallback(async (msg: MessageInstance) => {
    try {
      const saved = await formBuilderService.saveMessage(msg);
      setMessages(prev => prev.map(m => (m.messageId === saved.messageId || m.id === saved.id) ? saved : m));
    } catch (e) {
      console.error('Failed to update message in DB:', e);
    }
  }, []);

  const handleToggleBookmark = useCallback(async (fieldKey: string) => {
    const nextVal = !bookmarks[fieldKey];
    const newBookmarks = { ...bookmarks, [fieldKey]: nextVal };
    setBookmarks(newBookmarks);

    if (selectedMessage) {
      const updated = { ...selectedMessage, bookmarks: newBookmarks };
      setSelectedMessage(updated);
      await updateMessageInstance(updated);
    }
  }, [bookmarks, selectedMessage, updateMessageInstance]);

  const handleOpenNotes = useCallback((fieldKey: string, fieldLabel: string) => {
    setNotesModalFieldKey(fieldKey);
    setNotesModalFieldLabel(fieldLabel);
    setNewNoteText('');
    setIsNotesModalOpen(true);
  }, []);

  const handleAddNote = useCallback(async () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      author: newNoteAuthor || 'Ishika',
      text: newNoteText,
      timestamp: formatDate(new Date()),
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
  }, [newNoteText, newNoteAuthor, notes, notesModalFieldKey, selectedMessage, formatDate, updateMessageInstance]);

  const handleDeleteNote = useCallback(async (fieldKey: string, noteId: string) => {
    const currentFieldNotes = notes[fieldKey] || [];
    const newNotes = { ...notes, [fieldKey]: currentFieldNotes.filter(n => n.id !== noteId) };
    setNotes(newNotes);

    if (selectedMessage) {
      const updated = { ...selectedMessage, notes: newNotes };
      setSelectedMessage(updated);
      await updateMessageInstance(updated);
    }
  }, [notes, selectedMessage, updateMessageInstance]);

  const handleToggleHelp = useCallback((fieldKey: string) => {
    setActiveHelp(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  }, []);

  const handleTemplateChange = useCallback((id: string) => {
    setSelectedTemplateId(id);
    loadTemplate(id);
  }, [loadTemplate]);

  const handleNewMessage = useCallback(async () => {
    const tempMessageId = `MSG-${String(messages.length + 1).padStart(3, '0')}`;

    const defaultFormValues = {
      messageName: 'Welcome Email Campaign',
      messageId: tempMessageId,
      messageType: 'Shell',
      description: 'Welcome notification for retail customers onboarding to retail alerts.',
      priority: 'Medium',
      businessUnit: 'Retail Banking',
      newBranding: false,
    };

    const tempMsg: MessageInstance = {
      messageId: tempMessageId,
      messageName: 'Welcome Email Campaign',
      messageType: 'Shell',
      channels: ['Email', 'SMS'],
      status: 'Draft',
      lastModified: new Date().toISOString().split('T')[0],
      templateId: 'tmpl_welcome_email',
      formValues: defaultFormValues,
      bookmarks: {},
      notes: {},
    };

    try {
      const saved = await formBuilderService.saveMessage(tempMsg);
      setSelectedMessage(saved);
      setIsEditingExistingMessage(false);
      setBookmarks(saved.bookmarks || {});
      setNotes(saved.notes || {});
      setActiveHelp({});
      setSelectedTemplateId('tmpl_welcome_email');
      await loadTemplate('tmpl_welcome_email');
      reset(saved.formValues);
      setMessages(prev => [saved, ...prev]);
    } catch (e) {
      console.error('Failed to create draft in DB, falling back to local:', e);
      setSelectedMessage(null);
      setIsEditingExistingMessage(false);
      setBookmarks({});
      setNotes({});
      setActiveHelp({});
      setSelectedTemplateId('tmpl_welcome_email');
      await loadTemplate('tmpl_welcome_email');
      reset(defaultFormValues);
    }

    setActiveMainTab('Requirements');
    setActiveSubTabId('tab_main');
    setView('create');
  }, [messages.length, loadTemplate, reset]);

  const handleEditMessage = useCallback((msg: MessageInstance) => {
    setSelectedMessage(msg);
    setIsEditingExistingMessage(true);
    setBookmarks(msg.bookmarks || {});
    setNotes(msg.notes || {});
    setActiveHelp({});
    setSelectedTemplateId(msg.templateId || 'tmpl_welcome_email');
    loadTemplate(msg.templateId || 'tmpl_welcome_email');
    reset(msg.formValues);
    setActiveMainTab('Requirements');
    setActiveSubTabId('tab_main');
    setView('create');
  }, [loadTemplate, reset]);

  const handleDeleteMessage = useCallback(async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete message ID ${msgId}?`)) {
      try {
        await formBuilderService.deleteMessage(msgId);
        setMessages(prev => prev.filter(m => m.messageId !== msgId));
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  }, []);

  const onSubmit = useCallback(async (data: any) => {
    const newMsg: MessageInstance = {
      id: selectedMessage?.id,
      messageId: data.messageId || selectedMessage?.messageId || `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      messageName: data.messageName || 'Unnamed Message',
      messageType: data.messageType || 'Shell',
      channels: data.messageType === 'Shell' ? ['Email', 'SMS'] : ['Email'],
      status: 'Active',
      lastModified: new Date().toISOString().split('T')[0],
      templateId: selectedTemplateId,
      formValues: data,
      bookmarks,
      notes,
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

    setSelectedMessage(null);
    setBookmarks({});
    setNotes({});
    setActiveHelp({});
    setView('list');
  }, [selectedMessage, messages.length, selectedTemplateId, bookmarks, notes]);

  const onSubmitAsNew = useCallback(async (data: any) => {
    let finalMsgId = data.messageId || `MSG-${String(messages.length + 1).padStart(3, '0')}`;
    const exists = messages.some(m => m.messageId === finalMsgId);
    if (exists) {
      finalMsgId = `${finalMsgId}-COPY`;
    }

    const newMsg: MessageInstance = {
      messageId: finalMsgId,
      messageName: data.messageName ? `${data.messageName} (Copy)` : 'Unnamed Message',
      messageType: data.messageType || 'Shell',
      channels: data.messageType === 'Shell' ? ['Email', 'SMS'] : ['Email'],
      status: 'Draft',
      lastModified: new Date().toISOString().split('T')[0],
      templateId: selectedTemplateId,
      formValues: {
        ...data,
        messageId: finalMsgId,
        messageName: data.messageName ? `${data.messageName} (Copy)` : 'Unnamed Message',
      },
      bookmarks: {},
      notes: {},
    };

    try {
      const saved = await formBuilderService.saveMessage(newMsg);
      setMessages(prev => [saved, ...prev]);
    } catch (e) {
      console.error('Failed to save new message:', e);
    }

    setSelectedMessage(null);
    setBookmarks({});
    setNotes({});
    setActiveHelp({});
    setView('list');
  }, [messages, selectedTemplateId]);

  // ── Rule engine ──

  const getFieldState = useCallback((field: FormField) => {
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
          case '==': conditionMet = val1 === val2; break;
          case '!=': conditionMet = val1 !== val2; break;
          case 'contains': conditionMet = val1.includes(val2); break;
          case 'empty': conditionMet = !triggerValue || triggerValue === ''; break;
          default: break;
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
  }, [formValues]);

  const getValidationRules = useCallback((field: FormField, isRequired: boolean) => {
    const validationRules: any = {};
    if (isRequired) {
      validationRules.required = `${field.label} is required.`;
    }
    if (field.validation) {
      if (field.validation.minLength) {
        validationRules.minLength = {
          value: field.validation.minLength,
          message: field.validation.errorMessage || `${field.label} must be at least ${field.validation.minLength} characters.`,
        };
      }
      if (field.validation.maxLength) {
        validationRules.maxLength = {
          value: field.validation.maxLength,
          message: field.validation.errorMessage || `${field.label} cannot exceed ${field.validation.maxLength} characters.`,
        };
      }
      if (field.validation.regex) {
        validationRules.pattern = {
          value: new RegExp(field.validation.regex),
          message: field.validation.errorMessage || `${field.label} does not match validation format.`,
        };
      }
    }
    return validationRules;
  }, []);

  const getTabBadgeCount = useCallback((tab: FormTab) => {
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
  }, [bookmarks, notes]);

  // ── Derived state ──

  const filteredMessages = messages.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.messageId.toLowerCase().includes(query) ||
      m.messageName.toLowerCase().includes(query) ||
      m.messageType.toLowerCase().includes(query)
    );
  });

  const activeSubTab = currentTemplate?.tabs.find(t => t.tabId === activeSubTabId) || null;

  // ── Return ──

  return {
    view, setView,
    searchQuery, setSearchQuery,
    templates, selectedTemplateId, currentTemplate, handleTemplateChange,
    messages, selectedMessage, isEditingExistingMessage, filteredMessages,
    handleNewMessage, handleEditMessage, handleDeleteMessage,
    activeMainTab, setActiveMainTab,
    activeSubTabId, setActiveSubTabId, activeSubTab,
    bookmarks, notes,
    handleToggleBookmark, handleOpenNotes, handleAddNote, handleDeleteNote,
    isNotesModalOpen, setIsNotesModalOpen,
    notesModalFieldKey, notesModalFieldLabel,
    newNoteAuthor, setNewNoteAuthor,
    newNoteText, setNewNoteText,
    activeHelp, handleToggleHelp,
    previewDevice, setPreviewDevice,
    register, handleSubmit, control, formValues, setValue, errors, reset,
    getFieldState, getValidationRules, getTabBadgeCount,
    onSubmit, onSubmitAsNew,
  };
}
