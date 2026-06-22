import { MessageTemplate, DropdownMaster, AuditLog, TemplateVersion, MessageInstance } from '../types/formBuilder';

const BASE_URL = 'http://localhost:8089/api';

// Helper to check if backend is reachable
async function isBackendReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const response = await fetch(`${BASE_URL}/templates`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// LocalStorage database mock keys
const LS_TEMPLATES_KEY = 'alertsiq_dynamic_templates';
const LS_DROPDOWNS_KEY = 'alertsiq_dropdown_masters';
const LS_VERSIONS_KEY = 'alertsiq_template_versions';
const LS_AUDITS_KEY = 'alertsiq_audit_logs';

// Helper to seed localStorage if empty
const seedLocalStorage = () => {
  if (!localStorage.getItem(LS_TEMPLATES_KEY)) {
    const defaultTemplates: MessageTemplate[] = [
      {
        templateId: 'tmpl_welcome_email',
        templateName: 'Welcome Email Template',
        description: 'Standard welcome email sent to onboarded customer segments.',
        version: '1.0',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        tabs: [
          {
            tabId: 'tab_main',
            tabName: 'New Message',
            order: 0,
            sections: [
              {
                sectionId: 'sec_msg_info',
                sectionName: 'Message Information',
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
                    placeholder: 'Enter message name...',
                    helpText: 'Official display name of the alert',
                    defaultValue: 'Welcome Onboarding Alert',
                    required: true,
                    readOnly: false,
                    hidden: false,
                    validation: { minLength: 3, maxLength: 50, errorMessage: 'Name must be 3-50 chars.' },
                    appearance: { width: '100%', borderRadius: '8px' }
                  },
                  {
                    fieldId: 'fld_msg_id',
                    fieldKey: 'messageId',
                    fieldType: 'TextBox',
                    label: 'Message ID',
                    placeholder: 'WF-MSG-XXXX',
                    helpText: 'Unique Wells Fargo message identifier',
                    defaultValue: 'WF-MSG-1001',
                    required: true,
                    readOnly: true,
                    hidden: false
                  },
                  {
                    fieldId: 'fld_desc',
                    fieldKey: 'description',
                    fieldType: 'TextArea',
                    label: 'Description',
                    placeholder: 'Enter description...',
                    defaultValue: 'Welcome notification for retail customers',
                    required: false,
                    readOnly: false,
                    hidden: false,
                    appearance: { width: '100%' }
                  }
                ]
              },
              {
                sectionId: 'sec_msg_conf',
                sectionName: 'Message Configuration',
                description: 'Operational priorities',
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
                    label: 'Priority',
                    defaultValue: 'Medium',
                    required: true,
                    readOnly: false,
                    hidden: false,
                    validation: { allowedValues: ['High', 'Medium', 'Low', 'Critical'] },
                    appearance: { width: '50%' }
                  },
                  {
                    fieldId: 'fld_category',
                    fieldKey: 'category',
                    fieldType: 'Dropdown',
                    label: 'Category',
                    defaultValue: 'Marketing',
                    required: false,
                    readOnly: false,
                    hidden: false,
                    validation: { allowedValues: ['Transactional', 'Marketing', 'Security', 'Regulatory'] },
                    appearance: { width: '50%' }
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
                columns: 1,
                order: 0,
                fields: [
                  {
                    fieldId: 'fld_email',
                    fieldKey: 'email',
                    fieldType: 'Email',
                    label: 'Destination Email',
                    placeholder: 'e.g. user@wellsfargo.com',
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
                    defaultValue: 'RETAIL_CUSTOMERS',
                    required: true,
                    readOnly: false,
                    hidden: false
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    const defaultDropdowns: DropdownMaster[] = [
      {
        masterId: 'priority_levels',
        masterName: 'Priority',
        items: [
          { label: 'High', value: 'High' },
          { label: 'Medium', value: 'Medium' },
          { label: 'Low', value: 'Low' },
          { label: 'Critical', value: 'Critical' }
        ]
      },
      {
        masterId: 'message_categories',
        masterName: 'Category',
        items: [
          { label: 'Transactional', value: 'Transactional' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Security', value: 'Security' },
          { label: 'Regulatory', value: 'Regulatory' }
        ]
      }
    ];

    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(defaultTemplates));
    localStorage.setItem(LS_DROPDOWNS_KEY, JSON.stringify(defaultDropdowns));
    localStorage.setItem(LS_VERSIONS_KEY, JSON.stringify([]));
    localStorage.setItem(LS_AUDITS_KEY, JSON.stringify([]));
  }
};

// Seed initial values
seedLocalStorage();

export const formBuilderService = {
  // --- TEMPLATES ---
  
  async getTemplates(): Promise<MessageTemplate[]> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/templates`);
      const backendTemplates = await response.json();
      if (backendTemplates.length > 0) {
        return backendTemplates;
      }
      // Seed backend templates
      const localTemplates = JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
      for (const t of localTemplates) {
        await fetch(`${BASE_URL}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t)
        });
      }
      const response2 = await fetch(`${BASE_URL}/templates`);
      return response2.json();
    }
    return JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
  },

  async getTemplate(id: string): Promise<MessageTemplate> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/templates/${id}`);
      if (!response.ok) throw new Error('Template not found');
      return response.json();
    }
    const templates: MessageTemplate[] = JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
    const match = templates.find(t => t.templateId === id || t.id === id);
    if (!match) throw new Error('Template not found');
    return match;
  },

  async saveTemplate(template: MessageTemplate): Promise<MessageTemplate> {
    const isNew = !template.id && !template.templateId;
    
    if (await isBackendReachable()) {
      const url = template.id || template.templateId
        ? `${BASE_URL}/templates/${template.templateId || template.id}`
        : `${BASE_URL}/templates`;
      
      const method = template.id || template.templateId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      return response.json();
    }

    // Local Storage Mock
    const templates: MessageTemplate[] = JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
    let updatedTemplate = { ...template };

    if (isNew) {
      updatedTemplate.templateId = 'tmpl_' + Math.random().toString(36).substring(2, 9);
      updatedTemplate.id = updatedTemplate.templateId;
      updatedTemplate.version = '1.0';
      updatedTemplate.createdDate = new Date().toISOString();
      updatedTemplate.updatedDate = new Date().toISOString();
      templates.push(updatedTemplate);
      
      // Log audit
      this.logAuditMock(updatedTemplate.templateId, updatedTemplate.templateName, 'CREATE', 'Created initial template.');
    } else {
      const idx = templates.findIndex(t => t.templateId === template.templateId || t.id === template.id);
      
      // Version snapshot
      const currentVer = template.version || '1.0';
      const nextVer = (parseFloat(currentVer) + 0.1).toFixed(1);
      updatedTemplate.version = nextVer;
      updatedTemplate.updatedDate = new Date().toISOString();

      if (idx !== -1) {
        // Create version history item
        this.saveVersionMock(templates[idx]);
        templates[idx] = updatedTemplate;
      } else {
        templates.push(updatedTemplate);
      }
      this.logAuditMock(updatedTemplate.templateId, updatedTemplate.templateName, 'SAVE_VERSION', `Saved version ${nextVer}`);
    }

    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(templates));
    return updatedTemplate;
  },

  async deleteTemplate(id: string): Promise<void> {
    if (await isBackendReachable()) {
      await fetch(`${BASE_URL}/templates/${id}`, { method: 'DELETE' });
      return;
    }
    const templates: MessageTemplate[] = JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
    const match = templates.find(t => t.templateId === id || t.id === id);
    if (match) {
      this.logAuditMock(match.templateId, match.templateName, 'DELETE', 'Deleted template.');
    }
    const filtered = templates.filter(t => t.templateId !== id && t.id !== id);
    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(filtered));
  },

  // --- DROPDOWNS ---
  
  async getDropdowns(): Promise<DropdownMaster[]> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/masters/dropdowns`);
      const backendDropdowns = await response.json();
      if (backendDropdowns.length > 0) {
        return backendDropdowns;
      }
      // Seed backend dropdowns
      const localDropdowns = JSON.parse(localStorage.getItem(LS_DROPDOWNS_KEY) || '[]');
      for (const d of localDropdowns) {
        await fetch(`${BASE_URL}/masters/dropdowns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      }
      const response2 = await fetch(`${BASE_URL}/masters/dropdowns`);
      return response2.json();
    }
    return JSON.parse(localStorage.getItem(LS_DROPDOWNS_KEY) || '[]');
  },

  async saveDropdown(dropdown: DropdownMaster): Promise<DropdownMaster> {
    if (await isBackendReachable()) {
      const url = dropdown.id 
        ? `${BASE_URL}/masters/dropdowns/${dropdown.id}` 
        : `${BASE_URL}/masters/dropdowns`;
      const method = dropdown.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dropdown)
      });
      return response.json();
    }

    const dropdowns: DropdownMaster[] = JSON.parse(localStorage.getItem(LS_DROPDOWNS_KEY) || '[]');
    if (!dropdown.id && !dropdown.masterId) {
      dropdown.masterId = 'master_' + Math.random().toString(36).substring(2, 9);
      dropdown.id = dropdown.masterId;
      dropdowns.push(dropdown);
    } else {
      const idx = dropdowns.findIndex(d => d.masterId === dropdown.masterId || d.id === dropdown.id);
      if (idx !== -1) {
        dropdowns[idx] = dropdown;
      } else {
        dropdowns.push(dropdown);
      }
    }
    localStorage.setItem(LS_DROPDOWNS_KEY, JSON.stringify(dropdowns));
    return dropdown;
  },

  async deleteDropdown(id: string): Promise<void> {
    if (await isBackendReachable()) {
      await fetch(`${BASE_URL}/masters/dropdowns/${id}`, { method: 'DELETE' });
      return;
    }
    const dropdowns: DropdownMaster[] = JSON.parse(localStorage.getItem(LS_DROPDOWNS_KEY) || '[]');
    const filtered = dropdowns.filter(d => d.masterId !== id && d.id !== id);
    localStorage.setItem(LS_DROPDOWNS_KEY, JSON.stringify(filtered));
  },

  // --- VERSIONS ---

  async getVersions(templateId: string): Promise<TemplateVersion[]> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/templates/${templateId}/versions`);
      return response.json();
    }
    const versions: TemplateVersion[] = JSON.parse(localStorage.getItem(LS_VERSIONS_KEY) || '[]');
    return versions.filter(v => v.templateId === templateId).sort((a,b) => b.createdDate.localeCompare(a.createdDate));
  },

  async rollbackVersion(templateId: string, version: string): Promise<MessageTemplate> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/templates/${templateId}/rollback/${version}`, { method: 'POST' });
      return response.json();
    }

    const versions: TemplateVersion[] = JSON.parse(localStorage.getItem(LS_VERSIONS_KEY) || '[]');
    const snapshot = versions.find(v => v.templateId === templateId && v.version === version);
    if (!snapshot) throw new Error(`Snapshot version ${version} not found`);

    const templates: MessageTemplate[] = JSON.parse(localStorage.getItem(LS_TEMPLATES_KEY) || '[]');
    const deserialized: MessageTemplate = JSON.parse(snapshot.templateMetadataJson);

    // Bump version on rollback
    const nextVer = (parseFloat(deserialized.version) + 0.1).toFixed(1) + '-rollback';
    deserialized.version = nextVer;
    deserialized.updatedDate = new Date().toISOString();

    const idx = templates.findIndex(t => t.templateId === templateId);
    if (idx !== -1) {
      templates[idx] = deserialized;
      localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(templates));
      this.logAuditMock(templateId, deserialized.templateName, 'ROLLBACK', `Rolled back to version ${version}. New version code: ${nextVer}`);
      return deserialized;
    }
    throw new Error('Template not found in list');
  },

  // --- AUDITS ---

  async getAudits(templateId: string): Promise<AuditLog[]> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/audit/${templateId}`);
      return response.json();
    }
    const audits: AuditLog[] = JSON.parse(localStorage.getItem(LS_AUDITS_KEY) || '[]');
    return audits.filter(a => a.templateId === templateId).sort((a,b) => b.modifiedDate.localeCompare(a.modifiedDate));
  },

  // --- HELPER MOCK LOGGERS ---

  logAuditMock(templateId: string, templateName: string, action: string, changes: string) {
    const audits: AuditLog[] = JSON.parse(localStorage.getItem(LS_AUDITS_KEY) || '[]');
    const newLog: AuditLog = {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      templateId,
      templateName,
      action,
      modifiedBy: 'admin',
      modifiedDate: new Date().toISOString(),
      changes
    };
    audits.push(newLog);
    localStorage.setItem(LS_AUDITS_KEY, JSON.stringify(audits));
  },

  saveVersionMock(template: MessageTemplate) {
    const versions: TemplateVersion[] = JSON.parse(localStorage.getItem(LS_VERSIONS_KEY) || '[]');
    const newSnapshot: TemplateVersion = {
      id: 'ver_' + Math.random().toString(36).substring(2, 9),
      templateId: template.templateId,
      templateName: template.templateName,
      version: template.version,
      templateMetadataJson: JSON.stringify(template),
      createdBy: 'admin',
      createdDate: new Date().toISOString(),
      changeLog: `Automatic snapshot of version ${template.version}`
    };
    versions.push(newSnapshot);
    localStorage.setItem(LS_VERSIONS_KEY, JSON.stringify(versions));
  },

  // --- MESSAGES (Three-Collection Dynamic API) ---
  //
  // Payload contract (flat Map sent to backend):
  //   templateId  – required
  //   _id         – optional (for updates)
  //   _status     – optional "Active" | "Draft"
  //   _bookmarks  – optional Record<fieldKey, boolean>
  //   _notes      – optional Record<fieldKey, Note[]>
  //   <fieldKey>  – one key per form field (e.g. messageName, priority, etc.)
  //
  // The backend maps fieldKey -> mongoPropertyName using the template schema.
  // On load, the backend reverse-maps and returns formValues keyed by fieldKey.

  async getMessages(): Promise<MessageInstance[]> {
    if (await isBackendReachable()) {
      const raw: any[] = await (await fetch(`${BASE_URL}/messages`)).json();
      return raw.map(this._responseToMessageInstance);
    }
    return JSON.parse(localStorage.getItem('alertsiq_created_messages') || '[]');
  },

  async getMessage(id: string): Promise<MessageInstance> {
    if (await isBackendReachable()) {
      const response = await fetch(`${BASE_URL}/messages/${id}`);
      if (!response.ok) throw new Error('Message not found');
      return this._responseToMessageInstance(await response.json());
    }
    const messages: MessageInstance[] = JSON.parse(localStorage.getItem('alertsiq_created_messages') || '[]');
    const found = messages.find(m => m.messageId === id || m.id === id);
    if (!found) throw new Error('Message not found');
    return found;
  },

  /**
   * saveMessage — builds the flat payload expected by the new backend.
   * The formValues object (fieldKey -> value) is spread to the top level.
   * Bookmarks and notes are sent as reserved _bookmarks / _notes keys.
   */
  async saveMessage(message: MessageInstance): Promise<MessageInstance> {
    if (await isBackendReachable()) {
      // Build flat payload: spread formValues to top level
      const payload: Record<string, any> = {
        ...(message.formValues || {}),
        templateId: message.templateId,
        _status:    message.status || 'Draft',
        _bookmarks: message.bookmarks || {},
        _notes:     message.notes    || {},
      };
      if (message.id) payload['_id'] = message.id;

      const url    = message.id ? `${BASE_URL}/messages/${message.id}` : `${BASE_URL}/messages`;
      const method = message.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).messages?.join('; ') || (err as any).error || 'Save failed');
      }

      return this._responseToMessageInstance(await response.json());
    }

    // ── Offline fallback (localStorage) ──
    const messages: MessageInstance[] = JSON.parse(localStorage.getItem('alertsiq_created_messages') || '[]');
    const isEdit = message.id || messages.some(m => m.messageId === message.messageId);

    const toSave: MessageInstance = {
      ...message,
      lastModified: new Date().toISOString().split('T')[0],
    };

    if (isEdit) {
      const updated = messages.map(m =>
        (m.messageId === toSave.messageId || m.id === toSave.id) ? toSave : m
      );
      localStorage.setItem('alertsiq_created_messages', JSON.stringify(updated));
    } else {
      toSave.messageId = toSave.messageId || `MSG-${String(messages.length + 1).padStart(3, '0')}`;
      messages.push(toSave);
      localStorage.setItem('alertsiq_created_messages', JSON.stringify(messages));
    }
    return toSave;
  },

  async deleteMessage(id: string): Promise<void> {
    if (await isBackendReachable()) {
      await fetch(`${BASE_URL}/messages/${id}`, { method: 'DELETE' });
      return;
    }
    const messages: MessageInstance[] = JSON.parse(localStorage.getItem('alertsiq_created_messages') || '[]');
    const filtered = messages.filter(m => m.messageId !== id && m.id !== id);
    localStorage.setItem('alertsiq_created_messages', JSON.stringify(filtered));
  },

  /**
   * Normalise a backend response (which uses formValues, _bookmarks, _notes)
   * into the frontend MessageInstance shape.
   */
  _responseToMessageInstance(raw: any): MessageInstance {
    return {
      id:           raw._id      || raw.id,
      messageId:    raw.messageId,
      messageName:  raw.formValues?.messageName || raw.messageName || '',
      messageType:  raw.formValues?.messageType || raw.messageType || 'Shell',
      channels:     raw.channels || (raw.formValues?.messageType === 'Shell' ? ['Email', 'SMS'] : ['Email']),
      status:       raw.status   || raw._status  || 'Draft',
      lastModified: raw.lastModified || '',
      templateId:   raw.templateId,
      formValues:   raw.formValues  || {},
      bookmarks:    raw._bookmarks  || {},
      notes:        raw._notes      || {},
    };
  }
};
