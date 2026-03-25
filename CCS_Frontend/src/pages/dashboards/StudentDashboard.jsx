import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../../utils/api';

/* ─── theme context ──────────────────────────── */
const ThemeCtx = createContext(true); // true = dark
const useTheme = () => useContext(ThemeCtx);

/* ─── nav ────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',      label: 'My Profile',       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'academic',     label: 'My Academic History',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'skills',       label: 'My Skills',            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'affiliations', label: 'My Affiliations',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'violations',   label: 'My Violations',        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'grades',       label: 'My Grades',            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'tasks',        label: 'My Pending Tasks',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

/* ─── static demo data ───────────────────────── */
const ANNOUNCEMENTS = [
  { id: 1, title: 'Enrollment Period Open', date: 'Mar 14, 2026', tag: 'Important', color: 'from-brand-500 to-amber-500', desc: 'Enrollment for 2nd semester is now open. Log in to the registrar portal and complete your enrollment form before the deadline.' },
  { id: 2, title: 'Mid-term Examination Schedule', date: 'Mar 12, 2026', tag: 'Academic', color: 'from-blue-500 to-purple-500', desc: 'Mid-term exams are scheduled from March 20–25. Consult your professors for coverage and bring your exam permit.' },
  { id: 3, title: 'Academic Calendar Update', date: 'Mar 10, 2026', tag: 'General', color: 'from-emerald-500 to-teal-500', desc: 'A revised academic calendar has been released for AY 2025–2026. Download it from the registrar page.' },
  { id: 4, title: 'IT Week 2026 – Call for Participants', date: 'Mar 8, 2026', tag: 'Event', color: 'from-rose-500 to-pink-500', desc: 'CCS IT Week 2026 is accepting participants for coding contests, tech talks, and hackathon. Register before Mar 17.' },
];
const GRADES = [
  { subject: 'IT 111', title: 'Introduction to Computing', units: 3, prelim: '1.25', midterm: '1.50', final: '—' },
  { subject: 'IT 121', title: 'Computer Programming 1', units: 3, prelim: '1.00', midterm: '1.25', final: '—' },
  { subject: 'MATH 111', title: 'Mathematics in the Modern World', units: 3, prelim: '1.75', midterm: '2.00', final: '—' },
  { subject: 'ENGL 101', title: 'Purposive Communication', units: 3, prelim: '1.50', midterm: '1.50', final: '—' },
  { subject: 'PE 101', title: 'Physical Education 1', units: 2, prelim: '1.00', midterm: '1.00', final: '—' },
];
const COURSES_DEMO = [
  { code: 'IT 111', title: 'Introduction to Computing', instructor: 'Mr. Sample Faculty', schedule: 'MWF 8:00–9:00 AM', room: 'IT Lab 1', units: 3 },
  { code: 'IT 121', title: 'Computer Programming 1', instructor: 'Ms. Jane Doe', schedule: 'TTH 10:00–11:30 AM', room: 'Room 302', units: 3 },
  { code: 'MATH 111', title: 'Mathematics in the Modern World', instructor: 'Mr. John Smith', schedule: 'MWF 1:00–2:00 PM', room: 'Room 201', units: 3 },
  { code: 'ENGL 101', title: 'Purposive Communication', instructor: 'Ms. Reyes', schedule: 'TTH 1:00–2:30 PM', room: 'Room 104', units: 3 },
  { code: 'PE 101', title: 'Physical Education 1', instructor: 'Coach Garcia', schedule: 'WF 3:00–4:30 PM', room: 'Gymnasium', units: 2 },
];
const TASKS_DEFAULT = [
  { id: 1, subject: 'IT 121', title: 'Programming Lab Exercise 3', due: 'Mar 20, 2026', priority: 'High', done: false },
  { id: 2, subject: 'MATH 111', title: 'Problem Set 2 – Submission', due: 'Mar 18, 2026', priority: 'High', done: false },
  { id: 3, subject: 'ENGL 101', title: 'Reflection Paper – Week 6', due: 'Mar 22, 2026', priority: 'Medium', done: false },
  { id: 4, subject: 'IT 111', title: 'Read Chapter 5: Operating Systems', due: 'Mar 17, 2026', priority: 'Low', done: true },
  { id: 5, subject: 'PE 101', title: 'Submit Medical Certificate', due: 'Mar 15, 2026', priority: 'Medium', done: false },
];

/* ─── helpers ────────────────────────────────── */
const fmt = (d) => { try { return d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'; } catch { return d || '—'; } };
const val = (v) => v || '—';
const priorityStyle = (p, dark) => ({
  High:   dark ? 'bg-red-500/20 text-red-300 border border-red-500/30'    : 'bg-red-100 text-red-700 border border-red-300',
  Medium: dark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-700 border border-amber-300',
  Low:    dark ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' : 'bg-slate-200 text-slate-600 border border-slate-300',
}[p] ?? '');

/* ─── shared UI primitives ───────────────────── */
const Spinner = () => {
  const dark = useTheme();
  return (
    <div className="flex items-center justify-center py-16">
      <div className={`w-8 h-8 border-4 rounded-full animate-spin border-t-brand-500 ${dark ? 'border-slate-700' : 'border-slate-200'}`} />
    </div>
  );
};

const EmptyState = ({ icon, title, sub }) => {
  const dark = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-3">{icon}</span>
      <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{title}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
};

const SectionCard = ({ title, icon, action, children }) => {
  const dark = useTheme();
  return (
    <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/40 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">{title}</h4>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const Row = ({ label, value }) => {
  const dark = useTheme();
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className={`text-xs shrink-0 w-44 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-xs font-medium text-right break-words ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
};

/* theme-aware form class builders */
const mkInp = (dark) => dark
  ? 'w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition'
  : 'w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition';
const mkSel = (dark) => `${mkInp(dark)} appearance-none`;
const mkLbl = (dark) => `block text-xs font-semibold mb-1.5 uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`;

/* keep module-level aliases for components defined outside main (they use useTheme internally) */
const inp = 'w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition';
const sel = `${inp} appearance-none`;
const lbl = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide';

const Field = ({ label, required, icon, children }) => {
  const dark = useTheme();
  return (
    <div>
      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-orange-500/80'}`}>
        {icon && <span className="text-sm leading-none">{icon}</span>}
        {label}{required && <span className="text-brand-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
};

/* Select wrapper — adds a styled chevron arrow since appearance-none removes the native one */
const Sel = ({ dark: darkProp, className, children, ...props }) => {
  const darkCtx = useTheme();
  const dark = darkProp ?? darkCtx;
  return (
    <div className="relative">
      <select
        {...props}
        className={`${className || mkSel(dark)} pr-9`}
      >
        {children}
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-3 flex items-center ${dark ? 'text-orange-400/70' : 'text-orange-400'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

/* modal wrapper */
const Modal = ({ title, subtitle, onClose, children, footer }) => {
  const dark = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-sm ${dark ? 'bg-slate-950/80' : 'bg-slate-900/40'}`} onClick={onClose} />
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-start justify-between px-6 py-5 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-base font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
            {subtitle && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`transition-colors ml-4 mt-0.5 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className={`px-6 py-4 border-t ${dark ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-100 bg-slate-50'}`}>{footer}</div>}
      </div>
    </div>
  );
};

const BtnPrimary = ({ children, loading, ...props }) => (
  <button {...props} disabled={loading || props.disabled}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20">
    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
  </button>
);

const BtnGhost = ({ children, ...props }) => {
  const dark = useTheme();
  return (
    <button {...props} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${dark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'}`}>
      {children}
    </button>
  );
};

const BtnDanger = ({ children, ...props }) => (
  <button {...props} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
    {children}
  </button>
);

const BtnEdit = ({ onClick }) => {
  const dark = useTheme();
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      Edit
    </button>
  );
};

const AddBtn = ({ onClick, label }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-500 text-xs font-semibold transition-all">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
    {label}
  </button>
);

const ErrBox = ({ msg }) => msg ? (
  <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm">{msg}</div>
) : null;

/* ════════════════════════════════════════════════
   PER-SECTION PROFILE MODALS
════════════════════════════════════════════════ */
const patchStudent = (student, patch) => api.students.update(student.id, patch);

const PersonalInfoModal = ({ student, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState({ first_name: student.first_name||'', middle_name: student.middle_name||'', last_name: student.last_name||'', suffix: student.suffix||'', gender: student.gender||'Male', birth_date: student.birth_date?.split('T')[0]||'', place_of_birth: student.place_of_birth||'', nationality: student.nationality||'Filipino', civil_status: student.civil_status||'Single', religion: student.religion||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title="Edit Personal Information" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="First Name" required><input name="first_name" value={form.first_name} onChange={ch} className={i} required /></Field>
        <Field label="Middle Name"><input name="middle_name" value={form.middle_name} onChange={ch} className={i} /></Field>
        <Field label="Last Name" required><input name="last_name" value={form.last_name} onChange={ch} className={i} required /></Field>
        <Field label="Suffix"><input name="suffix" value={form.suffix} onChange={ch} className={i} placeholder="Jr, Sr, III…" /></Field>
        <Field label="Gender" required><Sel name="gender" value={form.gender} onChange={ch} className={s}><option>Male</option><option>Female</option></Sel></Field>
        <Field label="Birth Date" required><input type="date" name="birth_date" value={form.birth_date} onChange={ch} className={i} required /></Field>
        <Field label="Place of Birth" required><input name="place_of_birth" value={form.place_of_birth} onChange={ch} className={i} required /></Field>
        <Field label="Nationality"><input name="nationality" value={form.nationality} onChange={ch} className={i} /></Field>
        <Field label="Civil Status"><Sel name="civil_status" value={form.civil_status} onChange={ch} className={s}><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option></Sel></Field>
        <Field label="Religion"><input name="religion" value={form.religion} onChange={ch} className={i} /></Field>
      </form>
    </Modal>
  );
};

const ContactInfoModal = ({ student, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark);
  const [form, setForm] = useState({ email: student.email||'', contact_number: student.contact_number||'', alternate_contact_number: student.alternate_contact_number||'', street: student.street||'', barangay: student.barangay||'', city: student.city||'', province: student.province||'', zip_code: student.zip_code||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title="Edit Contact Information" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Email" required><input type="email" name="email" value={form.email} onChange={ch} className={i} required /></Field>
        <Field label="Contact Number" required><input name="contact_number" value={form.contact_number} onChange={ch} className={i} required /></Field>
        <Field label="Alt. Number"><input name="alternate_contact_number" value={form.alternate_contact_number} onChange={ch} className={i} /></Field>
        <Field label="Street"><input name="street" value={form.street} onChange={ch} className={i} /></Field>
        <Field label="Barangay"><input name="barangay" value={form.barangay} onChange={ch} className={i} /></Field>
        <Field label="City" required><input name="city" value={form.city} onChange={ch} className={i} required /></Field>
        <Field label="Province"><input name="province" value={form.province} onChange={ch} className={i} /></Field>
        <Field label="Zip Code"><input name="zip_code" value={form.zip_code} onChange={ch} className={i} /></Field>
      </form>
    </Modal>
  );
};

const emptyGuardian = () => ({ full_name: '', relationship: 'Father', occupation: '', contact_number: '', email: '', address: '' });

const GuardianFormModal = ({ studentId, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState(record ? { full_name: record.full_name||'', relationship: record.relationship||'Father', occupation: record.occupation||'', contact_number: record.contact_number||'', email: record.email||'', address: record.address||'' } : emptyGuardian());
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { if (record?.id) await api.students.updateGuardian(studentId, record.id, form); else await api.students.addGuardian(studentId, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title={record ? 'Edit Guardian' : 'Add Guardian'} onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Guardian'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Full Name" required><input name="full_name" value={form.full_name} onChange={ch} className={i} required /></Field>
        <Field label="Relationship" required><Sel name="relationship" value={form.relationship} onChange={ch} className={s}><option>Father</option><option>Mother</option><option>Guardian</option><option>Sibling</option><option>Other</option></Sel></Field>
        <Field label="Occupation"><input name="occupation" value={form.occupation} onChange={ch} className={i} /></Field>
        <Field label="Contact Number"><input name="contact_number" value={form.contact_number} onChange={ch} className={i} /></Field>
        <Field label="Email"><input type="email" name="email" value={form.email} onChange={ch} className={i} /></Field>
        <div className="col-span-2"><Field label="Address"><input name="address" value={form.address} onChange={ch} className={i} /></Field></div>
      </form>
    </Modal>
  );
};

const EnrollmentModal = ({ student, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState({ year_level: student.year_level||'', section: student.section||'', student_type: student.student_type||'Regular', enrollment_status: student.enrollment_status||'Enrolled', date_enrolled: student.date_enrolled?.split('T')[0]||'', program: student.program||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title="Edit Enrollment Details" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Year Level" required><Sel name="year_level" value={form.year_level} onChange={ch} className={s}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></Sel></Field>
        <Field label="Section"><input name="section" value={form.section} onChange={ch} className={i} /></Field>
        <Field label="Student Type" required><Sel name="student_type" value={form.student_type} onChange={ch} className={s}><option>Regular</option><option>Irregular</option><option>Transferee</option><option>Returnee</option></Sel></Field>
        <Field label="Enrollment Status" required><Sel name="enrollment_status" value={form.enrollment_status} onChange={ch} className={s}><option>Enrolled</option><option>Not Enrolled</option><option>LOA</option><option>Dropped</option></Sel></Field>
        <Field label="Date Enrolled" required><input type="date" name="date_enrolled" value={form.date_enrolled} onChange={ch} className={i} required /></Field>
        <Field label="Program"><input name="program" value={form.program} onChange={ch} className={i} /></Field>
      </form>
    </Modal>
  );
};

const EducationalBgModal = ({ student, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark);
  const [form, setForm] = useState({ lrn: student.lrn||'', last_school_attended: student.last_school_attended||'', last_year_attended: student.last_year_attended||'', honors_received: student.honors_received||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title="Edit Educational Background" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="LRN"><input name="lrn" value={form.lrn} onChange={ch} className={i} maxLength={12} /></Field>
        <Field label="Last Year Attended"><input name="last_year_attended" value={form.last_year_attended} onChange={ch} className={i} /></Field>
        <div className="col-span-2"><Field label="Last School Attended"><input name="last_school_attended" value={form.last_school_attended} onChange={ch} className={i} /></Field></div>
        <div className="col-span-2"><Field label="Honors / Awards"><textarea name="honors_received" value={form.honors_received} onChange={ch} className={`${i} resize-none`} rows={3} /></Field></div>
      </form>
    </Modal>
  );
};

const MedicalModal = ({ student, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState({ bloodtype: record?.bloodtype||'', existing_conditions: record?.existing_conditions||'', emergency_contact_name: record?.emergency_contact_name||'', emergency_contact_number: record?.emergency_contact_number||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => { e.preventDefault(); setSaving(true); setErr(null); try { if (record?.id) await api.students.updateMedical(student.id, record.id, form); else await api.students.addMedical(student.id, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); } };
  return (
    <Modal title={record ? 'Edit Medical Record' : 'Add Medical Record'} onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Blood Type"><Sel name="bloodtype" value={form.bloodtype} onChange={ch} className={s}><option value="">Select…</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}</Sel></Field>
        <Field label="Emergency Contact Name"><input name="emergency_contact_name" value={form.emergency_contact_name} onChange={ch} className={i} /></Field>
        <Field label="Emergency Contact No."><input name="emergency_contact_number" value={form.emergency_contact_number} onChange={ch} className={i} /></Field>
        <div className="col-span-2"><Field label="Existing Conditions"><textarea name="existing_conditions" value={form.existing_conditions} onChange={ch} className={`${i} resize-none`} rows={3} placeholder="e.g. Asthma, Hypertension…" /></Field></div>
      </form>
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   ACADEMIC HISTORY MODAL
════════════════════════════════════════════════ */
const emptyAH = () => ({ school_year: '', semester: '1st Semester', gpa: '', academic_standing: 'Good Standing', total_units: '', completed_units: '' });

const AcademicModal = ({ studentId, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState(record ? {
    school_year: record.school_year, semester: record.semester,
    gpa: record.gpa ?? '', academic_standing: record.academic_standing,
    total_units: record.total_units, completed_units: record.completed_units,
  } : emptyAH());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr(null);
    try {
      const payload = { ...form, gpa: form.gpa || null, total_units: Number(form.total_units), completed_units: Number(form.completed_units) };
      if (record?.id) await api.students.updateAcademicHistory(studentId, record.id, payload);
      else await api.students.addAcademicHistory(studentId, payload);
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={record ? 'Edit Academic Record' : 'Add Academic Record'} onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Record'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="School Year" required><input name="school_year" value={form.school_year} onChange={ch} className={i} placeholder="2025-2026" required /></Field>
        <Field label="Semester" required>
          <Sel name="semester" value={form.semester} onChange={ch} className={s}>
            <option>1st Semester</option><option>2nd Semester</option><option>Summer</option>
          </Sel>
        </Field>
        <Field label="GPA"><input type="number" name="gpa" value={form.gpa} onChange={ch} className={i} step="0.01" min="1" max="5" placeholder="e.g. 1.75" /></Field>
        <Field label="Academic Standing" required>
          <Sel name="academic_standing" value={form.academic_standing} onChange={ch} className={s}>
            <option>Good Standing</option><option>Dean's List</option><option>Academic Probation</option><option>Dismissed</option>
          </Sel>
        </Field>
        <Field label="Total Units" required><input type="number" name="total_units" value={form.total_units} onChange={ch} className={i} min="0" required /></Field>
        <Field label="Completed Units" required><input type="number" name="completed_units" value={form.completed_units} onChange={ch} className={i} min="0" required /></Field>
      </form>
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   AFFILIATION MODAL
════════════════════════════════════════════════ */
const emptyAff = () => ({ organization_name: '', position: '', date_joined: '', date_ended: '', status: 'Active', adviser_name: '' });

/* affiliation duration helper */
const affDuration = (joined, ended) => {
  if (!joined) return null;
  const start = new Date(joined);
  const end   = ended ? new Date(ended) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) return '< 1 month';
  if (months < 12) return `${months} mo${months > 1 ? 's' : ''}`;
  const yrs = Math.floor(months / 12); const rem = months % 12;
  return rem > 0 ? `${yrs} yr${yrs > 1 ? 's' : ''} ${rem} mo${rem > 1 ? 's' : ''}` : `${yrs} yr${yrs > 1 ? 's' : ''}`;
};

const AFF_STATUS = {
  Active:   { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Inactive: { bg: 'bg-slate-600/40 text-slate-400 border-slate-600/40',       dot: 'bg-slate-500'   },
  Alumni:   { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',    dot: 'bg-purple-400'  },
};

const AffiliationModal = ({ studentId, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState(record ? {
    organization_name: record.organization_name, position: record.position,
    date_joined: record.date_joined?.split('T')[0] || '', date_ended: record.date_ended?.split('T')[0] || '',
    status: record.status, adviser_name: record.adviser_name || '',
  } : emptyAff());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr(null);
    try {
      const payload = { ...form, date_ended: form.date_ended || null };
      if (record?.id) await api.students.updateAffiliation(studentId, record.id, payload);
      else await api.students.addAffiliation(studentId, payload);
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={record ? 'Edit Affiliation' : 'Add Affiliation'}
      subtitle={record ? record.organization_name : 'Fill in your organization details'}
      onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Affiliation'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="space-y-4">
        <Field label="Organization Name" required icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
          <input name="organization_name" value={form.organization_name} onChange={ch} className={i} placeholder="e.g. Junior Philippine Computer Society" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Position / Role" required icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input name="position" value={form.position} onChange={ch} className={i} placeholder="e.g. President" required />
          </Field>
          <Field label="Status" required>
            <Sel name="status" value={form.status} onChange={ch} className={s}>
              <option>Active</option><option>Inactive</option><option>Alumni</option>
            </Sel>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date Joined" required icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
            <input type="date" name="date_joined" value={form.date_joined} onChange={ch} className={i} required />
          </Field>
          <Field label="Date Ended" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
            <input type="date" name="date_ended" value={form.date_ended} onChange={ch} className={i} />
          </Field>
        </div>
        <Field label="Adviser / Moderator" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
          <input name="adviser_name" value={form.adviser_name} onChange={ch} className={i} placeholder="Optional — faculty adviser or moderator" />
        </Field>
        {form.date_joined && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${dark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <svg className="w-3.5 h-3.5 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Duration: <span className="font-semibold text-brand-400">{affDuration(form.date_joined, form.date_ended || null)}</span>
            {!form.date_ended && <span className="text-emerald-400 font-medium">(ongoing)</span>}
          </div>
        )}
      </form>
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   SKILLS MODAL
════════════════════════════════════════════════ */
const LEVEL_META = {
  Beginner:     { color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',     bar: 'bg-sky-400',     pct: 25 },
  Intermediate: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', bar: 'bg-amber-400',   pct: 50 },
  Advanced:     { color: 'bg-brand-500/20 text-brand-300 border-brand-500/30', bar: 'bg-brand-500',   pct: 75 },
  Expert:       { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', bar: 'bg-emerald-400', pct: 100 },
};

const SkillsModal = ({ studentId, currentSkills, onClose, onSaved }) => {
  const dark = useTheme();
  const i = mkInp(dark); const sl = mkSel(dark);
  const [allSkills, setAllSkills] = useState([]);
  const [selected, setSelected] = useState(
    currentSkills.map(s => ({
      skill_id: s.id, skill_name: s.skill_name, skill_category: s.skill_category,
      skill_level: s.pivot?.skill_level || '',
      certification: s.pivot?.certification ? true : false,
      certification_name: s.pivot?.certification_name || '',
      certification_date: s.pivot?.certification_date || '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Academic');

  useEffect(() => { api.skills.getAll().then(setAllSkills).catch(() => {}); }, []);

  const toggle = (skill) => setSelected(prev => {
    const exists = prev.find(s => s.skill_id === skill.id);
    if (exists) return prev.filter(s => s.skill_id !== skill.id);
    return [...prev, { skill_id: skill.id, skill_name: skill.skill_name, skill_category: skill.skill_category, skill_level: '', certification: false, certification_name: '', certification_date: '' }];
  });

  const updatePivot = (skillId, field, value) =>
    setSelected(prev => prev.map(s => s.skill_id === skillId ? { ...s, [field]: value } : s));

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await api.students.syncSkills(studentId, selected.map(s => ({
        skill_id: s.skill_id, skill_level: s.skill_level,
        certification: s.certification, certification_name: s.certification_name,
        certification_date: s.certification_date || null,
      })));
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save skills.'); }
    finally { setSaving(false); }
  };

  const tabs = ['Academic', 'Non-Academic'];
  const filtered = allSkills.filter(s =>
    s.skill_category === activeTab &&
    (s.skill_name.toLowerCase().includes(search.toLowerCase()) || s.skill_category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Modal title="Manage Skills" subtitle="Pick your skills and set your proficiency level" onClose={onClose}
      footer={<div className="flex items-center justify-between w-full"><span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{selected.length} skill{selected.length !== 1 ? 's' : ''} selected</span><div className="flex gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Skills</BtnPrimary></div></div>}>
      <ErrBox msg={err} />

      {/* Search */}
      <div className="relative mb-4">
        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} className={`${i} pl-9`} placeholder="Search skills…" />
      </div>

      {/* Category tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-4 ${dark ? 'bg-slate-900/60' : 'bg-slate-100'}`}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-brand-500 text-white shadow' : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'Academic' ? '💻 Academic' : '🏅 Non-Academic'}
          </button>
        ))}
      </div>

      {/* Skill chips */}
      <div className={`rounded-xl p-3 mb-5 min-h-[120px] max-h-52 overflow-y-auto ${dark ? 'bg-slate-900/40 border border-slate-700/40' : 'bg-slate-50 border border-slate-200'}`}>
        {filtered.length === 0
          ? <p className={`text-xs text-center py-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>No skills found.</p>
          : <div className="flex flex-wrap gap-2">
              {filtered.map(skill => {
                const isOn = selected.some(s => s.skill_id === skill.id);
                const lvl = selected.find(s => s.skill_id === skill.id)?.skill_level;
                const meta = LEVEL_META[lvl];
                return (
                  <button key={skill.id} type="button" onClick={() => toggle(skill)}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      isOn
                        ? 'bg-brand-500 text-white border-brand-600 shadow-md shadow-brand-500/20 scale-105'
                        : dark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-brand-500/50 hover:text-slate-200' : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400 hover:text-slate-800'
                    }`}>
                    {isOn && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    {skill.skill_name}
                    {meta && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${meta.color}`}>{lvl}</span>}
                  </button>
                );
              })}
            </div>
        }
      </div>

      {/* Selected skill details */}
      {selected.length > 0 && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Selected — Set Proficiency
          </p>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {selected.map(s => {
              const meta = LEVEL_META[s.skill_level];
              return (
                <div key={s.skill_id} className={`rounded-xl border overflow-hidden ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                  <div className={`flex items-center justify-between px-4 py-2.5 ${dark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.skill_category === 'Academic' ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
                        {s.skill_category === 'Academic' ? '💻' : '🏅'} {s.skill_category}
                      </span>
                      <span className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{s.skill_name}</span>
                    </div>
                    <button onClick={() => toggle({ id: s.skill_id })} className={`transition-colors ${dark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {/* Level bar */}
                  {meta && (
                    <div className={`h-1 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className={`h-full transition-all duration-500 ${meta.bar}`} style={{ width: `${meta.pct}%` }} />
                    </div>
                  )}
                  <div className="px-4 py-3 grid grid-cols-2 gap-3">
                    <Field label="Proficiency Level">
                      <Sel value={s.skill_level} onChange={e => updatePivot(s.skill_id, 'skill_level', e.target.value)} className={sl}>
                        <option value="">Select level</option>
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                      </Sel>
                    </Field>
                    <Field label="Certified?">
                      <Sel value={s.certification ? 'yes' : 'no'} onChange={e => updatePivot(s.skill_id, 'certification', e.target.value === 'yes')} className={sl}>
                        <option value="no">No</option><option value="yes">Yes</option>
                      </Sel>
                    </Field>
                    {s.certification && (
                      <>
                        <Field label="Certification Name"><input value={s.certification_name} onChange={e => updatePivot(s.skill_id, 'certification_name', e.target.value)} className={i} /></Field>
                        <Field label="Certification Date"><input type="date" value={s.certification_date} onChange={e => updatePivot(s.skill_id, 'certification_date', e.target.value)} className={i} /></Field>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const StudentDashboard = ({ user, onLogout }) => {
  const [active, setActive]             = useState('dashboard');
  const [tasks, setTasks]               = useState(TASKS_DEFAULT);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [student, setStudent]           = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileErr, setProfileErr]   = useState(null);
  const [dark, setDark]               = useState(() => localStorage.getItem('sd_theme') !== 'light');
  const [notifOpen, setNotifOpen]       = useState(false);
  const [readIds, setReadIds]           = useState(() => { try { return JSON.parse(localStorage.getItem('sd_notif_read') || '[]'); } catch { return []; } });

  const toggleTheme = () => setDark(d => { const next = !d; localStorage.setItem('sd_theme', next ? 'dark' : 'light'); return next; });

  /* ── notifications derived from student data ── */
  const buildNotifications = (s, taskList) => {
    const items = [];
    if (!s) return items;
    // Violations
    (s.violations ?? []).forEach(v => items.push({
      id: `viol-${v.id}`,
      type: 'violation',
      icon: '⚠️',
      title: 'Violation Recorded',
      body: `${v.violation_type} — ${v.severity_level} severity`,
      date: v.date_reported,
      nav: 'violations',
    }));
    // Academic history updates
    (s.academic_histories ?? []).forEach(ah => items.push({
      id: `ah-${ah.id}`,
      type: 'academic',
      icon: '📋',
      title: 'Academic Record Updated',
      body: `${ah.school_year} ${ah.semester} — GPA: ${ah.gpa ?? '—'}`,
      date: ah.updated_at ?? ah.created_at,
      nav: 'academic',
    }));
    // Pending tasks
    taskList.filter(t => !t.done).forEach(t => items.push({
      id: `task-${t.id}`,
      type: 'task',
      icon: '📌',
      title: 'Pending Task',
      body: `${t.title} — Due ${t.due}`,
      date: null,
      nav: 'tasks',
    }));
    return items;
  };

  const notifications = buildNotifications(student, tasks);
  const unreadCount   = notifications.filter(n => !readIds.includes(n.id)).length;

  const openNotif = () => {
    setNotifOpen(o => {
      if (!o) {
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
        localStorage.setItem('sd_notif_read', JSON.stringify(allIds));
      }
      return !o;
    });
  };

  const initials   = student
    ? `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : (user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'ST');
  const photoUrl   = student?.profile_photo
    ? `http://localhost:8000/storage/${student.profile_photo}?v=${student.updated_at ?? Date.now()}`
    : null;

  /* shared avatar component — shows photo or initials fallback */
  const Avatar = ({ size = 'md', className = '', onClick }) => {
    const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-sm', xl: 'w-20 h-20 text-2xl' };
    const base  = `${sizes[size]} rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`;
    return (
      <div className={base} onClick={onClick} title={onClick ? 'Change profile photo' : undefined}>
        {photoUrl
          ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} />
          : <span>{initials}</span>}
      </div>
    );
  };
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const loadStudent = useCallback(async () => {
    if (!user?.student_id) return;
    setLoadingProfile(true); setProfileErr(null);
    try { setStudent(await api.students.get(user.student_id)); }
    catch { setProfileErr('Could not load profile data.'); }
    finally { setLoadingProfile(false); }
  }, [user?.student_id]);

  useEffect(() => { loadStudent(); }, [loadStudent]);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-notif]')) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const sidebarExpanded = sidebarPinned || sidebarHovered;

  /* ── sidebar nav link ── */
  const NavLink = ({ item }) => {
    const isActive = active === item.id;
    return (
      <button onClick={() => setActive(item.id)}
        title={!sidebarExpanded ? item.label : ''}
        className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'} ${isActive
          ? 'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50'
          : dark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]" />
        )}
        <svg className={`w-5 h-5 shrink-0 transition-all duration-300 ${sidebarExpanded ? 'mr-3' : 'mr-0'} ${isActive ? 'text-brand-400' : dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
        </svg>
        <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>
          {item.label}
        </span>
        {item.id === 'tasks' && tasks.filter(t => !t.done).length > 0 && sidebarExpanded && (
          <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">{tasks.filter(t => !t.done).length}</span>
        )}
      </button>
    );
  };

  /* ════════════════════════════════
     PANEL: DASHBOARD
  ════════════════════════════════ */
  const DashboardPanel = () => {
    const s = student;
    const pendingTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    const taskPct = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
    const skillCount = s?.skills?.length ?? 0;
    const affiliationCount = s?.affiliations?.length ?? 0;
    const violationCount = s?.violations?.length ?? 0;

    const quickLinks = [
      { id: 'profile',      label: 'My Profile',          icon: '👤', desc: 'View & edit your info',         color: dark ? 'from-blue-500/20 to-purple-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100' },
      { id: 'academic',     label: 'Academic History',     icon: '📋', desc: 'Grades & academic records',     color: dark ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100' },
      { id: 'skills',       label: 'My Skills',            icon: '💡', desc: `${skillCount} skill${skillCount !== 1 ? 's' : ''} recorded`,  color: dark ? 'from-amber-500/20 to-orange-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100' },
      { id: 'affiliations', label: 'My Affiliations',      icon: '🏛️', desc: `${affiliationCount} org${affiliationCount !== 1 ? 's' : ''} joined`,  color: dark ? 'from-purple-500/20 to-pink-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100' },
      { id: 'violations',   label: 'My Violations',        icon: '⚠️', desc: violationCount ? `${violationCount} record${violationCount !== 1 ? 's' : ''}` : 'Clean record ✅', color: dark ? 'from-red-500/20 to-rose-500/10 border-red-500/20' : 'bg-red-50 border-red-100' },
      { id: 'grades',       label: 'My Grades',            icon: '🎓', desc: 'View your grade report',        color: dark ? 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100' },
    ];

    return (
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark ? 'bg-gradient-to-br from-brand-600/25 via-purple-600/10 to-slate-900/0 border-brand-500/20' : 'bg-gradient-to-br from-brand-50 via-purple-50 to-white border-brand-100'}`}>
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-brand-500/20">
                {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : <span>{initials}</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>Welcome back</p>
              <h2 className={`text-2xl font-black truncate ${dark ? 'text-white' : 'text-slate-800'}`}>{user?.name} 👋</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {s?.program && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-brand-100 text-brand-700'}`}>{s.program}</span>}
                {s?.year_level && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.year_level}</span>}
                {s?.section && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700'}`}>Section {s.section}</span>}
                {s?.enrollment_status && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700'}`}>{s.enrollment_status}</span>}
                {!s && <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>CCS Student · Profile Hub</span>}
              </div>
            </div>
            {s?.student_number && (
              <div className={`shrink-0 text-right hidden sm:block`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Student No.</p>
                <p className={`text-sm font-black font-mono ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{s.student_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Enrolled Units', val: s?.year_level ? '14' : '—', icon: '📚', dc: 'from-brand-500/20 to-amber-500/10 border-brand-500/20', lc: 'bg-orange-50 border-orange-100' },
            { label: 'Active Subjects', val: COURSES_DEMO.length, icon: '📖', dc: 'from-blue-500/20 to-purple-500/10 border-blue-500/20', lc: 'bg-blue-50 border-blue-100' },
            { label: 'Pending Tasks', val: pendingTasks.length, icon: '✅', dc: 'from-red-500/20 to-pink-500/10 border-red-500/20', lc: 'bg-red-50 border-red-100' },
            { label: 'GPA (Prelim)', val: '1.40', icon: '🎓', dc: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20', lc: 'bg-emerald-50 border-emerald-100' },
          ].map(st => (
            <div key={st.label} className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-400/50 hover:shadow-brand-500/10 ${dark ? `bg-gradient-to-br ${st.dc}` : st.lc}`}>
              <div className="text-2xl mb-2">{st.icon}</div>
              <div className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{st.val}</div>
              <div className={`text-xs mt-0.5 font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ── Violations / Notices ── */}
        {(() => {
          const viols = s?.violations ?? [];
          const pending = viols.filter(v => v.status !== 'Resolved');
          const high    = pending.filter(v => v.severity_level === 'High');
          const hasPending = pending.length > 0;

          if (!s) return null;

          return (
            <div className={`rounded-2xl border overflow-hidden ${
              hasPending
                ? high.length > 0
                  ? dark ? 'border-red-500/40 bg-red-900/10' : 'border-red-200 bg-red-50'
                  : dark ? 'border-amber-500/40 bg-amber-900/10' : 'border-amber-200 bg-amber-50'
                : dark ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'
            }`}>
              {/* Header */}
              <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
                hasPending
                  ? high.length > 0
                    ? dark ? 'border-red-500/30 bg-red-900/20' : 'border-red-200 bg-red-100/60'
                    : dark ? 'border-amber-500/30 bg-amber-900/20' : 'border-amber-200 bg-amber-100/60'
                  : dark ? 'border-emerald-500/20 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-100/60'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{hasPending ? (high.length > 0 ? '🚨' : '⚠️') : '✅'}</span>
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${
                    hasPending
                      ? high.length > 0 ? 'text-red-400' : 'text-amber-400'
                      : 'text-emerald-500'
                  }`}>
                    {hasPending ? 'Disciplinary Notices' : 'Disciplinary Record'}
                  </h4>
                  {hasPending && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${high.length > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {pending.length} unresolved
                    </span>
                  )}
                </div>
                <button onClick={() => setActive('violations')}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all border ${
                    hasPending
                      ? high.length > 0
                        ? dark ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-red-600 border-red-300 hover:bg-red-100'
                        : dark ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10' : 'text-amber-600 border-amber-300 hover:bg-amber-100'
                      : dark ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' : 'text-emerald-600 border-emerald-300 hover:bg-emerald-100'
                  }`}>
                  View all →
                </button>
              </div>

              <div className="p-5">
                {!hasPending ? (
                  /* Clean record */
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>You have a clean disciplinary record.</p>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>No active violations or notices on file. Keep it up!</p>
                    </div>
                  </div>
                ) : (
                  /* Violation cards */
                  <div className="space-y-3">
                    {pending.slice(0, 3).map(v => {
                      const isHigh = v.severity_level === 'High';
                      const isMed  = v.severity_level === 'Medium';
                      return (
                        <div key={v.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-400/50 hover:shadow-brand-500/10 ${
                          isHigh
                            ? dark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-100/60 border-red-300'
                            : isMed
                              ? dark ? 'bg-amber-900/20 border-amber-500/30' : 'bg-amber-100/60 border-amber-300'
                              : dark ? 'bg-slate-800/60 border-slate-600/40' : 'bg-white border-slate-200'
                        }`}>
                          {/* Severity icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isHigh ? 'bg-red-500/20 text-red-400' : isMed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className={`text-sm font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{v.violation_type}</p>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isMed ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              }`}>{v.severity_level}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                v.status === 'Pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>{v.status}</span>
                            </div>
                            {v.description && <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{v.description}</p>}
                            <p className={`text-[10px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                              Reported {fmt(v.date_reported)}{v.reported_by ? ` · by ${v.reported_by}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {pending.length > 3 && (
                      <button onClick={() => setActive('violations')}
                        className={`w-full text-center text-xs font-semibold py-2.5 rounded-xl border transition-all ${
                          dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>
                        +{pending.length - 3} more violation{pending.length - 3 > 1 ? 's' : ''} — View all
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Main Grid: Tasks + Quick Links ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Task Progress */}
          <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/40 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2"><span>✅</span><h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">My Pending Tasks</h4></div>
              <button onClick={() => setActive('tasks')} className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${dark ? 'text-brand-400 hover:bg-brand-500/10' : 'text-brand-600 hover:bg-brand-50'}`}>View all →</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Task Completion</span>
                  <span className={`text-xs font-black ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{taskPct}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700" style={{ width: `${taskPct}%` }} />
                </div>
                <p className={`text-[10px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{doneTasks.length} of {tasks.length} tasks done</p>
              </div>
              {/* Pending list */}
              <div className="space-y-2">
                {pendingTasks.slice(0, 4).map(t => (
                  <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-400/50 hover:shadow-brand-500/10 ${dark ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${t.priority === 'High' ? 'bg-red-400' : t.priority === 'Medium' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{t.title}</p>
                      <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{t.subject} · Due {t.due}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${priorityStyle(t.priority, dark)}`}>{t.priority}</span>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <div className="text-center py-4">
                    <span className="text-3xl">🎉</span>
                    <p className={`text-xs mt-1 font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>All tasks done!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>🔗 Quick Navigation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map(ql => (
                <button key={ql.id} onClick={() => setActive(ql.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-400/50 hover:shadow-brand-500/10 ${dark ? `bg-gradient-to-br ${ql.color}` : `${ql.color} shadow-sm`}`}>
                  <span className="text-2xl block mb-2">{ql.icon}</span>
                  <p className={`text-xs font-bold leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{ql.label}</p>
                  <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{ql.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Current Subjects ── */}
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/40 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center gap-2"><span>📖</span><h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">Current Subjects</h4></div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{COURSES_DEMO.length} subjects</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${dark ? 'border-slate-700/40 bg-slate-900/30' : 'border-slate-100 bg-slate-50'}`}>
                  {['Code', 'Subject', 'Instructor', 'Schedule', 'Room', 'Units'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-slate-700/30' : 'divide-slate-100'}`}>
                {COURSES_DEMO.map(c => (
                  <tr key={c.code} className={`transition-colors ${dark ? 'hover:bg-slate-700/20' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 font-bold text-brand-400 whitespace-nowrap">{c.code}</td>
                    <td className={`px-4 py-3 font-medium max-w-[180px] truncate ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{c.title}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{c.instructor}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{c.schedule}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{c.room}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${dark ? 'bg-brand-500/20 text-brand-300' : 'bg-brand-100 text-brand-700'}`}>{c.units}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Announcements ── */}
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>📢 Announcements</h3>
          <div className="space-y-3">
            {ANNOUNCEMENTS.map(a => (
              <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-400/50 hover:shadow-brand-500/10 ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-gradient-to-b ${a.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{a.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${a.color} text-white`}>{a.tag}</span>
                      <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{a.date}</span>
                    </div>
                  </div>
                  <p className={`text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: MY PROFILE
  ════════════════════════════════ */
  const ProfilePanel = () => {
    const [modal, setModal] = useState(null); // null | 'personal' | 'contact' | 'family' | 'enrollment' | 'education' | 'medical' | guardianRecord
    const [guardianModal, setGuardianModal] = useState(null); // null | 'add' | guardian record
    const [deletingGuardian, setDeletingGuardian] = useState(null);
    const [photoErr, setPhotoErr] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const s = student;

    const refresh = () => { setModal(null); setGuardianModal(null); loadStudent(); };

    const handlePhotoChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Client-side validation: 10 MB max, common image types
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
      if (!allowed.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i)) {
        setPhotoErr('Unsupported file type. Please use JPG, PNG, WebP, or GIF.');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setPhotoErr('File is too large. Maximum size is 10 MB.');
        e.target.value = '';
        return;
      }
      setPhotoErr(null);
      setPhotoUploading(true);
      try {
        await api.students.uploadPhoto(s.id, file);
        await loadStudent();
      } catch (ex) {
        setPhotoErr(ex.message || 'Upload failed. Please try again.');
      } finally {
        setPhotoUploading(false);
        e.target.value = '';
      }
    };

    const delGuardian = async (id) => {
      if (!window.confirm('Remove this guardian?')) return;
      setDeletingGuardian(id);
      try { await api.students.deleteGuardian(s.id, id); await loadStudent(); }
      catch { alert('Failed to delete.'); }
      finally { setDeletingGuardian(null); }
    };

    if (loadingProfile) return <Spinner />;
    if (profileErr) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{profileErr}</div>;

    return (
      <div className="space-y-5">
        {/* Section modals */}
        {modal === 'personal'   && <PersonalInfoModal  student={s} onClose={() => setModal(null)} onSaved={refresh} />}
        {modal === 'contact'    && <ContactInfoModal   student={s} onClose={() => setModal(null)} onSaved={refresh} />}
        {modal === 'enrollment' && <EnrollmentModal    student={s} onClose={() => setModal(null)} onSaved={refresh} />}
        {modal === 'education'  && <EducationalBgModal student={s} onClose={() => setModal(null)} onSaved={refresh} />}
        {modal === 'medical'    && <MedicalModal student={s} record={s?.medical_histories?.[0] ?? null} onClose={() => setModal(null)} onSaved={refresh} />}
        {guardianModal !== null && (
          <GuardianFormModal
            studentId={s?.id}
            record={guardianModal === 'add' ? null : guardianModal}
            onClose={() => setGuardianModal(null)}
            onSaved={refresh}
          />
        )}

        {/* Avatar card */}
        <div className="relative overflow-hidden rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 border"
          style={dark ? {
            background: 'linear-gradient(135deg, #2a1200 0%, #1a0d00 100%)',
            borderColor: 'rgba(249,115,22,0.5)',
            boxShadow: '0 0 20px 2px rgba(249,115,22,0.2), inset 0 0 30px rgba(249,115,22,0.04)',
          } : {
            background: '#fff8f5',
            borderColor: 'rgba(249,115,22,0.35)',
            boxShadow: '0 0 14px 2px rgba(249,115,22,0.12)',
          }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl pointer-events-none"
            style={{ background: dark ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.08)' }} />
          {/* Clickable avatar with upload */}
          <div className="relative shrink-0 group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {photoUploading
                ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                : photoUrl
                  ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} />
                  : <span>{initials}</span>}
            </div>
            {s && !photoUploading && (
              <>
                <label htmlFor="photo-upload" className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-white text-[10px] font-semibold">Change</span>
                </label>
                <input id="photo-upload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif" className="hidden" onChange={handlePhotoChange} />
              </>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {photoErr && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-900/30 border border-red-700/40 text-red-400 text-xs">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {photoErr}
                <button onClick={() => setPhotoErr(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
              </div>
            )}
            <h2 className={`text-xl font-bold ${dark ? 'text-orange-50' : 'text-slate-800'}`}>
              {s ? `${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''} ${s.last_name}${s.suffix ? ' ' + s.suffix : ''}` : (user?.name ?? '—')}
            </h2>
            <p className="text-orange-400 font-medium mt-0.5 text-sm capitalize">{user?.role}</p>
            <p className={`text-sm mt-0.5 ${dark ? 'text-orange-200/50' : 'text-slate-500'}`}>{user?.email}</p>
            {s?.student_number && <p className={`text-xs mt-0.5 ${dark ? 'text-orange-300/40' : 'text-slate-400'}`}>Student No. {s.student_number}</p>}
            {s && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ {s.enrollment_status ?? 'Enrolled'}</span>
                {s.year_level && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">{s.year_level}</span>}
                {s.program && <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${dark ? 'bg-orange-900/20 text-orange-200/70 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{s.program}</span>}
              </div>
            )}
          </div>
        </div>

        {!s ? <EmptyState icon="👤" title="No profile linked" sub="Your account is not linked to a student record yet." /> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Personal Information" icon="👤" action={<BtnEdit onClick={() => setModal('personal')} />}>
              <div className="space-y-1">
                <Row label="Gender"         value={val(s.gender)} />
                <Row label="Civil Status"   value={val(s.civil_status)} />
                <Row label="Nationality"    value={val(s.nationality)} />
                <Row label="Religion"       value={val(s.religion)} />
                <Row label="Date of Birth"  value={fmt(s.birth_date)} />
                <Row label="Place of Birth" value={val(s.place_of_birth)} />
              </div>
            </SectionCard>

            <SectionCard title="Contact Information" icon="📞" action={<BtnEdit onClick={() => setModal('contact')} />}>
              <div className="space-y-1">
                <Row label="Address"        value={val([s.street, s.barangay, s.city, s.province].filter(Boolean).join(', ') || null)} />
                <Row label="Zip Code"       value={val(s.zip_code)} />
                <Row label="Mobile Number"  value={val(s.contact_number)} />
                <Row label="Alt. Number"    value={val(s.alternate_contact_number)} />
                <Row label="Email Address"  value={val(s.email ?? user?.email)} />
              </div>
            </SectionCard>

            <SectionCard title="Family Background" icon="👨‍👩‍👦" action={<AddBtn onClick={() => setGuardianModal('add')} label="Add Guardian" />}>
              {s.guardians?.length > 0 ? (
                <div className="space-y-3">
                  {s.guardians.map(g => (
                    <div key={g.id} className="flex items-start justify-between gap-2 p-3 rounded-xl border"
                      style={dark ? {
                        background: 'rgba(249,115,22,0.06)',
                        borderColor: 'rgba(249,115,22,0.25)',
                      } : {
                        background: '#fff3ec',
                        borderColor: 'rgba(249,115,22,0.25)',
                      }}>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${dark ? 'text-orange-50' : 'text-slate-800'}`}>{g.full_name}</p>
                        <p className="text-xs text-orange-400 font-medium">{g.relationship}</p>
                        {g.occupation && <p className={`text-xs mt-0.5 ${dark ? 'text-orange-200/50' : 'text-slate-500'}`}>{g.occupation}</p>}
                        {g.contact_number && <p className={`text-xs mt-0.5 ${dark ? 'text-orange-300/40' : 'text-slate-400'}`}>{g.contact_number}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <BtnEdit onClick={() => setGuardianModal(g)} />
                        <BtnDanger onClick={() => delGuardian(g.id)} disabled={deletingGuardian === g.id}>
                          {deletingGuardian === g.id
                            ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                        </BtnDanger>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState icon="👨‍👩‍👦" title="No guardians recorded." sub="Click 'Add Guardian' to add family background." />}
            </SectionCard>

            <SectionCard title="Enrollment Details" icon="🎓" action={<BtnEdit onClick={() => setModal('enrollment')} />}>
              <div className="space-y-1">
                <Row label="Student Number"    value={val(s.student_number)} />
                <Row label="College"           value="College of Computing Studies" />
                <Row label="Program"           value={val(s.program)} />
                <Row label="Year Level"        value={val(s.year_level)} />
                <Row label="Section"           value={val(s.section)} />
                <Row label="Student Type"      value={val(s.student_type)} />
                <Row label="Date Enrolled"     value={fmt(s.date_enrolled)} />
                <Row label="Enrollment Status" value={val(s.enrollment_status)} />
              </div>
            </SectionCard>

            <SectionCard title="Educational Background" icon="🏫" action={<BtnEdit onClick={() => setModal('education')} />}>
              <div className="space-y-1">
                <Row label="Last School Attended" value={val(s.last_school_attended)} />
                <Row label="Last Year Attended"   value={val(s.last_year_attended)} />
                <Row label="LRN"                  value={val(s.lrn)} />
                <Row label="Honors / Awards"      value={val(s.honors_received)} />
              </div>
            </SectionCard>

            <SectionCard title="Medical Record" icon="🏥" action={<BtnEdit onClick={() => setModal('medical')} />}>
              {s.medical_histories?.length > 0 ? s.medical_histories.map(mh => (
                <div key={mh.id} className="space-y-1">
                  <Row label="Blood Type"            value={val(mh.bloodtype)} />
                  <Row label="Existing Conditions"   value={val(mh.existing_conditions)} />
                  <Row label="Emergency Contact"     value={val(mh.emergency_contact_name)} />
                  <Row label="Emergency Contact No." value={val(mh.emergency_contact_number)} />
                </div>
              )) : <EmptyState icon="🩺" title="No medical record yet." sub="Click the edit button to add one." />}
            </SectionCard>
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: ACADEMIC HISTORY
  ════════════════════════════════ */
  const AcademicPanel = () => {
    const s = student;
    if (loadingProfile) return <Spinner />;

    // Group records by school year, sorted descending (most recent first)
    const grouped = {};
    (s?.academic_histories ?? []).forEach(ah => {
      if (!grouped[ah.school_year]) grouped[ah.school_year] = [];
      grouped[ah.school_year].push(ah);
    });
    const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const standingStyle = (standing) => {
      if (standing === "Dean's List")        return dark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'   : 'bg-amber-100 text-amber-700 border-amber-200';
      if (standing === 'Good Standing')      return dark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (standing === 'Academic Probation') return dark ? 'bg-red-500/20 text-red-300 border-red-500/30'         : 'bg-red-100 text-red-700 border-red-200';
      return dark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const standingIcon = (standing) => {
      if (standing === "Dean's List")        return '🏆';
      if (standing === 'Good Standing')      return '✅';
      if (standing === 'Academic Probation') return '⚠️';
      return '📋';
    };

    const gpaColor = (gpa) => {
      if (!gpa) return dark ? 'text-slate-500' : 'text-slate-400';
      if (gpa <= 1.5)  return dark ? 'text-amber-300' : 'text-amber-600';
      if (gpa <= 2.0)  return dark ? 'text-emerald-300' : 'text-emerald-600';
      if (gpa <= 3.0)  return dark ? 'text-blue-300' : 'text-blue-600';
      return dark ? 'text-red-300' : 'text-red-600';
    };

    // Compute overall stats
    const allRecords = s?.academic_histories ?? [];
    const recordsWithGpa = allRecords.filter(r => r.gpa);
    const avgGpa = recordsWithGpa.length
      ? (recordsWithGpa.reduce((sum, r) => sum + parseFloat(r.gpa), 0) / recordsWithGpa.length).toFixed(2)
      : null;
    const totalCompleted = allRecords.reduce((sum, r) => sum + (r.completed_units || 0), 0);
    const deansListCount = allRecords.filter(r => r.academic_standing === "Dean's List").length;

    return (
      <div className="space-y-5">

        {/* Notice banner — read-only */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Academic records are managed by the administration. Contact your registrar for any corrections.
        </div>

        {/* Summary stats */}
        {allRecords.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Semesters on Record', val: allRecords.length, icon: '📅', dc: 'from-blue-500/20 to-purple-500/10 border-blue-500/20', lc: 'bg-blue-50 border-blue-100' },
              { label: 'Average GPA',          val: avgGpa ?? '—',    icon: '📊', dc: 'from-brand-500/20 to-amber-500/10 border-brand-500/20', lc: 'bg-orange-50 border-orange-100' },
              { label: 'Units Completed',      val: totalCompleted,   icon: '📚', dc: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20', lc: 'bg-emerald-50 border-emerald-100' },
              { label: "Dean's List",          val: deansListCount,   icon: '🏆', dc: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20', lc: 'bg-amber-50 border-amber-100' },
            ].map(st => (
              <div key={st.label} className={`rounded-2xl border p-4 ${dark ? `bg-gradient-to-br ${st.dc}` : st.lc}`}>
                <div className="text-xl mb-1">{st.icon}</div>
                <div className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{st.val}</div>
                <div className={`text-[10px] mt-0.5 font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{st.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Records grouped by school year */}
        {!s ? (
          <EmptyState icon="📚" title="No profile linked." />
        ) : sortedYears.length === 0 ? (
          <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <span className="text-5xl mb-3">📋</span>
            <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>No academic records yet.</p>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Your records will appear here once added by the administration.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedYears.map(year => {
              const records = grouped[year].sort((a, b) => {
                const order = { '1st Semester': 1, '2nd Semester': 2, 'Summer': 3 };
                return (order[a.semester] ?? 9) - (order[b.semester] ?? 9);
              });
              const yearGpa = records.filter(r => r.gpa);
              const yearAvg = yearGpa.length
                ? (yearGpa.reduce((s, r) => s + parseFloat(r.gpa), 0) / yearGpa.length).toFixed(2)
                : null;

              return (
                <div key={year} className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
                  {/* Year header */}
                  <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/40 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🎓</span>
                      <h4 className={`text-sm font-black ${dark ? 'text-slate-100' : 'text-slate-800'}`}>S.Y. {year}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{records.length} semester{records.length !== 1 ? 's' : ''}</span>
                    </div>
                    {yearAvg && (
                      <div className="text-right">
                        <p className={`text-[10px] uppercase tracking-wider font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Year Avg GPA</p>
                        <p className={`text-base font-black ${gpaColor(parseFloat(yearAvg))}`}>{yearAvg}</p>
                      </div>
                    )}
                  </div>

                  {/* Semester cards */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {records.map(ah => (
                      <div key={ah.id} className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-900/40 border-slate-700/40 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-slate-50 border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10'}`}>
                        {/* Semester label */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dark ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                            {ah.semester}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${standingStyle(ah.academic_standing)}`}>
                            {standingIcon(ah.academic_standing)} {ah.academic_standing}
                          </span>
                        </div>

                        {/* GPA */}
                        <div className="mb-3">
                          <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>GPA</p>
                          <p className={`text-3xl font-black ${gpaColor(ah.gpa ? parseFloat(ah.gpa) : null)}`}>
                            {ah.gpa ?? <span className={`text-lg ${dark ? 'text-slate-600' : 'text-slate-300'}`}>N/A</span>}
                          </p>
                        </div>

                        {/* Units progress bar */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <p className={`text-[10px] uppercase tracking-wider font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Units</p>
                            <p className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{ah.completed_units} / {ah.total_units}</p>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700"
                              style={{ width: ah.total_units > 0 ? `${Math.min(100, (ah.completed_units / ah.total_units) * 100)}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Educational Background */}
        {s && (
          <SectionCard title="Educational Background" icon="🏫">
            <div className="space-y-1">
              <Row label="Last School Attended" value={val(s.last_school_attended)} />
              <Row label="Last Year Attended"   value={val(s.last_year_attended)} />
              <Row label="LRN"                  value={val(s.lrn)} />
              {s.honors_received && (
                <div className={`mt-3 p-3 rounded-xl border ${dark ? 'bg-amber-900/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>Honors / Awards</p>
                  <p className={`text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{s.honors_received}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: SKILLS
  ════════════════════════════════ */
  const SkillsPanel = () => {
    const [modal, setModal] = useState(false);
    const s = student;

    if (loadingProfile) return <Spinner />;

    const academic    = s?.skills?.filter(sk => sk.skill_category === 'Academic')    ?? [];
    const nonAcademic = s?.skills?.filter(sk => sk.skill_category === 'Non-Academic') ?? [];

    const SkillCard = ({ skill }) => {
      const meta = LEVEL_META[skill.pivot?.skill_level];
      return (
        <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-800/60 border-slate-700/50 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-white border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10'}`}>
          <div className={`h-1 w-full ${skill.skill_category === 'Academic' ? 'bg-gradient-to-r from-brand-500 to-amber-400' : 'bg-gradient-to-r from-purple-500 to-pink-400'}`} />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-bold text-sm leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{skill.skill_name}</h4>
              {skill.pivot?.certification && (
                <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Certified
                </span>
              )}
            </div>
            {skill.description && <p className={`text-xs line-clamp-2 mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{skill.description}</p>}
            {meta ? (
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Proficiency</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>{skill.pivot.skill_level}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className={`h-full rounded-full transition-all duration-700 ${meta.bar}`} style={{ width: `${meta.pct}%` }} />
                </div>
              </div>
            ) : (
              <span className={`text-[10px] ${dark ? 'text-slate-600' : 'text-slate-400'}`}>No level set</span>
            )}
            {skill.pivot?.certification && skill.pivot?.certification_name && (
              <p className={`text-[10px] mt-2 truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}>📜 {skill.pivot.certification_name}</p>
            )}
          </div>
        </div>
      );
    };

    const CategorySection = ({ title, emoji, skills, emptyMsg }) => (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{emoji}</span>
          <h3 className={`text-xs font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{skills.length}</span>
          <div className={`flex-1 h-px ${dark ? 'bg-slate-700/60' : 'bg-slate-200'}`} />
        </div>
        {skills.length > 0
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{skills.map(sk => <SkillCard key={sk.id} skill={sk} />)}</div>
          : <p className={`text-xs py-4 pl-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{emptyMsg}</p>
        }
      </div>
    );

    return (
      <div className="space-y-5">
        {modal && <SkillsModal studentId={s?.id} currentSkills={s?.skills ?? []} onClose={() => setModal(false)} onSaved={() => { setModal(false); loadStudent(); }} />}

        <div className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? 'bg-brand-500/15' : 'bg-brand-50'}`}>💡</div>
            <div>
              <h2 className={`font-black text-base ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Skills & Certifications</h2>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {s?.skills?.length ? `${s.skills.length} skill${s.skills.length !== 1 ? 's' : ''} · ${academic.length} academic · ${nonAcademic.length} non-academic` : 'No skills added yet'}
              </p>
            </div>
          </div>
          {s && (
            <button onClick={() => setModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f26522, #e04f0f)', boxShadow: '0 4px 14px rgba(242,101,34,0.35)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Manage Skills
            </button>
          )}
        </div>

        {!s ? <EmptyState icon="🛠️" title="No profile linked." /> : s.skills?.length === 0 ? (
          <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 gap-3 ${dark ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
            <div className="text-5xl">🛠️</div>
            <p className={`font-bold text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>No skills recorded yet</p>
            <p className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Click "Manage Skills" to add your academic and non-academic skills.</p>
            <button onClick={() => setModal(true)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f26522, #e04f0f)', boxShadow: '0 4px 14px rgba(242,101,34,0.3)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Add Skills
            </button>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/30 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="p-5 space-y-7">
              <CategorySection title="Academic Skills" emoji="💻" skills={academic} emptyMsg="No academic skills added." />
              <CategorySection title="Non-Academic Skills" emoji="🏅" skills={nonAcademic} emptyMsg="No non-academic skills added." />
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: AFFILIATIONS
  ════════════════════════════════ */
  const AffiliationsPanel = () => {
    const [modal, setModal]     = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch]   = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const s = student;

    const del = async (id) => {
      if (!window.confirm('Delete this affiliation?')) return;
      setDeleting(id);
      try { await api.students.deleteAffiliation(s.id, id); await loadStudent(); }
      catch { alert('Failed to delete.'); }
      finally { setDeleting(null); }
    };

    if (loadingProfile) return <Spinner />;

    const affs = s?.affiliations ?? [];
    const activeCount   = affs.filter(a => a.status === 'Active').length;
    const inactiveCount = affs.filter(a => a.status === 'Inactive').length;
    const alumniCount   = affs.filter(a => a.status === 'Alumni').length;

    const filtered = affs.filter(a => {
      const matchSearch = !search || a.organization_name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || a.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-5">
        {modal && <AffiliationModal studentId={s?.id} record={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); loadStudent(); }} />}

        {/* Header banner */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 ${dark ? 'bg-gradient-to-br from-purple-600/15 via-brand-600/10 to-slate-900/0 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 via-brand-50 to-white border-purple-100'}`}>
          <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${dark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>🏛️</div>
              <div>
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>My Affiliations</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Organizations, clubs & extracurricular memberships</p>
              </div>
            </div>
            {s && <AddBtn onClick={() => setModal('add')} label="Add Affiliation" />}
          </div>

          {/* Stats row */}
          {affs.length > 0 && (
            <div className="relative grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Total',    val: affs.length,    color: dark ? 'text-slate-200' : 'text-slate-700' },
                { label: 'Active',   val: activeCount,    color: 'text-emerald-400' },
                { label: 'Alumni',   val: alumniCount,    color: 'text-purple-400' },
              ].map(st => (
                <div key={st.label} className={`rounded-xl p-3 text-center border ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white/70 border-slate-200'}`}>
                  <p className={`text-xl font-black ${st.color}`}>{st.val}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{st.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!s ? <EmptyState icon="🏛️" title="No profile linked." /> : (
          <>
            {/* Search + filter */}
            {affs.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organization or role…"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm ${dark ? 'bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-brand-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-400'} outline-none transition-colors`} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Active', 'Inactive', 'Alumni'].map(st => (
                    <button key={st} onClick={() => setFilterStatus(st)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === st
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                        : dark ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cards grid */}
            {filtered.length === 0 && affs.length > 0 ? (
              <EmptyState icon="🔍" title="No results found." sub="Try adjusting your search or filter." />
            ) : filtered.length === 0 ? (
              <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-5xl mb-3">🏛️</div>
                <h3 className={`text-base font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>No affiliations yet</h3>
                <p className={`text-sm mb-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Add your organizations, clubs, and extracurricular memberships.</p>
                {s && <AddBtn onClick={() => setModal('add')} label="Add Your First Affiliation" />}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(aff => {
                  const st = AFF_STATUS[aff.status] ?? AFF_STATUS.Inactive;
                  const dur = affDuration(aff.date_joined, aff.date_ended);
                  return (
                    <div key={aff.id} className={`group relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-800/40 border-slate-700/60 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-white border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10 shadow-sm'}`}>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-bold text-sm leading-tight truncate ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{aff.organization_name}</h4>
                            <p className={`text-xs mt-0.5 font-medium ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{aff.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <BtnEdit onClick={() => setModal(aff)} />
                          <BtnDanger onClick={() => del(aff.id)} disabled={deleting === aff.id}>
                            {deleting === aff.id
                              ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                          </BtnDanger>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className={`h-px mb-3 ${dark ? 'bg-slate-700/60' : 'bg-slate-100'}`} />

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Status badge */}
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-[10px] ${st.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {aff.status}
                        </span>
                        {/* Duration */}
                        {dur && (
                          <span className={`flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {dur}
                          </span>
                        )}
                      </div>

                      {/* Date range */}
                      <div className={`flex items-center gap-3 mt-2.5 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {fmt(aff.date_joined)}
                        </span>
                        <span>→</span>
                        <span>{aff.date_ended ? fmt(aff.date_ended) : <span className="text-emerald-400 font-medium">Present</span>}</span>
                      </div>

                      {/* Adviser */}
                      {aff.adviser_name && (
                        <div className={`flex items-center gap-1.5 mt-2.5 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Adviser: <span className={`font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{aff.adviser_name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: VIOLATIONS (read-only for student)
  ════════════════════════════════ */
  const ViolationsPanel = () => {
    const s = student;
    const [filter, setFilter] = useState('All');
    if (loadingProfile) return <Spinner />;

    const viols = s?.violations ?? [];
    const resolved  = viols.filter(v => v.status === 'Resolved');
    const unresolved = viols.filter(v => v.status !== 'Resolved');
    const highCount  = unresolved.filter(v => v.severity_level === 'High').length;

    const filtered = filter === 'All' ? viols
      : filter === 'Unresolved' ? unresolved
      : viols.filter(v => v.status === filter);

    const sevStyle = (sev) => ({
      High:   { card: dark ? 'border-red-500/40 bg-red-900/10' : 'border-red-200 bg-red-50',
                badge: dark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-600 border-red-200',
                icon: dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-500' },
      Medium: { card: dark ? 'border-amber-500/40 bg-amber-900/10' : 'border-amber-200 bg-amber-50',
                badge: dark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-600 border-amber-200',
                icon: dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-500' },
      Low:    { card: dark ? 'border-slate-600/40 bg-slate-800/30' : 'border-slate-200 bg-slate-50',
                badge: dark ? 'bg-slate-600/40 text-slate-400 border-slate-600/30' : 'bg-slate-100 text-slate-500 border-slate-200',
                icon: dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500' },
    });

    const statusStyle = (st) => st === 'Resolved'
      ? dark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
      : st === 'Under Review'
        ? dark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-600 border-blue-200'
        : dark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-600 border-orange-200';

    return (
      <div className="space-y-5">

        {/* ── Header banner ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 ${
          !s || viols.length === 0
            ? dark ? 'bg-gradient-to-br from-emerald-600/15 to-slate-900/0 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
            : highCount > 0
              ? dark ? 'bg-gradient-to-br from-red-600/15 to-slate-900/0 border-red-500/20' : 'bg-gradient-to-br from-red-50 to-white border-red-100'
              : dark ? 'bg-gradient-to-br from-amber-600/15 to-slate-900/0 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-100'
        }`}>
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none opacity-30"
            style={{ background: viols.length === 0 ? '#10b981' : highCount > 0 ? '#ef4444' : '#f59e0b' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                viols.length === 0 ? dark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                : highCount > 0 ? dark ? 'bg-red-500/20' : 'bg-red-100'
                : dark ? 'bg-amber-500/20' : 'bg-amber-100'
              }`}>
                {viols.length === 0 ? '✅' : highCount > 0 ? '🚨' : '⚠️'}
              </div>
              <div>
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>Disciplinary Records</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {viols.length === 0 ? 'No violations on record' : `${viols.length} total · ${unresolved.length} unresolved`}
                </p>
              </div>
            </div>
            {/* Summary pills */}
            {viols.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Total',      val: viols.length,      c: dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600' },
                  { label: 'Unresolved', val: unresolved.length, c: unresolved.length > 0 ? dark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500' },
                  { label: 'Resolved',   val: resolved.length,   c: dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' },
                ].map(p => (
                  <div key={p.label} className={`px-3 py-1.5 rounded-xl text-center ${p.c}`}>
                    <p className="text-base font-black leading-none">{p.val}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5">{p.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!s ? <EmptyState icon="⚠️" title="No profile linked." /> : (
          <>
            {viols.length === 0 ? (
              /* ── Clean record ── */
              <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${dark ? 'border-emerald-700/40' : 'border-emerald-200'}`}>
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${dark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className={`text-lg font-black mb-1 ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>Clean Record</h3>
                <p className={`text-sm ${dark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>You have no recorded violations. Keep up the good conduct!</p>
              </div>
            ) : (
              <>
                {/* ── Filter tabs ── */}
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Unresolved', 'Pending', 'Under Review', 'Resolved'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === f
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                        : dark ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {f}
                      {f === 'Unresolved' && unresolved.length > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unresolved.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Violation cards ── */}
                {filtered.length === 0 ? (
                  <EmptyState icon="🔍" title="No records match this filter." sub="Try a different filter above." />
                ) : (
                  <div className="space-y-4">
                    {filtered.map((v, idx) => {
                      const ss = sevStyle(v.severity_level) ?? sevStyle('Low');
                      return (
                        <div key={v.id} className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${ss.card} ${dark ? 'hover:border-brand-500/40 hover:shadow-brand-500/10' : 'hover:border-brand-400/50 hover:shadow-brand-500/10'}`}>
                          {/* Card header */}
                          <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b ${dark ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ss.icon}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={`font-bold text-sm ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{v.violation_type}</h4>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${ss.badge}`}>{v.severity_level}</span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(v.status)}`}>{v.status}</span>
                                </div>
                                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Reported {fmt(v.date_reported)}{v.reported_by ? ` · by ${v.reported_by}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold shrink-0 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>#{String(idx + 1).padStart(2, '0')}</span>
                          </div>

                          {/* Card body */}
                          <div className="px-5 py-4 space-y-3">
                            {v.description && (
                              <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Description</p>
                                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{v.description}</p>
                              </div>
                            )}

                            {/* Action taken box */}
                            <div className={`rounded-xl p-3.5 border ${dark ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/70 border-slate-200'}`}>
                              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Action Taken</p>
                              <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{v.action_taken || 'No action recorded yet.'}</p>
                            </div>

                            {/* Footer meta */}
                            <div className={`flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t ${dark ? 'border-slate-700/40 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Status: <span className={`font-bold ${v.status === 'Resolved' ? 'text-emerald-400' : v.status === 'Under Review' ? 'text-blue-400' : 'text-orange-400'}`}>{v.status}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Resolution: <span className={`font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{v.resolution_date ? fmt(v.resolution_date) : 'Pending'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Admin notice ── */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
          <svg className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Violation records are managed by the administration. Contact your department or guidance office for any concerns or disputes.</span>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: GRADES
  ════════════════════════════════ */
  const GradesPanel = () => {
    const [activeTerm, setActiveTerm] = useState('Midterm');
    const terms = ['Prelim', 'Midterm', 'Final'];

    // GPA helpers — lower is better (Philippine grading)
    const numericGrades = GRADES.map(g => parseFloat(g[activeTerm.toLowerCase()])).filter(n => !isNaN(n));
    const avg = numericGrades.length ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : '—';
    const totalUnits = GRADES.reduce((a, g) => a + g.units, 0);

    const standing = (gpa) => {
      const n = parseFloat(gpa);
      if (isNaN(n)) return { label: 'N/A', color: dark ? 'text-slate-400' : 'text-slate-500' };
      if (n <= 1.25) return { label: "Dean's List", color: 'text-amber-400' };
      if (n <= 1.75) return { label: 'Good Standing', color: 'text-emerald-400' };
      if (n <= 2.50) return { label: 'Satisfactory', color: 'text-blue-400' };
      return { label: 'Needs Improvement', color: 'text-red-400' };
    };

    const gradeColor = (val) => {
      const n = parseFloat(val);
      if (isNaN(n) || val === '—') return dark ? 'text-slate-500' : 'text-slate-400';
      if (n <= 1.25) return 'text-amber-400';
      if (n <= 1.75) return 'text-emerald-400';
      if (n <= 2.50) return dark ? 'text-blue-300' : 'text-blue-600';
      if (n <= 3.00) return dark ? 'text-orange-300' : 'text-orange-500';
      return 'text-red-400';
    };

    const st = standing(avg);

    return (
      <div className="space-y-5">

        {/* ── Hero GPA banner ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-slate-900/0 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-white border-blue-100'}`}>
          <div className="absolute right-0 top-0 w-56 h-56 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-40 h-40 bg-purple-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shrink-0">🎓</div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>AY 2025–2026 · 1st Semester</p>
                <div className="flex items-end gap-3">
                  <h2 className={`text-5xl font-black leading-none ${dark ? 'text-white' : 'text-slate-800'}`}>{avg}</h2>
                  <div className="pb-1">
                    <p className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>GPA ({activeTerm})</p>
                    <p className={`text-sm font-bold ${st.color}`}>{st.label}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Stats pills */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Total Units', val: totalUnits, icon: '📚' },
                { label: 'Subjects',    val: GRADES.length, icon: '📖' },
                { label: 'Passed',      val: numericGrades.filter(n => n <= 3.0).length, icon: '✅' },
              ].map(p => (
                <div key={p.label} className={`px-4 py-3 rounded-xl border text-center min-w-[72px] ${dark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                  <p className="text-lg mb-0.5">{p.icon}</p>
                  <p className={`text-xl font-black leading-none ${dark ? 'text-white' : 'text-slate-800'}`}>{p.val}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grade legend ── */}
        <div className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border text-xs ${dark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className={`font-bold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Grade Scale:</span>
          {[
            { range: '1.00–1.25', label: "Dean's List", c: 'text-amber-400' },
            { range: '1.50–1.75', label: 'Good Standing', c: 'text-emerald-400' },
            { range: '2.00–2.50', label: 'Satisfactory', c: dark ? 'text-blue-300' : 'text-blue-600' },
            { range: '2.75–3.00', label: 'Passing', c: dark ? 'text-orange-300' : 'text-orange-500' },
            { range: '5.00', label: 'Failed', c: 'text-red-400' },
          ].map(l => (
            <span key={l.range} className={`flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`font-bold ${l.c}`}>{l.range}</span> — {l.label}
            </span>
          ))}
        </div>

        {/* ── Grade table ── */}
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-white border-slate-200 shadow-sm'}`}>
          {/* Table header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-700/60 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
            <div>
              <h3 className={`font-bold text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Grade Report — AY 2025–2026, 1st Semester</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Bachelor of Science in Information Technology</p>
            </div>
            {/* Term switcher */}
            <div className={`flex rounded-xl overflow-hidden border ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
              {terms.map(t => (
                <button key={t} onClick={() => setActiveTerm(t)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${activeTerm === t
                    ? 'bg-brand-500 text-white'
                    : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider border-b ${dark ? 'bg-slate-900/40 border-slate-700/40 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <th className="px-5 py-3 text-left font-bold">Subject</th>
                  <th className="px-5 py-3 text-left font-bold hidden md:table-cell">Title</th>
                  <th className="px-5 py-3 text-center font-bold">Units</th>
                  <th className="px-5 py-3 text-center font-bold">Prelim</th>
                  <th className="px-5 py-3 text-center font-bold">Midterm</th>
                  <th className="px-5 py-3 text-center font-bold">Final</th>
                  <th className="px-5 py-3 text-center font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-slate-700/30' : 'divide-slate-100'}`}>
                {GRADES.map(g => {
                  const activeVal = g[activeTerm.toLowerCase()];
                  const isPassed = parseFloat(activeVal) <= 3.0;
                  const isFailed = parseFloat(activeVal) > 3.0;
                  const isPending = activeVal === '—';
                  return (
                    <tr key={g.subject} className={`transition-colors group ${dark ? 'hover:bg-slate-700/20' : 'hover:bg-blue-50/50'}`}>
                      <td className="px-5 py-4">
                        <span className={`font-black text-sm ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{g.subject}</span>
                      </td>
                      <td className={`px-5 py-4 hidden md:table-cell text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{g.title}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{g.units}</span>
                      </td>
                      {['prelim', 'midterm', 'final'].map(term => (
                        <td key={term} className="px-5 py-4 text-center">
                          <span className={`font-bold text-sm ${gradeColor(g[term])}`}>
                            {g[term] === '—' ? <span className={`text-xs italic ${dark ? 'text-slate-600' : 'text-slate-300'}`}>—</span> : g[term]}
                          </span>
                        </td>
                      ))}
                      <td className="px-5 py-4 text-center">
                        {isPending
                          ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>Pending</span>
                          : isPassed
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Passed</span>
                            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Failed</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={`border-t ${dark ? 'bg-slate-900/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <td className={`px-5 py-3.5 font-black text-xs uppercase tracking-wider ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Total</td>
                  <td className="hidden md:table-cell" />
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-black text-sm ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{totalUnits} units</span>
                  </td>
                  <td colSpan={3} className={`px-5 py-3.5 text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activeTerm} GPA: <span className={`font-black text-base ml-1 ${gradeColor(avg)}`}>{avg}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-bold ${st.color}`}>{st.label}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Notice ── */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
          <svg className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Grades shown are for reference only. Official grades are released by the Registrar's Office. Contact your instructor for any grade concerns.</span>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: TASKS
  ════════════════════════════════ */
  const TasksPanel = () => {
    const [filter, setFilter] = useState('All');
    const pending = tasks.filter(t => !t.done);
    const done    = tasks.filter(t => t.done);
    const pct     = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

    const highCount   = pending.filter(t => t.priority === 'High').length;
    const mediumCount = pending.filter(t => t.priority === 'Medium').length;

    const filtered = filter === 'All'       ? tasks
      : filter === 'Pending'   ? pending
      : filter === 'Completed' ? done
      : tasks.filter(t => !t.done && t.priority === filter);

    return (
      <div className="space-y-5">

        {/* ── Hero banner ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 ${dark ? 'bg-gradient-to-br from-brand-600/20 via-amber-600/10 to-slate-900/0 border-brand-500/20' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white border-orange-100'}`}>
          <div className="absolute right-0 top-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${dark ? 'bg-brand-500/20' : 'bg-orange-100'}`}>📋</div>
              <div>
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>My Pending Tasks</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {pending.length === 0 ? 'All tasks completed — great work!' : `${pending.length} task${pending.length > 1 ? 's' : ''} remaining`}
                </p>
              </div>
            </div>
            {/* Stat pills */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Total',     val: tasks.length,   c: dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600' },
                { label: 'Pending',   val: pending.length, c: pending.length > 0 ? dark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500' },
                { label: 'Done',      val: done.length,    c: dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' },
              ].map(p => (
                <div key={p.label} className={`px-3 py-1.5 rounded-xl text-center ${p.c}`}>
                  <p className="text-lg font-black leading-none">{p.val}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Overall Progress</span>
              <span className={`text-xs font-black ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{pct}%</span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${dark ? 'bg-slate-700/60' : 'bg-slate-200'}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700 relative"
                style={{ width: `${pct}%` }}>
                {pct > 10 && <div className="absolute inset-0 bg-white/20 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)' }} />}
              </div>
            </div>
            <p className={`text-[10px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{done.length} of {tasks.length} tasks completed</p>
          </div>
        </div>

        {/* ── Priority breakdown ── */}
        {pending.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'High Priority',   val: highCount,                                    c: dark ? 'border-red-500/30 bg-red-900/10' : 'border-red-200 bg-red-50',     tc: 'text-red-400',    icon: '🔴' },
              { label: 'Medium Priority', val: mediumCount,                                  c: dark ? 'border-amber-500/30 bg-amber-900/10' : 'border-amber-200 bg-amber-50', tc: 'text-amber-400',  icon: '🟡' },
              { label: 'Low Priority',    val: pending.filter(t => t.priority === 'Low').length, c: dark ? 'border-slate-600/40 bg-slate-800/30' : 'border-slate-200 bg-slate-50', tc: dark ? 'text-slate-400' : 'text-slate-500', icon: '🟢' },
            ].map(p => (
              <div key={p.label} className={`rounded-xl border p-3 text-center ${p.c}`}>
                <p className="text-lg mb-1">{p.icon}</p>
                <p className={`text-2xl font-black ${p.tc}`}>{p.val}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'High', 'Medium', 'Low', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === f
                ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                : dark ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {f}
              {f === 'Pending' && pending.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Task list ── */}
        {filtered.length === 0 ? (
          <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="text-4xl mb-2">🎉</div>
            <p className={`text-sm font-bold ${dark ? 'text-emerald-300' : 'text-emerald-600'}`}>
              {filter === 'Completed' ? 'No completed tasks yet.' : 'All tasks done!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(t => {
              const isDone = t.done;
              const pStyle = priorityStyle(t.priority, dark);
              return (
                <div key={t.id} className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isDone
                    ? dark ? 'bg-slate-800/20 border-slate-700/20 opacity-55' : 'bg-slate-50 border-slate-100 opacity-60'
                    : t.priority === 'High'
                      ? dark ? 'bg-red-900/10 border-red-500/20 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-red-50/60 border-red-200 hover:border-brand-400/50 hover:shadow-brand-500/10'
                      : t.priority === 'Medium'
                        ? dark ? 'bg-amber-900/10 border-amber-500/20 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-amber-50/60 border-amber-200 hover:border-brand-400/50 hover:shadow-brand-500/10'
                        : dark ? 'bg-slate-800/40 border-slate-700/40 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-white border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10 shadow-sm'
                }`}>
                  {/* Checkbox */}
                  <button onClick={() => toggleTask(t.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500'
                        : dark ? 'border-slate-600 hover:border-brand-500 hover:bg-brand-500/10' : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50'
                    }`}>
                    {isDone && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dark ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-600 border-brand-200'}`}>{t.subject}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pStyle}`}>{t.priority}</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDone ? 'line-through' : ''} ${dark ? isDone ? 'text-slate-500' : 'text-slate-100' : isDone ? 'text-slate-400' : 'text-slate-700'}`}>{t.title}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Due: {t.due}
                    </div>
                  </div>

                  {/* Status tag */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 self-center ${
                    isDone
                      ? dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>{isDone ? 'Done' : 'Pending'}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Notice ── */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
          <svg className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Tasks shown here are personal reminders. Click the circle to mark a task as done.</span>
        </div>
      </div>
    );
  };

  /* ── panel map ── */
  const panels = {
    dashboard: <DashboardPanel />, profile: <ProfilePanel />, academic: <AcademicPanel />,
    skills: <SkillsPanel />, affiliations: <AffiliationsPanel />, violations: <ViolationsPanel />,
    grades: <GradesPanel />, tasks: <TasksPanel />,
  };
  const activeNav = NAV.find(n => n.id === active);

  return (
    <ThemeCtx.Provider value={dark}>
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${dark ? 'sd-dark bg-slate-950' : 'sd-light bg-slate-50'}`}>
      {dark && <>
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      </>}

      {/* Sidebar — sits as a sibling to the right column, full height */}
      <aside
        className={`relative z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out shrink-0 ${sidebarExpanded ? 'w-64 shadow-2xl shadow-slate-900/50' : 'w-16'} ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* User profile header */}
        <div className={`flex items-center border-b h-20 overflow-hidden shrink-0 transition-all duration-300 ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'} ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden">
            {photoUrl
              ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover object-top" />
              : <span className="text-sm">{initials}</span>}
          </div>
          <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ml-3 ${sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
            <p className={`text-sm font-semibold leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
              {student
                ? `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`
                : (user?.name ?? '—')}
            </p>
            <p className={`text-[10px] mt-0.5 capitalize ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.role} · CCS</p>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-2 overflow-x-hidden">
          <p className={`px-2 text-xs font-semibold uppercase tracking-wider mb-4 transition-all duration-300 whitespace-nowrap ${sidebarExpanded ? 'opacity-100' : 'opacity-0 h-0 hidden'} ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Navigation
          </p>
          {NAV.map(item => <NavLink key={item.id} item={item} />)}
        </div>

        {/* Bottom: logout only */}
        <div className={`p-3 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={onLogout} title="Log Out"
            className={`w-full flex items-center rounded-xl transition-all duration-300 group text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 ${sidebarExpanded ? 'px-4 py-3' : 'px-0 py-3 justify-center'}`}>
            <svg className={`w-5 h-5 shrink-0 transition-all duration-300 group-hover:text-red-400 ${sidebarExpanded ? 'mr-3' : 'mr-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Right column: topnav + main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top nav */}
        <header className={`relative z-30 flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? 'border-slate-800/60 bg-slate-900/80 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(242,101,34,0.4)]">
              <img src="/ccs_logo.jpg" alt="CCS" className="w-6 h-6 object-contain rounded-lg" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 leading-none">Profile Hub</h1>
              <p className={`text-[10px] leading-none mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme} title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition-all ${dark ? 'bg-slate-800/60 border-slate-700/50 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
              {dark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
            {/* Notification bell */}
            <div className="relative" data-notif>
              <button onClick={openNotif} title="Notifications"
                className={`relative p-2 rounded-xl border transition-all ${dark ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Dropdown */}
              {notifOpen && (
                <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`text-sm font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Notifications</h3>
                    <button onClick={() => setNotifOpen(false)} className={`text-xs ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>✕</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} onClick={() => { setActive(n.nav); setNotifOpen(false); }}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b transition-colors ${dark ? 'border-slate-800 hover:bg-slate-800/60' : 'border-slate-50 hover:bg-slate-50'}`}>
                        <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</p>
                          <p className={`text-xs mt-0.5 truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{n.body}</p>
                          {n.date && <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{fmt(n.date)}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center gap-3 ${dark ? 'bg-slate-900/80 border-slate-800/50 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activeNav?.icon} />
            </svg>
            <h2 className={`text-base font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{activeNav?.label}</h2>
          </div>
          <div className="p-6">{panels[active]}</div>
        </main>
      </div>
    </div>
    </ThemeCtx.Provider>

  );
};

export default StudentDashboard;
