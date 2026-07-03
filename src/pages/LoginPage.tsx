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
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    }} className="aurora-bg">
      {/* Premium Fonts, Animations & Shimmers */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
        }
        
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .aurora-bg {
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 25%, #DBE7FF 50%, #E0F2FE 75%, #F5F8FF 100%);
          background-size: 400% 400%;
          animation: aurora 22s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .animate-fade-in-left { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-middle { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .animate-fade-in-right { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }

        .glass-vision {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.02),
            0 30px 60px rgba(30, 80, 255, 0.03),
            inset 0 1px 2px rgba(255, 255, 255, 0.7);
        }

        .glass-dock {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.03),
            0 1px 2px rgba(0, 0, 0, 0.01),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .btn-premium {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(30, 80, 255, 0.3);
          background: #003CDD !important;
        }
        .btn-premium::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0) 100%);
          animation: shimmer 2.5s infinite;
        }
      `}</style>

      {/* Layered Background Radial Gradients (Light Bloom) */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '15%', right: '10%', width: '55vw', height: '55vh', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '20%', width: '60vw', height: '60vh', background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, rgba(147,197,253,0) 70%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Noise texture overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02, pointerEvents: 'none', zIndex: 1 }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Abstract wave lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M-100,600 C200,450 600,800 1000,550 C1250,390 1350,560 1650,420" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
        <path d="M-50,680 C300,520 700,850 1100,620 C1350,450 1450,680 1700,520" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      </svg>

      {/* ── Center Container (Max-Width 1440px) ── */}
      <div style={{
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 48px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* ── Top Header ── */}
        <header style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0 12px 0',
          boxSizing: 'border-box',
          zIndex: 10,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E50FF 0%, #003CDD 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(30, 80, 255, 0.22)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Alerts IQ
              </div>
              <div style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '2.2px', color: '#64748B', textTransform: 'uppercase' }}>
                BY ENTERPRISE TEAMS
              </div>
            </div>
          </div>

          {/* Trusted Badge */}
          <div className="glass-dock" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '30px',
            padding: '8px 18px',
          }}>
            <ShieldCheck style={{ width: '15px', height: '15px', color: '#1E50FF' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Trusted by enterprise teams</span>
          </div>
        </header>

        {/* ── Main Layout Content ── */}
        <main style={{
          flex: 1,
          display: 'flex',
          padding: '12px 0 24px 0',
          boxSizing: 'border-box',
          gap: '48px',
          alignItems: 'stretch',
          position: 'relative',
          minHeight: 0, // ensure flex container behaves correctly
        }}>
          {/* Left Column - Premium Login Card */}
          <div className="animate-fade-in-left" style={{
            width: '410px',
            flexShrink: 0,
            borderRadius: '24px',
            padding: '32px 36px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#FFFFFF',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            height: '100%',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', color: '#4B5563', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  Welcome back! <span style={{ fontSize: '16px' }}>👋</span>
                </div>

                <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15, margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>
                  Sign in to your<br />
                  <span style={{ color: '#1E50FF' }}>workspace</span>
                </h1>

                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5', margin: '0 0 26px 0' }}>
                  Automate your email templates, streamline approvals, and deliver with confidence.
                </p>

                {error && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px 14px',
                    background: 'rgba(254, 242, 242, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #FEE2E2',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#DC2626',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <ShieldCheck style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Email field */}
                  <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
                  <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <Mail style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: emailFocused ? '#1E50FF' : '#64748B',
                      transition: 'color 0.2s'
                    }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '42px',
                        paddingRight: '14px',
                        border: `1px solid ${emailFocused ? '#1E50FF' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#0F172A',
                        background: '#FFFFFF',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: emailFocused ? '0 0 0 4px rgba(30, 80, 255, 0.08)' : 'none'
                      }}
                    />
                  </div>

                  {/* Password field */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#374151' }}>Password</label>
                    <a href="#" style={{ fontSize: '13px', fontWeight: 600, color: '#1E50FF', textDecoration: 'none', transition: 'color 0.2s' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Lock style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: passwordFocused ? '#1E50FF' : '#64748B',
                      transition: 'color 0.2s'
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '42px',
                        paddingRight: '44px',
                        border: `1px solid ${passwordFocused ? '#1E50FF' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#0F172A',
                        background: '#FFFFFF',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: passwordFocused ? '0 0 0 4px rgba(30, 80, 255, 0.08)' : 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#64748B',
                        lineHeight: 0
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium"
                    style={{
                      width: '100%',
                      height: '50px',
                      background: '#1E50FF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.8 : 1,
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 16px rgba(30, 80, 255, 0.2)',
                      letterSpacing: '0.2px'
                    }}
                  >
                    {loading ? (
                      <div style={{ width: '20px', height: '20px', border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                  <span style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.06)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
                  <span style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.06)' }} />
                </div>

                {/* SSO button */}
                <button
                  type="button"
                  onClick={handleSSO}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with SSO
                </button>
              </div>

              {/* Bottom Security Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12.5px', fontWeight: 500, justifyContent: 'center', marginTop: '24px' }}>
                <ShieldCheck style={{ width: '15px', height: '15px', color: '#1E50FF' }} />
                <span>Enterprise security. Your data is always protected.</span>
              </div>
            </div>
          </div>

          {/* Right Section Layout */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}>
            {/* Top content row: Middle features + Mockup preview */}
            <div style={{
              display: 'flex',
              flex: 1,
              gap: '32px',
              alignItems: 'center',
              minHeight: 0,
              marginBottom: '16px',
            }}>
              {/* Middle Column (AI Text & features) */}
              <div className="animate-fade-in-middle" style={{
                flex: 1.1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {/* AI Powered Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'flex-start',
                  borderRadius: '30px',
                  padding: '6px 14px',
                  marginBottom: '20px',
                  background: 'rgba(239, 246, 255, 0.8)',
                  border: '1px solid rgba(30, 80, 255, 0.1)',
                }}>
                  <Sparkles style={{ width: '13px', height: '13px', color: '#1E50FF' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E50FF', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    AI POWERED
                  </span>
                </div>

                {/* Main Heading */}
                <h2 style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.15,
                  margin: '0 0 16px 0',
                  letterSpacing: '-0.02em',
                }}>
                  AI-powered email<br />
                  template <span style={{ color: '#1E50FF' }}>automation</span>
                </h2>

                <p style={{
                  fontSize: '15px',
                  color: '#4B5563',
                  lineHeight: '1.6',
                  margin: '0 0 28px 0',
                }}>
                  Create on-brand, responsive emails in minutes.<br />
                  Automate approvals. Deliver at scale.
                </p>

                {/* Features List (No surrounding cards/boxes, exactly like original) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E50FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2c0 5.5-4.5 10-10 10 5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z" fill="#1E50FF" />
                        </svg>
                      ),
                      title: 'Smart template builder',
                      desc: 'Build beautiful emails with AI assistance'
                    },
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E50FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 11 11 13 15 9" />
                        </svg>
                      ),
                      title: 'Brand consistency',
                      desc: 'Ensure every email is on-brand'
                    },
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E50FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#1E50FF" />
                        </svg>
                      ),
                      title: 'Faster approvals',
                      desc: 'Automate review and approval workflows'
                    }
                  ].map((f, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '18px',
                    }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
                      }}>
                        {f.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#1F2937', marginBottom: '2px' }}>
                          {f.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.4' }}>
                          {f.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Preview Workspace Column */}
              <div className="animate-fade-in-right" style={{
                flex: 0.95,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '400px',
              }}>
                <div style={{
                  width: '100%',
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  maxHeight: '480px',
                  background: '#FFFFFF',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                }}>
                  {/* Mockup Title Header Toolbar */}
                  <div style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #F1F5F9',
                    background: '#FFFFFF',
                  }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                      Live Email Template Preview
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#E2FBEB', borderRadius: '20px', padding: '3px 10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#16A34A' }}>Live</span>
                    </div>
                  </div>

                  {/* Main Workspace split */}
                  <div style={{ 
                    display: 'flex', 
                    flex: 1, 
                    minHeight: 0,
                    background: '#FFFFFF',
                  }}>
                    {/* Left Sidebar Blocks */}
                    <div style={{
                      width: '56px',
                      borderRight: '1px solid #F1F5F9',
                      padding: '20px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '20px',
                      background: '#F8FAFC',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#1E50FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(30, 80, 255, 0.3)',
                        marginBottom: '10px'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </div>
                      {[
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="11" y2="17" /></svg>,
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      ].map((icon, idx) => (
                        <div key={idx} style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {icon}
                        </div>
                      ))}
                    </div>

                    {/* Canvas Workspace Viewport */}
                    <div style={{
                      flex: 1,
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      background: '#FFFFFF',
                      minHeight: 0,
                    }}>
                      {/* Header bar within Editor */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1E50FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '10px' }}>✓</div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Your Company</span>
                        </div>
                      </div>

                      {/* Blue Premium Hero Card */}
                      <div style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1E50FF 0%, #003CDD 100%)',
                        padding: '18px',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 12px 30px rgba(30, 80, 255, 0.25)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}>
                        {/* Interactive 3D Envelope illustration inside card */}
                        <div style={{
                          position: 'absolute',
                          right: '8px',
                          bottom: '8px',
                          width: '95px',
                          height: '85px',
                          opacity: 0.95,
                          zIndex: 1,
                          transform: 'rotate(-5deg) translateY(-2px)',
                        }}>
                          <svg width="100%" height="100%" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="25" width="80" height="55" rx="6" fill="#1D4ED8" opacity="0.8" />
                            <rect x="5" y="25" width="80" height="55" rx="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                            <rect x="15" y="8" width="60" height="40" rx="4" fill="white" />
                            <line x1="22" y1="18" x2="52" y2="18" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                            <line x1="22" y1="26" x2="68" y2="26" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                            <line x1="22" y1="34" x2="40" y2="34" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                            <path d="M5,25 L45,55 C48,57 52,57 55,55 L95,25" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                            <polyline points="5,80 45,50 95,80" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                            <circle cx="78" cy="18" r="11" fill="#10B981" filter="drop-shadow(0 2px 6px rgba(16,185,129,0.4))" />
                            <polyline points="73,18 77,22 84,14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        {/* Sparkles icons on Hero card */}
                        <div className="animate-pulse-glow" style={{ position: 'absolute', right: '110px', top: '15px', pointerEvents: 'none' }}>
                          <Sparkles style={{ width: '14px', height: '14px', color: '#93C5FD' }} />
                        </div>

                        <div style={{ position: 'relative', zIndex: 2, maxWidth: '60%' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                            Your update is here
                          </h3>
                          <p style={{ fontSize: '11px', margin: '0 0 14px 0', opacity: 0.85, lineHeight: 1.4 }}>
                            We're excited to share what's new and improved in this edition.
                          </p>
                          <button style={{
                            background: '#FFFFFF',
                            color: '#1D4ED8',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                          }}>
                            Learn more <ArrowRight style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      </div>

                      {/* Three Columns Grid (Colored Backgrounds, No Borders) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                          { 
                            icon: (
                              <div style={{width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4.5 16.5c-1.5 1.26-2 2.76-2 3.5 0 .28.22.5.5.5.74 0 2.24-.5 3.5-2" />
                                  <path d="M12 15l-3-3M2 22l1-1M17 5c-2.3 0-4.3 1-5.7 2.7L7 12l5 5 4.3-4.3c1.7-1.4 2.7-3.4 2.7-5.7V3h-2v2z" />
                                </svg>
                              </div>
                            ), 
                            title: 'New features', 
                            desc: 'Powerful tools to boost productivity.',
                            bg: '#FFF8F5'
                          },
                          { 
                            icon: (
                              <div style={{width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </div>
                            ), 
                            title: 'Enhanced security', 
                            desc: 'Enterprise-grade protection.',
                            bg: '#FFFDF0'
                          },
                          { 
                            icon: (
                              <div style={{width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="20" x2="18" y2="10" />
                                  <line x1="12" y1="20" x2="12" y2="4" />
                                  <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                              </div>
                            ), 
                            title: 'Better insights', 
                            desc: 'Data-driven decisions made simple.',
                            bg: '#F4FDF7'
                          },
                        ].map((col, idx) => (
                          <div key={idx} style={{
                            borderRadius: '10px',
                            padding: '10px 8px',
                            background: col.bg,
                          }}>
                            <div style={{ marginBottom: '6px' }}>{col.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F2937', marginBottom: '2px', lineHeight: 1.2 }}>
                              {col.title}
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748B', lineHeight: 1.3 }}>
                              {col.desc}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* What's new list + Chart graphic row */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                            What's new?
                          </div>
                          {[
                            'AI-powered content suggestions',
                            'Real-time collaboration',
                            'Advanced analytics dashboard'
                          ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <div style={{ width: '10px', height: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E50FF', flexShrink: 0 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <span style={{ fontSize: '10.5px', color: '#4B5563', fontWeight: 500 }}>{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Layered Dashboard Chart Widget floating with no borders */}
                        <div style={{ width: '100px', height: '60px', flexShrink: 0, position: 'relative' }}>
                          <svg viewBox="0 0 100 60" fill="none" style={{ width: '100%', height: '100%' }}>
                            {/* Bar Chart group */}
                            <rect x="0" y="25" width="6" height="18" rx="2" fill="#E2E8F0" />
                            <rect x="10" y="18" width="6" height="25" rx="2" fill="#60A5FA" opacity="0.6" />
                            <rect x="20" y="22" width="6" height="21" rx="2" fill="#93C5FD" opacity="0.4" />
                            
                            {/* Pie Chart group */}
                            <circle cx="65" cy="30" r="20" fill="white" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.04))" />
                            <circle cx="65" cy="30" r="16" stroke="#F1F5F9" strokeWidth="4" />
                            
                            {/* Blue segment */}
                            <path d="M65 14 A16 16 0 0 1 81 30" stroke="#1E50FF" strokeWidth="4" strokeLinecap="round" />
                            {/* Light Blue segment */}
                            <path d="M81 30 A16 16 0 0 1 65 46" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                            
                            <circle cx="65" cy="30" r="10" fill="white" />
                          </svg>
                        </div>
                      </div>

                      {/* Footer Signature */}
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '10px',
                        borderTop: '1px solid #F1F5F9'
                      }}>
                        <div style={{ fontSize: '10px', color: '#4B5563', fontWeight: 500 }}>
                          Thanks for being part of our journey!
                        </div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>
                          – The Your Company Team
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Apple Dock style glass stats bar spanning across middle and right */}
            <div className="glass-dock" style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '76px',
              borderRadius: '20px',
              boxSizing: 'border-box',
              padding: '0 32px',
              zIndex: 5,
              position: 'relative',
              justifyContent: 'space-between'
            }}>
              {/* 3D Glassmorphic Crystal Cube Floating */}
              <div className="animate-float" style={{
                position: 'absolute',
                left: '-24px',
                top: '-68px',
                zIndex: 6,
                pointerEvents: 'none',
              }}>
                <svg width="110" height="110" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0 20px 30px rgba(30,80,255,0.22))' }}>
                  <defs>
                    <linearGradient id="glass-top" x1="60" y1="12" x2="60" y2="58" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                      <stop offset="35%" stopColor="#E0F2FE" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="glass-left" x1="12" y1="35" x2="60" y2="105" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="glass-right" x1="60" y1="35" x2="108" y2="105" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.75" />
                      <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="core-glow" x1="60" y1="40" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                    </linearGradient>
                    <filter id="cube-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                    </filter>
                  </defs>
                  <circle cx="60" cy="62" r="16" fill="url(#core-glow)" filter="url(#cube-glow)" />
                  <circle cx="60" cy="62" r="8" fill="#93C5FD" opacity="0.7" />
                  <line x1="60" y1="88" x2="60" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="32" y1="50" x2="60" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="88" y1="50" x2="60" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                  <polygon points="60,15 108,40 60,65 12,40" fill="url(#glass-top)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" strokeLinejoin="round" />
                  <polygon points="12,40 60,65 60,105 12,80" fill="url(#glass-left)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinejoin="round" />
                  <polygon points="108,40 60,65 60,105 108,80" fill="url(#glass-right)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinejoin="round" />
                  <line x1="60" y1="65" x2="60" y2="105" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
                  <line x1="12" y1="40" x2="60" y2="65" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <line x1="108" y1="40" x2="60" y2="65" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
                  <circle cx="60" cy="15" r="1.5" fill="#FFFFFF" />
                  <circle cx="12" cy="40" r="1" fill="#FFFFFF" opacity="0.8" />
                  <circle cx="108" cy="40" r="1" fill="#FFFFFF" opacity="0.8" />
                </svg>
              </div>

              {/* Stat 1 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '80px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(30, 80, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Users style={{ width: '18px', height: '18px', color: '#1E50FF' }} />
                </div>
                <div>
                  <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    25K+
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Active Users
                  </div>
                </div>
              </div>

              <div style={{ width: '1px', height: '36px', background: 'rgba(30, 80, 255, 0.1)', margin: '0 16px' }} />

              {/* Stat 2 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(30, 80, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock style={{ width: '18px', height: '18px', color: '#1E50FF' }} />
                </div>
                <div>
                  <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    98%
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Time Saved
                  </div>
                </div>
              </div>

              <div style={{ width: '1px', height: '36px', background: 'rgba(30, 80, 255, 0.1)', margin: '0 16px' }} />

              {/* Stat 3 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(30, 80, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle style={{ width: '18px', height: '18px', color: '#1E50FF' }} />
                </div>
                <div>
                  <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    99.9%
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Uptime
                  </div>
                </div>
              </div>

              <div style={{ width: '1px', height: '36px', background: 'rgba(30, 80, 255, 0.1)', margin: '0 16px' }} />

              {/* Stat 4 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: 'rgba(30, 80, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#1E50FF' }} />
                </div>
                <div>
                  <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    Enterprise
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Grade Security
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
