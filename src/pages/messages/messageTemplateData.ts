/**
 * messageTemplateData.ts
 * ──────────────────────
 * Pure data module — no React, no JSX.
 * Contains the rich wireframe template definition and seed message instances
 * used when no backend data is available.
 */

import { MessageTemplate, MessageInstance } from '../../types/formBuilder';

// ─── Wireframe Template (canonical rich schema) ──────────────────────────────

export const wireframeTemplate: MessageTemplate = {
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
                { ruleId: 'r_brand_show', triggerField: 'newBranding', operator: '==', value: 'true', action: 'SHOW' },
                { ruleId: 'r_brand_hide', triggerField: 'newBranding', operator: '!=', value: 'true', action: 'HIDE' }
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
                { ruleId: 'r_color_show', triggerField: 'newBranding', operator: '==', value: 'true', action: 'SHOW' },
                { ruleId: 'r_color_hide', triggerField: 'newBranding', operator: '!=', value: 'true', action: 'HIDE' }
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
                { ruleId: 'r_logo_show', triggerField: 'newBranding', operator: '==', value: 'true', action: 'SHOW' },
                { ruleId: 'r_logo_hide', triggerField: 'newBranding', operator: '!=', value: 'true', action: 'HIDE' }
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
              validation: { regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$', errorMessage: 'Must be a valid Wells Fargo email address.' }
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
          collapsible: false,
          expandedByDefault: false,
          order: 0,
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
          collapsible: false,
          expandedByDefault: false,
          order: 0,
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
          collapsible: false,
          expandedByDefault: false,
          order: 0,
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
          collapsible: false,
          expandedByDefault: false,
          order: 0,
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

// ─── Seed Messages (used when localStorage / backend is empty) ───────────────

export const seedMessages: MessageInstance[] = [
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
    bookmarks: { messageName: true },
    notes: {
      messageName: [
        { id: 'n1', author: 'Ishika', text: 'Hello', timestamp: '15 Jun 2026 - 16:07' },
        { id: 'n2', author: 'Ishika', text: 'hello', timestamp: '15 Jun 2026 - 16:07' }
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
