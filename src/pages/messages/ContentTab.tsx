/**
 * ContentTab.tsx
 * ──────────────
 * Root orchestrator for the multi-channel Content Builder layout.
 */

import React, { useState } from 'react';
import {
  Download, Save, FileText, Mail, Shield, MessageSquare,
  Bell, MessageCircle, ChevronDown
} from 'lucide-react';
import { useContentBuilder, ContentBuilderContext } from './contentBuilder/useContentBuilder';
import ContentBuilderPanel from './contentBuilder/ContentBuilderPanel';
import LivePreview from './contentBuilder/LivePreview';
import { useMessageFormContext } from './useMessageForm';

// ── Action bar — pure white, visually separated from the gray panel headers ───

function ContentActionBar() {
  const { componentsByChannel } = React.useContext(ContentBuilderContext)!;

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      channels: componentsByChannel,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `multi_channel_content_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5
      bg-white dark:bg-slate-950
      border-b border-slate-200 dark:border-slate-800/80">
      
      {/* Title */}
      <div>
        <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase">Content Orchestration Center</h1>
      </div>

      <div className="flex items-center gap-2">
        <button type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
            border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
            text-slate-600 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300
            transition-all duration-150 shadow-sm">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          Create FR
        </button>

        <button type="button" onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
            border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
            text-slate-600 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300
            transition-all duration-150 shadow-sm">
          <Download className="h-3.5 w-3.5 text-slate-400" />
          Export All Channels
        </button>

        <button type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold rounded-lg
            bg-blue-600 hover:bg-blue-500 active:bg-blue-700
            text-white transition-all duration-150 shadow-sm shadow-blue-600/30">
          <Save className="h-3.5 w-3.5" />
          Save
        </button>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function ContentTab() {
  const contentBuilderState = useContentBuilder();
  const { previewChannel, setPreviewChannel, componentsByChannel } = contentBuilderState;

  // Try to access the parent MessageFormContext safely
  let formCtx: any = null;
  try {
    formCtx = useMessageFormContext();
  } catch (e) {}

  const activeChannels = formCtx?.activeChannels || ['Email', 'SecureInbox'];

  const toggleChannel = (ch: string) => {
    if (!formCtx) return;
    const current = formCtx.activeChannels || ['Email'];
    let updated;
    if (current.includes(ch)) {
      if (current.length <= 1) return; // Must have at least 1 channel active
      updated = current.filter((c: string) => c !== ch);
    } else {
      updated = [...current, ch];
    }
    
    const CHANNEL_ORDER = ['Email', 'SecureInbox', 'SMS', 'Push', 'WhatsApp'];
    const sortedUpdated = [...updated].sort((a, b) => CHANNEL_ORDER.indexOf(a) - CHANNEL_ORDER.indexOf(b));
    
    formCtx.setActiveChannels(sortedUpdated);
    formCtx.setValue('channels', sortedUpdated, { shouldDirty: true });
    
    if (formCtx.selectedMessage) {
      formCtx.selectedMessage.channels = sortedUpdated;
    }
    
    // Auto-switch previewChannel if the current active one was disabled
    if (!sortedUpdated.includes(previewChannel)) {
      setPreviewChannel(sortedUpdated[0]);
    }
  };

  // Keep channels initially collapsed (minimized)
  const [expandedChannel, setExpandedChannel] = useState<string>('');

  // Keep track of the last previewChannel so we can auto-expand when it changes via tabs, but NOT on mount
  const lastPreviewChannel = React.useRef(previewChannel);
  React.useEffect(() => {
    if (previewChannel !== lastPreviewChannel.current) {
      setExpandedChannel(previewChannel);
      lastPreviewChannel.current = previewChannel;
    }
  }, [previewChannel]);

  const handleToggleAccordion = (ch: string) => {
    if (expandedChannel === ch) {
      setExpandedChannel('');
    } else {
      setExpandedChannel(ch);
      setPreviewChannel(ch as any);
    }
  };

  return (
    <ContentBuilderContext.Provider value={contentBuilderState}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 176px)', minHeight: 480 }}>

        {/* ── Action bar (white bg) ── */}
        <ContentActionBar />

        {/* ── Two-panel grid ── */}
        <div
          className="flex-1 min-h-0 grid"
          style={{ gridTemplateColumns: '55fr 45fr' }}
        >
          {/* LEFT — Collapsible Content Builders */}
          <div className="flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
            
            {/* Channel Activator Manager Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex-shrink-0">
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">Message Delivery Channels</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure multiple templates for active channels</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/85 rounded-xl p-1">
                {['Email', 'SecureInbox', 'SMS', 'Push', 'WhatsApp'].map(channelOption => {
                  const isActive = activeChannels.includes(channelOption);
                  return (
                    <button
                      key={channelOption}
                      type="button"
                      onClick={() => toggleChannel(channelOption)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wide uppercase transition-all duration-150 ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/10'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {channelOption === 'SecureInbox' ? 'Secure Inbox' : channelOption}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsible channels list */}
            <div className="space-y-3">
              {activeChannels.map((ch: any) => {
                const isExpanded = expandedChannel === ch;
                const comps = componentsByChannel[ch] || [];
                const count = comps.length;
                
                // Choose icon and styles per channel
                let Icon = Mail;
                let colorClass = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200/40';
                let label = 'Email Channel';
                let description = 'Rich HTML template builder';
                
                if (ch === 'SecureInbox') {
                  Icon = Shield;
                  colorClass = 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200/40';
                  label = 'Secure Inbox';
                  description = 'Portal message template builder';
                } else if (ch === 'SMS') {
                  Icon = MessageSquare;
                  colorClass = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40';
                  label = 'SMS message';
                  description = 'Standard texting short message';
                } else if (ch === 'Push') {
                  Icon = Bell;
                  colorClass = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200/40';
                  label = 'Push Notification';
                  description = 'Mobile device locking alert';
                } else if (ch === 'WhatsApp') {
                  Icon = MessageCircle;
                  colorClass = 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200/40';
                  label = 'WhatsApp Message';
                  description = 'Interactive messaging template';
                }

                return (
                  <div key={ch} className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm
                    ${isExpanded 
                      ? 'border-indigo-400/50 bg-white dark:bg-slate-900 shadow-md ring-1 ring-indigo-500/10' 
                      : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}>
                    {/* Accordion Header Trigger */}
                    <button
                      type="button"
                      onClick={() => handleToggleAccordion(ch)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/30">
                          {count} {count === 1 ? 'Block' : 'Blocks'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : ''}`} />
                      </div>
                    </button>

                    {/* Accordion Content Panel */}
                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'border-t border-slate-100 dark:border-slate-800 h-[520px] min-h-0' : 'h-0 overflow-hidden'}`}>
                      {isExpanded && <ContentBuilderPanel channel={ch} />}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT — Live Preview */}
          <div className="flex flex-col min-h-0">
            <LivePreview />
          </div>
        </div>

      </div>
    </ContentBuilderContext.Provider>
  );
}
