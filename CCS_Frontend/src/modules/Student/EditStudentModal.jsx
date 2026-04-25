import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';
import { STORAGE_URL } from '../../utils/config';

const YEAR_PREFIX = { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4' };
const PROGRAM_CODE = { 'Information Technology': 'IT', 'Computer Science': 'CS' };
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const getSectionOptions = (program, yearLevel) => {
  const yr = YEAR_PREFIX[yearLevel];
  const code = PROGRAM_CODE[program];
  if (!yr || !code) return [];
  return SECTIONS.map(s => `${yr}${code}-${s}`);
};

const emptyMedical   = () => ({ bloodtype: '', existing_conditions: '', emergency_contact_name: '', emergency_contact_number: '' });
const emptyViolation = () => ({ offense: '', date: '', sanction: '' });
const emptyAffil     = () => ({ organization: '', role: '', year: '' });
const emptyActivity  = () => ({ activity: '', description: '', year: '' });
const emptyAcadHist  = () => ({ school: '', year: '', gpa: '' });

const SECTIONS_TABS = [
  { id: 'personal',   label: 'Personal Info' },
  { id: 'medical',    label: 'Medical Records' },
  { id: 'skills',     label: 'Skills' },
  { id: 'violations', label: 'Violations' },
];

const EditStudentModal = ({ isOpen, onClose, onStudentUpdated, student }) => {
  const dark = useDarkMode();

  const modalBg       = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const headerBg      = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const footerBg      = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const tabsBg        = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const inputCls      = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-brand-500'}`;
  const selectCls     = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 focus:border-brand-500'}`;
  const labelCls      = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`;
  const boldText      = dark ? 'text-slate-100' : 'text-slate-900';
  const sectionHead = `text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`;
  const SectionTitle = ({ label }) => (
    <p className={sectionHead}>{label}</p>
  );
  const cardBg        = dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
  const skillCardBase = dark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white';
  const skillCardSel  = dark ? 'border-brand-500 bg-brand-900/20' : 'border-brand-400 bg-brand-50/30';
  const subText       = dark ? 'text-slate-400' : 'text-slate-500';
  const cancelBtn     = dark ? 'text-slate-200 bg-slate-800 border border-slate-600 hover:bg-slate-700' : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50';
  const addRowBtn     = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all mt-3 ${dark ? 'border-brand-500/40 text-brand-400 hover:bg-brand-500/10' : 'border-brand-300 text-brand-600 hover:bg-brand-50'}`;
  const delBtn        = `p-2 rounded-lg border transition-all ${dark ? 'border-slate-600 text-slate-400 hover:bg-red-900/20 hover:border-red-500/40 hover:text-red-400' : 'border-brand-200 text-brand-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500'}`;

  const [activeSection, setActiveSection] = useState('personal');
  const [allSkills, setAllSkills]         = useState([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]                 = useState(null);
  const [fieldErrors, setFieldErrors]     = useState({});
  const formScrollRef = useRef(null);
  const fieldRefs     = useRef({});

  const [formData, setFormData] = useState({
    student_number: '', first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: 'Male', birth_date: '', place_of_birth: '',
    nationality: 'Filipino', civil_status: 'Single', religion: 'Roman Catholic',
    email: '', contact_number: '', alternate_contact_number: '',
    street: '', barangay: '', city: '', province: '', zip_code: '',
    year_level: '1st Year', section: '', student_type: 'Regular',
    enrollment_status: 'Enrolled', date_enrolled: new Date().toISOString().split('T')[0],
    department_id: '', program: '',
    lrn: '', last_school_attended: '', last_year_attended: '', honors_received: '',
  });

  const [medicalRecords, setMedicalRecords] = useState([emptyMedical()]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [violations, setViolations]         = useState([emptyViolation()]);
  const [affiliations, setAffiliations]     = useState([emptyAffil()]);
  const [activities, setActivities]         = useState([emptyActivity()]);
  const [acadHistories, setAcadHistories]   = useState([emptyAcadHist()]);

  useEffect(() => {
    if (isOpen && student) {
      setActiveSection('personal');
      setFormData({
        student_number:           student.student_number || '',
        first_name:               student.first_name || '',
        middle_name:              student.middle_name || '',
        last_name:                student.last_name || '',
        suffix:                   student.suffix || '',
        gender:                   student.gender || 'Male',
        birth_date:               student.birth_date ? student.birth_date.split('T')[0] : '',
        place_of_birth:           student.place_of_birth || '',
        nationality:              student.nationality || 'Filipino',
        civil_status:             student.civil_status || 'Single',
        religion:                 student.religion || 'Roman Catholic',
        email:                    student.email || '',
        contact_number:           student.contact_number || '',
        alternate_contact_number: student.alternate_contact_number || '',
        street:                   student.street || '',
        barangay:                 student.barangay || '',
        city:                     student.city || '',
        province:                 student.province || '',
        zip_code:                 student.zip_code || '',
        year_level:               student.year_level || '1st Year',
        section:                  student.section || '',
        student_type:             student.student_type || 'Regular',
        enrollment_status:        student.enrollment_status || 'Enrolled',
        date_enrolled:            student.date_enrolled ? student.date_enrolled.split('T')[0] : new Date().toISOString().split('T')[0],
        department_id:            student.department_id || '',
        program:                  student.program || '',
        lrn:                      student.lrn || '',
        last_school_attended:     student.last_school_attended || '',
        last_year_attended:       student.last_year_attended || '',
        honors_received:          student.honors_received || '',
      });

      setMedicalRecords(
        student.medical_histories?.length > 0
          ? student.medical_histories.map(mh => ({ id: mh.id, bloodtype: mh.bloodtype || '', existing_conditions: mh.existing_conditions || '', emergency_contact_name: mh.emergency_contact_name || '', emergency_contact_number: mh.emergency_contact_number || '' }))
          : [emptyMedical()]
      );

      setSelectedSkills(
        student.skills
          ? student.skills.map(s => ({ skill_id: s.id, skill_name: s.skill_name, skill_category: s.skill_category, skill_level: s.pivot?.skill_level || '', certification: s.pivot?.certification ? true : false, certification_name: s.pivot?.certification_name || '', certification_date: s.pivot?.certification_date || '' }))
          : []
      );

      setViolations(
        student.violations?.length > 0
          ? student.violations.map(v => ({ id: v.id, offense: v.violation_type || '', date: v.date_reported ? v.date_reported.split('T')[0] : '', sanction: v.description || '' }))
          : [emptyViolation()]
      );

      setAffiliations(
        student.affiliations?.length > 0
          ? student.affiliations.map(a => ({
              id: a.id,
              organization_name: a.organization_name || '',
              position: a.position || '',
              status: a.status || 'Active',
              date_joined: a.date_joined ? a.date_joined.split('T')[0] : '',
              adviser_name: a.adviser_name || '',
            }))
          : [{ organization_name: '', position: '', status: 'Active', date_joined: '', adviser_name: '' }]
      );

      setActivities(
        student.activities?.length > 0
          ? student.activities.map(a => ({ id: a.id, activity: a.activity || '', description: a.description || '', year: a.year || '' }))
          : [emptyActivity()]
      );

      setAcadHistories(
        student.academic_histories?.length > 0
          ? student.academic_histories.map(h => ({ id: h.id, school: h.school_name || '', year: h.school_year || '', gpa: h.gpa || '' }))
          : [emptyAcadHist()]
      );

      api.skills.getAll().then(setAllSkills).catch(() => {});
    }
  }, [isOpen, student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'program' || name === 'year_level') {
      setFormData(prev => ({ ...prev, [name]: value, section: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const parseErrors = useCallback((message) => {
    const map = {};
    const patterns = [
      { re: /student.?number.*required/i, key: 'student_number' },
      { re: /student.?number.*taken/i,    key: 'student_number' },
      { re: /student.?number.*start/i,    key: 'student_number' },
      { re: /first.?name.*required/i,     key: 'first_name' },
      { re: /last.?name.*required/i,      key: 'last_name' },
      { re: /email.*required/i,           key: 'email' },
      { re: /email.*taken/i,              key: 'email' },
      { re: /email.*valid/i,              key: 'email' },
      { re: /contact.*required/i,         key: 'contact_number' },
      { re: /program.*required/i,         key: 'program' },
      { re: /year.?level.*required/i,     key: 'year_level' },
    ];
    for (const { re, key } of patterns) { if (re.test(message)) map[key] = message; }
    return map;
  }, []);

  const scrollToFirstError = useCallback((errors) => {
    const order = ['student_number','first_name','last_name','email','contact_number','program','year_level'];
    for (const key of order) {
      if (errors[key] && fieldRefs.current[key]) {
        fieldRefs.current[key].scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldRefs.current[key].focus({ preventScroll: true });
        break;
      }
    }
  }, []);

  const inpErr = (field) => fieldErrors[field]
    ? `w-full rounded-lg border-2 px-3 py-2 text-sm outline-none transition-all bg-red-50 border-red-400 text-slate-900 placeholder-slate-400 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]`
    : inputCls;
  const selErr = (field) => fieldErrors[field]
    ? `w-full rounded-lg border-2 px-3 py-2 text-sm outline-none transition-all bg-red-50 border-red-400 text-slate-900 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]`
    : selectCls;
  const ErrMsg = ({ field }) => fieldErrors[field]
    ? <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
        {fieldErrors[field]}
      </p>
    : null;

  // helpers
  const updRow = (setter, i, f, v) => setter(prev => prev.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
  const addRow = (setter, empty) => setter(prev => [...prev, empty()]);
  const delRow = (setter, i) => setter(prev => prev.filter((_, idx) => idx !== i));

  const handleMedicalChange  = (i, f, v) => updRow(setMedicalRecords, i, f, v);
  const addMedicalRow        = () => addRow(setMedicalRecords, emptyMedical);
  const removeMedicalRow     = (i) => delRow(setMedicalRecords, i);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skill_id === skill.id);
      if (exists) return prev.filter(s => s.skill_id !== skill.id);
      return [...prev, { skill_id: skill.id, skill_name: skill.skill_name, skill_category: skill.skill_category, skill_level: '', certification: false, certification_name: '', certification_date: '' }];
    });
  };
  const updateSkillPivot = (skillId, field, value) =>
    setSelectedSkills(prev => prev.map(s => s.skill_id === skillId ? { ...s, [field]: value } : s));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const payload = { ...formData };
      ['department_id', 'course_id'].forEach(k => { if (payload[k] === '' || payload[k] === undefined) payload[k] = null; });
      await api.students.update(student.id, payload);

      // Medical
      const origMedical = student.medical_histories || [];
      for (const orig of origMedical) {
        if (!medicalRecords.find(m => m.id && m.id === orig.id)) await api.students.deleteMedical(student.id, orig.id).catch(() => {});
      }
      for (const m of medicalRecords.filter(m => m.bloodtype || m.existing_conditions || m.emergency_contact_name || m.emergency_contact_number)) {
        const mp = { bloodtype: m.bloodtype, existing_conditions: m.existing_conditions, emergency_contact_name: m.emergency_contact_name, emergency_contact_number: m.emergency_contact_number };
        m.id ? await api.students.updateMedical(student.id, m.id, mp) : await api.students.addMedical(student.id, mp);
      }

      // Skills
      await api.students.syncSkills(student.id, selectedSkills.map(s => ({ skill_id: s.skill_id, skill_level: s.skill_level, certification: s.certification, certification_name: s.certification_name, certification_date: s.certification_date || null })));

      // Violations
      const origViolations = student.violations || [];
      for (const orig of origViolations) {
        if (!violations.find(v => v.id && v.id === orig.id)) await api.students.deleteViolation(student.id, orig.id).catch(() => {});
      }
      for (const v of violations.filter(v => v.offense)) {
        const vp = { violation_type: v.offense, description: v.sanction || '', date_reported: v.date || new Date().toISOString().split('T')[0], reported_by: 'Administration', severity_level: 'Low', status: 'Pending' };
        v.id ? await api.students.updateViolation(student.id, v.id, vp) : await api.students.addViolation(student.id, vp);
      }

      // Affiliations
      const origAffils = student.affiliations || [];
      for (const orig of origAffils) {
        if (!affiliations.find(a => a.id && a.id === orig.id)) await api.students.deleteAffiliation(student.id, orig.id).catch(() => {});
      }
      for (const a of affiliations.filter(a => a.organization_name)) {
        const ap = {
          organization_name: a.organization_name,
          position: a.position || 'Member',
          status: a.status || 'Active',
          date_joined: a.date_joined || new Date().toISOString().split('T')[0],
          adviser_name: a.adviser_name || null,
          date_ended: null,
        };
        a.id ? await api.students.updateAffiliation(student.id, a.id, ap).catch(() => api.students.addAffiliation(student.id, ap)) : await api.students.addAffiliation(student.id, ap);
      }

      // Academic Histories
      const origHist = student.academic_histories || [];
      for (const orig of origHist) {
        if (!acadHistories.find(h => h.id && h.id === orig.id)) await api.students.deleteAcademicHistory(student.id, orig.id).catch(() => {});
      }
      for (const h of acadHistories.filter(h => h.school || h.year)) {
        const hp = { school_name: h.school || null, school_year: h.year || '', semester: '1st Semester', gpa: h.gpa || null, academic_standing: 'Good Standing', total_units: 0, completed_units: 0 };
        h.id ? await api.students.updateAcademicHistory(student.id, h.id, hp).catch(() => api.students.addAcademicHistory(student.id, hp)) : await api.students.addAcademicHistory(student.id, hp);
      }

      onStudentUpdated();
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to update student. Please check all required fields.';
      const parsed = parseErrors(msg);
      setError(msg);
      if (Object.keys(parsed).length > 0) { setFieldErrors(parsed); scrollToFirstError(parsed); }
      else if (formScrollRef.current) formScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-xl sm:my-8 sm:w-full sm:max-w-4xl border ${modalBg}`}>

          {/* Hero Header */}
          <div className={`px-6 pt-6 pb-5 border-b ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/60' : 'bg-gradient-to-br from-orange-50/60 to-white border-slate-100'}`}>
            <div className="flex items-center gap-4">
              {/* Avatar — shows photo if available, otherwise initials */}
              {(() => {
                const photo = student?.profile_photo;
                const src = photo ? (photo.startsWith('http') ? photo : `${STORAGE_URL}/${photo}`) : null;
                if (src) return (
                  <img src={src} alt="profile"
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-lg ring-2 ring-orange-400/40"
                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                );
                return (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-orange-500/30 shrink-0">
                    {formData.first_name?.[0] || ''}{formData.last_name?.[0] || ''}
                  </div>
                );
              })()}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>Editing Student</p>
                <h3 className={`text-lg font-extrabold leading-tight ${boldText}`}>{formData.first_name || 'Student'} {formData.last_name}</h3>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{formData.program || 'No program'} · {formData.year_level}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b px-6 ${tabsBg}`}>
            {SECTIONS_TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveSection(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-all relative ${activeSection === tab.id ? 'text-orange-500' : `${subText} hover:text-slate-700`}`}>
                {tab.label}
                {activeSection === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />}
              </button>
            ))}
          </div>

          <div className="px-6 py-5 overflow-y-auto max-h-[60vh]" ref={formScrollRef}>
            {error && <div className={`mb-5 border-l-4 border-red-500 p-4 rounded-md text-sm ${dark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>{error}</div>}

            {/* ── Personal Info ── */}
            {activeSection === 'personal' && (
              <div className="space-y-5">
                {/* Personal Information */}
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <SectionTitle label="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className={labelCls}>Student ID</label>
                      <input type="text" name="student_number" value={formData.student_number || ''} onChange={handleChange} ref={el => fieldRefs.current.student_number = el} className={inpErr('student_number')} />
                      <ErrMsg field="student_number" /></div>
                    <div><label className={labelCls}>First Name *</label>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} ref={el => fieldRefs.current.first_name = el} className={inpErr('first_name')} />
                      <ErrMsg field="first_name" /></div>
                    <div><label className={labelCls}>Middle Name</label>
                      <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputCls} /></div>
                    <div><label className={labelCls}>Last Name *</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} ref={el => fieldRefs.current.last_name = el} className={inpErr('last_name')} />
                      <ErrMsg field="last_name" /></div>
                    <div><label className={labelCls}>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} ref={el => fieldRefs.current.email = el} className={inpErr('email')} />
                      <ErrMsg field="email" /></div>
                    <div><label className={labelCls}>Phone</label>
                      <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} ref={el => fieldRefs.current.contact_number = el} className={inpErr('contact_number')} />
                      <ErrMsg field="contact_number" /></div>
                    <div><label className={labelCls}>Date of Birth</label>
                      <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputCls} /></div>
                    <div><label className={labelCls}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls}>
                        <option value="">Select...</option><option>Male</option><option>Female</option>
                      </select></div>
                    <div className="md:col-span-2"><label className={labelCls}>Address</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City / Address" className={inputCls} /></div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <SectionTitle label="Academic Information" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className={labelCls}>Course *</label>
                      <select name="program" value={formData.program} onChange={handleChange} ref={el => fieldRefs.current.program = el} className={selErr('program')}>
                        <option value="">Select...</option>
                        <option value="Information Technology">BSIT - Information Technology</option>
                        <option value="Computer Science">BSCS - Computer Science</option>
                      </select><ErrMsg field="program" /></div>
                    <div><label className={labelCls}>Year Level *</label>
                      <select name="year_level" value={formData.year_level} onChange={handleChange} ref={el => fieldRefs.current.year_level = el} className={selErr('year_level')}>
                        <option value="">Select...</option>
                        <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                      </select><ErrMsg field="year_level" /></div>
                    <div><label className={labelCls}>Section</label>
                      <select name="section" value={formData.section} onChange={handleChange} className={selectCls}>
                        <option value="">Select Section</option>
                        {getSectionOptions(formData.program, formData.year_level).map(sec => <option key={sec}>{sec}</option>)}
                      </select></div>
                    <div><label className={labelCls}>Student Type</label>
                      <select name="student_type" value={formData.student_type} onChange={handleChange} className={selectCls}>
                        <option>Regular</option><option>Irregular</option><option>Returnee</option><option>Shiftee</option>
                        <option>Transferee</option><option>Graduated</option><option>Dropped</option><option>LOA</option><option>Suspended</option>
                      </select></div>
                    <div><label className={labelCls}>Enrollment Status</label>
                      <select name="enrollment_status" value={formData.enrollment_status} onChange={handleChange} className={selectCls}>
                        <option>Enrolled</option><option>Not Enrolled</option>
                      </select></div>
                  </div>
                </div>

                {/* Affiliations */}
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <SectionTitle label="Affiliations" />
                  {affiliations.map((a, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3 mb-3 items-end">
                      <div className="col-span-2">
                        <label className={labelCls}>Organization</label>
                        <input value={a.organization_name || ''} onChange={e => updRow(setAffiliations, i, 'organization_name', e.target.value)} className={inputCls} placeholder="e.g. JCCS, GDSC" />
                      </div>
                      <div>
                        <label className={labelCls}>Role</label>
                        <input value={a.position || ''} onChange={e => updRow(setAffiliations, i, 'position', e.target.value)} className={inputCls} placeholder="e.g. President" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className={labelCls}>Status</label>
                          <select value={a.status || 'Active'} onChange={e => updRow(setAffiliations, i, 'status', e.target.value)} className={inputCls}>
                            <option>Active</option><option>Inactive</option><option>Alumni</option>
                          </select>
                        </div>
                        {affiliations.length > 1 && (
                          <button type="button" onClick={() => delRow(setAffiliations, i)} className={delBtn}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addRow(setAffiliations, () => ({ organization_name: '', position: '', status: 'Active', date_joined: '', adviser_name: '' }))} className={addRowBtn}>+ Add Row</button>
                </div>

                {/* Non-Academic Activities */}
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <SectionTitle label="Non-Academic Activities" />
                  {activities.map((a, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 mb-3 items-end">
                      <div><label className={labelCls}>Activity</label>
                        <input value={a.activity} onChange={e => updRow(setActivities, i, 'activity', e.target.value)} className={inputCls} /></div>
                      <div><label className={labelCls}>Description</label>
                        <input value={a.description} onChange={e => updRow(setActivities, i, 'description', e.target.value)} className={inputCls} /></div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1"><label className={labelCls}>Year</label>
                          <input value={a.year} onChange={e => updRow(setActivities, i, 'year', e.target.value)} placeholder="e.g. 2024" className={inputCls} /></div>
                        {activities.length > 1 && <button type="button" onClick={() => delRow(setActivities, i)} className={delBtn}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addRow(setActivities, emptyActivity)} className={addRowBtn}>+ Add Row</button>
                </div>

                {/* Academic History */}
                <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <SectionTitle label="Academic History" />
                  {acadHistories.map((h, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 mb-3 items-end">
                      <div><label className={labelCls}>School</label>
                        <input value={h.school} onChange={e => updRow(setAcadHistories, i, 'school', e.target.value)} className={inputCls} /></div>
                      <div><label className={labelCls}>Year</label>
                        <input value={h.year} onChange={e => updRow(setAcadHistories, i, 'year', e.target.value)} placeholder="e.g. 2022-2023" className={inputCls} /></div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1"><label className={labelCls}>GPA</label>
                          <input value={h.gpa} onChange={e => updRow(setAcadHistories, i, 'gpa', e.target.value)} placeholder="e.g. 1.50" className={inputCls} /></div>
                        {acadHistories.length > 1 && <button type="button" onClick={() => delRow(setAcadHistories, i)} className={delBtn}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addRow(setAcadHistories, emptyAcadHist)} className={addRowBtn}>+ Add Row</button>
                </div>
              </div>
            )}

            {/* ── Medical Records ── */}
            {activeSection === 'medical' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-sm font-semibold uppercase tracking-wider border-b pb-2 flex-1 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`}>Medical Records & Emergency Contacts</h4>
                  <button type="button" onClick={addMedicalRow} className="ml-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Record
                  </button>
                </div>
                <div className="space-y-5">
                  {medicalRecords.map((m, i) => (
                    <div key={i} className={`border p-4 rounded-xl relative ${cardBg}`}>
                      {medicalRecords.length > 1 && (
                        <button type="button" onClick={() => removeMedicalRow(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                      <p className={`text-xs font-bold uppercase mb-3 ${subText}`}>Record #{i + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Blood Type</label>
                          <select value={m.bloodtype} onChange={e => handleMedicalChange(i, 'bloodtype', e.target.value)} className={selectCls}>
                            <option value="">Unknown</option>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <option key={bt}>{bt}</option>)}
                          </select></div>
                        <div className="md:row-span-2"><label className={labelCls}>Existing Conditions / Allergies</label>
                          <textarea value={m.existing_conditions} onChange={e => handleMedicalChange(i, 'existing_conditions', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="None reported" /></div>
                        <div><label className={labelCls}>Emergency Contact Name</label>
                          <input type="text" value={m.emergency_contact_name} onChange={e => handleMedicalChange(i, 'emergency_contact_name', e.target.value)} className={inputCls} /></div>
                        <div><label className={labelCls}>Emergency Contact Number</label>
                          <input type="text" value={m.emergency_contact_number} onChange={e => handleMedicalChange(i, 'emergency_contact_number', e.target.value)} className={inputCls} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Skills ── */}
            {activeSection === 'skills' && (
              <div>
                <SectionTitle label="Skills & Certifications" />
                {allSkills.length === 0 ? (
                  <p className={`text-sm italic ${subText}`}>No skills available in the system.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allSkills.map(skill => {
                      const sel = selectedSkills.find(s => s.skill_id === skill.id);
                      const isSelected = !!sel;
                      return (
                        <div key={skill.id} className={`border rounded-xl p-4 transition-all ${isSelected ? skillCardSel : skillCardBase}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <input type="checkbox" id={`skill-${skill.id}`} checked={isSelected} onChange={() => toggleSkill(skill)} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer" />
                            <label htmlFor={`skill-${skill.id}`} className={`font-semibold text-sm cursor-pointer flex-1 ${boldText}`}>
                              {skill.skill_name}<span className={`ml-2 text-xs font-normal ${subText}`}>{skill.skill_category}</span>
                            </label>
                          </div>
                          {isSelected && (
                            <div className={`mt-2 pl-7 space-y-2 border-t pt-3 ${dark ? 'border-slate-700' : 'border-brand-100'}`}>
                              <div><label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Proficiency Level</label>
                                <select value={sel.skill_level} onChange={e => updateSkillPivot(skill.id, 'skill_level', e.target.value)} className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                                  <option value="">Select Level</option>
                                  {['Beginner','Intermediate','Advanced','Expert'].map(l => <option key={l}>{l}</option>)}
                                </select></div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id={`cert-${skill.id}`} checked={sel.certification} onChange={e => updateSkillPivot(skill.id, 'certification', e.target.checked)} className="w-3.5 h-3.5 text-brand-600 rounded border-slate-300" />
                                <label htmlFor={`cert-${skill.id}`} className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Has Certification</label>
                              </div>
                              {sel.certification && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div><label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Certification Name</label>
                                    <input type="text" value={sel.certification_name} onChange={e => updateSkillPivot(skill.id, 'certification_name', e.target.value)} className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} /></div>
                                  <div><label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Date Obtained</label>
                                    <input type="date" value={sel.certification_date} onChange={e => updateSkillPivot(skill.id, 'certification_date', e.target.value)} className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} /></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Violations ── */}
            {activeSection === 'violations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-sm font-semibold uppercase tracking-wider border-b pb-2 flex-1 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`}>Violations</h4>
                  <button type="button" onClick={() => addRow(setViolations, emptyViolation)} className="ml-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Violation
                  </button>
                </div>
                {violations.map((v, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 mb-3 items-end">
                    <div><label className={labelCls}>Offense</label>
                      <input type="text" value={v.offense} onChange={e => updRow(setViolations, i, 'offense', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Date</label>
                      <input type="date" value={v.date} onChange={e => updRow(setViolations, i, 'date', e.target.value)} className={inputCls} /></div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1"><label className={labelCls}>Sanction</label>
                        <input type="text" value={v.sanction} onChange={e => updRow(setViolations, i, 'sanction', e.target.value)} className={inputCls} /></div>
                      {violations.length > 1 && <button type="button" onClick={() => delRow(setViolations, i)} className={delBtn}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-end gap-3 border-t ${footerBg}`}>
            <button type="button" onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center gap-2 min-w-[130px] justify-center">
              {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
