import { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api';

const STYLES = `
  @keyframes spin-slow  { to { transform: rotate(360deg); } }
  @keyframes spin-rev   { to { transform: rotate(-360deg); } }
  @keyframes float-up   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
  @keyframes float-dn   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(14px) scale(0.97)} }
  @keyframes drift      { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-10px)} 66%{transform:translate(-6px,6px)} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(255,255,255,0.35)} 70%{box-shadow:0 0 0 22px rgba(255,255,255,0)} 100%{box-shadow:0 0 0 0 rgba(255,255,255,0)} }
  @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes fade-up    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 60%{transform:translateX(7px)} 80%{transform:translateX(-3px)} }
  @keyframes particle   { 0%{opacity:0;transform:translateY(0) scale(0)} 20%{opacity:1} 80%{opacity:0.6} 100%{opacity:0;transform:translateY(-60px) scale(1.5)} }
  @keyframes glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
`;

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { w:6,  h:6,  top:'15%', left:'20%', delay:'0s',   dur:'4s'  },
      { w:4,  h:4,  top:'70%', left:'15%', delay:'1.2s', dur:'5s'  },
      { w:8,  h:8,  top:'40%', left:'75%', delay:'0.5s', dur:'6s'  },
      { w:5,  h:5,  top:'80%', left:'60%', delay:'2s',   dur:'4.5s'},
      { w:3,  h:3,  top:'25%', left:'55%', delay:'1.8s', dur:'3.5s'},
      { w:7,  h:7,  top:'55%', left:'35%', delay:'0.8s', dur:'5.5s'},
      { w:4,  h:4,  top:'10%', left:'80%', delay:'2.5s', dur:'4s'  },
      { w:5,  h:5,  top:'90%', left:'40%', delay:'1.5s', dur:'6s'  },
    ].map((p, i) => (
      <div key={i} className="absolute rounded-full bg-white/30"
        style={{ width: p.w, height: p.h, top: p.top, left: p.left,
          animation: `particle ${p.dur} ${p.delay} ease-in-out infinite` }} />
    ))}
  </div>
);

const StudentLogin = ({ onLogin, onGoToSignUp }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) { setError('Please fill in all fields.'); return; }
    if (!/^(22|23|24)\d{5}$/.test(identifier)) {
      setError('Student number must start with 22, 23, or 24 followed by 5 digits.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ student_number: identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'Invalid credentials.'));
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
    <div className="min-h-screen w-screen flex overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff4ec 0%, #ffe8d6 50%, #ffdcc4 100%)' }}>
      <style>{STYLES}</style>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col items-center justify-center"
        style={{ background: 'linear-gradient(145deg, #f26522 0%, #e04f0f 40%, #c13b0a 100%)' }}>

        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '18px 18px' }} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/ccs_logo.jpg" alt=""
            className="w-[480px] h-[480px] object-contain rounded-[100px]"
            style={{ opacity: 0.12, filter: 'blur(6px)' }}
            onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <div className="absolute w-[520px] h-[520px] rounded-full"
          style={{ border: '1px dashed rgba(255,255,255,0.18)', animation: 'spin-slow 30s linear infinite' }} />
        <div className="absolute w-[370px] h-[370px] rounded-full"
          style={{ border: '1.5px solid rgba(255,255,255,0.12)', animation: 'spin-rev 20s linear infinite' }} />
        <div className="absolute w-[230px] h-[230px] rounded-full"
          style={{ border: '2px solid rgba(255,255,255,0.15)', animation: 'spin-slow 12s linear infinite' }} />

        <div className="absolute w-48 h-48 rounded-full"
          style={{ top: '8%', left: '-5%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', animation: 'float-up 7s ease-in-out infinite' }} />
        <div className="absolute w-40 h-40 rounded-full"
          style={{ bottom: '10%', right: '-4%', background: 'radial-gradient(circle, rgba(255,200,100,0.2) 0%, transparent 70%)', animation: 'float-dn 9s ease-in-out infinite' }} />
        <div className="absolute w-24 h-24 rounded-full"
          style={{ top: '55%', left: '10%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', animation: 'drift 11s ease-in-out infinite' }} />

        <Particles />

        <div className="relative z-10 flex flex-col items-center text-center px-10"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>

          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.15)', transform: 'scale(1.35)', filter: 'blur(12px)' }} />
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.1)', transform: 'scale(1.18)', filter: 'blur(6px)' }} />
            <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(12px)', animation: 'pulse-ring 2.8s ease-out infinite' }}>
              <img src="/ccs_logo.jpg" alt="CCS"
                className="w-24 h-24 object-contain rounded-2xl"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25))' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          </div>

          <h2 className="text-4xl font-black tracking-tight mb-1"
            style={{
              background: 'linear-gradient(90deg, #fff 0%, #ffe0c8 40%, #fff 60%, #ffd0a8 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3.5s linear infinite',
            }}>
            Student Portal
          </h2>
          <p className="text-orange-200 text-sm font-semibold tracking-[0.2em] uppercase mt-1">CCS Profiling System</p>

          <div className="flex items-center gap-3 mt-5">
            <div className="w-10 h-px bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-10 h-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT FORM PANEL ══════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 relative">

        {/* Orange radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(242,101,34,0.18) 0%, transparent 65%)' }} />
        {/* Subtle top-right warm glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,160,60,0.15) 0%, transparent 70%)', animation: 'glow-pulse 4s ease-in-out infinite' }} />

        {/* Mobile watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden" style={{ opacity: 0.06 }}>
          <img src="/ccs_logo.jpg" alt="" className="w-72 h-72 object-contain"
            style={{ filter: 'blur(4px)' }} onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <div className="relative z-10 w-full max-w-md"
          style={{ animation: mounted ? 'fade-up 0.65s ease both' : 'none', animationDelay: '0.1s' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow">
              <img src="/ccs_logo.jpg" alt="CCS" className="w-8 h-8 object-contain rounded-lg"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-widest">CCS Profiling</p>
              <p className="text-orange-900 font-bold text-sm">Student Portal</p>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(242,101,34,0.12)', border: '1px solid rgba(242,101,34,0.3)', color: '#c13b0a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
              Student Access
            </div>
            <h1 className="text-3xl font-black leading-tight" style={{ color: '#7a2000' }}>Welcome back 👋</h1>
            <p className="text-sm mt-1.5" style={{ color: '#b05020' }}>Sign in with your student number to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student number field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#c13b0a' }}>Student Number</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#e07040' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </span>
                <input type="text" value={identifier}
                  onChange={e => { setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 7)); setError(''); }}
                  placeholder="e.g. 2201535" inputMode="numeric" maxLength={7}
                  className="w-full text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(242,101,34,0.25)', color: '#5a1a00', backdropFilter: 'blur(4px)' }}
                  onFocus={e => { e.target.style.border = '2px solid #f26522'; e.target.style.boxShadow = '0 0 0 4px rgba(242,101,34,0.12)'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(242,101,34,0.25)'; e.target.style.boxShadow = 'none'; }}
                  autoComplete="username" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#c13b0a' }}>Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#e07040' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full text-sm rounded-2xl pl-11 pr-12 py-3.5 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(242,101,34,0.25)', color: '#5a1a00', backdropFilter: 'blur(4px)' }}
                  onFocus={e => { e.target.style.border = '2px solid #f26522'; e.target.style.boxShadow = '0 0 0 4px rgba(242,101,34,0.12)'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(242,101,34,0.25)'; e.target.style.boxShadow = 'none'; }}
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#e07040' }}>
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
              <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
                style={{ animation: 'shake 0.35s ease' }}>
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #f26522 0%, #e04f0f 100%)', boxShadow: '0 4px 24px rgba(242,101,34,0.45)' }}>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in...</>
                : <span className="relative">Sign In →</span>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(242,101,34,0.2)' }} />
            <span className="text-xs" style={{ color: '#c06030' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(242,101,34,0.2)' }} />
          </div>

          <p className="text-sm text-center" style={{ color: '#b05020' }}>
            Don't have an account?{' '}
            <button onClick={onGoToSignUp} className="font-bold transition-colors hover:underline" style={{ color: '#e04f0f' }}>Create one</button>
          </p>
          <p className="text-xs mt-2 text-center" style={{ color: '#c06030' }}>
            Faculty?{' '}
            <a href="/faculty/login" className="font-semibold transition-colors hover:underline" style={{ color: '#e04f0f' }}>Faculty Login →</a>
          </p>
          <p className="text-center text-xs mt-8" style={{ color: 'rgba(180,80,20,0.5)' }}>© 2026 CCS Profiling System</p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
