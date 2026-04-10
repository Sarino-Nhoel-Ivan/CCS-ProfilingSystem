import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://ccs-profilingsystem-production.up.railway.app/api';

const STYLES = `
  @keyframes spin-slow  { to { transform: rotate(360deg); } }
  @keyframes spin-rev   { to { transform: rotate(-360deg); } }
  @keyframes float-up   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
  @keyframes float-dn   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
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
    {[{w:6,h:6,top:'15%',left:'20%',delay:'0s',dur:'4s'},{w:4,h:4,top:'70%',left:'15%',delay:'1.2s',dur:'5s'},
      {w:8,h:8,top:'40%',left:'75%',delay:'0.5s',dur:'6s'},{w:5,h:5,top:'80%',left:'60%',delay:'2s',dur:'4.5s'},
      {w:3,h:3,top:'25%',left:'55%',delay:'1.8s',dur:'3.5s'},{w:7,h:7,top:'55%',left:'35%',delay:'0.8s',dur:'5.5s'},
      {w:4,h:4,top:'10%',left:'80%',delay:'2.5s',dur:'4s'},{w:5,h:5,top:'90%',left:'40%',delay:'1.5s',dur:'6s'},
    ].map((p,i) => (
      <div key={i} className="absolute rounded-full bg-white/30"
        style={{width:p.w,height:p.h,top:p.top,left:p.left,animation:`particle ${p.dur} ${p.delay} ease-in-out infinite`}} />
    ))}
  </div>
);

const OInput = ({ icon, ...props }) => (
  <div className="relative group">
    {icon && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" style={{color:'#e07040'}}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </span>
    )}
    <input {...props}
      className={`w-full text-sm rounded-2xl py-3.5 focus:outline-none transition-all ${icon ? 'pl-11 pr-4' : 'px-4'}`}
      style={{background:'rgba(255,255,255,0.75)',border:'2px solid rgba(242,101,34,0.25)',color:'#5a1a00',backdropFilter:'blur(4px)'}}
      onFocus={e=>{e.target.style.border='2px solid #f26522';e.target.style.boxShadow='0 0 0 4px rgba(242,101,34,0.12)';}}
      onBlur={e=>{e.target.style.border='2px solid rgba(242,101,34,0.25)';e.target.style.boxShadow='none';}}
    />
  </div>
);

const OSelect = ({ children, ...props }) => (
  <select {...props}
    className="w-full text-sm rounded-2xl px-4 py-3.5 focus:outline-none transition-all"
    style={{background:'rgba(255,255,255,0.75)',border:'2px solid rgba(242,101,34,0.25)',color:'#5a1a00'}}
    onFocus={e=>{e.target.style.border='2px solid #f26522';e.target.style.boxShadow='0 0 0 4px rgba(242,101,34,0.12)';}}
    onBlur={e=>{e.target.style.border='2px solid rgba(242,101,34,0.25)';e.target.style.boxShadow='none';}}
  >
    {children}
  </select>
);

const Label = ({ children }) => (
  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'#c13b0a'}}>{children}</label>
);
const Field = ({ label, children }) => <div><Label>{label}</Label>{children}</div>;

const Section = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <span className="text-base">{icon}</span>
    <span className="text-xs font-black uppercase tracking-widest" style={{color:'#e04f0f'}}>{title}</span>
    <div className="flex-1 h-px" style={{background:'linear-gradient(to right, rgba(242,101,34,0.4), transparent)'}} />
  </div>
);

const ErrorBox = ({ msg }) => msg ? (
  <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3.5" style={{animation:'shake 0.35s ease'}}>
    <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <span>{msg}</span>
  </div>
) : null;

const StudentSignUp = ({ onSignUp, onGoToLogin }) => {
  const [step, setStep]       = useState('form');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [otp, setOtp]         = useState(['','','','','','']);
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const [form, setForm] = useState({
    student_number:'', first_name:'', middle_name:'', last_name:'',
    gender:'', contact_number:'', email:'', password:'', password_confirmation:'',
  });
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const startTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => setResendTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; }), 1000);
  };

  const handleSendOtp = async () => {
    setError(''); setInfo('');
    if (!form.email) { setError('Please enter your email address first.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/send-otp`, { method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'}, body: JSON.stringify({ email: form.email, role: 'student' }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to send OTP.'); return; }
      setInfo(`OTP sent to ${form.email}.`); setStep('otp'); startTimer();
    } catch { setError('Could not reach the server.'); } finally { setLoading(false); }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`otp-s-${i+1}`)?.focus();
  };
  const handleOtpKey = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-s-${i-1}`)?.focus(); };

  const handleVerifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, { method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'}, body: JSON.stringify({ email: form.email, otp: code }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Invalid OTP.'); return; }
      setInfo('✅ Email verified! Submitting...'); await handleRegister();
    } catch { setError('Could not reach the server.'); } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
        body: JSON.stringify({ role:'student', student_number:form.student_number, email:form.email, password:form.password, password_confirmation:form.password_confirmation, first_name:form.first_name, middle_name:form.middle_name, last_name:form.last_name, gender:form.gender, contact_number:form.contact_number }) });
      const data = await res.json();
      if (!res.ok) { setError(data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'Registration failed.')); setStep('form'); }
      else { localStorage.setItem('auth_token', data.token); onSignUp(data.user); }
    } catch { setError('Could not connect to the server.'); setStep('form'); } finally { setLoading(false); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!/^(22|23|24)\d{5}$/.test(form.student_number)) { setError('Student number must start with 22, 23, or 24 followed by 5 digits.'); return; }
    if (!form.first_name || !form.last_name) { setError('First and last name are required.'); return; }
    if (!form.gender) { setError('Please select your gender.'); return; }
    if (!/^09\d{9}$/.test(form.contact_number)) { setError('Mobile number must be 11 digits starting with 09.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match.'); return; }
    await handleSendOtp();
  };

  const PwIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
  const EyeIcon = ({ open }) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}</svg>;

  return (
    <div className="min-h-screen w-screen flex overflow-hidden" style={{background:'linear-gradient(135deg,#fff4ec 0%,#ffe8d6 50%,#ffdcc4 100%)'}}>
      <style>{STYLES}</style>

      {/* LEFT animated panel */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[36%] relative overflow-hidden flex-col items-center justify-center shrink-0"
        style={{background:'linear-gradient(160deg,#f26522 0%,#e04f0f 35%,#c13b0a 70%,#99310e 100%)'}}>
        <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',backgroundSize:'18px 18px'}} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/ccs_logo.jpg" alt="" className="w-[460px] h-[460px] object-contain rounded-[100px]"
            style={{opacity:0.13,filter:'blur(7px)'}} onError={e=>{e.target.style.display='none';}} />
        </div>
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{border:'1px dashed rgba(255,255,255,0.18)',animation:'spin-slow 30s linear infinite'}} />
        <div className="absolute w-[360px] h-[360px] rounded-full" style={{border:'1.5px solid rgba(255,255,255,0.12)',animation:'spin-rev 20s linear infinite'}} />
        <div className="absolute w-[220px] h-[220px] rounded-full" style={{border:'2px solid rgba(255,255,255,0.15)',animation:'spin-slow 12s linear infinite'}} />
        <div className="absolute w-48 h-48 rounded-full" style={{top:'6%',left:'-6%',background:'radial-gradient(circle,rgba(255,255,255,0.18) 0%,transparent 70%)',animation:'float-up 7s ease-in-out infinite'}} />
        <div className="absolute w-40 h-40 rounded-full" style={{bottom:'8%',right:'-5%',background:'radial-gradient(circle,rgba(255,200,100,0.2) 0%,transparent 70%)',animation:'float-dn 9s ease-in-out infinite'}} />
        <div className="absolute w-24 h-24 rounded-full" style={{top:'52%',left:'8%',background:'radial-gradient(circle,rgba(255,255,255,0.12) 0%,transparent 70%)',animation:'drift 11s ease-in-out infinite'}} />
        <Particles />
        <div className="relative z-10 flex flex-col items-center text-center px-10"
          style={{opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.8s ease,transform 0.8s ease'}}>
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl" style={{background:'rgba(255,255,255,0.15)',transform:'scale(1.35)',filter:'blur(12px)'}} />
            <div className="absolute inset-0 rounded-3xl" style={{background:'rgba(255,255,255,0.1)',transform:'scale(1.18)',filter:'blur(6px)'}} />
            <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{background:'rgba(255,255,255,0.22)',backdropFilter:'blur(12px)',animation:'pulse-ring 2.8s ease-out infinite'}}>
              <img src="/ccs_logo.jpg" alt="CCS" className="w-24 h-24 object-contain rounded-2xl"
                style={{filter:'drop-shadow(0 4px 16px rgba(0,0,0,0.25))'}} onError={e=>{e.target.style.display='none';}} />
            </div>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-1"
            style={{background:'linear-gradient(90deg,#fff 0%,#ffe0c8 40%,#fff 60%,#ffd0a8 100%)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 3.5s linear infinite'}}>
            Student Portal
          </h2>
          <p className="text-orange-200 text-sm font-semibold tracking-[0.2em] uppercase mt-1">CCS Profiling System</p>
          <div className="flex items-center gap-3 mt-5">
            <div className="w-10 h-px bg-white/30" /><div className="w-2 h-2 rounded-full bg-white/50" /><div className="w-10 h-px bg-white/30" />
          </div>
        </div>
      </div>

      {/* RIGHT scrollable form */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto py-10 px-4 lg:px-10 relative">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 60% 30%,rgba(242,101,34,0.12) 0%,transparent 60%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(255,160,60,0.15) 0%,transparent 70%)',animation:'glow-pulse 4s ease-in-out infinite'}} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden" style={{opacity:0.05}}>
          <img src="/ccs_logo.jpg" alt="" className="w-72 h-72 object-contain" style={{filter:'blur(4px)'}} onError={e=>{e.target.style.display='none';}} />
        </div>

        <div className="relative z-10 w-full max-w-2xl" style={{animation:mounted?'fade-up 0.65s ease both':'none',animationDelay:'0.1s'}}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow" style={{background:'linear-gradient(135deg,#f26522,#c13b0a)'}}>
              <img src="/ccs_logo.jpg" alt="CCS" className="w-8 h-8 object-contain rounded-lg" onError={e=>{e.target.style.display='none';}} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{color:'#e04f0f'}}>CCS Profiling</p>
              <p className="font-bold text-sm" style={{color:'#7a2000'}}>Student Registration</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-3"
              style={{background:'rgba(242,101,34,0.12)',border:'1px solid rgba(242,101,34,0.3)',color:'#c13b0a'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" style={{animation:'pulse-ring 2s ease-out infinite'}} />
              Student Registration
            </div>
            <h1 className="text-3xl font-black leading-tight" style={{color:'#7a2000'}}>Create your account ✨</h1>
            <p className="text-sm mt-1.5" style={{color:'#b05020'}}>Fill in your details to get started.</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl shadow-xl p-8"
            style={{background:'rgba(255,255,255,0.82)',backdropFilter:'blur(8px)',border:'1px solid rgba(242,101,34,0.2)',boxShadow:'0 8px 40px rgba(242,101,34,0.15),0 2px 8px rgba(0,0,0,0.06)'}}>

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl text-center" style={{background:'linear-gradient(135deg,rgba(242,101,34,0.08),rgba(255,237,213,0.6))',border:'1px solid rgba(242,101,34,0.2)'}}>
                  <div className="text-4xl mb-2">📧</div>
                  <p className="text-sm font-medium" style={{color:'#7a2000'}}>We sent a 6-digit code to</p>
                  <p className="font-bold text-sm mt-0.5" style={{color:'#e04f0f'}}>{form.email}</p>
                  <p className="text-xs mt-1" style={{color:'#b05020'}}>Check your inbox and spam folder.</p>
                </div>
                {info && !error && <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">{info}</div>}
                <ErrorBox msg={error} />
                <div className="flex justify-center gap-3">
                  {otp.map((digit,i) => (
                    <input key={i} id={`otp-s-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)}
                      className="w-12 h-14 text-center text-2xl font-black rounded-2xl focus:outline-none transition-all shadow-sm"
                      style={{background:'rgba(255,255,255,0.9)',border:'2px solid rgba(242,101,34,0.3)',color:'#5a1a00'}}
                      onFocus={e=>{e.target.style.border='2px solid #f26522';e.target.style.boxShadow='0 0 0 4px rgba(242,101,34,0.15)';}}
                      onBlur={e=>{e.target.style.border='2px solid rgba(242,101,34,0.3)';e.target.style.boxShadow='none';}} />
                  ))}
                </div>
                <button onClick={handleVerifyOtp} disabled={loading||otp.join('').length<6}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                  style={{background:'linear-gradient(135deg,#f26522 0%,#e04f0f 100%)',boxShadow:'0 4px 20px rgba(242,101,34,0.4)'}}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)'}} />
                  {loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying...</>:<span className="relative">Verify & Create Account →</span>}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button onClick={()=>{setStep('form');setOtp(['','','','','','']);setError('');setInfo('');}} className="transition-colors hover:underline" style={{color:'#b05020'}}>← Back to form</button>
                  {resendTimer>0?<span style={{color:'#c06030'}}>Resend in {resendTimer}s</span>:<button onClick={handleSendOtp} disabled={loading} className="font-bold transition-colors disabled:opacity-50" style={{color:'#e04f0f'}}>Resend OTP</button>}
                </div>
              </div>
            )}

            {/* Form Step */}
            {step === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Section icon="🎓" title="Student Identifier" />
                <Field label="Student Number *">
                  <OInput placeholder="e.g. 2201535 (starts with 22, 23, or 24)" value={form.student_number}
                    onChange={e=>set('student_number',e.target.value.replace(/\D/g,'').slice(0,7))} inputMode="numeric" maxLength={7} required />
                </Field>
                <p className="text-xs -mt-2" style={{color:'#b05020'}}>Must start with 22, 23, or 24 followed by 5 digits.</p>

                <Section icon="👤" title="Personal Information" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="First Name *"><OInput placeholder="Juan" value={form.first_name} onChange={e=>set('first_name',e.target.value)} required /></Field>
                  <Field label="Middle Name"><OInput placeholder="Santos" value={form.middle_name} onChange={e=>set('middle_name',e.target.value)} /></Field>
                  <Field label="Last Name *"><OInput placeholder="dela Cruz" value={form.last_name} onChange={e=>set('last_name',e.target.value)} required /></Field>
                </div>
                <Field label="Gender *">
                  <OSelect value={form.gender} onChange={e=>set('gender',e.target.value)} required>
                    <option value="">Select gender</option><option>Male</option><option>Female</option>
                  </OSelect>
                </Field>
                <Field label="Mobile Number *">
                  <OInput type="tel" placeholder="09XXXXXXXXX" value={form.contact_number}
                    onChange={e=>set('contact_number',e.target.value.replace(/\D/g,'').slice(0,11))} inputMode="numeric" maxLength={11} required />
                </Field>

                <Section icon="🔐" title="Account Credentials" />
                <Field label="Personal Email *">
                  <OInput icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    type="email" placeholder="youremail@gmail.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
                  <p className="text-xs mt-1.5" style={{color:'#b05020'}}>Used for OTP verification only. Login uses your student number.</p>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Password * (min. 8 chars)">
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{color:'#e07040'}}><PwIcon /></span>
                      <input type={showPw?'text':'password'} placeholder="Min. 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}
                        className="w-full text-sm rounded-2xl pl-11 pr-12 py-3.5 focus:outline-none transition-all"
                        style={{background:'rgba(255,255,255,0.75)',border:'2px solid rgba(242,101,34,0.25)',color:'#5a1a00'}}
                        onFocus={e=>{e.target.style.border='2px solid #f26522';e.target.style.boxShadow='0 0 0 4px rgba(242,101,34,0.12)';}}
                        onBlur={e=>{e.target.style.border='2px solid rgba(242,101,34,0.25)';e.target.style.boxShadow='none';}}
                        required autoComplete="new-password" />
                      <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{color:'#e07040'}}><EyeIcon open={showPw} /></button>
                    </div>
                  </Field>
                  <Field label="Confirm Password *">
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{color:'#e07040'}}><PwIcon /></span>
                      <input type={showPw?'text':'password'} placeholder="Re-enter password" value={form.password_confirmation} onChange={e=>set('password_confirmation',e.target.value)}
                        className="w-full text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none transition-all"
                        style={{background:'rgba(255,255,255,0.75)',border:'2px solid rgba(242,101,34,0.25)',color:'#5a1a00'}}
                        onFocus={e=>{e.target.style.border='2px solid #f26522';e.target.style.boxShadow='0 0 0 4px rgba(242,101,34,0.12)';}}
                        onBlur={e=>{e.target.style.border='2px solid rgba(242,101,34,0.25)';e.target.style.boxShadow='none';}}
                        required autoComplete="new-password" />
                    </div>
                  </Field>
                </div>

                <div className="flex items-start gap-2 text-xs rounded-2xl px-4 py-3"
                  style={{background:'linear-gradient(135deg,rgba(242,101,34,0.1),rgba(255,237,213,0.5))',border:'1px solid rgba(242,101,34,0.2)',color:'#c13b0a'}}>
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color:'#e04f0f'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  A 6-digit OTP will be sent to your email for verification. Your login will use your student number.
                </div>

                <ErrorBox msg={error} />

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 relative overflow-hidden group"
                  style={{background:'linear-gradient(135deg,#f26522 0%,#e04f0f 100%)',boxShadow:'0 4px 24px rgba(242,101,34,0.45)'}}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%)'}} />
                  {loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Please wait...</>:<span className="relative">Continue — Verify Email →</span>}
                </button>
              </form>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{background:'rgba(242,101,34,0.2)'}} />
              <span className="text-xs" style={{color:'#c06030'}}>or</span>
              <div className="flex-1 h-px" style={{background:'rgba(242,101,34,0.2)'}} />
            </div>
            <p className="text-center text-sm" style={{color:'#b05020'}}>
              Already have an account?{' '}
              <button onClick={onGoToLogin} className="font-bold transition-colors hover:underline" style={{color:'#e04f0f'}}>Sign In</button>
            </p>
          </div>
          <p className="text-center text-xs mt-4" style={{color:'rgba(180,80,20,0.5)'}}>© 2026 CCS Profiling System · All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignUp;
