import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight,
  Sparkles, Edit, Users, Send, FileText, LayoutGrid,
  Image, Settings, ShieldAlert, Triangle
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    if (!password) { setError('Please enter your password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setTimeout(() => {
      dispatch(login({
        user: { id: '1', username: email.split('@')[0], email, role: 'Administrator', permissions: ['admin', 'create', 'edit', 'delete'] },
        token: 'jwt_mock_token_alerts_iq',
      }));
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  const handleSSO = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch(login({
        user: { id: 'sso_user', username: 'enterprise_user', email: 'user@enterprise.com', role: 'Enterprise Member', permissions: ['create', 'edit'] },
        token: 'jwt_mock_sso_token_alerts_iq',
      }));
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", color: '#142653' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <section className="flex flex-col justify-between bg-white overflow-hidden flex-shrink-0"
        style={{ width: '42%', padding: '60px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', width: '100%', maxWidth: 440, margin: '0 auto' }}>
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px',
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: "'Inter', sans-serif",
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.1 }}>Alerts IQ</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', color: '#2563eb' }}>AUTOMATION STUDIO</div>
            </div>
          </div>

          {/* Form */}
          <div style={{ width: '100%', maxWidth: 440, marginTop: 120 }}>
            {/* Welcome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              <span style={{ width: 22, height: 2, background: '#2563eb', borderRadius: 2, flexShrink: 0, display: 'inline-block' }} />
              Welcome back
            </div>

            <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 1.08, margin: '0 0 16px 0' }}>
              Sign in to your<br />workspace
            </h1>

            <p style={{ fontSize: 15, lineHeight: '22px', color: '#64748b', marginBottom: 28 }}>
              Automate your email templates, streamline approvals,<br />
              and deliver enterprise communication with confidence.
            </p>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: 13 }}>
                <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email address</label>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <Mail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: '100%', height: 52, paddingLeft: 44, paddingRight: 16, border: '1px solid #dbe3f0', borderRadius: 10, outline: 'none', fontSize: 14, color: '#142653', background: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#dbe3f0'}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600 }}>Password</label>
                <a href="#forgot" style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative', marginBottom: 22 }}>
                <Lock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ width: '100%', height: 52, paddingLeft: 44, paddingRight: 44, border: '1px solid #dbe3f0', borderRadius: 10, outline: 'none', fontSize: 14, color: '#142653', background: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#dbe3f0'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}>
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>

              {/* Sign In Button */}
              <button type="submit" disabled={loading}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                style={{ width: '100%', height: 52, background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                {loading
                  ? <div style={{ width: 20, height: 20, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : <><span>Sign in</span><ArrowRight style={{ width: 16, height: 16 }} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', color: '#cbd5e1' }}>
              <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>or</span>
              <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* SSO Button */}
            <button type="button" onClick={handleSSO} disabled={loading}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
              style={{ width: '100%', height: 52, border: '1px solid #dbe3f0', borderRadius: 10, background: 'white', fontSize: 15, fontWeight: 600, color: '#142653', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
              <ShieldCheck style={{ width: 18, height: 18, color: '#2563eb' }} />
              Continue with SSO
            </button>
          </div>

          {/* Security footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', fontSize: 12, marginTop: 40 }}>
            <Lock style={{ width: 13, height: 13 }} />
            Enterprise security. Your data is always protected.
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <section className="flex flex-col overflow-hidden relative flex-1"
        style={{ padding: '80px 60px 36px', background: 'radial-gradient(ellipse at 75% 5%, #c7d7ff 0%, #dbeafe 28%, #eef4ff 55%, #f4f8ff 100%)' }}>

        {/* Subtle arc decorations */}
        <div style={{ position: 'absolute', top: '-6%', right: '-8%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '2%', right: '-14%', width: 680, height: 680, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', pointerEvents: 'none' }} />

        {/* Trust Badge — absolute top-right, contained */}
        <div style={{ position: 'absolute', top: 60, right: 60, background: 'white', borderRadius: 30, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(37,99,235,0.08)', zIndex: 10, whiteSpace: 'nowrap' }}>
          <ShieldCheck style={{ width: 16, height: 16, color: '#2563eb', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Trusted by enterprise teams</span>
        </div>

        {/* Centered content wrapper for right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          {/* Hero Text */}
          <div style={{ marginTop: 8, zIndex: 1 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.15, margin: '0 0 12px 0' }}>
              AI-powered email<br />
              <span style={{ color: '#2563eb' }}>automation</span> platform
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', lineHeight: '24px', margin: 0 }}>
              Create. Personalize. Approve. Deliver.<br />
              All in one intelligent workspace.
            </p>
          </div>

        {/* Workflow Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 28, gap: 0 }}>
          {[
            { icon: <Edit style={{ width: 24, height: 24, color: '#2563eb' }} />, label: 'Create' },
            { icon: <Users style={{ width: 24, height: 24, color: '#2563eb' }} />, label: 'Review' },
            { icon: <ShieldCheck style={{ width: 24, height: 24, color: '#2563eb' }} />, label: 'Approve' },
            { icon: <Send style={{ width: 22, height: 22, color: '#2563eb', transform: 'rotate(-30deg)' }} />, label: 'Deliver' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(37,99,235,0.1)', border: '1px solid rgba(219,234,254,0.6)' }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ margin: '0 12px', marginBottom: 20 }}>
                  <svg width="44" height="6" viewBox="0 0 44 6" fill="none">
                    <circle cx="5" cy="3" r="2.2" fill="#93c5fd" opacity="0.5" />
                    <circle cx="16" cy="3" r="2.4" fill="#60a5fa" opacity="0.7" />
                    <circle cx="28" cy="3" r="2.4" fill="#3b82f6" opacity="0.85" />
                    <circle cx="39" cy="3" r="2.2" fill="#93c5fd" opacity="0.5" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Email Mock Window Area */}
        <div style={{ flex: 1, position: 'relative', marginTop: 16 }}>

          {/* Tilted Email Window — aligned left, fixed width and height */}
          <div style={{
            position: 'absolute', left: 0, top: 20,
            width: 620, height: 360,
            background: 'white', borderRadius: 18,
            boxShadow: '-20px 30px 80px rgba(37,99,235,0.20), 0 10px 40px rgba(15,23,42,0.12)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            transform: 'perspective(1600px) rotateX(4deg) rotateY(-5deg) rotateZ(-1deg)',
          }}>
            {/* Window Header */}
            <div style={{ height: 42, background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                New Email Template
              </div>
            </div>

            {/* Window Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Sidebar */}
              <div style={{ width: 125, borderRight: '1px solid #f1f5f9', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText style={{ width: 14, height: 14 }} /> Content
                </div>
                {['Blocks', 'Uploads', 'Settings'].map(item => (
                  <div key={item} style={{ color: '#94a3b8', padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item === 'Blocks' && <LayoutGrid style={{ width: 14, height: 14 }} />}
                    {item === 'Uploads' && <Image style={{ width: 14, height: 14 }} />}
                    {item === 'Settings' && <Settings style={{ width: 14, height: 14 }} />}
                    {item}
                  </div>
                ))}
              </div>

              {/* Canvas */}
              <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Triangle style={{ width: 12, height: 12, color: '#2563eb', fill: '#2563eb', transform: 'rotate(180deg)' }} />
                  Your Company
                </div>
                {/* Email preview card */}
                <div style={{ height: 120, borderRadius: 10, background: 'linear-gradient(135deg,#0f172a,#1e40af)', padding: '14px 16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -10, top: -10, width: 130, height: 130, borderRadius: '50%', background: 'rgba(96,165,250,0.15)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                  {/* Polygon decoration */}
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 75, height: 75, opacity: 0.9 }}>
                    <svg viewBox="0 0 80 80" fill="none" style={{ width: '100%', height: '100%' }}>
                      <polygon points="40,4 70,26 60,64 20,64 10,26" fill="url(#pg1)" opacity="0.35" />
                      <polygon points="40,14 62,30 54,58 26,58 18,30" fill="url(#pg2)" opacity="0.65" />
                      <polygon points="40,26 54,36 48,54 32,54 26,36" fill="url(#pg3)" opacity="0.85" />
                      <defs>
                        <linearGradient id="pg1" x1="40" y1="4" x2="40" y2="64"><stop stopColor="#93c5fd" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
                        <linearGradient id="pg2" x1="40" y1="14" x2="40" y2="58"><stop stopColor="#60a5fa" /><stop offset="1" stopColor="#1d4ed8" /></linearGradient>
                        <linearGradient id="pg3" x1="40" y1="26" x2="40" y2="54"><stop stopColor="#bfdbfe" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, margin: 0, position: 'relative', zIndex: 1 }}>Your update<br />is <span style={{ fontWeight: 800 }}>here</span></h3>
                  <button style={{ width: 86, height: 24, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 9, fontWeight: 700, cursor: 'pointer', position: 'relative', zIndex: 1 }}>Learn more</button>
                </div>
                {/* Skeleton lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ height: 4, background: '#e2e8f0', borderRadius: 3, width: '85%' }} />
                  <div style={{ height: 4, background: '#e2e8f0', borderRadius: 3, width: '60%' }} />
                </div>
                {/* Mockup cards */}
                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ flex: 1, height: 56, border: '1px solid #f1f5f9', borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 18, height: 14, borderRadius: 2, border: '1.5px solid #cbd5e1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Assistant Panel */}
              <div style={{ width: 165, borderLeft: '1px solid #f1f5f9', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, color: '#142653' }}>
                  <Sparkles style={{ width: 14, height: 14, color: '#2563eb' }} /> AI Assistant
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 12px', fontSize: 11, fontWeight: 500, color: '#64748b', lineHeight: '15px' }}>
                  Optimize for<br /><span style={{ fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>engagement</span>
                </div>
                <button style={{ height: 30, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Generate</button>
                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>Brand check</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: '#10b981' }}><polyline points="20 6 9 17 4 12" /></svg>
                    All good
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating AI Badge — overlaps bottom-left corner of the window */}
          <div style={{
            position: 'absolute', top: 345, left: -20, zIndex: 30,
            background: 'white', padding: '12px 18px', borderRadius: 14,
            boxShadow: '0 12px 32px rgba(15,23,42,0.10)', border: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'float 5s ease-in-out infinite',
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles style={{ width: 14, height: 14, color: '#2563eb' }} />
            </div>
            <div>
              <strong style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', display: 'block', lineHeight: 1.3 }}>AI Generated</strong>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>On-brand. On-point. Always.</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
