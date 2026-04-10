import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import {
  HomeIcon, UserIcon, ClipboardDocumentListIcon, LightBulbIcon,
  BuildingLibraryIcon, ExclamationTriangleIcon, BookOpenIcon,
  ClipboardDocumentCheckIcon, SunIcon, MoonIcon, BellIcon,
  MagnifyingGlassIcon, ArrowRightOnRectangleIcon, PlusIcon,
  PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon,
  ChevronUpIcon, InformationCircleIcon, CalendarDaysIcon,
  UserCircleIcon, AcademicCapIcon, ChevronDownIcon,
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon,
  CameraIcon, BuildingOfficeIcon, UserGroupIcon,
  ShieldExclamationIcon, DocumentTextIcon, CalendarIcon,
  ArrowRightIcon, FunnelIcon, PhoneIcon, HeartIcon,
  IdentificationIcon, BookmarkIcon, WrenchScrewdriverIcon,
  TrophyIcon, MegaphoneIcon, LinkIcon, ChartBarIcon,
  KeyIcon, EyeIcon, ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

/* ─── theme context ──────────────────────────── */
const ThemeCtx = createContext(true); // true = dark
const useTheme = () => useContext(ThemeCtx);

/* ─── nav ────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',            Icon: HomeIcon },
  { id: 'profile',      label: 'My Profile',           Icon: UserIcon },
  { id: 'academic',     label: 'My Academic History',  Icon: ClipboardDocumentListIcon },
  { id: 'skills',       label: 'My Skills',            Icon: LightBulbIcon },
  { id: 'affiliations', label: 'My Affiliations',      Icon: BuildingLibraryIcon },
  { id: 'violations',   label: 'My Violations',        Icon: ExclamationTriangleIcon },
  { id: 'tasks',        label: 'My Pending Tasks',     Icon: ClipboardDocumentCheckIcon },
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

const EmptyState = ({ Icon: EmptyIcon, icon, title, sub }) => {
  const dark = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {EmptyIcon
        ? <EmptyIcon className={`w-14 h-14 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
        : <span className="text-5xl mb-3">{icon}</span>}
      <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{title}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
};

const SectionCard = ({ title, Icon, action, children }) => {
  const dark = useTheme();
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-brand-400/60 hover:shadow-brand-500/20 ${dark ? 'bg-slate-900 border-slate-700/60 hover:bg-slate-800' : 'bg-white border-slate-200 shadow-sm hover:bg-brand-50/40'}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-brand-500" />}
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
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </div>
  );
};

/* modal wrapper */
const Modal = ({ title, subtitle, onClose, children, footer }) => {
  const dark = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-md ${dark ? 'bg-slate-950/30' : 'bg-slate-900/20'}`} onClick={onClose} />
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-start justify-between px-6 py-5 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-base font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
            {subtitle && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`transition-colors ml-4 mt-0.5 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className={`px-6 py-4 border-t ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>{footer}</div>}
      </div>
    </div>
  );
};

const BtnPrimary = ({ children, loading, ...props }) => (
  <button {...props} disabled={loading || props.disabled}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
    style={{ background: 'linear-gradient(135deg, #f26522, #e04f0f)', boxShadow: '0 4px 14px rgba(242,101,34,0.35)' }}>
    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
  </button>
);

const BtnGhost = ({ children, ...props }) => {
  const dark = useTheme();
  return (
    <button {...props} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${dark ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'}`}>
      {children}
    </button>
  );
};

const BtnDanger = ({ children, ...props }) => (
  <button {...props} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-400 transition-all duration-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30 dark:hover:bg-red-500/20 dark:hover:border-red-500/50">
    {children}
  </button>
);

const BtnEdit = ({ onClick }) => {
  const dark = useTheme();
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${dark ? 'text-brand-400 bg-brand-500/10 border-brand-500/30 hover:bg-brand-500/20 hover:border-brand-500/50' : 'text-brand-600 bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-400'}`}>
      <PencilSquareIcon className="w-3.5 h-3.5" />
      Edit
    </button>
  );
};

const AddBtn = ({ onClick, label }) => (
  <button onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
    style={{ background: 'linear-gradient(135deg, #f26522, #e04f0f)', boxShadow: '0 4px 14px rgba(242,101,34,0.30)' }}>
    <PlusIcon className="w-3.5 h-3.5" />
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

/* ── Shared client-side validators ── */
const validators = {
  name:    (v) => !v || /^[a-zA-ZÀ-ÿ\s'\-.]+$/.test(v.trim()) ? null : 'Only letters, spaces, hyphens and apostrophes allowed.',
  phone:   (v) => !v || /^09\d{9}$/.test(v.replace(/\s/g, '')) ? null : 'Must start with 09 and be exactly 11 digits.',
  zip:     (v) => !v || /^\d{4,5}$/.test(v) ? null : 'Zip code must be 4–5 digits.',
  lrn:     (v) => !v || /^\d{12}$/.test(v) ? null : 'LRN must be exactly 12 digits.',
  pastDate:(v) => { if (!v) return null; const d = new Date(v); const today = new Date(); today.setHours(0,0,0,0); return d < today ? null : 'Date must be in the past.'; },
  gpa:     (v) => !v || (parseFloat(v) >= 1.0 && parseFloat(v) <= 5.0) ? null : 'GPA must be between 1.00 and 5.00.',
};
const runValidation = (rules) => { for (const [field, check, value] of rules) { const e = check(value); if (e) return `${field}: ${e}`; } return null; };

const PersonalInfoModal = ({ student, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  const [form, setForm] = useState({ first_name: student.first_name||'', middle_name: student.middle_name||'', last_name: student.last_name||'', suffix: student.suffix||'', gender: student.gender||'Male', birth_date: student.birth_date?.split('T')[0]||'', place_of_birth: student.place_of_birth||'', nationality: student.nationality||'Filipino', civil_status: student.civil_status||'Single', religion: student.religion||'' });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    const vErr = runValidation([
      ['First Name',     validators.name,     form.first_name],
      ['Middle Name',    validators.name,     form.middle_name],
      ['Last Name',      validators.name,     form.last_name],
      ['Place of Birth', validators.name,     form.place_of_birth],
      ['Nationality',    validators.name,     form.nationality],
      ['Date of Birth',  validators.pastDate, form.birth_date],
    ]);
    if (vErr) { setErr(vErr); return; }
    setSaving(true); setErr(null);
    try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); }
  };
  return (
    <Modal title="Edit Personal Information" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="First Name" required><input name="first_name" value={form.first_name} onChange={ch} className={i} required /></Field>
        <Field label="Middle Name"><input name="middle_name" value={form.middle_name} onChange={ch} className={i} /></Field>
        <Field label="Last Name" required><input name="last_name" value={form.last_name} onChange={ch} className={i} required /></Field>
        <Field label="Suffix"><input name="suffix" value={form.suffix} onChange={ch} className={i} placeholder="Jr, Sr, III…" /></Field>
        <Field label="Gender" required><Sel name="gender" value={form.gender} onChange={ch} className={s}><option>Male</option><option>Female</option></Sel></Field>
        <Field label="Birth Date" required><input type="date" name="birth_date" value={form.birth_date} onChange={ch} className={i} required max={new Date(Date.now()-86400000).toISOString().split('T')[0]} /></Field>
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
  const chPhone = (e) => { const v = e.target.value.replace(/[^\d]/g, ''); setForm(p => ({ ...p, [e.target.name]: v })); };
  const chZip   = (e) => { const v = e.target.value.replace(/[^\d]/g, ''); setForm(p => ({ ...p, zip_code: v })); };
  const save = async (e) => {
    e.preventDefault();
    const vErr = runValidation([
      ['Contact Number',   validators.phone, form.contact_number],
      ['Alternate Number', validators.phone, form.alternate_contact_number],
      ['Zip Code',         validators.zip,   form.zip_code],
    ]);
    if (vErr) { setErr(vErr); return; }
    setSaving(true); setErr(null);
    try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); }
  };
  return (
    <Modal title="Edit Contact Information" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Email" required><input type="email" name="email" value={form.email} onChange={ch} className={i} required /></Field>
        <Field label="Contact Number" required><input name="contact_number" value={form.contact_number} onChange={chPhone} className={i} required maxLength={11} placeholder="09XXXXXXXXX" /></Field>
        <Field label="Alt. Number"><input name="alternate_contact_number" value={form.alternate_contact_number} onChange={chPhone} className={i} maxLength={11} placeholder="09XXXXXXXXX" /></Field>
        <Field label="Street"><input name="street" value={form.street} onChange={ch} className={i} /></Field>
        <Field label="Barangay"><input name="barangay" value={form.barangay} onChange={ch} className={i} /></Field>
        <Field label="City" required><input name="city" value={form.city} onChange={ch} className={i} required /></Field>
        <Field label="Province"><input name="province" value={form.province} onChange={ch} className={i} /></Field>
        <Field label="Zip Code"><input name="zip_code" value={form.zip_code} onChange={chZip} className={i} maxLength={5} placeholder="e.g. 4025" /></Field>
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
  const chPhone = (e) => { const v = e.target.value.replace(/[^\d]/g, ''); setForm(p => ({ ...p, contact_number: v })); };
  const save = async (e) => {
    e.preventDefault();
    const vErr = runValidation([
      ['Full Name',      validators.name,  form.full_name],
      ['Contact Number', validators.phone, form.contact_number],
    ]);
    if (vErr) { setErr(vErr); return; }
    setSaving(true); setErr(null);
    try { if (record?.id) await api.students.updateGuardian(studentId, record.id, form); else await api.students.addGuardian(studentId, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); }
  };
  return (
    <Modal title={record ? 'Edit Guardian' : 'Add Guardian'} onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Guardian'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="Full Name" required><input name="full_name" value={form.full_name} onChange={ch} className={i} required /></Field>
        <Field label="Relationship" required><Sel name="relationship" value={form.relationship} onChange={ch} className={s}><option>Father</option><option>Mother</option><option>Guardian</option><option>Sibling</option><option>Other</option></Sel></Field>
        <Field label="Occupation"><input name="occupation" value={form.occupation} onChange={ch} className={i} /></Field>
        <Field label="Contact Number"><input name="contact_number" value={form.contact_number} onChange={chPhone} className={i} maxLength={11} placeholder="09XXXXXXXXX" /></Field>
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
        <Field label="Date Enrolled" required><input type="date" name="date_enrolled" value={form.date_enrolled} onChange={ch} className={i} required max={new Date().toISOString().split('T')[0]} /></Field>
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
  const chLrn = (e) => { const v = e.target.value.replace(/[^\d]/g, ''); setForm(p => ({ ...p, lrn: v })); };
  const save = async (e) => {
    e.preventDefault();
    const vErr = runValidation([['LRN', validators.lrn, form.lrn]]);
    if (vErr) { setErr(vErr); return; }
    setSaving(true); setErr(null);
    try { await patchStudent(student, form); onSaved(); } catch (ex) { setErr(ex.message||'Failed to save.'); } finally { setSaving(false); }
  };
  return (
    <Modal title="Edit Educational Background" onClose={onClose} footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-2 gap-4">
        <Field label="LRN"><input name="lrn" value={form.lrn} onChange={chLrn} className={i} maxLength={12} placeholder="12-digit LRN" /></Field>
        <Field label="Last Year Attended"><input name="last_year_attended" value={form.last_year_attended} onChange={ch} className={i} placeholder="e.g. 2022-2023" /></Field>
        <div className="col-span-2"><Field label="Last School Attended"><input name="last_school_attended" value={form.last_school_attended} onChange={ch} className={i} /></Field></div>
        <div className="col-span-2"><Field label="Honors / Awards"><textarea name="honors_received" value={form.honors_received} onChange={ch} className={`${i} resize-none`} rows={3} /></Field></div>
      </form>
    </Modal>
  );
};

const MedicalModal = ({ student, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  // Only manage medical fields — never touch emergency contact fields
  const [form, setForm] = useState({
    bloodtype:           record?.bloodtype            || '',
    existing_conditions: record?.existing_conditions  || '',
  });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr(null);
    try {
      // Merge with existing record to preserve emergency contact fields
      const payload = {
        bloodtype:                      form.bloodtype,
        existing_conditions:            form.existing_conditions,
        // preserve existing emergency contact fields untouched
        emergency_contact_name:         record?.emergency_contact_name         ?? null,
        emergency_contact_number:       record?.emergency_contact_number       ?? null,
        emergency_contact_relationship: record?.emergency_contact_relationship ?? null,
        emergency_contact_address:      record?.emergency_contact_address      ?? null,
      };
      if (record?.id) await api.students.updateMedical(student.id, record.id, payload);
      else await api.students.addMedical(student.id, payload);
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={record ? 'Edit Medical Record' : 'Add Medical Record'} subtitle="Student health information" icon="🏥" onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="space-y-4">
        <Field label="Blood Type" icon="🩸">
          <Sel name="bloodtype" value={form.bloodtype} onChange={ch} className={s}>
            <option value="">Select…</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
          </Sel>
        </Field>
        <Field label="Existing Conditions / Allergies" icon="🩺">
          <textarea name="existing_conditions" value={form.existing_conditions} onChange={ch} className={`${i} resize-none`} rows={4} placeholder="e.g. Asthma, Hypertension, Diabetes…" />
        </Field>
      </form>
    </Modal>
  );
};

const EmergencyContactModal = ({ student, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark); const s = mkSel(dark);
  // Only manage emergency contact fields — never touch medical fields
  const [form, setForm] = useState({
    emergency_contact_name:         record?.emergency_contact_name         || '',
    emergency_contact_number:       record?.emergency_contact_number       || '',
    emergency_contact_relationship: record?.emergency_contact_relationship || '',
    emergency_contact_address:      record?.emergency_contact_address      || '',
  });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr(null);
    try {
      // Merge with existing record to preserve medical fields untouched
      const payload = {
        ...form,
        bloodtype:           record?.bloodtype            ?? null,
        existing_conditions: record?.existing_conditions  ?? null,
      };
      if (record?.id) await api.students.updateMedical(student.id, record.id, payload);
      else await api.students.addMedical(student.id, payload);
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={record ? 'Edit Emergency Contact' : 'Add Emergency Contact'} subtitle="Person to contact in case of emergency" icon="🚨" onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save Changes</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="space-y-5">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${dark ? 'text-orange-400/70' : 'text-orange-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Contact Person
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Full Name" required icon="👤">
                <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={ch} className={i} required placeholder="Complete name" />
              </Field>
            </div>
            <Field label="Relationship" icon="🔗">
              <Sel name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={ch} className={s}>
                <option value="">Select…</option>
                <option>Father</option><option>Mother</option><option>Sibling</option>
                <option>Spouse</option><option>Relative</option><option>Friend</option><option>Other</option>
              </Sel>
            </Field>
            <Field label="Contact Number" required icon="📱">
              <input name="emergency_contact_number" value={form.emergency_contact_number} onChange={ch} className={i} required placeholder="09XX-XXX-XXXX" />
            </Field>
            <div className="col-span-2">
              <Field label="Address" icon="🏠">
                <input name="emergency_contact_address" value={form.emergency_contact_address} onChange={ch} className={i} placeholder="Home address (optional)" />
              </Field>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

/* ════════════════════════════════════════════════
   ACADEMIC HISTORY MODAL
════════════════════════════════════════════════ */
const emptyAH = () => ({ school_name: '', school_year: '', gpa: '', academic_standing: 'Good Standing', semester: '1st Semester', total_units: 0, completed_units: 0 });

const AcademicModal = ({ studentId, record, onClose, onSaved }) => {
  const dark = useTheme(); const i = mkInp(dark);
  const [form, setForm] = useState(record ? {
    school_name:       record.school_name      ?? '',
    school_year:       record.school_year      ?? '',
    gpa:               record.gpa              ?? '',
    academic_standing: record.academic_standing ?? 'Good Standing',
    semester:          record.semester          ?? '1st Semester',
    total_units:       record.total_units       ?? 0,
    completed_units:   record.completed_units   ?? 0,
  } : emptyAH());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const ch = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const vErr = runValidation([['GPA', validators.gpa, form.gpa]]);
    if (vErr) { setErr(vErr); return; }
    setSaving(true); setErr(null);
    try {
      const payload = { ...form, gpa: form.gpa || null };
      if (record?.id) await api.students.updateAcademicHistory(studentId, record.id, payload);
      else await api.students.addAcademicHistory(studentId, payload);
      onSaved();
    } catch (ex) { setErr(ex.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={record ? 'Edit Academic Record' : 'Add Academic Record'} subtitle="School, year and GPA" icon="📊" onClose={onClose}
      footer={<div className="flex justify-end gap-3"><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record ? 'Save Changes' : 'Add Record'}</BtnPrimary></div>}>
      <ErrBox msg={err} />
      <form onSubmit={save} className="grid grid-cols-3 gap-3">
        <Field label="School" icon="🏫">
          <input name="school_name" value={form.school_name} onChange={ch} className={i} placeholder="e.g. Bigaa National HS" />
        </Field>
        <Field label="Year" icon="📅">
          <input name="school_year" value={form.school_year} onChange={ch} className={i} placeholder="e.g. 2025-2026" required />
        </Field>
        <Field label="GPA" icon="⭐">
          <input type="number" name="gpa" value={form.gpa} onChange={ch} className={i} step="0.01" min="1" max="5" placeholder="e.g. 1.75" />
        </Field>
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
        <Field label="Organization Name" required icon={<BuildingOfficeIcon className="w-3.5 h-3.5" />}>
          <input name="organization_name" value={form.organization_name} onChange={ch} className={i} placeholder="e.g. Junior Philippine Computer Society" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Position / Role" required icon={<UserIcon className="w-3.5 h-3.5" />}>
            <input name="position" value={form.position} onChange={ch} className={i} placeholder="e.g. President" required />
          </Field>
          <Field label="Status" required>
            <Sel name="status" value={form.status} onChange={ch} className={s}>
              <option>Active</option><option>Inactive</option><option>Alumni</option>
            </Sel>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date Joined" required icon={<CalendarDaysIcon className="w-3.5 h-3.5" />}>
            <input type="date" name="date_joined" value={form.date_joined} onChange={ch} className={i} required />
          </Field>
          <Field label="Date Ended" icon={<CalendarDaysIcon className="w-3.5 h-3.5" />}>
            <input type="date" name="date_ended" value={form.date_ended} onChange={ch} className={i} />
          </Field>
        </div>
        <Field label="Adviser / Moderator" icon={<UserCircleIcon className="w-3.5 h-3.5" />}>
          <input name="adviser_name" value={form.adviser_name} onChange={ch} className={i} placeholder="Optional — faculty adviser or moderator" />
        </Field>
        {form.date_joined && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <ClockIcon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
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
    s.skill_name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedInTab = selected.filter(s => s.skill_category === activeTab);

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const levelColor = (lvl) => {
    if (lvl === 'Expert')       return dark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'   : 'bg-amber-100 text-amber-700 border-amber-300';
    if (lvl === 'Advanced')     return dark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (lvl === 'Intermediate') return dark ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'     : 'bg-blue-100 text-blue-700 border-blue-300';
    return dark ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-md ${dark ? 'bg-slate-950/40' : 'bg-slate-900/20'}`} onClick={onClose} />
      <div className={`relative w-full max-w-3xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${dark ? 'bg-slate-900 border-orange-500/30' : 'bg-white border-orange-200'}`}
        style={dark ? { boxShadow: '0 0 40px rgba(249,115,22,0.12)' } : { boxShadow: '0 8px 40px rgba(249,115,22,0.12)' }}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b rounded-t-2xl ${dark ? 'border-orange-500/20 bg-orange-500/5' : 'border-orange-100 bg-orange-50/60'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${dark ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-orange-100 border border-orange-200'}`}>💡</div>
            <div>
              <h3 className={`text-base font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Manage Skills</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Pick your skills and set your proficiency level</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${dark ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
              {selected.length} selected
            </span>
            <button onClick={onClose} className={`rounded-lg p-1 transition-colors ${dark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: skill picker */}
          <div className={`flex flex-col w-1/2 border-r ${dark ? 'border-orange-500/15' : 'border-orange-100'}`}>
            {/* Search */}
            <div className={`px-4 pt-4 pb-3 border-b ${dark ? 'border-orange-500/10' : 'border-orange-50'}`}>
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills…"
                  className={`${i} pl-9`} />
              </div>
            </div>
            {/* Category tabs */}
            <div className={`flex gap-1 mx-4 mt-3 mb-2 p-1 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                    ? 'bg-brand-500 text-white shadow'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'Academic' ? '💻 Academic' : '🏅 Non-Academic'}
                </button>
              ))}
            </div>
            {/* Skill checkboxes */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filtered.length === 0
                ? <p className={`text-xs text-center py-8 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>No skills found.</p>
                : <div className="pt-2 space-y-1">
                    {filtered.map(skill => {
                      const isOn = selected.some(s => s.skill_id === skill.id);
                      const lvl = selected.find(s => s.skill_id === skill.id)?.skill_level;
                      return (
                        <label key={skill.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                            isOn
                              ? dark ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'
                              : dark ? 'hover:bg-slate-800 border border-transparent' : 'hover:bg-slate-50 border border-transparent'
                          }`}>
                          {/* Custom checkbox */}
                          <div className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                            isOn
                              ? 'bg-brand-500 border-brand-500'
                              : dark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
                          }`} style={{ width: '18px', height: '18px' }}
                            onClick={() => toggle(skill)}>
                            {isOn && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input type="checkbox" checked={isOn} onChange={() => toggle(skill)} className="sr-only" />
                          <span className={`text-sm flex-1 ${isOn ? dark ? 'text-orange-100 font-semibold' : 'text-slate-800 font-semibold' : dark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {skill.skill_name}
                          </span>
                          {lvl && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold shrink-0 ${levelColor(lvl)}`}>{lvl}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
              }
            </div>
          </div>

          {/* Right: selected skills + proficiency */}
          <div className="flex flex-col w-1/2">
            <div className={`px-4 py-3 border-b ${dark ? 'border-orange-500/10 bg-orange-500/5' : 'border-orange-50 bg-orange-50/40'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-orange-400/70' : 'text-orange-500'}`}>
                Selected Skills — Set Proficiency
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {selected.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <LightBulbIcon className={`w-6 h-6 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                  <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No skills selected yet</p>
                  <p className={`text-[10px] mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Click a skill on the left to add it</p>
                </div>
              ) : selected.map(s => {
                const meta = LEVEL_META[s.skill_level];
                return (
                  <div key={s.skill_id} className={`rounded-xl border overflow-hidden ${dark ? 'bg-slate-800/60 border-orange-500/15' : 'bg-orange-50/40 border-orange-200/60'}`}>
                    {/* Skill name row */}
                    <div className={`flex items-center justify-between px-3 py-2 ${dark ? 'bg-slate-900/60' : 'bg-white/60'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${s.skill_category === 'Academic' ? dark ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-brand-100 text-brand-700 border-brand-200' : dark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                          {s.skill_category === 'Academic' ? '💻' : '🏅'}
                        </span>
                        <span className={`text-xs font-semibold truncate ${dark ? 'text-orange-100' : 'text-slate-800'}`}>{s.skill_name}</span>
                      </div>
                      <button onClick={() => toggle({ id: s.skill_id })} className={`shrink-0 ml-2 transition-colors ${dark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}>
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Level progress bar */}
                    {meta && <div className={`h-0.5 ${dark ? 'bg-slate-700' : 'bg-orange-100'}`}><div className={`h-full transition-all duration-500 ${meta.bar}`} style={{ width: `${meta.pct}%` }} /></div>}
                    {/* Controls */}
                    <div className="px-3 py-2.5 space-y-2">
                      {/* Level pills */}
                      <div className="flex gap-1 flex-wrap">
                        {LEVELS.map(lvl => (
                          <button key={lvl} type="button" onClick={() => updatePivot(s.skill_id, 'skill_level', s.skill_level === lvl ? '' : lvl)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${s.skill_level === lvl ? levelColor(lvl) : dark ? 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                      {/* Certification toggle */}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updatePivot(s.skill_id, 'certification', !s.certification)}
                          className={`w-8 h-4 rounded-full transition-all relative ${s.certification ? 'bg-brand-500' : dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${s.certification ? 'left-4.5' : 'left-0.5'}`} style={{ left: s.certification ? '18px' : '2px' }} />
                        </button>
                        <span className={`text-[10px] font-semibold ${dark ? 'text-orange-300/60' : 'text-slate-500'}`}>Certified</span>
                      </div>
                      {s.certification && (
                        <div className="grid grid-cols-2 gap-2">
                          <input value={s.certification_name} onChange={e => updatePivot(s.skill_id, 'certification_name', e.target.value)} className={`${i} text-xs py-1.5`} placeholder="Cert. name" />
                          <input type="date" value={s.certification_date} onChange={e => updatePivot(s.skill_id, 'certification_date', e.target.value)} className={`${i} text-xs py-1.5`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t rounded-b-2xl flex items-center justify-between ${dark ? 'border-orange-500/20 bg-slate-900/80' : 'border-orange-100 bg-orange-50/40'}`}>
          <ErrBox msg={err} />
          <div className="flex gap-3 ml-auto">
            <BtnGhost onClick={onClose}>Cancel</BtnGhost>
            <BtnPrimary loading={saving} onClick={save}>Save Skills</BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   FORCE CHANGE PASSWORD MODAL
════════════════════════════════════════════════ */
const ForceChangePasswordModal = ({ dark, onChanged }) => {
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirm] = useState('');
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (newPw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setErr('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await api.auth.changePassword({ new_password: newPw, new_password_confirmation: confirmPw });
      onChanged();
    } catch (ex) {
      setErr(ex.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const inp = `w-full pr-10 pl-4 py-3 rounded-xl border text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-brand-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-brand-500'}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ background: 'linear-gradient(135deg,#f26522,#e04f0f)', borderColor: 'transparent' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Change Your Password</h2>
              <p className="text-xs text-white/80 mt-0.5">You must set a new password before continuing.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
            <InformationCircleIcon className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
            Your account was created by the administration. Your temporary password was your birthday (mm/dd/yyyy). Please set a new secure password now.
          </div>

          {err && <div className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${dark ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}><ExclamationCircleIcon className="w-4 h-4 shrink-0" />{err}</div>}

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" className={inp} required />
              <button type="button" onClick={() => setShowNew(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm New Password</label>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter new password" className={inp} required />
              <button type="button" onClick={() => setShowConf(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#f26522,#e04f0f)', boxShadow: '0 4px 14px rgba(242,101,34,0.35)' }}>
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const StudentDashboard = ({ user, onLogout }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(() => searchParams.get('section') || 'dashboard');

  const navigateTo = (section) => {
    setActive(section);
    setSearchParams({ section }, { replace: true });
  };
  const [tasks, setTasks]               = useState(TASKS_DEFAULT);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [student, setStudent]           = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(() => user?.must_change_password === true);
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
    (s.violations ?? []).forEach(v => items.push({
      id: `viol-${v.id}`, type: 'violation',
      Icon: ExclamationTriangleIcon, iconCls: 'text-red-400',
      title: 'Violation Recorded',
      body: `${v.violation_type} — ${v.severity_level} severity`,
      date: v.date_reported, nav: 'violations',
    }));
    (s.academic_histories ?? []).forEach(ah => items.push({
      id: `ah-${ah.id}`, type: 'academic',
      Icon: ClipboardDocumentListIcon, iconCls: 'text-blue-400',
      title: 'Academic Record Updated',
      body: `${ah.school_year} ${ah.semester} — GPA: ${ah.gpa ?? '—'}`,
      date: ah.updated_at ?? ah.created_at, nav: 'academic',
    }));
    taskList.filter(t => !t.done).forEach(t => items.push({
      id: `task-${t.id}`, type: 'task',
      Icon: ClipboardDocumentCheckIcon, iconCls: 'text-brand-400',
      title: 'Pending Task',
      body: `${t.title} — Due ${t.due}`,
      date: null, nav: 'tasks',
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
    ? (student.profile_photo.startsWith('http')
        ? student.profile_photo
        : `${STORAGE_URL}/${student.profile_photo}`)
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
    const IconComp = item.Icon;
    return (
      <button onClick={() => navigateTo(item.id)}
        title={!sidebarExpanded ? item.label : ''}
        className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'} ${isActive
          ? 'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50'
          : dark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]" />
        )}
        <IconComp className={`w-5 h-5 shrink-0 transition-all duration-300 ${sidebarExpanded ? 'mr-3' : 'mr-0'} ${isActive ? 'text-brand-400' : dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'}`} />
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
      { id: 'profile',      label: 'My Profile',      Icon: UserIcon,                desc: 'View & edit your info',                                                    color: dark ? 'from-blue-500/20 to-purple-500/10 border-blue-500/20'    : 'bg-blue-50 border-blue-100',    iconColor: 'text-blue-500'    },
      { id: 'academic',     label: 'Academic History', Icon: ClipboardDocumentListIcon, desc: 'Grades & academic records',                                              color: dark ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20': 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-500' },
      { id: 'skills',       label: 'My Skills',        Icon: LightBulbIcon,           desc: `${skillCount} skill${skillCount !== 1 ? 's' : ''} recorded`,              color: dark ? 'from-amber-500/20 to-orange-500/10 border-amber-500/20'  : 'bg-amber-50 border-amber-100',   iconColor: 'text-amber-500'   },
      { id: 'affiliations', label: 'My Affiliations',  Icon: BuildingLibraryIcon,     desc: `${affiliationCount} org${affiliationCount !== 1 ? 's' : ''} joined`,      color: dark ? 'from-purple-500/20 to-pink-500/10 border-purple-500/20'  : 'bg-purple-50 border-purple-100', iconColor: 'text-purple-500'  },
      { id: 'violations',   label: 'My Violations',    Icon: ExclamationTriangleIcon, desc: violationCount ? `${violationCount} record${violationCount !== 1 ? 's' : ''}` : 'Clean record', color: dark ? 'from-red-500/20 to-rose-500/10 border-red-500/20' : 'bg-red-50 border-red-100', iconColor: 'text-red-500' },
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
            { label: 'Enrolled Units',  val: s?.year_level ? '14' : '—', Icon: BookmarkIcon,              iconCls: 'text-brand-500',   dc: 'from-brand-500/20 to-amber-500/10 border-brand-500/20',   lc: 'bg-orange-50 border-orange-100' },
            { label: 'Active Subjects', val: COURSES_DEMO.length,         Icon: BookOpenIcon,              iconCls: 'text-blue-500',    dc: 'from-blue-500/20 to-purple-500/10 border-blue-500/20',    lc: 'bg-blue-50 border-blue-100' },
            { label: 'Pending Tasks',   val: pendingTasks.length,          Icon: ClipboardDocumentCheckIcon, iconCls: 'text-red-500',   dc: 'from-red-500/20 to-pink-500/10 border-red-500/20',        lc: 'bg-red-50 border-red-100' },
            { label: 'GPA (Prelim)',    val: '1.40',                       Icon: AcademicCapIcon,           iconCls: 'text-emerald-500', dc: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20', lc: 'bg-emerald-50 border-emerald-100' },
          ].map(st => (
            <div key={st.label} className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-brand-400/60 hover:shadow-brand-500/20 ${dark ? `bg-gradient-to-br ${st.dc}` : st.lc}`}>
              <st.Icon className={`w-6 h-6 mb-2 ${st.iconCls}`} />
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
                  {hasPending
                    ? (high.length > 0 ? <ExclamationTriangleIcon className="w-4 h-4 text-red-400" /> : <ExclamationCircleIcon className="w-4 h-4 text-amber-400" />)
                    : <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
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
                <button onClick={() => navigateTo('violations')}
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
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
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
                        <div key={v.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-brand-400/60 hover:shadow-brand-500/20 ${
                          isHigh
                            ? dark ? 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30' : 'bg-red-100/60 border-red-300 hover:bg-red-100'
                            : isMed
                              ? dark ? 'bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/30' : 'bg-amber-100/60 border-amber-300 hover:bg-amber-100'
                              : dark ? 'bg-slate-800 border-slate-600/40 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-brand-50/40'
                        }`}>
                          {/* Severity icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isHigh ? 'bg-red-500/20 text-red-400' : isMed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            <ExclamationTriangleIcon className="w-4 h-4" />
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
                      <button onClick={() => navigateTo('violations')}
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
          <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2"><ClipboardDocumentCheckIcon className="w-4 h-4 text-brand-500" /><h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">My Pending Tasks</h4></div>
              <button onClick={() => navigateTo('tasks')} className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${dark ? 'text-brand-400 hover:bg-brand-500/10' : 'text-brand-600 hover:bg-brand-50'}`}>View all →</button>
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
                  <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-brand-400/60 hover:shadow-brand-500/20 ${dark ? 'bg-slate-900 border-slate-700/60 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-brand-50/40'}`}>
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
                    <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
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
                <button key={ql.id} onClick={() => navigateTo(ql.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-brand-400/60 hover:shadow-brand-500/20 ${dark ? `bg-gradient-to-br ${ql.color}` : `${ql.color} shadow-sm`}`}>
                  <ql.Icon className={`w-7 h-7 mb-2 ${ql.iconColor}`} />
                  <p className={`text-xs font-bold leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{ql.label}</p>
                  <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{ql.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Current Subjects ── */}
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center gap-2"><span>📖</span><h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">Current Subjects</h4></div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{COURSES_DEMO.length} subjects</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
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
              <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-brand-400/60 hover:shadow-brand-500/20 ${dark ? 'bg-slate-900 border-slate-700/60 hover:bg-slate-800' : 'bg-white border-slate-200 shadow-sm hover:bg-brand-50/40'}`}>
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
        {modal === 'emergency'  && <EmergencyContactModal student={s} record={s?.medical_histories?.[0] ?? null} onClose={() => setModal(null)} onSaved={refresh} />}
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
                  <CameraIcon className="w-6 h-6 text-white" />
                  <span className="text-white text-[10px] font-semibold">Change</span>
                </label>
                <input id="photo-upload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif" className="hidden" onChange={handlePhotoChange} />
              </>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {photoErr && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-900/30 border border-red-700/40 text-red-400 text-xs">
                <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
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
                    <div key={g.id} className="flex items-start justify-between gap-2 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/20"
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
                            : <TrashIcon className="w-3.5 h-3.5" />}
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
                  <Row label="Blood Type"          value={val(mh.bloodtype)} />
                  <Row label="Existing Conditions" value={val(mh.existing_conditions)} />
                </div>
              )) : <EmptyState icon="🩺" title="No medical record yet." sub="Click the edit button to add one." />}
            </SectionCard>

            <SectionCard title="Emergency Contact" icon="🚨" action={<BtnEdit onClick={() => setModal('emergency')} />}>
              {s.medical_histories?.length > 0 && s.medical_histories[0].emergency_contact_name ? (() => {
                const ec = s.medical_histories[0];
                return (
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${dark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50/60 border-orange-200/60'}`}>
                    {/* Phone icon circle */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${dark ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-orange-100 border border-orange-200'}`}>
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight ${dark ? 'text-orange-50' : 'text-slate-800'}`}>{ec.emergency_contact_name}</p>
                      <p className="text-sm font-semibold text-orange-400 mt-0.5">{ec.emergency_contact_number || '—'}</p>
                      {ec.emergency_contact_relationship && (
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${dark ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                          {ec.emergency_contact_relationship}
                        </span>
                      )}
                      {ec.emergency_contact_address && (
                        <p className={`text-xs mt-1 truncate ${dark ? 'text-orange-200/50' : 'text-slate-400'}`}>📍 {ec.emergency_contact_address}</p>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <EmptyState icon="🚨" title="No emergency contact yet." sub="Click the edit button to add one." />
              )}
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
    const [modal, setModal] = useState(null);
    const [deleting, setDeleting] = useState(null);
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

    const del = async (id) => {
      if (!window.confirm('Delete this academic record?')) return;
      setDeleting(id);
      try { await api.students.deleteAcademicHistory(s.id, id); await loadStudent(); }
      catch { alert('Failed to delete.'); }
      finally { setDeleting(null); }
    };

    return (
      <div className="space-y-5">
        {modal && <AcademicModal studentId={s?.id} record={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); loadStudent(); }} />}

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
        <SectionCard title="Academic History" icon="📊" action={s && <AddBtn onClick={() => setModal('add')} label="Add Record" />}>
          {!s ? (
            <EmptyState icon="📚" title="No profile linked." />
          ) : sortedYears.length === 0 ? (
            <EmptyState icon="📚" title="No academic history yet." sub="Click 'Add Record' to get started." />
          ) : (
            <div className="space-y-5 -mx-5 -mb-5 px-5 pb-5">
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
                  <div key={year} className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                    {/* Year header */}
                    <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
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
                        <div key={ah.id} className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'bg-slate-900 border-slate-700/60 hover:border-brand-500/40 hover:shadow-brand-500/10' : 'bg-slate-50 border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10'}`}>
                          {/* Semester label */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dark ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                              {ah.semester}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${standingStyle(ah.academic_standing)}`}>
                              {standingIcon(ah.academic_standing)} {ah.academic_standing}
                            </span>
                          </div>
                          {/* School name */}
                          {ah.school_name && (
                            <p className={`text-[10px] font-semibold mb-2 truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}>🏫 {ah.school_name}</p>
                          )}

                          {/* GPA */}
                          <div className="mb-3">
                            <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>GPA</p>
                            <p className={`text-3xl font-black ${gpaColor(ah.gpa ? parseFloat(ah.gpa) : null)}`}>
                              {ah.gpa ?? <span className={`text-lg ${dark ? 'text-slate-600' : 'text-slate-300'}`}>N/A</span>}
                            </p>
                          </div>

                          {/* Units progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <p className={`text-[10px] uppercase tracking-wider font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Units</p>
                              <p className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{ah.completed_units} / {ah.total_units}</p>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700"
                                style={{ width: ah.total_units > 0 ? `${Math.min(100, (ah.completed_units / ah.total_units) * 100)}%` : '0%' }} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className={`flex items-center justify-end gap-1 pt-2 border-t ${dark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                            <BtnEdit onClick={() => setModal(ah)} />
                            <BtnDanger onClick={() => del(ah.id)} disabled={deleting === ah.id}>
                              {deleting === ah.id
                                ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                            </BtnDanger>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Educational Background removed — moved to My Profile */}
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
        <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${dark ? 'bg-slate-900 border-slate-700/60 hover:bg-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/25' : 'bg-white border-slate-200 hover:bg-brand-50/40 hover:border-brand-400/60 hover:shadow-brand-500/20'}`}>
          <div className={`h-1 w-full ${skill.skill_category === 'Academic' ? 'bg-gradient-to-r from-brand-500 to-amber-400' : 'bg-gradient-to-r from-purple-500 to-pink-400'}`} />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={`font-bold text-sm leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{skill.skill_name}</h4>
              {skill.pivot?.certification && (
                <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <CheckCircleIcon className="w-2.5 h-2.5" />
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

    const CategorySection = ({ title, Icon: CatIcon, skills, emptyMsg }) => (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {CatIcon && <CatIcon className="w-4 h-4 text-brand-500" />}
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

        <div className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-brand-500/15' : 'bg-brand-50'}`}>
              <LightBulbIcon className="w-5 h-5 text-brand-500" />
            </div>
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
              <PlusIcon className="w-3.5 h-3.5" />
              Manage Skills
            </button>
          )}
        </div>

        {!s ? <EmptyState icon="🛠️" title="No profile linked." /> : s.skills?.length === 0 ? (
          <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 gap-3 ${dark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
            <WrenchScrewdriverIcon className="w-14 h-14 text-slate-300" />
            <p className={`font-bold text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>No skills recorded yet</p>
            <p className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Click "Manage Skills" to add your academic and non-academic skills.</p>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
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
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${dark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <BuildingLibraryIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>My Affiliations</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Organizations, clubs & extracurricular memberships</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          {affs.length > 0 && (
            <div className="relative grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Total',    val: affs.length,    color: dark ? 'text-slate-200' : 'text-slate-700' },
                { label: 'Active',   val: activeCount,    color: 'text-emerald-400' },
                { label: 'Alumni',   val: alumniCount,    color: 'text-purple-400' },
              ].map(st => (
                <div key={st.label} className={`rounded-xl p-3 text-center border ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white/70 border-slate-200'}`}>
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
                  <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organization or role…"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-brand-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-400'} outline-none transition-colors`} />
                </div>
                <div className="relative">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-brand-500' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-400'}`}>
                    {['All', 'Active', 'Inactive', 'Alumni'].map(st => <option key={st}>{st}</option>)}
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 right-2.5 flex items-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
            )}

            {/* Cards grid */}
            {filtered.length === 0 && affs.length > 0 ? (
              <EmptyState icon="🔍" title="No results found." sub="Try adjusting your search or filter." />
            ) : filtered.length === 0 ? (
              <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <BuildingLibraryIcon className="w-14 h-14 mb-3 text-slate-300" />
                <h3 className={`text-base font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>No affiliations yet</h3>
                <p className={`text-sm mb-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Your affiliations will appear here once added by the administration.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(aff => {
                  const st = AFF_STATUS[aff.status] ?? AFF_STATUS.Inactive;
                  const dur = affDuration(aff.date_joined, aff.date_ended);
                  return (
                    <div key={aff.id} className={`group relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${dark ? 'bg-slate-900 border-slate-700/60 hover:bg-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/25' : 'bg-white border-slate-200 hover:bg-brand-50/40 hover:border-brand-400/60 hover:shadow-brand-500/20 shadow-sm'}`}>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            <BuildingOfficeIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-bold text-sm leading-tight truncate ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{aff.organization_name}</h4>
                            <p className={`text-xs mt-0.5 font-medium ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{aff.position}</p>
                          </div>
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
                            <ClockIcon className="w-3 h-3" />
                            {dur}
                          </span>
                        )}
                      </div>

                      {/* Date range */}
                      <div className={`flex items-center gap-3 mt-2.5 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {fmt(aff.date_joined)}
                        </span>
                        <span>→</span>
                        <span>{aff.date_ended ? fmt(aff.date_ended) : <span className="text-emerald-400 font-medium">Present</span>}</span>
                      </div>

                      {/* Adviser */}
                      {aff.adviser_name && (
                        <div className={`flex items-center gap-1.5 mt-2.5 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <UserCircleIcon className="w-3 h-3 shrink-0" />
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
      Low:    { card: dark ? 'border-slate-600/40 bg-slate-800' : 'border-slate-200 bg-slate-50',
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
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                viols.length === 0 ? dark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                : highCount > 0 ? dark ? 'bg-red-500/20' : 'bg-red-100'
                : dark ? 'bg-amber-500/20' : 'bg-amber-100'
              }`}>
                {viols.length === 0
                  ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  : highCount > 0
                    ? <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                    : <ExclamationCircleIcon className="w-6 h-6 text-amber-500" />}
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
                  <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
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
                        : dark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
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
                        <div key={v.id} className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${ss.card} ${dark ? 'hover:bg-slate-800 hover:border-brand-500/60 hover:shadow-brand-500/25' : 'hover:brightness-95 hover:border-brand-400/60 hover:shadow-brand-500/20'}`}>
                          {/* Card header */}
                          <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b ${dark ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ss.icon}`}>
                                <ExclamationTriangleIcon className="w-4 h-4" />
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
                            <div className={`rounded-xl p-3.5 border ${dark ? 'bg-slate-900 border-slate-700/50' : 'bg-white/70 border-slate-200'}`}>
                              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Action Taken</p>
                              <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{v.action_taken || 'No action recorded yet.'}</p>
                            </div>

                            {/* Footer meta */}
                            <div className={`flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t ${dark ? 'border-slate-700/60 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                              <div className="flex items-center gap-1.5">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Status: <span className={`font-bold ${v.status === 'Resolved' ? 'text-emerald-400' : v.status === 'Under Review' ? 'text-blue-400' : 'text-orange-400'}`}>{v.status}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CalendarDaysIcon className="w-3.5 h-3.5" />
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
          <InformationCircleIcon className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
          <span>Violation records are managed by the administration. Contact your department or guidance office for any concerns or disputes.</span>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
  /* ════════════════════════════════
     PANEL: TASKS
  ════════════════════════════════ */
  const TasksPanel = () => {
    const [filter, setFilter]       = useState('All');
    const [view, setView]           = useState('tasks');   // 'tasks' | 'archive'
    const [confirmDelete, setConfirmDelete] = useState(null); // task id to confirm

    const pending = tasks.filter(t => !t.done);
    const done    = tasks.filter(t => t.done);
    const pct     = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

    const highCount   = pending.filter(t => t.priority === 'High').length;
    const mediumCount = pending.filter(t => t.priority === 'Medium').length;

    // When a task is checked → move to archive (mark done)
    const handleCheck = (id) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    };

    // Delete from archive with confirmation
    const handleDelete = (id) => setConfirmDelete(id);
    const confirmDel = () => {
      if (confirmDelete === '__all__') setTasks(prev => prev.filter(t => !t.done));
      else setTasks(prev => prev.filter(t => t.id !== confirmDelete));
      setConfirmDelete(null);
    };

    const filtered = filter === 'All'     ? pending
      : filter === 'High'   ? pending.filter(t => t.priority === 'High')
      : filter === 'Medium' ? pending.filter(t => t.priority === 'Medium')
      : pending.filter(t => t.priority === 'Low');

    return (
      <div className="space-y-5">

        {/* Delete confirmation modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 backdrop-blur-md ${dark ? 'bg-slate-950/40' : 'bg-slate-900/20'}`} onClick={() => setConfirmDelete(null)} />
            <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${dark ? 'bg-red-500/15' : 'bg-red-50'}`}>
                <TrashIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className={`text-base font-bold text-center mb-1 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
                {confirmDelete === '__all__' ? 'Clear Archive?' : 'Delete Task?'}
              </h3>
              <p className={`text-xs text-center mb-5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {confirmDelete === '__all__'
                  ? `This will permanently delete all ${done.length} completed task${done.length !== 1 ? 's' : ''} from your archive. This cannot be undone.`
                  : 'This will permanently remove the task from your archive. This cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={confirmDel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hero banner ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 ${dark ? 'bg-gradient-to-br from-brand-600/20 via-amber-600/10 to-slate-900/0 border-brand-500/20' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white border-orange-100'}`}>
          <div className="absolute right-0 top-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${dark ? 'bg-brand-500/20' : 'bg-orange-100'}`}>
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>My Pending Tasks</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {pending.length === 0 ? 'All tasks completed — great work!' : `${pending.length} task${pending.length > 1 ? 's' : ''} remaining`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Total',   val: tasks.length,   c: dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600' },
                { label: 'Pending', val: pending.length, c: pending.length > 0 ? dark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500' },
                { label: 'Done',    val: done.length,    c: dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' },
              ].map(p => (
                <div key={p.label} className={`px-3 py-1.5 rounded-xl text-center ${p.c}`}>
                  <p className="text-lg font-black leading-none">{p.val}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Overall Progress</span>
              <span className={`text-xs font-black ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{pct}%</span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${dark ? 'bg-slate-700/60' : 'bg-slate-200'}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700"
                style={{ width: `${pct}%` }} />
            </div>
            <p className={`text-[10px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{done.length} of {tasks.length} tasks completed</p>
          </div>
        </div>

        {/* ── View switcher: Tasks / Archive ── */}
        <div className={`flex gap-1 p-1 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button onClick={() => setView('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${view === 'tasks' ? 'bg-brand-500 text-white shadow' : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
            Pending Tasks
            {pending.length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setView('archive')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${view === 'archive' ? 'bg-brand-500 text-white shadow' : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            <ArchiveBoxIcon className="w-4 h-4" />
            Archive
            {done.length > 0 && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${view === 'archive' ? 'bg-white/20 text-white' : dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{done.length}</span>}
          </button>
        </div>

        {/* ── TASKS VIEW ── */}
        {view === 'tasks' && (
          <>
            {pending.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'High',   val: highCount,                                        c: dark ? 'border-red-500/30 bg-red-900/10' : 'border-red-200 bg-red-50',         tc: 'text-red-400' },
                  { label: 'Medium', val: mediumCount,                                      c: dark ? 'border-amber-500/30 bg-amber-900/10' : 'border-amber-200 bg-amber-50', tc: 'text-amber-400' },
                  { label: 'Low',    val: pending.filter(t => t.priority === 'Low').length, c: dark ? 'border-slate-600/40 bg-slate-800' : 'border-slate-200 bg-slate-50',   tc: dark ? 'text-slate-400' : 'text-slate-500' },
                ].map(p => (
                  <div key={p.label} className={`rounded-xl border p-3 text-center ${p.c}`}>
                    <p className={`text-2xl font-black ${p.tc}`}>{p.val}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.label} Priority</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {['All', 'High', 'Medium', 'Low'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === f
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                    : dark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <CheckCircleIcon className="w-10 h-10 mb-2 text-emerald-400 mx-auto" />
                <p className={`text-sm font-bold ${dark ? 'text-emerald-300' : 'text-emerald-600'}`}>All tasks done! Check the Archive.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(t => {
                  const pStyle = priorityStyle(t.priority, dark);
                  return (
                    <div key={t.id} className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      t.priority === 'High'
                        ? dark ? 'bg-red-900/10 border-red-500/20 hover:border-brand-500/40' : 'bg-red-50/60 border-red-200 hover:border-brand-400/40'
                        : t.priority === 'Medium'
                          ? dark ? 'bg-amber-900/10 border-amber-500/20 hover:border-brand-500/40' : 'bg-amber-50/60 border-amber-200 hover:border-brand-400/40'
                          : dark ? 'bg-slate-900 border-slate-700/60 hover:border-brand-500/40' : 'bg-white border-slate-200 hover:border-brand-400/40 shadow-sm'
                    }`}>
                      {/* Checkbox — checking moves to archive */}
                      <button onClick={() => handleCheck(t.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${dark ? 'border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/10' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dark ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-600 border-brand-200'}`}>{t.subject}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pStyle}`}>{t.priority}</span>
                        </div>
                        <p className={`text-sm font-semibold ${dark ? 'text-slate-100' : 'text-slate-700'}`}>{t.title}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <CalendarIcon className="w-3 h-3 shrink-0" />
                          Due: {t.due}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 self-center ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Pending</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ARCHIVE VIEW ── */}
        {view === 'archive' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                <ArchiveBoxIcon className="w-4 h-4 shrink-0" />
                Completed tasks are stored here. You can permanently delete them.
              </div>
              {done.length > 0 && (
                <button onClick={() => setConfirmDelete('__all__')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${dark ? 'border-red-500/30 text-red-400 hover:bg-red-900/20 bg-red-900/10' : 'border-red-200 text-red-500 hover:bg-red-50 bg-white'}`}>
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete All
                </button>
              )}
            </div>

            {done.length === 0 ? (
              <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <ArchiveBoxIcon className={`w-10 h-10 mb-2 mx-auto ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`text-sm font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Archive is empty</p>
                <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Completed tasks will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {done.map(t => {
                  const pStyle = priorityStyle(t.priority, dark);
                  return (
                    <div key={t.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${dark ? 'bg-slate-800/30 border-slate-700/30' : 'bg-slate-50 border-slate-100'}`}>
                      {/* Done indicator */}
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dark ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-600 border-brand-200'}`}>{t.subject}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pStyle}`}>{t.priority}</span>
                        </div>
                        <p className={`text-sm font-semibold line-through ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{t.title}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                          <CalendarIcon className="w-3 h-3 shrink-0" />
                          Due: {t.due}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>Done</span>
                        <button onClick={() => handleDelete(t.id)}
                          className={`p-1.5 rounded-lg border transition-all ${dark ? 'border-slate-700 text-slate-500 hover:bg-red-900/20 hover:border-red-500/40 hover:text-red-400' : 'border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500'}`}
                          title="Delete from archive">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
          <InformationCircleIcon className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
          <span>Check the circle to mark a task as done — it moves to the Archive automatically.</span>
        </div>
      </div>
    );
  };

  /* ── panel map ── */
  const panels = {
    dashboard: <DashboardPanel />, profile: <ProfilePanel />, academic: <AcademicPanel />,
    skills: <SkillsPanel />, affiliations: <AffiliationsPanel />, violations: <ViolationsPanel />,
    tasks: <TasksPanel />,
  };
  const activeNav = NAV.find(n => n.id === active);

  return (
    <ThemeCtx.Provider value={dark}>
    {/* Force-change-password modal — blocks everything until password is changed */}
    {mustChangePassword && (
      <ForceChangePasswordModal dark={dark} onChanged={() => {
        setMustChangePassword(false);
        const stored = JSON.parse(localStorage.getItem('auth_user') || '{}');
        stored.must_change_password = false;
        localStorage.setItem('auth_user', JSON.stringify(stored));
      }} />
    )}
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
            <ArrowRightOnRectangleIcon className={`w-5 h-5 shrink-0 transition-all duration-300 group-hover:text-red-400 ${sidebarExpanded ? 'mr-3' : 'mr-0'}`} />
            <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Right column: topnav + main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top nav */}
        <header className={`relative z-30 flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? 'border-slate-800/60 bg-slate-900 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-sm'}`}>
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
              className={`p-2 rounded-xl border transition-all ${dark ? 'bg-slate-900 border-slate-700/60 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
              {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            {/* Notification bell */}
            <div className="relative" data-notif>
              <button onClick={openNotif} title="Notifications"
                className={`relative p-2 rounded-xl border transition-all ${dark ? 'bg-slate-900 border-slate-700/60 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                <BellIcon className="w-4 h-4" />
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
                        <BellIcon className="w-8 h-8 mb-2 text-slate-400" />
                        <p className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} onClick={() => { navigateTo(n.nav); setNotifOpen(false); }}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b transition-colors ${dark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-50 hover:bg-slate-50'}`}>
                        <n.Icon className={`w-5 h-5 shrink-0 mt-0.5 ${n.iconCls}`} />
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
          <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center gap-3 ${dark ? 'bg-slate-900 border-slate-800/50 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            {activeNav?.Icon && <activeNav.Icon className="w-5 h-5 text-brand-500" />}
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

