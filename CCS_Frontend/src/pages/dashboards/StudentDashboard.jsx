import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../../utils/api';

/* ─── theme context ──────────────────────────── */
const ThemeCtx = createContext(true); // true = dark
const useTheme = () => useContext(ThemeCtx);

/* ─── nav ────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',      label: 'My Profile',       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'academic',     label: 'Academic History',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'skills',       label: 'Skills',            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'affiliations', label: 'Affiliations',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'violations',   label: 'Violations',        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { id: 'grades',       label: 'Grades',            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'tasks',        label: 'Pending Tasks',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
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
    <Modal title={record ? 'Edit Affiliation' : 'Add Affiliation'} onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Affiliation'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Field label="Organization Name" required><input name="organization_name" value={form.organization_name} onChange={ch} className={i} required /></Field></div>
        <Field label="Position / Role" required><input name="position" value={form.position} onChange={ch} className={i} required /></Field>
        <Field label="Status" required>
          <Sel name="status" value={form.status} onChange={ch} className={s}>
            <option>Active</option><option>Inactive</option><option>Alumni</option>
          </Sel>
        </Field>
        <Field label="Date Joined" required><input type="date" name="date_joined" value={form.date_joined} onChange={ch} className={i} required /></Field>
        <Field label="Date Ended"><input type="date" name="date_ended" value={form.date_ended} onChange={ch} className={i} /></Field>
        <div className="col-span-2"><Field label="Adviser Name"><input name="adviser_name" value={form.adviser_name} onChange={ch} className={i} placeholder="Optional" /></Field></div>
      </form>
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   SKILLS MODAL
════════════════════════════════════════════════ */
const SkillsModal = ({ studentId, currentSkills, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const ii = i; const sl = s; // aliases used in nested JSX
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

  const filtered = allSkills.filter(s => s.skill_name.toLowerCase().includes(search.toLowerCase()) || s.skill_category.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(filtered.map(s => s.skill_category))];

  return (
    <Modal title="Manage Skills" subtitle="Select skills and set your proficiency level" onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Skills</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <input value={search} onChange={e => setSearch(e.target.value)} className={`${i} mb-4`} placeholder="Search skills…" />

      {/* Skill picker */}
      <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-1">
        {categories.map(cat => (
          <div key={cat}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {filtered.filter(s => s.skill_category === cat).map(skill => {
                const isOn = selected.some(s => s.skill_id === skill.id);
                return (
                  <button key={skill.id} type="button" onClick={() => toggle(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isOn ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                    {isOn && '✓ '}{skill.skill_name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No skills found.</p>}
      </div>

      {/* Selected skill details */}
      {selected.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Selected Skills — Set Details</p>
          <div className="space-y-3">
            {selected.map(s => (
              <div key={s.skill_id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-white bg-brand-500 px-2 py-0.5 rounded uppercase">{s.skill_category}</span>
                    <p className="text-sm font-semibold text-slate-100 mt-1">{s.skill_name}</p>
                  </div>
                  <button onClick={() => toggle({ id: s.skill_id })} className="text-slate-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                      <Field label="Certification Name"><input value={s.certification_name} onChange={e => updatePivot(s.skill_id, 'certification_name', e.target.value)} className={ii} /></Field>
                      <Field label="Certification Date"><input type="date" value={s.certification_date} onChange={e => updatePivot(s.skill_id, 'certification_date', e.target.value)} className={ii} /></Field>
                    </>
                  )}
                </div>
              </div>
            ))}
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

  const toggleTheme = () => setDark(d => { const next = !d; localStorage.setItem('sd_theme', next ? 'dark' : 'light'); return next; });

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
  const DashboardPanel = () => (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600/20 via-purple-600/10 to-transparent border border-brand-500/20 p-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
            {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} /> : <span>{initials}</span>}
          </div>
          <div>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back,</p>
            <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{user?.name} 👋</h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>CCS Student · Profile Hub</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Units', val: '14', icon: '📚', color: 'from-brand-500/20 to-amber-500/10 border-brand-500/20' },
          { label: 'Active Subjects', val: COURSES_DEMO.length, icon: '📖', color: 'from-blue-500/20 to-purple-500/10 border-blue-500/20' },
          { label: 'Pending Tasks', val: tasks.filter(t => !t.done).length, icon: '✅', color: 'from-red-500/20 to-pink-500/10 border-red-500/20' },
          { label: 'GPA (Prelim)', val: '1.40', icon: '🎓', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20' },
        ].map(st => (
          <div key={st.label} className={`rounded-2xl border p-4 bg-gradient-to-br ${st.color}`}>
            <div className="text-2xl mb-1">{st.icon}</div>
            <div className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{st.val}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{st.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>📢 Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${dark ? 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
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
    const [modal, setModal] = useState(null); // null | 'add' | record
    const [deleting, setDeleting] = useState(null);
    const s = student;

    const del = async (id) => {
      if (!window.confirm('Delete this academic record?')) return;
      setDeleting(id);
      try { await api.students.deleteAcademicHistory(s.id, id); await loadStudent(); }
      catch { alert('Failed to delete.'); }
      finally { setDeleting(null); }
    };

    if (loadingProfile) return <Spinner />;

    return (
      <div className="space-y-5">
        {modal && <AcademicModal studentId={s?.id} record={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); loadStudent(); }} />}

        <SectionCard title="Academic History" icon="📊" action={s && <AddBtn onClick={() => setModal('add')} label="Add Record" />}>
          {!s ? <EmptyState icon="📚" title="No profile linked." /> :
           s.academic_histories?.length > 0 ? (
            <div className="overflow-x-auto -mx-5 -mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">School Year</th>
                    <th className="px-5 py-3 text-left font-semibold">Semester</th>
                    <th className="px-5 py-3 text-center font-semibold">GPA</th>
                    <th className="px-5 py-3 text-left font-semibold">Standing</th>
                    <th className="px-5 py-3 text-right font-semibold">Units</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {s.academic_histories.map(ah => (
                    <tr key={ah.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3.5 text-slate-200 font-medium">{ah.school_year}</td>
                      <td className="px-5 py-3.5 text-slate-300">{ah.semester}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-brand-400">{ah.gpa ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${ah.academic_standing === 'Good Standing' || ah.academic_standing === "Dean's List" ? 'bg-green-900/40 text-green-300' : 'bg-yellow-900/40 text-yellow-300'}`}>{ah.academic_standing}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">{ah.completed_units} / {ah.total_units}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <BtnEdit onClick={() => setModal(ah)} />
                          <BtnDanger onClick={() => del(ah.id)} disabled={deleting === ah.id}>
                            {deleting === ah.id ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                          </BtnDanger>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon="📚" title="No academic history yet." sub="Click 'Add Record' to get started." />}
        </SectionCard>

        {s && (
          <SectionCard title="Educational Background" icon="🏫">
            <div className="space-y-1">
              <Row label="Last School Attended" value={val(s.last_school_attended)} />
              <Row label="Last Year Attended"   value={val(s.last_year_attended)} />
              <Row label="LRN"                  value={val(s.lrn)} />
              {s.honors_received && (
                <div className="mt-3 p-3 rounded-xl bg-amber-900/20 border border-amber-800/40">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Honors / Awards</p>
                  <p className="text-sm text-slate-200">{s.honors_received}</p>
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

    return (
      <div className="space-y-5">
        {modal && <SkillsModal studentId={s?.id} currentSkills={s?.skills ?? []} onClose={() => setModal(false)} onSaved={() => { setModal(false); loadStudent(); }} />}

        <SectionCard title="Skills & Certifications" icon="💡" action={s && <AddBtn onClick={() => setModal(true)} label="Manage Skills" />}>
          {!s ? <EmptyState icon="🛠️" title="No profile linked." /> :
           s.skills?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {s.skills.map(skill => (
                <div key={skill.id} className="border border-slate-700 bg-slate-800/50 p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white bg-brand-500 px-2 py-0.5 rounded uppercase w-fit">{skill.skill_category}</span>
                  <h4 className="font-bold text-sm text-slate-100">{skill.skill_name}</h4>
                  {skill.description && <p className="text-xs text-slate-400 line-clamp-2">{skill.description}</p>}
                  <div className="mt-auto pt-3 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-medium border border-slate-600 text-slate-400 px-2 py-1 rounded">Level: {skill.pivot?.skill_level || 'N/A'}</span>
                    {skill.pivot?.certification && (
                      <span className="text-xs flex items-center font-medium text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Certified
                      </span>
                    )}
                  </div>
                  {skill.pivot?.certification && (
                    <div className="text-xs text-slate-500">
                      <p className="font-semibold text-slate-400">{skill.pivot.certification_name}</p>
                      <p>Date: {skill.pivot.certification_date || '—'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <EmptyState icon="🛠️" title="No skills recorded yet." sub="Click 'Manage Skills' to add your skills." />}
        </SectionCard>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: AFFILIATIONS
  ════════════════════════════════ */
  const AffiliationsPanel = () => {
    const [modal, setModal] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const s = student;

    const del = async (id) => {
      if (!window.confirm('Delete this affiliation?')) return;
      setDeleting(id);
      try { await api.students.deleteAffiliation(s.id, id); await loadStudent(); }
      catch { alert('Failed to delete.'); }
      finally { setDeleting(null); }
    };

    if (loadingProfile) return <Spinner />;

    return (
      <div className="space-y-5">
        {modal && <AffiliationModal studentId={s?.id} record={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); loadStudent(); }} />}

        <SectionCard title="Affiliations & Organizations" icon="🏛️" action={s && <AddBtn onClick={() => setModal('add')} label="Add Affiliation" />}>
          {!s ? <EmptyState icon="🏛️" title="No profile linked." /> :
           s.affiliations?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {s.affiliations.map(aff => (
                <div key={aff.id} className="border border-slate-700 p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-900/40 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{aff.organization_name}</h4>
                        <p className="text-xs text-slate-400">{aff.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <BtnEdit onClick={() => setModal(aff)} />
                      <BtnDanger onClick={() => del(aff.id)} disabled={deleting === aff.id}>
                        {deleting === aff.id ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                      </BtnDanger>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aff.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>{aff.status}</span>
                    <span className="text-xs text-slate-500">Joined: {fmt(aff.date_joined)}</span>
                    {aff.date_ended && <span className="text-xs text-slate-500">Ended: {fmt(aff.date_ended)}</span>}
                  </div>
                  {aff.adviser_name && <p className="text-xs text-slate-500 mt-1.5">Adviser: {aff.adviser_name}</p>}
                </div>
              ))}
            </div>
          ) : <EmptyState icon="🏛️" title="No affiliations recorded." sub="Click 'Add Affiliation' to add your organizations." />}
        </SectionCard>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: VIOLATIONS (read-only for student)
  ════════════════════════════════ */
  const ViolationsPanel = () => {
    const s = student;
    if (loadingProfile) return <Spinner />;

    return (
      <div className="space-y-5">
        <SectionCard title="Violations / Disciplinary Records" icon="⚠️">
          {!s ? <EmptyState icon="⚠️" title="No profile linked." /> :
           s.violations?.length > 0 ? (
            <div className="space-y-4">
              {s.violations.map(v => (
                <div key={v.id} className={`border p-4 rounded-xl ${v.severity_level === 'High' ? 'border-red-800/50 bg-red-900/20' : v.severity_level === 'Medium' ? 'border-yellow-800/50 bg-yellow-900/20' : 'border-slate-700 bg-slate-800/30'}`}>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{v.violation_type}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Reported: {fmt(v.date_reported)} by {v.reported_by || '—'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0 ${v.severity_level === 'High' ? 'bg-red-900/60 text-red-300' : v.severity_level === 'Medium' ? 'bg-yellow-900/60 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>{v.severity_level}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{v.description}</p>
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-900/50 text-sm">
                    <p className="font-semibold text-xs uppercase text-slate-400 mb-1">Action Taken</p>
                    <p className="text-slate-400 mb-2">{v.action_taken || 'Pending'}</p>
                    <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-2 text-slate-500">
                      <span>Status: <strong className={v.status === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}>{v.status}</strong></span>
                      <span>Resolution: {v.resolution_date ? fmt(v.resolution_date) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-base font-bold text-green-300 mb-1">Clean Record</h4>
              <p className="text-sm text-green-500">You have no recorded violations.</p>
            </div>
          )}
        </SectionCard>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-500 flex items-start gap-2">
          <svg className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Violation records are managed by the administration. Contact your department for any concerns.
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: GRADES
  ════════════════════════════════ */
  const GradesPanel = () => {
    const avg = (GRADES.map(g => parseFloat(g.midterm)).reduce((a, b) => a + b, 0) / GRADES.length).toFixed(2);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">🎓</div>
          <div>
            <p className="text-slate-400 text-xs">Current Semester GPA (Midterm avg.)</p>
            <h2 className="text-3xl font-bold text-white">{avg}</h2>
            <p className="text-emerald-400 text-xs mt-0.5">Good Standing</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/60">
            <h3 className="font-bold text-slate-200">Grade Report — AY 2025–2026, 1st Semester</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Subject</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Title</th>
                  <th className="px-5 py-3 text-center font-semibold">Units</th>
                  <th className="px-5 py-3 text-center font-semibold">Prelim</th>
                  <th className="px-5 py-3 text-center font-semibold">Midterm</th>
                  <th className="px-5 py-3 text-center font-semibold">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {GRADES.map(g => (
                  <tr key={g.subject} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-brand-400">{g.subject}</td>
                    <td className="px-5 py-3.5 text-slate-300 hidden md:table-cell text-xs">{g.title}</td>
                    <td className="px-5 py-3.5 text-center text-slate-400">{g.units}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-200">{g.prelim}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-200">{g.midterm}</td>
                    <td className="px-5 py-3.5 text-center text-slate-500 italic">{g.final}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/40 border-t border-slate-700/60">
                  <td colSpan={2} className="px-5 py-3 font-bold text-slate-300 text-xs uppercase">Total Units</td>
                  <td className="px-5 py-3 text-center font-bold text-brand-400">{GRADES.reduce((a, g) => a + g.units, 0)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: TASKS
  ════════════════════════════════ */
  const TasksPanel = () => {
    const pending = tasks.filter(t => !t.done);
    const done    = tasks.filter(t => t.done);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-200">Task Progress</h3>
            <span className="text-xs text-slate-400">{done.length} / {tasks.length} completed</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${(done.length / tasks.length) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{pending.length} pending {pending.length === 1 ? 'task' : 'tasks'} remaining</p>
        </div>
        {pending.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">📋 Pending</h3>
            <div className="space-y-3">
              {pending.map(t => (
                <div key={t.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 transition-all">
                  <button onClick={() => toggleTask(t.id)} className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-brand-500 mt-0.5 shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">{t.subject}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityStyle(t.priority)}`}>{t.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mt-1">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Due: {t.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {done.length > 0 && (
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">✅ Completed</h3>
            <div className="space-y-2">
              {done.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 opacity-60">
                  <button onClick={() => toggleTask(t.id)} className="w-5 h-5 rounded-full bg-emerald-500/30 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400 line-through">{t.title}</p>
                    <p className="text-xs text-slate-600">{t.subject} · {t.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${dark ? 'sd-dark bg-slate-950' : 'sd-light bg-slate-100'}`}>
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
        <header className={`relative z-30 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl shrink-0 ${dark ? 'border-slate-800/60 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-sm'}`}>
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
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          <div className={`sticky top-0 z-10 px-6 py-4 backdrop-blur-xl border-b flex items-center gap-3 ${dark ? 'bg-slate-900/80 border-slate-800/50' : 'bg-white/90 border-slate-200'}`}>
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
