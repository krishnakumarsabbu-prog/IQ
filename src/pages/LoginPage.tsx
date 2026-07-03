import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Zap, CheckCircle, Users, Clock } from 'lucide-react';

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
      minHeight: '100vh', width: '100vw', overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'linear-gradient(135deg, #e8eeff 0%, #dce7fd 20%, #c8d8fc 45%, #b8caff 65%, #a8bcff 85%, #9aaff5 100%)',
      position: 'relative', display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatCube {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(0.85); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }
        .lp-left { animation: fadeSlideIn 0.6s 0.05s ease both; }
        .lp-mid  { animation: fadeSlideIn 0.6s 0.15s ease both; }
        .lp-right{ animation: fadeSlideIn 0.6s 0.25s ease both; }
        .btn-signin { transition: background 0.18s, box-shadow 0.18s, transform 0.12s !important; }
        .btn-signin:hover { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.45) !important; }
        .btn-sso { transition: background 0.18s, border-color 0.18s !important; }
        .btn-sso:hover { background: #f0f5ff !important; border-color: #93c5fd !important; }
      `}</style>

      {/* ── Decorative background arcs ── */}
      <svg style={{ position:'absolute', top:0, right:0, pointerEvents:'none', zIndex:0 }} width="700" height="700" viewBox="0 0 700 700" fill="none">
        <circle cx="600" cy="100" r="300" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <circle cx="600" cy="100" r="420" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
        <circle cx="600" cy="100" r="560" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6"/>
      </svg>
      <svg style={{ position:'absolute', bottom:0, left:'30%', pointerEvents:'none', zIndex:0, opacity:0.18 }} width="400" height="300" viewBox="0 0 400 300" fill="none">
        <ellipse cx="200" cy="150" rx="300" ry="200" stroke="white" strokeWidth="0.8"/>
        <ellipse cx="200" cy="150" rx="200" ry="130" stroke="white" strokeWidth="0.6"/>
      </svg>

      {/* ── Top header bar (logo + trusted badge) on gradient ── */}
      <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'28px 48px 0' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:42, height:42, borderRadius:10,
            background:'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(37,99,235,0.35)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', lineHeight:1.1, letterSpacing:'-0.2px' }}>Alerts IQ</div>
            <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:'2.2px', color:'#475569', textTransform:'uppercase' }}>BY ENTERPRISE TEAMS</div>
          </div>
        </div>

        {/* Trusted badge */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(255,255,255,0.82)', backdropFilter:'blur(10px)',
          border:'1px solid rgba(37,99,235,0.18)', borderRadius:30,
          padding:'9px 20px', boxShadow:'0 4px 20px rgba(37,99,235,0.1)'
        }}>
          <ShieldCheck style={{ width:15, height:15, color:'#2563eb' }} />
          <span style={{ fontSize:12.5, fontWeight:600, color:'#0f172a' }}>Trusted by enterprise teams</span>
        </div>
      </div>

      {/* ── Main 3-column layout ── */}
      <div style={{ flex:1, display:'flex', gap:0, padding:'24px 48px 0', position:'relative', zIndex:5, alignItems:'flex-start', minHeight:0 }}>

        {/* ── LEFT WHITE CARD ── */}
        <div className="lp-left" style={{
          width:'34%', minWidth:360, flexShrink:0,
          background:'white', borderRadius:20,
          boxShadow:'0 20px 60px rgba(37,99,235,0.13), 0 4px 20px rgba(15,23,42,0.07)',
          padding:'44px 48px 36px', boxSizing:'border-box',
          display:'flex', flexDirection:'column'
        }}>
          {/* Welcome */}
          <div style={{ fontSize:16, color:'#0f172a', fontWeight:500, display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
            Welcome back! <span style={{ fontSize:18 }}>👋</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize:38, fontWeight:800, color:'#0f172a', lineHeight:1.15, margin:'0 0 12px 0', letterSpacing:'-1px' }}>
            Sign in to your<br />
            <span style={{ color:'#2563eb' }}>workspace</span>
          </h1>

          <p style={{ fontSize:13.5, color:'#64748b', lineHeight:'20px', margin:'0 0 28px 0' }}>
            Automate your email templates, streamline<br />
            approvals, and deliver with confidence.
          </p>

          {error && (
            <div style={{ marginBottom:14, padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, display:'flex', alignItems:'center', gap:8, color:'#dc2626', fontSize:13 }}>
              <ShieldCheck style={{ width:14, height:14, flexShrink:0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column' }}>
            {/* Email */}
            <label style={{ fontSize:13.5, fontWeight:600, color:'#0f172a', marginBottom:7 }}>Email address</label>
            <div style={{ position:'relative', marginBottom:18 }}>
              <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color: emailFocused ? '#2563eb' : '#94a3b8', transition:'color 0.2s' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                style={{
                  width:'100%', height:48, paddingLeft:42, paddingRight:14,
                  border:`1.5px solid ${emailFocused ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius:10, outline:'none', fontSize:14, color:'#0f172a',
                  background: emailFocused ? '#f8fbff' : 'white', boxSizing:'border-box',
                  fontFamily:'inherit', transition:'border-color 0.2s, background 0.2s',
                  boxShadow: emailFocused ? '0 0 0 3px rgba(37,99,235,0.09)' : 'none'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <label style={{ fontSize:13.5, fontWeight:600, color:'#0f172a' }}>Password</label>
              <a href="#" style={{ fontSize:13, fontWeight:600, color:'#2563eb', textDecoration:'none' }}>Forgot password?</a>
            </div>
            <div style={{ position:'relative', marginBottom:24 }}>
              <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color: passwordFocused ? '#2563eb' : '#94a3b8', transition:'color 0.2s' }} />
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                style={{
                  width:'100%', height:48, paddingLeft:42, paddingRight:44,
                  border:`1.5px solid ${passwordFocused ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius:10, outline:'none', fontSize:14, color:'#0f172a',
                  background: passwordFocused ? '#f8fbff' : 'white', boxSizing:'border-box',
                  fontFamily:'inherit', transition:'border-color 0.2s, background 0.2s',
                  boxShadow: passwordFocused ? '0 0 0 3px rgba(37,99,235,0.09)' : 'none'
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, color:'#94a3b8', lineHeight:0 }}>
                {showPassword ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
              </button>
            </div>

            {/* Sign In button */}
            <button type="submit" disabled={loading} className="btn-signin"
              style={{
                width:'100%', height:52, background:'#2563eb', color:'white',
                border:'none', borderRadius:12, fontSize:15, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                fontFamily:'inherit', boxShadow:'0 4px 16px rgba(37,99,235,0.38)',
                letterSpacing:'0.1px'
              }}>
              {loading
                ? <div style={{ width:20, height:20, border:'2.5px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                : <><span>Sign in</span><ArrowRight style={{ width:17, height:17 }} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0' }}>
            <span style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8' }}>or</span>
            <span style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          {/* SSO button */}
          <button type="button" onClick={handleSSO} disabled={loading} className="btn-sso"
            style={{
              width:'100%', height:50, border:'1.5px solid #e2e8f0', borderRadius:12,
              background:'white', fontSize:14, fontWeight:600, color:'#0f172a',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              cursor:'pointer', fontFamily:'inherit'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with SSO
          </button>

          {/* Security footer */}
          <div style={{ display:'flex', alignItems:'center', gap:7, color:'#94a3b8', fontSize:12, marginTop:28 }}>
            <ShieldCheck style={{ width:13, height:13 }} />
            Enterprise security. Your data is always protected.
          </div>
        </div>

        {/* ── MIDDLE SECTION (transparent on gradient) ── */}
        <div className="lp-mid" style={{
          flex:1, padding:'8px 44px 0', display:'flex', flexDirection:'column', position:'relative'
        }}>
          {/* AI Powered badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7, alignSelf:'flex-start',
            background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(37,99,235,0.2)', borderRadius:30,
            padding:'7px 16px', marginBottom:22,
            boxShadow:'0 2px 12px rgba(37,99,235,0.1)'
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#2563eb', animation:'pulseDot 2s ease-in-out infinite', flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:700, color:'#2563eb', letterSpacing:'1px', textTransform:'uppercase' }}>AI POWERED</span>
            <Sparkles style={{ width:12, height:12, color:'#2563eb' }} />
          </div>

          {/* Main heading */}
          <h2 style={{ fontSize:40, fontWeight:800, color:'#0f172a', lineHeight:1.18, margin:'0 0 14px 0', letterSpacing:'-1.2px' }}>
            AI-powered email<br />
            template <span style={{ color:'#2563eb' }}>automation</span>
          </h2>

          <p style={{ fontSize:15, color:'#475569', lineHeight:'23px', margin:'0 0 36px 0' }}>
            Create on-brand, responsive emails in minutes.<br />
            Automate approvals. Deliver at scale.
          </p>

          {/* Feature rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:26 }}>
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                ),
                title: 'Smart template builder',
                desc: 'Build beautiful emails with AI assistance',
                titleColor: '#0f172a'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'Brand consistency',
                desc: 'Ensure every email is on-brand',
                titleColor: '#0f172a'
              },
              {
                icon: <Zap style={{ width:20, height:20, color:'#2563eb' }} />,
                title: 'Faster approvals',
                desc: 'Automate review and approval workflows',
                titleColor: '#2563eb'
              },
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                <div style={{
                  width:46, height:46, borderRadius:12, flexShrink:0,
                  background:'rgba(255,255,255,0.82)', backdropFilter:'blur(6px)',
                  border:'1px solid rgba(37,99,235,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 2px 12px rgba(37,99,235,0.1)'
                }}>
                  {f.icon}
                </div>
                <div style={{ paddingTop:2 }}>
                  <div style={{ fontSize:15, fontWeight:700, color: f.titleColor, marginBottom:3 }}>{f.title}</div>
                  <div style={{ fontSize:13, color:'#64748b', lineHeight:'18px' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 3D Isometric Cube */}
          <div style={{ position:'absolute', bottom:80, right:20, animation:'floatCube 6s ease-in-out infinite' }}>
            <svg width="130" height="120" viewBox="0 0 130 120" fill="none">
              <defs>
                <linearGradient id="iso-top" x1="65" y1="0" x2="65" y2="55" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93c5fd"/>
                  <stop offset="1" stopColor="#60a5fa"/>
                </linearGradient>
                <linearGradient id="iso-left" x1="10" y1="55" x2="65" y2="110" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb"/>
                  <stop offset="1" stopColor="#1d4ed8"/>
                </linearGradient>
                <linearGradient id="iso-right" x1="65" y1="55" x2="120" y2="110" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/>
                  <stop offset="1" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              {/* Top face */}
              <polygon points="65,8 115,36 65,64 15,36" fill="url(#iso-top)" opacity="0.95"/>
              {/* Left face */}
              <polygon points="15,36 65,64 65,110 15,82" fill="url(#iso-left)" opacity="0.9"/>
              {/* Right face */}
              <polygon points="115,36 65,64 65,110 115,82" fill="url(#iso-right)" opacity="0.85"/>
              {/* Shine on top */}
              <polygon points="65,12 110,38 65,58 20,38" fill="white" opacity="0.12"/>
            </svg>
          </div>
        </div>

        {/* ── RIGHT WHITE CARD ── */}
        <div className="lp-right" style={{
          width:'32%', minWidth:340, flexShrink:0,
          background:'white', borderRadius:20,
          boxShadow:'0 20px 60px rgba(37,99,235,0.13), 0 4px 20px rgba(15,23,42,0.07)',
          display:'flex', flexDirection:'column', overflow:'hidden'
        }}>
          {/* Card header */}
          <div style={{ padding:'20px 22px 14px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13.5, fontWeight:700, color:'#0f172a' }}>Live Email Template Preview</span>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, padding:'5px 12px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'pulseDot 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize:11.5, fontWeight:700, color:'#16a34a' }}>Live</span>
            </div>
          </div>

          {/* Email preview */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Email sender row */}
            <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #f8fafc' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#2563eb,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M12 8v4l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Your Company</span>
            </div>

            <div style={{ display:'flex', flex:1 }}>
              {/* Icon sidebar */}
              <div style={{ width:42, borderRight:'1px solid #f1f5f9', padding:'14px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:14, background:'#fafbfc', flexShrink:0 }}>
                {[
                  <svg key="g" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
                  <svg key="img" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
                  <svg key="up" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
                  <svg key="usr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                  <svg key="srch" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
                ].map((icon, i) => (
                  <div key={i} style={{ width:28, height:28, borderRadius:7, background: i===0 ? '#eff6ff' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {icon}
                  </div>
                ))}
              </div>

              {/* Email body */}
              <div style={{ flex:1, padding:'14px 16px', overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
                {/* Hero banner */}
                <div style={{
                  borderRadius:10, overflow:'hidden', position:'relative',
                  background:'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)',
                  padding:'16px 14px 14px', color:'white', minHeight:130
                }}>
                  {/* Glow */}
                  <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:'rgba(147,197,253,0.18)', filter:'blur(20px)', pointerEvents:'none' }} />
                  {/* Floating stars */}
                  <div style={{ position:'absolute', top:10, left:'55%', fontSize:11, opacity:0.6 }}>✦</div>
                  <div style={{ position:'absolute', top:20, right:24, fontSize:8, opacity:0.5 }}>✦</div>
                  <div style={{ position:'absolute', bottom:16, right:10, fontSize:10, opacity:0.4 }}>✦</div>
                  {/* Envelope illustration */}
                  <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:78, height:68, opacity:0.95 }}>
                    <svg viewBox="0 0 90 80" fill="none" style={{ width:'100%', height:'100%' }}>
                      <rect x="5" y="22" width="75" height="50" rx="5" fill="white" opacity="0.18"/>
                      <rect x="5" y="22" width="75" height="50" rx="5" stroke="white" strokeWidth="1.5" opacity="0.55"/>
                      <polyline points="5,24 42.5,50 80,24" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                      {/* Check badge */}
                      <circle cx="68" cy="18" r="13" fill="#22c55e"/>
                      <polyline points="62,18 66,23 75,12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:800, lineHeight:1.3, margin:'0 0 6px 0', position:'relative', zIndex:1, maxWidth:'52%' }}>Your update is here</h3>
                  <p style={{ fontSize:11, margin:'0 0 10px 0', opacity:0.78, lineHeight:'15px', position:'relative', zIndex:1, maxWidth:'50%' }}>
                    We're excited to share what's new and improved.
                  </p>
                  <button style={{ background:'white', color:'#1d4ed8', border:'none', borderRadius:6, padding:'5px 12px', fontSize:10.5, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, position:'relative', zIndex:1, whiteSpace:'nowrap' }}>
                    Learn more <ArrowRight style={{ width:11, height:11 }} />
                  </button>
                </div>

                {/* 3 feature columns */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[
                    { emoji:'🚀', title:'New features', desc:'Powerful tools to boost productivity.' },
                    { emoji:'🔒', title:'Enhanced security', desc:'Enterprise-grade protection.' },
                    { emoji:'📈', title:'Better insights', desc:'Data-driven decisions made simple.' },
                  ].map((c, i) => (
                    <div key={i} style={{ border:'1px solid #f1f5f9', borderRadius:8, padding:'9px 8px' }}>
                      <div style={{ fontSize:15, marginBottom:3 }}>{c.emoji}</div>
                      <div style={{ fontSize:10.5, fontWeight:700, color:'#0f172a', marginBottom:3, lineHeight:'13px' }}>{c.title}</div>
                      <div style={{ fontSize:9.5, color:'#94a3b8', lineHeight:'12px' }}>{c.desc}</div>
                    </div>
                  ))}
                </div>

                {/* What's new */}
                <div style={{ border:'1px solid #f1f5f9', borderRadius:8, padding:'10px 12px', display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:8 }}>What's new?</div>
                    {['AI-powered content suggestions','Real-time collaboration','Advanced analytics dashboard'].map((item, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                        <CheckCircle style={{ width:11, height:11, color:'#2563eb', flexShrink:0 }} />
                        <span style={{ fontSize:10.5, color:'#475569' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Pie chart illustration */}
                  <div style={{ width:60, height:56, flexShrink:0 }}>
                    <svg viewBox="0 0 70 70" fill="none" style={{ width:'100%', height:'100%' }}>
                      <circle cx="35" cy="35" r="28" fill="#f1f5f9"/>
                      <path d="M35 35 L35 7 A28 28 0 0 1 63 35 Z" fill="#2563eb"/>
                      <path d="M35 35 L63 35 A28 28 0 0 1 21 59 Z" fill="#60a5fa"/>
                      <path d="M35 35 L21 59 A28 28 0 0 1 7 21 Z" fill="#f59e0b"/>
                      <circle cx="35" cy="35" r="14" fill="white"/>
                    </svg>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ fontSize:10.5, color:'#94a3b8', lineHeight:'15px', paddingBottom:4 }}>
                  Thanks for being part of our journey!<br />
                  <span style={{ color:'#64748b' }}>— The <strong style={{ color:'#0f172a' }}>Your Company</strong> Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ── */}
      <div style={{
        position:'relative', zIndex:5,
        display:'flex', alignItems:'stretch',
        margin:'16px 48px 24px',
        borderRadius:16,
        overflow:'hidden'
      }}>
        {/* Middle stats (under middle section) */}
        <div style={{ flex:1, display:'flex', background:'rgba(255,255,255,0.55)', backdropFilter:'blur(10px)', borderRadius:'16px 0 0 16px', overflow:'hidden' }}>
          {[
            { icon: <Users style={{ width:20, height:20, color:'#2563eb' }} />, val:'25K+', label:'Active Users' },
            { icon: <Clock style={{ width:20, height:20, color:'#2563eb' }} />, val:'98%', label:'Time Saved' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'16px 22px', borderRight: i===0 ? '1px solid rgba(37,99,235,0.12)' : 'none' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(37,99,235,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', lineHeight:1.1 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Right stats (under right card) */}
        <div style={{ width:'32%', minWidth:340, display:'flex', background:'rgba(255,255,255,0.55)', backdropFilter:'blur(10px)', borderRadius:'0 16px 16px 0', overflow:'hidden', borderLeft:'1px solid rgba(37,99,235,0.1)' }}>
          {[
            { icon: <CheckCircle style={{ width:20, height:20, color:'#2563eb' }} />, val:'99.9%', label:'Uptime' },
            { icon: <ShieldCheck style={{ width:20, height:20, color:'#2563eb' }} />, val:'Enterprise', label:'Grade Security' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderRight: i===0 ? '1px solid rgba(37,99,235,0.12)' : 'none' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(37,99,235,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:'#0f172a', lineHeight:1.1 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
