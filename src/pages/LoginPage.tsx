import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';
import { ArrowRight, ShieldCheck, Sparkles, Users, Clock, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes waveDrift {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(10px); }
          100% { transform: translateX(0) translateY(0); }
        }

        .fade-in-1 { animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fade-in-2 { animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .fade-in-3 { animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .float-anim { animation: float 7s ease-in-out infinite; }

        .sign-in-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .sign-in-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(30,80,255,0.35) !important;
        }
        .sign-in-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmer 2.8s infinite;
        }

        .sso-btn {
          transition: all 0.2s ease;
        }
        .sso-btn:hover:not(:disabled) {
          background: #F8FAFF !important;
          border-color: #C7D2FE !important;
          box-shadow: 0 2px 8px rgba(30,80,255,0.08) !important;
        }

        .feature-row {
          transition: transform 0.2s ease;
        }
        .feature-row:hover {
          transform: translateX(4px);
        }
      `}</style>

      {/* ─── BACKGROUND ─── */}
      {/* Left 62% - very light blue/white */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '62%',
        height: '100%',
        background: 'linear-gradient(160deg, #F0F4FF 0%, #E8EFFF 30%, #EBF4FF 60%, #F5F8FF 100%)',
        zIndex: 0,
      }} />
      {/* Right 38% - deep royal blue */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '38%',
        height: '100%',
        background: 'linear-gradient(160deg, #1a3fa8 0%, #1530a0 30%, #0f2580 60%, #0d1e6b 100%)',
        zIndex: 0,
      }} />

      {/* Blue side flowing wave lines */}
      <svg style={{ position: 'absolute', top: 0, right: 0, width: '38%', height: '100%', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 500 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,150 C100,80 250,280 400,180 C480,140 520,200 600,160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <path d="M-80,300 C80,200 280,420 450,300 C530,250 570,340 650,280" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <path d="M-30,480 C150,360 320,580 500,450 C580,400 610,490 700,440" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
        <path d="M-60,620 C120,500 300,720 480,580 C560,530 590,620 680,570" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
        <path d="M-20,760 C160,640 340,860 520,720 C600,670 630,760 720,710" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        {/* Subtle large arc */}
        <path d="M50,0 C200,200 100,600 300,900" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="80" />
        <path d="M200,0 C350,300 250,700 450,900" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="60" />
      </svg>

      {/* Soft radial bloom on left side */}
      <div style={{ position: 'absolute', top: '-8%', left: '-5%', width: '45vw', height: '55vh', background: 'radial-gradient(ellipse, rgba(99,130,250,0.14) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '15%', width: '50vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(147,197,253,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── MAIN WRAPPER ─── */}
      <div style={{
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        zIndex: 2,
      }}>

        {/* ─── HEADER ─── */}
        <header style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 0 10px 0',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: '38px', height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E50FF 0%, #0A35D0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(30,80,255,0.28)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Alerts IQ</div>
              <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '2.2px', color: '#6B7280', textTransform: 'uppercase' }}>BY ENTERPRISE TEAMS</div>
            </div>
          </div>

          {/* Trusted badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.85)',
            borderRadius: '30px',
            padding: '7px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#1E50FF' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>Trusted by enterprise teams</span>
          </div>
        </header>

        {/* ─── MAIN CONTENT ROW ─── */}
        <main style={{
          flex: 1,
          display: 'flex',
          gap: '28px',
          padding: '10px 0 16px 0',
          alignItems: 'stretch',
          minHeight: 0,
        }}>

          {/* ── LEFT CARD: Sign In ── */}
          <div className="fade-in-1" style={{
            width: '390px',
            flexShrink: 0,
            borderRadius: '20px',
            background: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(15,30,100,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            border: '1px solid rgba(226,232,240,0.7)',
            padding: '32px 34px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

              <div style={{ fontSize: '14.5px', color: '#4B5563', fontWeight: 500, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Welcome back! <span style={{ fontSize: '16px' }}>👋</span>
              </div>

              <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0D1B2A', lineHeight: 1.15, margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>
                Sign in to your<br />
                <span style={{ color: '#1E50FF' }}>workspace</span>
              </h1>

              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.55, margin: '0 0 24px 0' }}>
                Automate your email templates, streamline approvals, and deliver with confidence.
              </p>

              {error && (
                <div style={{
                  marginBottom: '14px',
                  padding: '10px 12px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email address</label>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: emailFocused ? '#1E50FF' : '#9CA3AF' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    style={{
                      width: '100%', height: '46px', paddingLeft: '40px', paddingRight: '14px',
                      border: `1.5px solid ${emailFocused ? '#1E50FF' : '#E5E7EB'}`,
                      borderRadius: '10px', outline: 'none', fontSize: '13.5px', color: '#111827',
                      background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: emailFocused ? '0 0 0 3px rgba(30,80,255,0.1)' : 'none',
                    }}
                  />
                </div>

                {/* Password */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Password</label>
                  <a href="#" style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E50FF', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                  <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: passwordFocused ? '#1E50FF' : '#9CA3AF' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={{
                      width: '100%', height: '46px', paddingLeft: '40px', paddingRight: '42px',
                      border: `1.5px solid ${passwordFocused ? '#1E50FF' : '#E5E7EB'}`,
                      borderRadius: '10px', outline: 'none', fontSize: '13.5px', color: '#111827',
                      background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: passwordFocused ? '0 0 0 3px rgba(30,80,255,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9CA3AF', lineHeight: 0 }}
                  >
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="sign-in-btn"
                  style={{
                    width: '100%', height: '48px',
                    background: '#1E50FF',
                    color: 'white', border: 'none', borderRadius: '11px',
                    fontSize: '14.5px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.85 : 1,
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 18px rgba(30,80,255,0.28)',
                    letterSpacing: '0.1px',
                  }}
                >
                  {loading
                    ? <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                    : <><span>Sign in</span><ArrowRight style={{ width: '15px', height: '15px' }} /></>
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
                <span style={{ flex: 1, height: '1px', background: '#F0F0F0' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.3px' }}>or</span>
                <span style={{ flex: 1, height: '1px', background: '#F0F0F0' }} />
              </div>

              {/* SSO */}
              <button
                type="button"
                onClick={handleSSO}
                disabled={loading}
                className="sso-btn"
                style={{
                  width: '100%', height: '46px',
                  border: '1.5px solid #E5E7EB', borderRadius: '11px',
                  background: '#FFFFFF', fontSize: '13.5px', fontWeight: 600, color: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with SSO
              </button>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'center', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #F3F4F6' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#1E50FF' }} />
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Enterprise security. Your data is always protected.</span>
            </div>
          </div>

          {/* ── MIDDLE: AI Features ── */}
          <div className="fade-in-2" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '8px 0',
            minWidth: 0,
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* AI Powered badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px', alignSelf: 'flex-start',
                background: 'rgba(224,236,255,0.9)', border: '1px solid rgba(30,80,255,0.15)',
                borderRadius: '30px', padding: '5px 13px', marginBottom: '18px',
              }}>
                <Sparkles style={{ width: '12px', height: '12px', color: '#1E50FF' }} />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1E50FF', letterSpacing: '1px', textTransform: 'uppercase' }}>AI POWERED</span>
              </div>

              <h2 style={{
                fontSize: '38px', fontWeight: 800, color: '#0D1B2A',
                lineHeight: 1.15, margin: '0 0 14px 0', letterSpacing: '-0.025em',
              }}>
                AI-powered email<br />
                template <span style={{ color: '#1E50FF' }}>automation</span>
              </h2>

              <p style={{ fontSize: '14.5px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 30px 0' }}>
                Create on-brand, responsive emails in minutes.<br />
                Automate approvals. Deliver at scale.
              </p>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2c0 5.5-4.5 10-10 10 5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z" fill="#1E50FF" />
                      </svg>
                    ),
                    title: 'Smart template builder',
                    desc: 'Build beautiful emails with AI assistance',
                    titleColor: '#1F2937',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E50FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 11 11 13 15 9" />
                      </svg>
                    ),
                    title: 'Brand consistency',
                    desc: 'Ensure every email is on-brand',
                    titleColor: '#1F2937',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1E50FF" />
                      </svg>
                    ),
                    title: 'Faster approvals',
                    desc: 'Automate review and approval workflows',
                    titleColor: '#1E50FF',
                  },
                ].map((f, i) => (
                  <div key={i} className="feature-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(30,80,255,0.1), 0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      {f.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: f.titleColor, marginBottom: '1px' }}>{f.title}</div>
                      <div style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: 1.4 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom stats bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '16px',
              padding: '0 24px',
              height: '72px',
              marginTop: '20px',
              boxShadow: '0 4px 20px rgba(15,30,100,0.06)',
            }}>
              {[
                { icon: <Users style={{ width: '17px', height: '17px', color: '#1E50FF' }} />, value: '25K+', label: 'Active Users' },
                { icon: <Clock style={{ width: '17px', height: '17px', color: '#1E50FF' }} />, value: '98%', label: 'Time Saved' },
                { icon: <CheckCircle style={{ width: '17px', height: '17px', color: '#1E50FF' }} />, value: '99.9%', label: 'Uptime' },
                { icon: <ShieldCheck style={{ width: '17px', height: '17px', color: '#1E50FF' }} />, value: 'Enterprise', label: 'Grade Security' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: '1px', height: '32px', background: 'rgba(30,80,255,0.1)', margin: '0 20px' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(30,80,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B2A', lineHeight: 1.1 }}>{s.value}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live Email Preview Panel (on deep blue bg) ── */}
          <div className="fade-in-3" style={{
            width: '380px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* The white preview card */}
            <div style={{
              flex: 1,
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #F1F5F9',
                background: '#FFFFFF',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B2A' }}>Live Email Template Preview</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ECFDF5', borderRadius: '20px', padding: '3px 9px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A' }}>Live</span>
                </div>
              </div>

              {/* Body: sidebar + canvas */}
              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Icon sidebar */}
                <div style={{
                  width: '50px', flexShrink: 0,
                  borderRight: '1px solid #F1F5F9',
                  background: '#F8FAFC',
                  padding: '16px 0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                }}>
                  {/* Active icon */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#1E50FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(30,80,255,0.35)',
                    marginBottom: '4px',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                  </div>
                  {[
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" /></svg>,
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
                  ].map((icon, idx) => (
                    <div key={idx} style={{ width: '32px', height: '32px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                    </div>
                  ))}
                </div>

                {/* Email canvas */}
                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', background: '#FFFFFF' }}>

                  {/* Company header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1E50FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0D1B2A' }}>Your Company</span>
                  </div>

                  {/* Hero blue card */}
                  <div style={{
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1E50FF 0%, #0A35D0 100%)',
                    padding: '16px 14px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(30,80,255,0.28)',
                  }}>
                    {/* Envelope illustration */}
                    <div style={{ position: 'absolute', right: '8px', bottom: '4px', width: '88px', height: '78px' }}>
                      <svg viewBox="0 0 100 90" fill="none" width="100%" height="100%">
                        <rect x="5" y="26" width="78" height="54" rx="5" fill="#1D4ED8" opacity="0.75" />
                        <rect x="5" y="26" width="78" height="54" rx="5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                        <rect x="16" y="8" width="58" height="38" rx="4" fill="white" />
                        <line x1="22" y1="18" x2="50" y2="18" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                        <line x1="22" y1="26" x2="65" y2="26" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                        <line x1="22" y1="34" x2="40" y2="34" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                        <path d="M5,26 L44,54 C47,56 51,56 54,54 L83,26" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                        <circle cx="76" cy="18" r="10" fill="#10B981" />
                        <polyline points="71,18 75,22 82,13" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Star sparkles */}
                        <circle cx="10" cy="15" r="2" fill="rgba(255,255,255,0.5)" />
                        <circle cx="90" cy="35" r="1.5" fill="rgba(255,255,255,0.4)" />
                      </svg>
                    </div>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '58%' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 5px 0', lineHeight: 1.2 }}>Your update is here</h3>
                      <p style={{ fontSize: '10px', margin: '0 0 12px 0', opacity: 0.85, lineHeight: 1.4 }}>
                        We're excited to share what's new and improved.
                      </p>
                      <button style={{
                        background: '#FFFFFF', color: '#1D4ED8', border: 'none', borderRadius: '7px',
                        padding: '6px 12px', fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}>
                        Learn more <ArrowRight style={{ width: '10px', height: '10px' }} />
                      </button>
                    </div>
                  </div>

                  {/* 3-column feature tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px' }}>
                    {[
                      { emoji: '🚀', title: 'New features', desc: 'Powerful tools to boost productivity.', bg: '#FFF8F5' },
                      { emoji: '🔒', title: 'Enhanced security', desc: 'Enterprise-grade protection.', bg: '#FFFDF0' },
                      { emoji: '📈', title: 'Better insights', desc: 'Data-driven decisions made simple.', bg: '#F4FDF7' },
                    ].map((col, idx) => (
                      <div key={idx} style={{ borderRadius: '8px', padding: '9px 7px', background: col.bg }}>
                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>{col.emoji}</div>
                        <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#1F2937', marginBottom: '2px', lineHeight: 1.2 }}>{col.title}</div>
                        <div style={{ fontSize: '8.5px', color: '#64748B', lineHeight: 1.3 }}>{col.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* What's new + mini chart */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>What's new?</div>
                      {['AI-powered content suggestions', 'Real-time collaboration', 'Advanced analytics dashboard'].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1E50FF" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                          <span style={{ fontSize: '9.5px', color: '#4B5563', fontWeight: 500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                    {/* Mini chart */}
                    <div style={{ width: '90px', height: '55px', flexShrink: 0 }}>
                      <svg viewBox="0 0 90 55" fill="none" width="100%" height="100%">
                        <rect x="0" y="22" width="6" height="18" rx="2" fill="#E2E8F0" />
                        <rect x="9" y="15" width="6" height="25" rx="2" fill="#60A5FA" opacity="0.7" />
                        <rect x="18" y="19" width="6" height="21" rx="2" fill="#93C5FD" opacity="0.5" />
                        <circle cx="62" cy="27" r="18" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.05))" />
                        <circle cx="62" cy="27" r="14" stroke="#F1F5F9" strokeWidth="4" />
                        <path d="M62 13 A14 14 0 0 1 76 27" stroke="#1E50FF" strokeWidth="4" strokeLinecap="round" />
                        <path d="M76 27 A14 14 0 0 1 62 41" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                        <path d="M62 41 A14 14 0 0 1 48 27" stroke="#BAE6FD" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="62" cy="27" r="8" fill="white" />
                      </svg>
                    </div>
                  </div>

                  {/* Footer signature */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                    <div style={{ fontSize: '9.5px', color: '#4B5563', fontWeight: 500 }}>Thanks for being part of our journey!</div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 500 }}>– The <strong>Your Company</strong> Team</div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
