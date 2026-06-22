import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, Mail, Sliders, ShieldAlert, 
  Database, ListChecks, GitCommit, History, Layers,
  Check, Save, Terminal, Lock,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import Layout from '../../components/Layout';

// Subcomponents imports
import MessageTemplateBuilder from './MessageTemplateBuilder';
import FieldLibrary from './FieldLibrary';
import ValidationRules from './ValidationRules';
import DropdownMasters from './DropdownMasters';
import TemplateVersions from './TemplateVersions';
import AuditHistory from './AuditHistory';

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  
  // Tabs state synced with search parameters
  const activeCategory = searchParams.get('category') || 'messages';
  const activeMessageTab = searchParams.get('tab') || 'builder';

  const updateParams = (category: string, tab: string) => {
    setSearchParams({ category, tab });
  };

  // Mock General Settings State
  const [themeMode, setThemeMode] = useState('dark');
  const [backendPort, setBackendPort] = useState('8089');
  const [logLevel, setLogLevel] = useState('INFO');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.wellsfargo.com/alerts-iq');
  const [isSavedGeneral, setIsSavedGeneral] = useState(false);

  // Mock Security Settings State
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('10.128.0.0/16, 172.22.45.0/24');
  const [isSavedSecurity, setIsSavedSecurity] = useState(false);

  const handleSaveGeneral = () => {
    setIsSavedGeneral(true);
    setTimeout(() => setIsSavedGeneral(false), 2000);
  };

  const handleSaveSecurity = () => {
    setIsSavedSecurity(true);
    setTimeout(() => setIsSavedSecurity(false), 2000);
  };

  // Horizontal tabs config for Messages Category
  const messageTabs = [
    { id: 'builder', label: 'Template Builder', icon: Layers },
    { id: 'library', label: 'Field Library', icon: Database },
    { id: 'validation', label: 'Validation Rules', icon: ListChecks },
    { id: 'dropdowns', label: 'Dropdown Masters', icon: Database },
    { id: 'versions', label: 'Template Versions', icon: GitCommit },
    { id: 'audit', label: 'Audit History', icon: History }
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-sm dark:shadow-none">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
              Control Panel & Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Manage system behaviors, message builder models, security policies, and integrations
            </p>
          </div>
        </div>

        {/* Main Two-Column Layout with Collapsible Side Console (Tray) */}
        <div className="flex gap-6 items-start relative min-h-[500px]">
          
          {/* Left Navigation Console Tray */}
          <div className={`transition-all duration-300 ease-in-out shrink-0 ${
            isConsoleOpen 
              ? 'w-72 opacity-100 translate-x-0' 
              : 'w-0 opacity-0 -translate-x-10 overflow-hidden pointer-events-none'
          }`}>
            <div className="w-72 bg-white/90 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-1.5 backdrop-blur-sm shadow-sm dark:shadow-none min-h-[400px]">
              <div className="flex items-center justify-between px-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Sliders className="h-3.5 w-3.5" />
                  <span className="text-xxs font-bold uppercase tracking-widest">Settings Console</span>
                </div>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
                  title="Collapse Console Panel"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => updateParams('messages', 'builder')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                  activeCategory === 'messages'
                    ? 'bg-indigo-50/80 dark:bg-indigo-600/10 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-750 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-55 dark:hover:bg-slate-800/30 hover:text-slate-950 dark:hover:text-slate-200'
                }`}
              >
                <Mail className={`h-4.5 w-4.5 ${activeCategory === 'messages' ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-450 dark:text-slate-500'}`} />
                <div className="text-left flex-1">
                  <div className="leading-tight">Messages Configurations</div>
                  <div className="text-xxs text-slate-450 dark:text-slate-500 font-normal mt-0.5">Forms & dynamic templates</div>
                </div>
              </button>

              <button
                onClick={() => updateParams('general', '')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                  activeCategory === 'general'
                    ? 'bg-indigo-50/80 dark:bg-indigo-600/10 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-750 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-55 dark:hover:bg-slate-800/30 hover:text-slate-950 dark:hover:text-slate-200'
                }`}
              >
                <Sliders className={`h-4.5 w-4.5 ${activeCategory === 'general' ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-450 dark:text-slate-500'}`} />
                <div className="text-left flex-1">
                  <div className="leading-tight">General Customization</div>
                  <div className="text-xxs text-slate-450 dark:text-slate-500 font-normal mt-0.5">Preferences & configurations</div>
                </div>
              </button>

              <button
                onClick={() => updateParams('security', '')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                  activeCategory === 'security'
                    ? 'bg-indigo-50/80 dark:bg-indigo-600/10 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-750 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-55 dark:hover:bg-slate-800/30 hover:text-slate-950 dark:hover:text-slate-200'
                }`}
              >
                <ShieldAlert className={`h-4.5 w-4.5 ${activeCategory === 'security' ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-450 dark:text-slate-500'}`} />
                <div className="text-left flex-1">
                  <div className="leading-tight">Security & Policies</div>
                  <div className="text-xxs text-slate-450 dark:text-slate-500 font-normal mt-0.5">Authentication & ACL protocols</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Active Content Panel */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 transition-all duration-300">
            
            {/* Open Console Tray Trigger (only visible when console is closed) */}
            {!isConsoleOpen && (
              <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm dark:shadow-none animate-in fade-in slide-in-from-left-4 duration-200">
                <button
                  onClick={() => setIsConsoleOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-450 rounded-xl text-xs font-bold transition-all border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <span>Show Settings Console</span>
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                  {activeCategory} {activeCategory === 'messages' ? `> ${messageTabs.find(t => t.id === activeMessageTab)?.label || activeMessageTab}` : ''}
                </span>
              </div>
            )}
            
            {/* Category: Messages (Tab list + inner component) */}
            {activeCategory === 'messages' && (
              <div className="flex flex-col gap-6">
                
                {/* Horizontal Navigation Sub-tabs */}
                <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1.5 backdrop-blur-sm shadow-sm dark:shadow-none">
                  {messageTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeMessageTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => updateParams('messages', tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-white border border-slate-200 dark:border-slate-750 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Inner component renderer */}
                <div className="bg-white dark:bg-slate-900/25 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-none">
                  {activeMessageTab === 'builder' && <MessageTemplateBuilder isEmbedded={true} />}
                  {activeMessageTab === 'library' && <FieldLibrary isEmbedded={true} />}
                  {activeMessageTab === 'validation' && <ValidationRules isEmbedded={true} />}
                  {activeMessageTab === 'dropdowns' && <DropdownMasters isEmbedded={true} />}
                  {activeMessageTab === 'versions' && <TemplateVersions isEmbedded={true} />}
                  {activeMessageTab === 'audit' && <AuditHistory isEmbedded={true} />}
                </div>

              </div>
            )}

            {/* Category: General */}
            {activeCategory === 'general' && (
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-sm dark:shadow-2xl flex flex-col gap-6 text-slate-800 dark:text-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-white">General Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure layout themes, system parameters, and outbound channels.</p>
                </div>
                
                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Theme Mode Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Display Theme Preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'dark', 'system'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setThemeMode(mode)}
                          className={`py-3.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                            themeMode === mode 
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white shadow-lg' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {mode} Mode
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Backend Port API Endpoint */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Form Builder API Service Port</label>
                    <div className="flex gap-2">
                      <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 select-none">http://localhost:</span>
                      <input
                        type="text"
                        value={backendPort}
                        onChange={(e) => setBackendPort(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 flex-1"
                      />
                    </div>
                  </div>

                  {/* System Logger Levels */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Spring Console Log Level</label>
                    <select
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {['DEBUG', 'INFO', 'WARN', 'ERROR'].map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  {/* Outbound Webhook Integration */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Outbound Webhook Delivery Endpoint</label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-205 dark:bg-slate-800 w-full mt-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Terminal className="h-4 w-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    <span className="text-xxs font-mono">Running FormBuilder v1.0.0.RELEASE</span>
                  </div>
                  <button
                    onClick={handleSaveGeneral}
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10"
                  >
                    {isSavedGeneral ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{isSavedGeneral ? 'Configurations Saved!' : 'Save System Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Category: Security */}
            {activeCategory === 'security' && (
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-sm dark:shadow-2xl flex flex-col gap-6 text-slate-800 dark:text-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-white">Access Control & Security Policies</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Govern administrative session intervals, token parameters, and IP address scopes.</p>
                </div>

                <div className="h-px bg-slate-202 dark:bg-slate-800 w-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Session Timeout Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-355">
                      <span>Inactivity Auto-Logout Timeout</span>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold">{sessionTimeout} minutes</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none mt-2"
                    />
                  </div>

                  {/* Multi Factor Authentication Toggle */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">Require MFA for Studio Designers</label>
                    <div className="flex items-center gap-3 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={mfaEnabled}
                        onChange={(e) => setMfaEnabled(e.target.checked)}
                        className="accent-indigo-500 h-4 w-4 cursor-pointer"
                        id="mfaCheckbox"
                      />
                      <label htmlFor="mfaCheckbox" className="text-xs text-slate-600 dark:text-slate-300 font-medium select-none cursor-pointer">
                        {mfaEnabled ? 'Enforced Policy Active' : 'Allow Single-Factor Auth'}
                      </label>
                    </div>
                  </div>

                  {/* IP Whitelisting Range */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-655 dark:text-slate-355">Allowed Client Subnets (CIDR Whitelist)</label>
                    <input
                      type="text"
                      value={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      className="bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-indigo-650 dark:text-indigo-400 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-xxs text-slate-500 dark:text-slate-500">Comma-separated IPv4 CIDR blocks authorized to query administrative configuration APIs.</span>
                  </div>

                </div>

                <div className="h-px bg-slate-202 dark:bg-slate-800 w-full mt-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Lock className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />
                    <span className="text-xxs font-mono">TLS Connection Active: 256-bit AES</span>
                  </div>
                  <button
                    onClick={handleSaveSecurity}
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10"
                  >
                    {isSavedSecurity ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{isSavedSecurity ? 'Policies Applied!' : 'Apply Security Policies'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </Layout>
  );
}
