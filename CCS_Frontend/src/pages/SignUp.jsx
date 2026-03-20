import { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api';

/* ─── shared UI helpers ─────────────────────────────────────── */
const Input = ({ icon, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </span>
    )}
    <input
      {...props}
      className={`w-full bg-slate-800/60 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm rounded-xl py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all ${icon ? 'pl-10 pr-4' : 'px-4'}`}
    />
  </div>
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all">
    {children}
  </select>
);

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{children}</label>
);

const Field = ({ label, children }) => (
  <div><Label>{label}</Label>{children}</div>
);

const Section = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <span className="text-base">{icon}</span>
    <span className="text-xs font-bold uppercase tracking-widest text-brand-400">{title}</span>
    <div className="flex-1 h-px bg-slate-700/60" />
  </div>
);

const ErrorBox = ({ msg }) => msg ? (
  <div className="flex items-start gap-3 bg-red-500/20 border-2 border-red-500/60 text-red-300 text-sm rounded-xl px-4 py-3.5 font-medium shadow-lg shadow-red-500/10">
    <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <span>{msg}</span>
  </div>
) : null;

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const SignUp = ({ onSignUp, onGoToLogin }) => {
  const [step, setStep]       = useState('form'); // 'form' | 'otp'
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [courses, setCourses] = useState([]);

  /* ── form state ── */
  const [form, setForm] = useState({
    role: 'student',
    // student identifier
    student_number: '',
    // account
    email: '', password: '', password_confirmation: '',
    // personal
    first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: '', civil_status: '', nationality: 'Filipino',
    religion: '', birth_date: '', place_of_birth: '',
    // contact
    contact_number: '',
    street: '', barangay: '', city: '', province: '', zip_code: '',
    // enrollment
    program: 'Information Technology', year_level: '1st Year',
    student_type: 'Regular', enrollment_status: 'Enrolled',
    date_enrolled: new Date().toISOString().split('T')[0],
    course_id: '',
    // education background
    last_school_attended: '', last_year_attended: '', lrn: '',
    // family
    father_name: '', father_occupation: '',
    mother_name: '', mother_occupation: '', guardian_contact: '',
    // faculty-specific
    position: '', employment_status: 'Regular',
    hire_date: '', contact_number_faculty: '', office_location: '', department_id: '',
  });

  /* OTP state */
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  // Fetch courses on mount
  useEffect(() => {
    fetch(`${API}/courses`, { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setCourses(data))
      .catch(() => {});
  }, []);

  const startTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; });
    }, 1000);
  };

  /* ─── send OTP ─── */
  const handleSendOtp = async () => {
    setError(''); setInfo('');
    if (!form.email) { setError('Please enter your email address first.'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: form.email, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to send OTP.'); return; }
      setInfo(`OTP sent to ${form.email}. Check your inbox.`);
      setStep('otp');
      startTimer();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── OTP input handling ─── */
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };

  /* ─── verify OTP then register ─── */
  const handleVerifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Invalid OTP.'); return; }
      setInfo('✅ Email verified! Submitting your registration...');
      await handleRegister();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── final register call ─── */
  const handleRegister = async () => {
    setLoading(true);
    try {
      let payload;
      if (form.role === 'student') {
        payload = {
          role: 'student',
          student_number: form.student_number,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          first_name: form.first_name, middle_name: form.middle_name,
          last_name: form.last_name, suffix: form.suffix,
          gender: form.gender, civil_status: form.civil_status,
          nationality: form.nationality, religion: form.religion,
          birth_date: form.birth_date, place_of_birth: form.place_of_birth,
          contact_number: form.contact_number,
          street: form.street, barangay: form.barangay,
          city: form.city, province: form.province, zip_code: form.zip_code,
          program: form.program, year_level: form.year_level,
          student_type: form.student_type, enrollment_status: form.enrollment_status,
          date_enrolled: form.date_enrolled,
          course_id: form.course_id,
          last_school_attended: form.last_school_attended,
          last_year_attended: form.last_year_attended, lrn: form.lrn,
          father_name: form.father_name, father_occupation: form.father_occupation,
          mother_name: form.mother_name, mother_occupation: form.mother_occupation,
          guardian_contact: form.guardian_contact,
        };
      } else {
        payload = {
          role: 'faculty',
          first_name: form.first_name, middle_name: form.middle_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          position: form.position,
          employment_status: form.employment_status,
          hire_date: form.hire_date,
          contact_number: form.contact_number_faculty,
          office_location: form.office_location,
          department_id: form.department_id,
        };
      }

      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || 'Registration failed.');
        setError(msg);
        setStep('form');
      } else {
        localStorage.setItem('auth_token', data.token);
        onSignUp(data.user);
      }
    } catch {
      setError('Could not connect to the server.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  /* ─── form submit (validation + trigger OTP) ─── */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match.'); return; }

    if (form.role === 'student') {
      if (!/^(22|23|24)\d{5}$/.test(form.student_number)) {
        setError('Student number must start with 22, 23, or 24 followed by 5 digits (e.g. 2201535).');
        return;
      }
      if (!form.first_name || !form.last_name) { setError('First and last name are required.'); return; }
      if (!form.gender)       { setError('Please select your gender.'); return; }
      if (!form.civil_status) { setError('Please select your civil status.'); return; }
      if (!form.birth_date)   { setError('Date of birth is required.'); return; }
      if (!form.contact_number) { setError('Contact number is required.'); return; }
      if (!/^09\d{9}$/.test(form.contact_number)) { setError('Mobile number must be 11 digits starting with 09 (e.g. 09XXXXXXXXX).'); return; }
      if (!form.city)         { setError('City is required.'); return; }
      if (!form.course_id)    { setError('Please select a course.'); return; }
    }

    if (form.role === 'faculty') {
      if (!form.first_name || !form.last_name) { setError('First and last name are required.'); return; }
      if (!form.position)           { setError('Position is required.'); return; }
      if (!form.employment_status)  { setError('Employment status is required.'); return; }
      if (!form.hire_date)          { setError('Hire date is required.'); return; }
      if (!form.department_id)      { setError('Department ID is required.'); return; }
    }

    await handleSendOtp();
  };

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 relative overflow-hidden py-8">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(242,101,34,0.4)] mb-3">
              <img src="/ccs_logo.jpg" alt="CCS" className="w-10 h-10 object-contain rounded-xl" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 tracking-tight">
              {step === 'otp' ? 'Verify Your Email' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">CCS Profiling System</p>
          </div>

          {/* ─── OTP STEP ─── */}
          {step === 'otp' && (
            <div className="text-center space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-4xl mb-2">📧</div>
                <p className="text-slate-300 text-sm font-medium">We sent a 6-digit code to</p>
                <p className="text-brand-400 font-bold text-sm mt-0.5">{form.email}</p>
                <p className="text-slate-500 text-xs mt-1">Check your inbox (and spam folder).</p>
              </div>

              {info && !error && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">{info}</div>
              )}
              <ErrorBox msg={error} />

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-600 text-white rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                ))}
              </div>

              <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Verifying...</>
                  : 'Verify & Create Account'
                }
              </button>

              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setError(''); setInfo(''); }}
                  className="text-slate-400 hover:text-slate-200 transition-colors">← Back to form</button>
                {resendTimer > 0
                  ? <span className="text-slate-500">Resend in {resendTimer}s</span>
                  : <button onClick={handleSendOtp} disabled={loading}
                      className="text-brand-400 hover:text-brand-300 font-semibold transition-colors disabled:opacity-50">Resend OTP</button>
                }
              </div>
            </div>
          )}

          {/* ─── FORM STEP ─── */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Role selector — admin excluded */}
              <div>
                <Label>Register as</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'student', label: 'Student', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { key: 'faculty', label: 'Faculty', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  ].map(r => (
                    <button key={r.key} type="button" onClick={() => set('role', r.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                        form.role === r.key
                          ? 'bg-brand-600/20 border-brand-500 text-brand-400 shadow-[0_0_12px_rgba(242,101,34,0.2)]'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={r.icon} />
                      </svg>
                      <span className="text-xs font-medium capitalize">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ══ STUDENT FIELDS ══ */}
              {form.role === 'student' && (
                <>
                  <Section icon="🎓" title="Student Identifier" />
                  <Field label="Student Number *">
                    <Input placeholder="e.g. 2201535 (starts with 22, 23, or 24)"
                      value={form.student_number}
                      onChange={e => set('student_number', e.target.value.replace(/\D/g, '').slice(0, 7))}
                      inputMode="numeric" maxLength={7} required />
                  </Field>
                  <p className="text-xs text-slate-500 -mt-2">Must start with 22, 23, or 24 followed by 5 digits.</p>

                  <Section icon="👤" title="Personal Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="First Name *"><Input placeholder="Juan" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></Field>
                    <Field label="Middle Name"><Input placeholder="Santos" value={form.middle_name} onChange={e => set('middle_name', e.target.value)} /></Field>
                    <Field label="Last Name *"><Input placeholder="dela Cruz" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Suffix">
                      <Select value={form.suffix} onChange={e => set('suffix', e.target.value)}>
                        <option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option>
                      </Select>
                    </Field>
                    <Field label="Gender *">
                      <Select value={form.gender} onChange={e => set('gender', e.target.value)} required>
                        <option value="">Select</option><option>Male</option><option>Female</option>
                      </Select>
                    </Field>
                    <Field label="Civil Status *">
                      <Select value={form.civil_status} onChange={e => set('civil_status', e.target.value)} required>
                        <option value="">Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                      </Select>
                    </Field>
                    <Field label="Nationality *">
                      <Input placeholder="Filipino" value={form.nationality} onChange={e => set('nationality', e.target.value)} required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Date of Birth *">
                      <Input type="date" value={form.birth_date}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                        onChange={e => set('birth_date', e.target.value)} required />
                    </Field>
                    <Field label="Place of Birth"><Input placeholder="City, Province" value={form.place_of_birth} onChange={e => set('place_of_birth', e.target.value)} /></Field>
                    <Field label="Religion"><Input placeholder="e.g. Catholic" value={form.religion} onChange={e => set('religion', e.target.value)} /></Field>
                  </div>

                  <Section icon="📞" title="Contact & Address" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Mobile Number *">
                      <Input type="tel" placeholder="09XXXXXXXXX"
                        value={form.contact_number}
                        onChange={e => set('contact_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        maxLength={11} required />
                    </Field>
                    <Field label="City *"><Input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} required /></Field>
                    <Field label="Street"><Input placeholder="Street" value={form.street} onChange={e => set('street', e.target.value)} /></Field>
                    <Field label="Barangay"><Input placeholder="Barangay" value={form.barangay} onChange={e => set('barangay', e.target.value)} /></Field>
                    <Field label="Province"><Input placeholder="Province" value={form.province} onChange={e => set('province', e.target.value)} /></Field>
                    <Field label="Zip Code">
                      <Input placeholder="0000"
                        value={form.zip_code}
                        onChange={e => set('zip_code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4} inputMode="numeric" />
                    </Field>
                  </div>

                  <Section icon="🎓" title="Enrollment Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Program *">
                      <Select value={form.program} onChange={e => set('program', e.target.value)} required>
                        <option>Information Technology</option><option>Computer Science</option>
                      </Select>
                    </Field>
                    <Field label="Year Level *">
                      <Select value={form.year_level} onChange={e => set('year_level', e.target.value)} required>
                        <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                      </Select>
                    </Field>
                    <Field label="Course *">
                      <Select value={form.course_id} onChange={e => set('course_id', e.target.value)} required>
                        <option value="">-- Select Course --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
                        ))}
                      </Select>
                      {courses.length === 0 && (
                        <p className="text-xs text-amber-400 mt-1.5">No courses available yet. Contact admin.</p>
                      )}
                    </Field>
                    <Field label="Student Type *">
                      <Select value={form.student_type} onChange={e => set('student_type', e.target.value)} required>
                        <option>Regular</option><option>Irregular</option><option>Returnee</option><option>Shiftee</option><option>Transferee</option>
                      </Select>
                    </Field>
                    <Field label="Date Enrolled *">
                      <Input type="date" value={form.date_enrolled}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => set('date_enrolled', e.target.value)} required />
                    </Field>
                  </div>

                  <Section icon="🏫" title="Educational Background" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Last School Attended"><Input placeholder="School Name" value={form.last_school_attended} onChange={e => set('last_school_attended', e.target.value)} /></Field>
                    <Field label="Last Year Attended"><Input placeholder="e.g. 2024" value={form.last_year_attended} onChange={e => set('last_year_attended', e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" maxLength={4} /></Field>
                    <Field label="LRN"><Input placeholder="12-digit LRN" value={form.lrn} onChange={e => set('lrn', e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" maxLength={12} /></Field>
                  </div>

                  <Section icon="👨‍👩‍👦" title="Family Background" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Father's Name"><Input placeholder="Full Name" value={form.father_name} onChange={e => set('father_name', e.target.value)} /></Field>
                    <Field label="Father's Occupation"><Input placeholder="Occupation" value={form.father_occupation} onChange={e => set('father_occupation', e.target.value)} /></Field>
                    <Field label="Mother's Name"><Input placeholder="Full Name" value={form.mother_name} onChange={e => set('mother_name', e.target.value)} /></Field>
                    <Field label="Mother's Occupation"><Input placeholder="Occupation" value={form.mother_occupation} onChange={e => set('mother_occupation', e.target.value)} /></Field>
                    <Field label="Guardian Contact No.">
                      <Input type="tel" placeholder="09XXXXXXXXX"
                        value={form.guardian_contact}
                        onChange={e => set('guardian_contact', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        maxLength={11} inputMode="numeric" />
                    </Field>
                  </div>
                </>
              )}

              {/* ══ FACULTY FIELDS ══ */}
              {form.role === 'faculty' && (
                <>
                  <Section icon="👤" title="Personal Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="First Name *"><Input placeholder="Juan" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></Field>
                    <Field label="Middle Name"><Input placeholder="Santos" value={form.middle_name} onChange={e => set('middle_name', e.target.value)} /></Field>
                    <Field label="Last Name *"><Input placeholder="dela Cruz" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></Field>
                  </div>

                  <Section icon="🏢" title="Faculty Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Position *"><Input placeholder="e.g. Instructor I" value={form.position} onChange={e => set('position', e.target.value)} required /></Field>
                    <Field label="Employment Status *">
                      <Select value={form.employment_status} onChange={e => set('employment_status', e.target.value)} required>
                        <option>Regular</option><option>Part-time</option><option>Contractual</option>
                      </Select>
                    </Field>
                    <Field label="Hire Date *"><Input type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} required /></Field>
                    <Field label="Department ID *">
                      <Input placeholder="Department ID (number)" type="number" min="1"
                        value={form.department_id} onChange={e => set('department_id', e.target.value)} required />
                    </Field>
                    <Field label="Contact Number"><Input type="tel" placeholder="09XXXXXXXXX" value={form.contact_number_faculty} onChange={e => set('contact_number_faculty', e.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" maxLength={11} /></Field>
                    <Field label="Office Location"><Input placeholder="e.g. Faculty Room 2" value={form.office_location} onChange={e => set('office_location', e.target.value)} /></Field>
                  </div>
                </>
              )}

              {/* ══ ACCOUNT CREDENTIALS (both roles) ══ */}
              <Section icon="🔐" title="Account Credentials" />

              <Field label={form.role === 'faculty' ? 'Personal Email *' : 'Personal Email *'}>
                <Input
                  icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  type="email"
                  placeholder={form.role === 'faculty' ? 'yourpersonalemail@gmail.com' : 'youremail@gmail.com'}
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
                {form.role === 'faculty' && (
                  <p className="text-xs text-slate-500 mt-1.5">OTP will be sent here. This email is also used to log in.</p>
                )}
                {form.role === 'student' && (
                  <p className="text-xs text-slate-500 mt-1.5">Used for OTP verification only. Login uses your student number.</p>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Password * (min. 8 chars)">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </span>
                    <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                      required autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPw
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                        }
                      </svg>
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password *">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </span>
                    <input type={showPw ? 'text' : 'password'} placeholder="Re-enter password"
                      value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                      required autoComplete="new-password" />
                  </div>
                </Field>
              </div>

              {/* OTP note */}
              <div className="flex items-start gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {form.role === 'student'
                  ? 'A 6-digit OTP will be sent to your email for verification. Your login will use your student number.'
                  : 'A 6-digit OTP will be sent to your personal email for verification. This email is also your login.'
                }
              </div>

              <ErrorBox msg={error} />

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-brand-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Please wait...</>
                  : 'Continue — Verify Email'
                }
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign In</button>
          </p>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">© 2026 CCS Profiling System · All rights reserved</p>
      </div>
    </div>
  );
};

export default SignUp;
