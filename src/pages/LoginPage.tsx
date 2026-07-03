import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight,
  Sparkles, Zap, Users, CheckCircle, Clock, TrendingUp,
  Shield, Star, BarChart2
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
    <div style={{ height: '100vh', width: '100vw', display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden', background: '#eef2ff' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-left { animation: slideInLeft 0.7s ease both; }
        .login-middle { animation: fadeInUp 0.7s 0.15s ease both; }
        .login-right { animation: slideInRight 0.7s 0.1s ease both; }
        .signin-btn:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
        .signin-btn { transition: background 0.2s, transform 0.15s !important; }
        .sso-btn:hover { background: #f8fafc !important; border-color: #bfdbfe !important; }
        .sso-btn { transition: background 0.2s, border-color 0.2s !important; }
        .feature-row:hover .feature-icon { transform: scale(1.08); background: #eff6ff !important; }
        .feature-icon { transition: transform 0.2s, background 0.2s; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="login-left" style={{
        width: '34%', minWidth: 380, background: 'white',
        display: 'flex', flexDirection: 'column',
        padding: '0 52px', boxSizing: 'border-box',
        position: 'relative', zIndex: 2,
        boxShadow: '4px 0 40px rgba(37,99,235,0.07)'
      }}>
        {/* Logo */}
        <div style={{ paddingTop: 40, marginBottom: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>Alerts IQ</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2px', color: '#64748b', textTransform: 'uppercase' }}>BY ENTERPRISE TEAMS</div>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 20 }}>
          <div style={{ marginBottom: 6, fontSize: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Welcome back!</span>
            <span style={{ fontSize: 20 }}>👋</span>
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1.15, margin: '0 0 10px 0', letterSpacing: '-0.8px' }}>
            Sign in to your<br />
            <span style={{ color: '#2563eb' }}>workspace</span>
          </h1>

          <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: '21px', margin: '0 0 28px 0' }}>
            Automate your email templates, streamline<br />
            approvals, and deliver with confidence.
          </p>

          {error && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13 }}>
              <Shield style={{ width: 15, height: 15, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginBottom: 7 }}>Email address</label>
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: emailFocused ? '#2563eb' : '#94a3b8', transition: 'color 0.2s' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  width: '100%', height: 48, paddingLeft: 42, paddingRight: 14,
                  border: `1.5px solid ${emailFocused ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: 10, outline: 'none', fontSize: 14, color: '#0f172a',
                  background: emailFocused ? '#f8fbff' : 'white', boxSizing: 'border-box',
                  fontFamily: 'inherit', transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: emailFocused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>Password</label>
              <a href="#" style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative', marginBottom: 22 }}>
              <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: passwordFocused ? '#2563eb' : '#94a3b8', transition: 'color 0.2s' }} />
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={{
                  width: '100%', height: 48, paddingLeft: 42, paddingRight: 44,
                  border: `1.5px solid ${passwordFocused ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: 10, outline: 'none', fontSize: 14, color: '#0f172a',
                  background: passwordFocused ? '#f8fbff' : 'white', boxSizing: 'border-box',
                  fontFamily: 'inherit', transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: passwordFocused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none'
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8', lineHeight: 0 }}>
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="signin-btn"
              style={{
                width: '100%', height: 50, background: '#2563eb', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                letterSpacing: '0.1px'
              }}>
              {loading
                ? <div style={{ width: 20, height: 20, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <><span>Sign in</span><ArrowRight style={{ width: 17, height: 17 }} /></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>or</span>
            <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <button type="button" onClick={handleSSO} disabled={loading} className="sso-btn"
            style={{
              width: '100%', height: 50, border: '1.5px solid #e2e8f0', borderRadius: 10,
              background: 'white', fontSize: 14, fontWeight: 600, color: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
            {/* Google G icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with SSO
          </button>
        </div>

        {/* Footer */}
        <div style={{ paddingBottom: 32, display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', fontSize: 12 }}>
          <ShieldCheck style={{ width: 14, height: 14, color: '#94a3b8' }} />
          Enterprise security. Your data is always protected.
        </div>
      </div>

      {/* ── MIDDLE PANEL ── */}
      <div className="login-middle" style={{
        flex: '0 0 36%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #c7d7ff 0%, #dbe8ff 30%, #e8f0ff 60%, #f0f5ff 100%)',
        display: 'flex', flexDirection: 'column', padding: '52px 44px 0',
        boxSizing: 'border-box'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: 340, height: 340, borderRadius: '50%', background: 'rgba(147,197,253,0.25)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '-40px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(191,219,254,0.3)', filter: 'blur(35px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', right: '-30px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', filter: 'blur(25px)', pointerEvents: 'none' }} />

        {/* Decorative arc lines */}
        <svg style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', opacity: 0.25 }} width="400" height="400" viewBox="0 0 400 400" fill="none">
          <circle cx="350" cy="50" r="200" stroke="white" strokeWidth="1"/>
          <circle cx="350" cy="50" r="280" stroke="white" strokeWidth="0.7"/>
          <circle cx="350" cy="50" r="350" stroke="white" strokeWidth="0.5"/>
        </svg>

        {/* AI Powered Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(37,99,235,0.15)', borderRadius: 30,
          padding: '7px 16px', alignSelf: 'flex-start', marginBottom: 28,
          boxShadow: '0 2px 12px rgba(37,99,235,0.08)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', animation: 'shimmer 2s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI POWERED</span>
          <Sparkles style={{ width: 13, height: 13, color: '#2563eb' }} />
        </div>

        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1.18, margin: '0 0 14px 0', letterSpacing: '-1px' }}>
          AI-powered email<br />
          template <span style={{ color: '#2563eb' }}>automation</span>
        </h2>

        <p style={{ fontSize: 14.5, color: '#475569', lineHeight: '22px', margin: '0 0 36px 0' }}>
          Create on-brand, responsive emails in minutes.<br />
          Automate approvals. Deliver at scale.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 36 }}>
          {[
            {
              icon: <Sparkles style={{ width: 20, height: 20, color: '#2563eb' }} />,
              title: 'Smart template builder',
              desc: 'Build beautiful emails with AI assistance',
              color: '#eff6ff'
            },
            {
              icon: <ShieldCheck style={{ width: 20, height: 20, color: '#2563eb' }} />,
              title: 'Brand consistency',
              desc: 'Ensure every email is on-brand',
              color: '#eff6ff'
            },
            {
              icon: <Zap style={{ width: 20, height: 20, color: '#2563eb' }} />,
              title: <span><span style={{ color: '#2563eb' }}>Faster approvals</span></span>,
              desc: 'Automate review and approval workflows',
              color: '#eff6ff'
            },
          ].map((f, i) => (
            <div key={i} className="feature-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default' }}>
              <div className="feature-icon" style={{
                width: 46, height: 46, borderRadius: 13,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(37,99,235,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 2px 10px rgba(37,99,235,0.08)'
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: '18px' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Floating Cube decoration */}
        <div style={{ position: 'absolute', bottom: 100, right: 20, animation: 'floatSlow 7s ease-in-out infinite', opacity: 0.85 }}>
          <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
            <defs>
              <linearGradient id="cube-top" x1="60" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#93c5fd" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="cube-left" x1="0" y1="60" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="cube-right" x1="60" y1="60" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <polygon points="60,5 110,32 110,80 60,107 10,80 10,32" fill="url(#cube-top)" opacity="0.25" />
            <polygon points="60,5 110,32 60,60 10,32" fill="url(#cube-top)" opacity="0.6" />
            <polygon points="10,32 60,60 60,107 10,80" fill="url(#cube-left)" opacity="0.8" />
            <polygon points="110,32 60,60 60,107 110,80" fill="url(#cube-right)" opacity="0.7" />
          </svg>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.8)',
          display: 'flex', padding: '16px 24px', gap: 0
        }}>
          {[
            { icon: <Users style={{ width: 18, height: 18, color: '#2563eb' }} />, val: '25K+', label: 'Active Users' },
            { icon: <Clock style={{ width: 18, height: 18, color: '#2563eb' }} />, val: '98%', label: 'Time Saved' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, borderRight: i < 1 ? '1px solid rgba(37,99,235,0.12)' : 'none', paddingRight: i < 1 ? 16 : 0, paddingLeft: i > 0 ? 16 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right" style={{
        flex: 1, background: 'white',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        borderLeft: '1px solid #f1f5f9'
      }}>
        {/* Trusted badge top-right */}
        <div style={{
          position: 'absolute', top: 28, right: 28,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 30,
          padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(15,23,42,0.06)', zIndex: 10
        }}>
          <ShieldCheck style={{ width: 15, height: 15, color: '#2563eb' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>Trusted by enterprise teams</span>
        </div>

        {/* Preview card */}
        <div style={{ flex: 1, padding: '52px 32px 100px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Live Email Template Preview</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 12px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#16a34a' }}>Live</span>
            </div>
          </div>

          {/* Email Preview Window */}
          <div style={{
            background: 'white', borderRadius: 14,
            border: '1px solid #e8edf5',
            boxShadow: '0 8px 40px rgba(15,23,42,0.08)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: 'float 6s ease-in-out infinite'
          }}>
            {/* Window top bar */}
            <div style={{ height: 44, borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Your Company</span>
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
              {/* Icon sidebar */}
              <div style={{ width: 44, borderRight: '1px solid #f1f5f9', padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: '#fafbfc' }}>
                {[
                  <svg key="a" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
                  <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
                  <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
                  <svg key="d" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                  <svg key="e" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
                ].map((icon, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: 8, background: i === 0 ? '#eff6ff' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}>
                    {icon}
                  </div>
                ))}
              </div>

              {/* Email content area */}
              <div style={{ flex: 1, padding: '16px 18px', overflowY: 'auto' }}>
                {/* Hero banner */}
                <div style={{
                  borderRadius: 10, background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
                  padding: '18px 18px 16px', color: 'white', marginBottom: 14,
                  position: 'relative', overflow: 'hidden', minHeight: 140
                }}>
                  <div style={{ position: 'absolute', right: -15, top: -15, width: 120, height: 120, borderRadius: '50%', background: 'rgba(147,197,253,0.12)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                  {/* Envelope illustration */}
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 80, height: 70, opacity: 0.9 }}>
                    <svg viewBox="0 0 90 80" fill="none" style={{ width: '100%', height: '100%' }}>
                      <rect x="5" y="20" width="80" height="52" rx="5" fill="white" opacity="0.15"/>
                      <rect x="5" y="20" width="80" height="52" rx="5" stroke="white" strokeWidth="1.5" opacity="0.5"/>
                      <polyline points="5,22 45,50 85,22" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                      <circle cx="67" cy="16" r="14" fill="#22c55e"/>
                      <polyline points="60,16 65,21 76,11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="22" cy="65" r="5" fill="white" opacity="0.15"/>
                      <circle cx="10" cy="45" r="3" fill="white" opacity="0.12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, margin: '0 0 8px 0', position: 'relative', zIndex: 1, maxWidth: '58%' }}>
                    Your update is here
                  </h3>
                  <p style={{ fontSize: 11.5, margin: '0 0 12px 0', opacity: 0.8, lineHeight: '16px', position: 'relative', zIndex: 1, maxWidth: '55%' }}>
                    We're excited to share what's new and improved.
                  </p>
                  <button style={{ background: 'white', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                    Learn more <ArrowRight style={{ width: 11, height: 11 }} />
                  </button>
                </div>

                {/* 3 feature columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { emoji: '🚀', title: 'New features', desc: 'Powerful tools to boost productivity.' },
                    { emoji: '🔒', title: 'Enhanced security', desc: 'Enterprise-grade protection.' },
                    { emoji: '📈', title: 'Better insights', desc: 'Data-driven decisions made simple.' },
                  ].map((c, i) => (
                    <div key={i} style={{ border: '1px solid #f1f5f9', borderRadius: 8, padding: '10px 10px 10px' }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{c.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: '14px' }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: '13px' }}>{c.desc}</div>
                    </div>
                  ))}
                </div>

                {/* What's new section */}
                <div style={{ border: '1px solid #f1f5f9', borderRadius: 8, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>What's new?</div>
                    {[
                      'AI-powered content suggestions',
                      'Real-time collaboration',
                      'Advanced analytics dashboard',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <CheckCircle style={{ width: 12, height: 12, color: '#2563eb', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#475569' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mini chart */}
                  <div style={{ width: 70, height: 60, flexShrink: 0 }}>
                    <svg viewBox="0 0 80 60" fill="none" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor="#2563eb" stopOpacity="0.2"/>
                          <stop offset="1" stopColor="#2563eb" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M5 50 Q20 35 35 28 Q50 20 65 10 Q70 8 75 5" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                      <path d="M5 50 Q20 35 35 28 Q50 20 65 10 Q70 8 75 5 L75 60 L5 60 Z" fill="url(#chart-fill)"/>
                      <circle cx="35" cy="28" r="3.5" fill="#f59e0b" stroke="white" strokeWidth="1.5"/>
                      <circle cx="65" cy="10" r="3.5" fill="#2563eb" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>

                {/* Footer text */}
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: '16px' }}>
                  Thanks for being part of our journey!<br />
                  <span style={{ color: '#475569' }}>— The <strong>Your Company</strong> Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '1px solid #f1f5f9',
          display: 'flex', padding: '14px 32px', gap: 0
        }}>
          {[
            { icon: <CheckCircle style={{ width: 18, height: 18, color: '#2563eb' }} />, val: '99.9%', label: 'Uptime', bg: 'rgba(37,99,235,0.06)' },
            { icon: <Shield style={{ width: 18, height: 18, color: '#2563eb' }} />, val: 'Enterprise', label: 'Grade Security', bg: 'rgba(37,99,235,0.06)' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, borderRight: i < 1 ? '1px solid #f1f5f9' : 'none', paddingRight: i < 1 ? 20 : 0, paddingLeft: i > 0 ? 20 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
