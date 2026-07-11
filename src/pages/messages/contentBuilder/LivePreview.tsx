/**
 * LivePreview.tsx — Premium multi-channel live preview engine
 */

import React, { useMemo } from 'react';
import { RefreshCw, Mail, Shield, MessageSquare, Bell, MessageCircle } from 'lucide-react';
import { useContentBuilderContext } from './useContentBuilder';
import { SAMPLE_CUSTOMERS } from './constants';
import type { CanvasComponent, BrandSettings } from './types';
import { useMessageFormContext } from '../useMessageForm';

// ── Variable interpolation ────────────────────────────────────────────────────

function interpolate(text: string, vars: Record<string, string>): string {
  if (!text) return '';
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

// ── Component → rendered element ──────────────────────────────────────────────

function EmailBlock({
  comp,
  primaryColor,
  vars,
}: {
  comp: CanvasComponent;
  primaryColor: string;
  vars: Record<string, string>;
}) {
  const text = interpolate(comp.text, vars);
  const url = comp.url ? interpolate(comp.url, vars) : '#';

  switch (comp.kind) {
    case 'pageheader':
    case 'heading':
    case 'banner':
      return (
        <div
          className="py-6 px-5 font-bold text-white text-center text-sm leading-snug tracking-tight"
          style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor})` }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'subheading':
      return (
        <h2
          className="text-[13px] font-bold text-slate-800 px-5 pt-4 pb-1"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'paragraph':
    case 'richtext':
      return (
        <p
          className="text-[12px] text-slate-600 px-5 py-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'quote':
      return (
        <blockquote
          className="mx-5 my-3 pl-4 border-l-[3px] text-[12px] italic text-slate-500 leading-relaxed"
          style={{ borderColor: primaryColor }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );

    case 'cta':
    case 'quickaction':
      return (
        <div className="flex justify-center px-5 py-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-7 py-2.5 text-[12px] font-bold text-white rounded-lg shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );

    case 'link':
      return (
        <div className="px-5 py-1.5">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-semibold underline underline-offset-2"
            style={{ color: primaryColor }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="px-5 py-2">
          {comp.url ? (
            <img
              src={url}
              alt={text}
              className="w-full h-auto max-h-48 object-contain rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-full h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
              📷 {text || 'Image Placeholder'}
            </div>
          )}
        </div>
      );

    case 'divider':
      return <hr className="mx-5 my-2 border-slate-200" />;

    case 'spacer':
      return <div className="h-4" />;

    case 'transactionsummary':
    case 'accountdetails':
      return (
        <div className="mx-5 my-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
          <p className="font-bold text-slate-700 text-xs">{comp.label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-0.5">
            <span className="text-slate-400">Account</span>
            <span>{vars.AccountNumber ?? '****XXXX'}</span>
            <span className="text-slate-400">Amount</span>
            <span className="font-semibold">{vars.Amount ?? '$0.00'}</span>
            <span className="text-slate-400">Date</span>
            <span>{vars.TransactionDate ?? '—'}</span>
          </div>
        </div>
      );

    case 'keymetrics':
      return (
        <div className="mx-5 my-2 grid grid-cols-3 gap-2">
          {['Transactions', 'Balance', 'Rewards'].map(l => (
            <div key={l} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">{l}</p>
              <p className="text-[13px] font-bold text-slate-700 mt-0.5">—</p>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="mx-5 my-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-400 italic">
          [{comp.label}: {text}]
        </div>
      );
  }
}

// ── SMS Viewport Skin ──────────────────────────────────────────────────────────

function SmsPreview({ components, vars }: { components: CanvasComponent[]; vars: Record<string, string> }) {
  return (
    <div className="mx-auto max-w-[280px] w-full bg-slate-950 rounded-[40px] border-[10px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col font-sans text-slate-800 relative">
      {/* Notch */}
      <div className="w-24 h-4 bg-slate-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20" />
      
      {/* iOS Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[9px] font-bold text-white bg-slate-900 flex-shrink-0">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span>📶</span>
          <span>5G</span>
          <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center"><div className="w-3.5 h-full bg-white rounded-2xs" /></div>
        </div>
      </div>
      
      {/* SMS Header */}
      <div className="bg-slate-900 text-white py-2 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">WF</div>
          <div>
            <p className="text-[10px] font-bold">Wells Fargo Alerts</p>
            <p className="text-[7.5px] text-slate-400">954-02</p>
          </div>
        </div>
        <span className="text-[9px] text-indigo-400 font-semibold cursor-pointer">Details</span>
      </div>
      
      {/* SMS Chat Canvas */}
      <div className="flex-1 bg-[#efeae2] dark:bg-slate-900 p-3 overflow-y-auto space-y-3 flex flex-col justify-end min-h-0">
        <div className="text-center my-1"><span className="bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] px-2 py-0.5 rounded-md font-semibold">Today 9:41 AM</span></div>
        
        {/* Messages */}
        <div className="space-y-2 flex flex-col items-start">
          {components.length === 0 ? (
            <div className="text-slate-400 italic text-[10px] text-center w-full py-10">No message content</div>
          ) : (
            components.map(c => {
              const text = interpolate(c.text, vars);
              const hasUrl = c.url && ['cta', 'link', 'quickaction'].includes(c.kind);
              const url = c.url ? interpolate(c.url, vars) : '#';
              
              if (c.kind === 'divider' || c.kind === 'spacer') return null;
              
              return (
                <div key={c.id} className="bg-white dark:bg-slate-800 text-[10px] text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm leading-relaxed border border-slate-200/50 dark:border-slate-700/50">
                  <div dangerouslySetInnerHTML={{ __html: text }} />
                  {hasUrl && (
                    <a href={url} target="_blank" rel="noreferrer" className="block mt-1 text-blue-600 dark:text-blue-400 font-semibold underline truncate">
                      {url}
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Keyboard mock */}
      <div className="bg-[#f6f6f6] dark:bg-slate-950 p-2 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-full px-3 py-1 flex items-center justify-between">
          <span className="text-[9px] text-slate-400">iMessage</span>
          <span className="text-xs text-indigo-500 font-bold">⬆️</span>
        </div>
      </div>
    </div>
  );
}

// ── Push Notification Skin ─────────────────────────────────────────────────────

function PushPreview({ components, vars }: { components: CanvasComponent[]; vars: Record<string, string> }) {
  const heading = components.find(c => c.kind === 'heading' || c.kind === 'pageheader')?.text || 'Wells Fargo Alert';
  const body = components.find(c => c.kind === 'paragraph' || c.kind === 'richtext')?.text || 'You have a new message.';
  
  return (
    <div className="mx-auto max-w-[280px] w-full bg-slate-950 rounded-[40px] border-[10px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col font-sans relative">
      {/* Notch */}
      <div className="w-24 h-4 bg-slate-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20" />
      
      {/* Background wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 opacity-90" />
      
      {/* Lockscreen Interface */}
      <div className="relative z-10 flex-1 flex flex-col justify-between py-10 px-5 text-white">
        {/* Time & Date */}
        <div className="text-center mt-6">
          <p className="text-4xl font-light tracking-tight">09:41</p>
          <p className="text-[9px] font-semibold text-white/70 mt-1">Thursday, October 16</p>
        </div>
        
        {/* Notification Banner */}
        <div className="my-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-[8px] font-black text-white">WF</div>
                <span className="text-[9px] font-bold tracking-wider text-white/90">WELLS FARGO</span>
              </div>
              <span className="text-[8px] text-white/60">now</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white" dangerouslySetInnerHTML={{ __html: interpolate(heading, vars) }} />
              <p className="text-[9px] text-white/80 leading-normal mt-0.5" dangerouslySetInnerHTML={{ __html: interpolate(body, vars) }} />
            </div>
          </div>
        </div>
        
        {/* Swipe to open indicator */}
        <div className="text-center space-y-2">
          <div className="w-24 h-1 bg-white/40 rounded-full mx-auto" />
          <p className="text-[8px] text-white/50 tracking-wider">Swipe up to unlock</p>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Skin ─────────────────────────────────────────────────────────────

function WhatsAppPreview({ components, vars }: { components: CanvasComponent[]; vars: Record<string, string> }) {
  return (
    <div className="mx-auto max-w-[280px] w-full bg-slate-950 rounded-[40px] border-[10px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col font-sans text-slate-800 relative">
      {/* Notch */}
      <div className="w-24 h-4 bg-slate-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20" />
      
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white pt-6 pb-2.5 px-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-slate-200/20 flex items-center justify-center text-[10px] font-bold text-white">WF</div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold">Wells Fargo</span>
            <span className="text-[9px] text-emerald-400">✓</span>
          </div>
          <span className="text-[7.5px] text-white/70 block">Official Business Account</span>
        </div>
      </div>
      
      {/* WhatsApp Chat Canvas */}
      <div className="flex-1 bg-[#efeae2] dark:bg-slate-900 p-3 overflow-y-auto space-y-2 flex flex-col justify-end min-h-0">
        <div className="space-y-2 flex flex-col items-start w-full">
          {components.length === 0 ? (
            <div className="text-slate-400 italic text-[10px] text-center w-full py-10">No message content</div>
          ) : (
            <div className="bg-white dark:bg-slate-800 text-slate-855 dark:text-slate-100 rounded-lg rounded-tl-none p-3 shadow-md max-w-[85%] border border-slate-200/30 dark:border-slate-700/30 space-y-1.5 relative">
              {/* WhatsApp Bubble Tail */}
              <div className="absolute top-0 -left-1.5 w-2 h-2 bg-white dark:bg-slate-800 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              
              {components.map(c => {
                const text = interpolate(c.text, vars);
                const hasUrl = c.url && ['cta', 'link', 'quickaction'].includes(c.kind);
                const url = c.url ? interpolate(c.url, vars) : '#';
                
                if (c.kind === 'divider' || c.kind === 'spacer') return null;
                
                return (
                  <div key={c.id} className="text-[10px] leading-normal">
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                    {hasUrl && (
                      <a href={url} target="_blank" rel="noreferrer" className="block mt-1 text-teal-655 dark:text-teal-400 font-semibold underline truncate">
                        {url}
                      </a>
                    )}
                  </div>
                );
              })}
              
              {/* Read receipt */}
              <div className="flex justify-end items-center gap-1 mt-1 text-[7.5px] text-slate-400 w-full">
                <span>9:41 AM</span>
                <span className="text-sky-500 font-bold">✓✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Input area */}
      <div className="bg-[#f0f0f0] dark:bg-slate-950 p-2 border-t border-slate-200 dark:border-slate-850 flex items-center gap-2 flex-shrink-0">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-1 text-[9px] text-slate-400 flex items-center">
          Type a message
        </div>
        <div className="w-7 h-7 rounded-full bg-[#128c7e] flex items-center justify-center text-white text-[11px] shadow-sm">
          🎙️
        </div>
      </div>
    </div>
  );
}

// ── Secure Message Portal Skin ────────────────────────────────────────────────

function SecureInboxPreview({
  components,
  brand,
  vars,
  previewSegment,
}: {
  components: CanvasComponent[];
  brand: BrandSettings;
  vars: Record<string, string>;
  previewSegment: string;
}) {
  const sorted = [...components].sort((a, b) => a.order - b.order);
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 font-sans border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-lg">
      {/* Portal Header */}
      <div className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-[9px] font-black text-slate-950">WF</div>
          <span className="text-[11px] font-bold tracking-wide">Wells Fargo Secure Message Portal — {previewSegment}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
          <span>🔒</span> End-to-End Encrypted
        </div>
      </div>
      
      {/* Portal Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-5 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden flex flex-col">
          {/* Top colored band */}
          <div className="h-1" style={{ backgroundColor: brand.primaryColor }} />
          
          {/* Sender metadata info */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sender</p>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">Secure Alerts Team</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Received Date</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-0.5">{vars.TransactionDate ?? 'Just Now'}</p>
            </div>
          </div>
          
          {/* Content block mapping */}
          <div className="p-5 flex-1 space-y-4">
            {sorted.length === 0 ? (
              <div className="py-12 text-center text-[12px] text-slate-400 italic">This message has no blocks.</div>
            ) : (
              sorted.map(comp => (
                <EmailBlock
                  key={comp.id}
                  comp={comp}
                  primaryColor={brand.primaryColor}
                  vars={vars}
                />
              ))
            )}
          </div>
          
          {/* Safety disclaimer */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-900 px-5 py-3 text-center">
            <p className="text-[8.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
              This message was sent securely to your Wells Fargo Inbox. If you did not request or recognize this information, please call Security Operations immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LivePreview() {
  const {
    componentsByChannel,
    brand,
    previewSegment,
    setPreviewSegment,
    sampleDataKey,
    setSampleDataKey,
    currentSampleData,
    previewChannel,
    setPreviewChannel,
  } = useContentBuilderContext();

  // Retrieve active channels from wizard state to render tabs
  let formCtx: any = null;
  try {
    formCtx = useMessageFormContext();
  } catch (e) {}
  const activeChannels = formCtx?.activeChannels || ['Email', 'SecureInbox'];

  const vars: Record<string, string> = {
    CustomerName: currentSampleData.CustomerName,
    AccountNumber: currentSampleData.AccountNumber,
    Amount: currentSampleData.Amount,
    TransactionDate: currentSampleData.TransactionDate,
    MerchantName: currentSampleData.MerchantName,
    LOB: currentSampleData.LOB,
    Region: currentSampleData.Region,
    ctaLink: 'https://wf.com/alert-secure'
  };

  const channelComponents = useMemo(() => {
    return componentsByChannel[previewChannel] || [];
  }, [componentsByChannel, previewChannel]);

  const sorted = useMemo(() => {
    return [...channelComponents].sort((a, b) => a.order - b.order);
  }, [channelComponents]);

  // Render the appropriate skin based on active preview channel
  const renderPreviewSkin = () => {
    switch (previewChannel) {
      case 'SecureInbox':
        return (
          <SecureInboxPreview
            components={channelComponents}
            brand={brand}
            vars={vars}
            previewSegment={previewSegment}
          />
        );
      case 'SMS':
        return (
          <SmsPreview
            components={channelComponents}
            vars={vars}
          />
        );
      case 'Push':
        return (
          <PushPreview
            components={channelComponents}
            vars={vars}
          />
        );
      case 'WhatsApp':
        return (
          <WhatsAppPreview
            components={channelComponents}
            vars={vars}
          />
        );
      case 'Email':
      default:
        return (
          <div
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/60
            dark:shadow-slate-900/60 overflow-hidden border border-slate-200/60
            dark:border-slate-800/60 dark:bg-slate-900 max-w-lg mx-auto"
          >
            {/* Email "from" strip */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-850"
              style={{ backgroundColor: brand.primaryColor + '10' }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center
                text-[10px] font-black text-white shadow-sm"
                style={{ backgroundColor: brand.primaryColor }}
              >
                WF
              </div>
              <div>
                <p className="text-[11px] font-bold" style={{ color: brand.primaryColor }}>
                  Wells Fargo — {previewSegment}
                </p>
                <p className="text-[9px] text-slate-400">noreply@wellsfargo.com</p>
              </div>
            </div>

            {/* Component blocks */}
            {sorted.length === 0 ? (
              <div className="py-16 text-center text-[12px] text-slate-400">
                <div className="text-3xl mb-2 opacity-30">📧</div>
                <p className="font-semibold">Empty canvas</p>
                <p className="text-[10px] text-slate-300 mt-1">Add components to see the preview</p>
              </div>
            ) : (
              <div className="pb-1">
                {sorted.map(comp => (
                  <EmailBlock
                    key={comp.id}
                    comp={comp}
                    primaryColor={brand.primaryColor}
                    vars={vars}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <div
              className="px-5 py-4 border-t border-slate-100 dark:border-slate-850
              text-center bg-slate-50/50 dark:bg-slate-900/50"
            >
              <p className="text-[10px] text-slate-400 leading-relaxed">
                © 2025 Wells Fargo Bank, N.A. All rights reserved.
                <br />
                <span className="text-slate-300">This is an automated message. Please do not reply.</span>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950">
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4 h-12
        bg-slate-100 dark:bg-slate-900/80
        border-b border-slate-200 dark:border-slate-800 flex-shrink-0"
      >
        {/* Label */}
        <div className="flex items-center gap-2.5">
          <span className="w-[3px] h-4 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
            Live Preview
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Active channels switching segments */}
          {activeChannels.length > 1 && (
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/80 rounded-lg p-0.5 mr-2">
              {activeChannels.map((ch: any) => {
                const isActive = previewChannel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setPreviewChannel(ch)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-100 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          )}

          <select
            value={previewSegment}
            onChange={e => setPreviewSegment(e.target.value as any)}
            className="text-[11px] font-semibold bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700 rounded-lg
              px-2 py-1 text-slate-700 dark:text-slate-200
              outline-none focus:border-indigo-400 cursor-pointer transition-all"
          >
            {['Retail', 'Corporate', 'Premium', 'Commercial'].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sampleDataKey}
            onChange={e => setSampleDataKey(e.target.value)}
            className="text-[11px] font-semibold bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700 rounded-lg
              px-2 py-1 text-slate-700 dark:text-slate-200
              outline-none focus:border-indigo-400 cursor-pointer transition-all"
          >
            {SAMPLE_CUSTOMERS.map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            title="Refresh"
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-slate-200 dark:hover:bg-slate-800
              text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Preview viewport ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-5
        bg-slate-100/50 dark:bg-slate-950/60"
      >
        {renderPreviewSkin()}
      </div>
    </div>
  );
}
