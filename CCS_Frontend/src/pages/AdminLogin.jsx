import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://ccs-profilingsystem-production.up.railway.app/api';

const STYLES = `
  @keyframes fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 80%{transform:translateX(-3px)} }
  @keyframes glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
  @keyframes scan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
  @keyframes flicker  { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.4} 94%{opacity:1} 97%{opacity:0.7} 98%{opacity:1} }
  @keyframes orbit    { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
  @keyframes orbit2   { from{transform:rotate(180deg) translateX(80px) rotate(-180deg)} to{transform:rotate(540deg) translateX(80px) rotate(-540deg)} }
  @keyframes btn-glow { 0%,100%{box-shadow:0 4px 24px rgba(242,101,34,0.3),0 0 0 1px rgba(242,101,34,0.2)} 50%{box-shadow:0 4px 32px rgba(242,101,34,0.55),0 0 0 1px rgba(242,101,34,0.4)} }
`;

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'Invalid credentials.'));
      } else if (data.user?.role !== 'admin') {
        setError('This portal is restricted to admin accounts only.');
      } else {
        localStorage.setItem('auth_token', data.token);
        onLogin(data.user);
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1224 40%, #0f1530 70%, #0a0e1a 100%)' }}>
      <style>{STYLES}</style>

      {/* Deep navy-to-indigo radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(30,40,100,0.6) 0%, transparent 65%)' }} />

      {/* Orange accent glow — top right */}
      <div className="absolute pointer-events-none"
        style={{ top: '-80px', right: '-80px', width: '360px', height: '360px',
          background: 'radial-gradient(circle, rgba(242,101,34,0.12) 0%, transparent 65%)',
          animation: 'glow-pulse 4s ease-in-out infinite' }} />

      {/* Orange accent glow — bottom left */}
      <div className="absolute pointer-events-none"
        style={{ bottom: '-60px', left: '-60px', width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(242,101,34,0.08) 0%, transparent 65%)',
          animation: 'glow-pulse 6s ease-in-out infinite reverse' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(242,101,34,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(242,101,34,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(242,101,34,0.15), transparent)', animation: 'scan 8s linear infinite' }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-sm px-5"
        style={{ animation: mounted ? 'fade-up 0.6s ease both' : 'none' }}>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo with orange ring + orbiting dots */}
          <div className="relative mb-5 flex items-center justify-center" style={{ width: 80, height: 80 }}>
            {/* Orbiting dot 1 */}
            <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
              style={{ background: '#f26522', boxShadow: '0 0 8px rgba(242,101,34,0.9)', animation: 'orbit 4s linear infinite', top: '50%', left: '50%', marginTop: -5, marginLeft: -5 }} />
            {/* Orbiting dot 2 */}
            <div className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{ background: 'rgba(242,101,34,0.6)', boxShadow: '0 0 6px rgba(242,101,34,0.6)', animation: 'orbit2 6s linear infinite', top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }} />
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: '0 0 0 1px rgba(242,101,34,0.3), 0 0 24px rgba(242,101,34,0.15)', borderRadius: '18px' }} />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
              style={{ background: 'linear-gradient(135deg, rgba(242,101,34,0.15) 0%, rgba(15,21,48,0.9) 100%)', border: '1px solid rgba(242,101,34,0.25)', backdropFilter: 'blur(8px)' }}>
              <img src="/ccs_logo.jpg" alt="CCS" className="w-11 h-11 object-contain rounded-xl"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          </div>

          {/* Title with flicker */}
          <div className="flex items-center gap-2 mb-1" style={{ animation: 'flicker 6s ease-in-out infinite' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" style={{ boxShadow: '0 0 6px rgba(242,101,34,0.8)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(242,101,34,0.8)' }}>Admin Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" style={{ boxShadow: '0 0 6px rgba(242,101,34,0.8)', animation: 'glow-pulse 2s ease-in-out infinite reverse' }} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Control</h1>
          <p className="text-xs mt-1.5 text-center" style={{ color: 'rgba(148,163,184,0.7)' }}>
            ⚡ Only the chosen ones get in
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(15,21,48,0.7)', border: '1px solid rgba(242,101,34,0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

          {/* Top orange line */}
          <div className="h-px w-full mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(242,101,34,0.5), transparent)' }} />

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Admin Email</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(100,116,139,0.8)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@ccs.pnc.edu.com"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl transition-all focus:outline-none"
                style={{ background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(242,101,34,0.15)', color: '#e2e8f0', caretColor: '#f26522' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(242,101,34,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(242,101,34,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(242,101,34,0.15)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="username" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(100,116,139,0.8)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-11 py-3 rounded-xl transition-all focus:outline-none"
                style={{ background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(242,101,34,0.15)', color: '#e2e8f0', caretColor: '#f26522' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(242,101,34,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(242,101,34,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(242,101,34,0.15)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(100,116,139,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(242,101,34,0.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.8)'; }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPw
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 text-sm rounded-xl px-3.5 py-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', animation: 'shake 0.35s ease' }}>
              <svg className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group mt-1"
            style={{ background: 'linear-gradient(135deg, #f26522 0%, #e04f0f 100%)', boxShadow: '0 4px 24px rgba(242,101,34,0.3), 0 0 0 1px rgba(242,101,34,0.2)', color: '#fff', animation: 'btn-glow 2.5s ease-in-out infinite' }}>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
            {loading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Gaining Access...</>
              : <span className="relative">🔓 Enter the Vault</span>}
          </button>

          {/* Bottom orange line */}
          <div className="h-px w-full mt-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(242,101,34,0.3), transparent)' }} />
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(71,85,105,0.7)' }}>© 2026 CCS Profiling System · All rights reserved</p>
      </div>
    </div>
  );
};

export default AdminLogin;
