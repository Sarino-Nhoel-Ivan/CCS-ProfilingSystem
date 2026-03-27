import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const YEAR_PREFIX = { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4' };
const PROGRAM_CODE = { 'Information Technology': 'IT', 'Computer Science': 'CS' };
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const getSectionOptions = (program, yearLevel) => {
  const yr = YEAR_PREFIX[yearLevel];
  const code = PROGRAM_CODE[program];
  if (!yr || !code) return [];
  return SECTIONS.map(s => `${yr}${code}-${s}`);
};

const emptyMedical = () => ({ bloodtype: '', existing_conditions: '', emergency_contact_name: '', emergency_contact_number: '' });
const emptyViolation = () => ({ violation_type: '', description: '', date_reported: '', reported_by: '', severity_level: 'Low', action_taken: '', status: 'Pending', resolution_date: '' });

const SECTIONS_TABS = [
  { id: 'personal',  label: 'Personal Info' },
  { id: 'medical',   label: 'Medical Records' },
  { id: 'skills',    label: 'Skills' },
  { id: 'violations',label: 'Violations' },
];

const EditStudentModal = ({ isOpen, onClose, onStudentUpdated, student }) => {
  const dark = useDarkMode();

  // Dark mode tokens (defined inside component so they react to dark mode)
  const modalBg   = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const headerBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const footerBg  = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const tabsBg    = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const inputCls  = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-brand-500'}`;
  const selectCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 focus:border-brand-500'}`;
  const labelCls  = `block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`;
  const boldText  = dark ? 'text-slate-100' : 'text-slate-900';
  const sectionHead = `text-sm font-semibold uppercase tracking-wider mb-4 border-b pb-2 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`;
  const cardBg    = dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
  const skillCardBase = dark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white';
  const skillCardSel  = dark ? 'border-brand-500 bg-brand-900/20' : 'border-brand-400 bg-brand-50/30';
  const subText   = dark ? 'text-slate-400' : 'text-slate-500';
  const cancelBtn = dark
    ? 'text-slate-200 bg-slate-800 border border-slate-600 hover:bg-slate-700'
    : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50';

  const [activeSection, setActiveSection] = useState('personal');
  const [departments, setDepartments] = useState([]);
  const [allSkills, setAllSkills]       = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState(null);

  // ── Core student fields ───────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: 'Male', birth_date: '', place_of_birth: '',
    nationality: 'Filipino', civil_status: 'Single', religion: 'Roman Catholic',
    email: '', contact_number: '', alternate_contact_number: '',
    street: '', barangay: '', city: '', province: '', zip_code: '',
    year_level: '1st Year', section: '', student_type: 'Regular',
    enrollment_status: 'Enrolled', date_enrolled: new Date().toISOString().split('T')[0],
    department_id: '', program: '',
    lrn: '', last_school_attended: '', last_year_attended: '', honors_received: '',
  });

  // ── Medical records ──────────────────────────────────────────────────────
  const [medicalRecords, setMedicalRecords] = useState([emptyMedical()]);

  // ── Skills (pivot) ────────────────────────────────────────────────────────
  const [selectedSkills, setSelectedSkills] = useState([]);
  // selectedSkills: [{ skill_id, skill_level, certification, certification_name, certification_date }]

  // ── Violations ────────────────────────────────────────────────────────────
  const [violations, setViolations]         = useState([]);

  // ── Load data when modal opens ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && student) {
      setActiveSection('personal');
      setFormData({
        first_name:                student.first_name || '',
        middle_name:               student.middle_name || '',
        last_name:                 student.last_name || '',
        suffix:                    student.suffix || '',
        gender:                    student.gender || 'Male',
        birth_date:                student.birth_date ? student.birth_date.split('T')[0] : '',
        place_of_birth:            student.place_of_birth || '',
        nationality:               student.nationality || 'Filipino',
        civil_status:              student.civil_status || 'Single',
        religion:                  student.religion || 'Roman Catholic',
        email:                     student.email || '',
        contact_number:            student.contact_number || '',
        alternate_contact_number:  student.alternate_contact_number || '',
        street:                    student.street || '',
        barangay:                  student.barangay || '',
        city:                      student.city || '',
        province:                  student.province || '',
        zip_code:                  student.zip_code || '',
        year_level:                student.year_level || '1st Year',
        section:                   student.section || '',
        student_type:              student.student_type || 'Regular',
        enrollment_status:         student.enrollment_status || 'Enrolled',
        date_enrolled:             student.date_enrolled ? student.date_enrolled.split('T')[0] : new Date().toISOString().split('T')[0],
        department_id:             student.department_id || '',
        program:                   student.program || '',
        lrn:                       student.lrn || '',
        last_school_attended:      student.last_school_attended || '',
        last_year_attended:        student.last_year_attended || '',
        honors_received:           student.honors_received || '',
      });

      // Medical
      setMedicalRecords(
        student.medical_histories && student.medical_histories.length > 0
          ? student.medical_histories.map(mh => ({
              id: mh.id,
              bloodtype: mh.bloodtype || '',
              existing_conditions: mh.existing_conditions || '',
              emergency_contact_name: mh.emergency_contact_name || '',
              emergency_contact_number: mh.emergency_contact_number || '',
            }))
          : [emptyMedical()]
      );

      // Skills
      setSelectedSkills(
        student.skills
          ? student.skills.map(s => ({
              skill_id:           s.id,
              skill_name:         s.skill_name,
              skill_category:     s.skill_category,
              skill_level:        s.pivot?.skill_level || '',
              certification:      s.pivot?.certification ? true : false,
              certification_name: s.pivot?.certification_name || '',
              certification_date: s.pivot?.certification_date || '',
            }))
          : []
      );

      // Violations
      setViolations(
        student.violations
          ? student.violations.map(v => ({
              id:               v.id,
              violation_type:   v.violation_type || '',
              description:      v.description || '',
              date_reported:    v.date_reported ? v.date_reported.split('T')[0] : '',
              reported_by:      v.reported_by || '',
              severity_level:   v.severity_level || 'Low',
              action_taken:     v.action_taken || '',
              status:           v.status || 'Pending',
              resolution_date:  v.resolution_date ? v.resolution_date.split('T')[0] : '',
            }))
          : []
      );

      fetchDropdownData();
    }
  }, [isOpen, student]);

  const fetchDropdownData = async () => {
    try {
      const [deptData, skillsData] = await Promise.all([
        api.departments.getAll(),
        api.skills.getAll(),
      ]);
      setDepartments(deptData);
      setAllSkills(skillsData);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'program' || name === 'year_level') {
      setFormData(prev => ({ ...prev, [name]: value, section: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ── Medical helpers ────────────────────────────────────────────────────────
  const handleMedicalChange = (i, field, value) =>
    setMedicalRecords(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  const addMedicalRow  = () => setMedicalRecords(prev => [...prev, emptyMedical()]);
  const removeMedicalRow = (i) => setMedicalRecords(prev => prev.filter((_, idx) => idx !== i));

  // ── Skill helpers ──────────────────────────────────────────────────────────
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skill_id === skill.id);
      if (exists) return prev.filter(s => s.skill_id !== skill.id);
      return [...prev, { skill_id: skill.id, skill_name: skill.skill_name, skill_category: skill.skill_category, skill_level: '', certification: false, certification_name: '', certification_date: '' }];
    });
  };
  const updateSkillPivot = (skillId, field, value) =>
    setSelectedSkills(prev => prev.map(s => s.skill_id === skillId ? { ...s, [field]: value } : s));

  // ── Violation helpers ──────────────────────────────────────────────────────
  const handleViolationChange = (i, field, value) =>
    setViolations(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  const addViolationRow  = () => setViolations(prev => [...prev, emptyViolation()]);
  const removeViolationRow = (i) => setViolations(prev => prev.filter((_, idx) => idx !== i));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Update core student — convert empty strings to null for integer FK fields
      const payload = { ...formData };
      ['department_id', 'course_id'].forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
      });
      await api.students.update(student.id, payload);

      // 2. Sync medical records: delete removed, update existing, add new
      const originalMedical = student.medical_histories || [];
      // Delete rows that were removed
      for (const orig of originalMedical) {
        const stillPresent = medicalRecords.find(m => m.id && m.id === orig.id);
        if (!stillPresent) {
          await api.students.deleteMedical(student.id, orig.id).catch(() => {});
        }
      }
      for (const m of medicalRecords) {
        const payload = {
          bloodtype:                m.bloodtype,
          existing_conditions:      m.existing_conditions,
          emergency_contact_name:   m.emergency_contact_name,
          emergency_contact_number: m.emergency_contact_number,
        };
        if (m.id) {
          await api.students.updateMedical(student.id, m.id, payload);
        } else {
          await api.students.addMedical(student.id, payload);
        }
      }

      // 3. Sync skills (full sync via single endpoint)
      const skillsPayload = selectedSkills.map(s => ({
        skill_id:           s.skill_id,
        skill_level:        s.skill_level,
        certification:      s.certification,
        certification_name: s.certification_name,
        certification_date: s.certification_date || null,
      }));
      await api.students.syncSkills(student.id, skillsPayload);

      // 4. Sync violations: delete removed, update existing, add new
      const originalViolations = student.violations || [];
      for (const orig of originalViolations) {
        const stillPresent = violations.find(v => v.id && v.id === orig.id);
        if (!stillPresent) {
          await api.students.deleteViolation(student.id, orig.id).catch(() => {});
        }
      }
      for (const v of violations) {
        const payload = {
          violation_type:  v.violation_type,
          description:     v.description,
          date_reported:   v.date_reported,
          reported_by:     v.reported_by,
          severity_level:  v.severity_level,
          action_taken:    v.action_taken,
          status:          v.status,
          resolution_date: v.resolution_date || null,
        };
        if (v.id) {
          await api.students.updateViolation(student.id, v.id, payload);
        } else {
          await api.students.addViolation(student.id, payload);
        }
      }

      onStudentUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update student. Please check all required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border ${modalBg}`}>

          {/* Header */}
          <div className={`px-6 pt-5 pb-4 border-b flex justify-between items-center ${headerBg}`}>
            <h3 className={`text-xl font-bold ${boldText}`}>Edit Student Profile</h3>
            <button onClick={onClose} className={`${dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-500'}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Section Tabs */}
          <div className={`flex border-b px-6 ${tabsBg}`}>
            {SECTIONS_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-all relative ${activeSection === tab.id ? 'text-brand-600' : `${subText} hover:text-slate-700`}`}
              >
                {tab.label}
                {activeSection === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600" />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">

              {error && (
                <div className={`mb-5 border-l-4 border-red-500 p-4 rounded-md text-sm ${dark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>{error}</div>
              )}

              {/* ── Personal Info ─────────────────────────────────────────── */}
              {activeSection === 'personal' && (
                <div className="space-y-7">
                  <div>
                    <h4 className={sectionHead}>Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><label className={labelCls}>First Name *</label><input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Middle Name</label><input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Last Name *</label><input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Suffix</label><input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className={selectCls}><option>Male</option><option>Female</option></select></div>
                      <div><label className={labelCls}>Birth Date *</label><input required type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputCls} /></div>
                      <div className="md:col-span-2"><label className={labelCls}>Place of Birth *</label><input required type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Nationality</label><input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Civil Status</label>
                        <select name="civil_status" value={formData.civil_status} onChange={handleChange} className={selectCls}>
                          <option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                        </select>
                      </div>
                      <div><label className={labelCls}>Religion</label><input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputCls} /></div>
                    </div>
                  </div>

                  <div>
                    <h4 className={sectionHead}>Contact & Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className={labelCls}>Email Address *</label><input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Primary Contact *</label><input required type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Alternate Contact</label><input type="text" name="alternate_contact_number" value={formData.alternate_contact_number} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Street</label><input type="text" name="street" value={formData.street} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Barangay</label><input type="text" name="barangay" value={formData.barangay} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>City *</label><input required type="text" name="city" value={formData.city} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Province</label><input type="text" name="province" value={formData.province} onChange={handleChange} className={inputCls} /></div>
                      <div><label className={labelCls}>Zip Code</label><input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className={inputCls} /></div>
                    </div>
                  </div>

                  <div>
                    <h4 className={sectionHead}>Academic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className={labelCls}>Course / Program *</label>
                        <select required name="program" value={formData.program} onChange={handleChange} className={selectCls}>
                          <option value="">Select Course / Program</option>
                          <option value="Information Technology">BSIT - Information Technology</option>
                          <option value="Computer Science">BSCS - Computer Science</option>
                        </select>
                      </div>
                      <div><label className={labelCls}>Year Level</label>
                        <select name="year_level" value={formData.year_level} onChange={handleChange} className={selectCls}>
                          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                        </select>
                      </div>
                      <div><label className={labelCls}>Section</label>
                        <select name="section" value={formData.section} onChange={handleChange} className={selectCls}>
                          <option value="">Select Section</option>
                          {getSectionOptions(formData.program, formData.year_level).map(sec => (<option key={sec} value={sec}>{sec}</option>))}
                        </select>
                      </div>
                      <div><label className={labelCls}>Student Type</label>
                        <select name="student_type" value={formData.student_type} onChange={handleChange} className={selectCls}>
                          <option>Regular</option><option>Irregular</option><option>Returnee</option><option>Shiftee</option>
                          <option>Transferee</option><option>Graduated</option><option>Dropped</option><option>LOA</option><option>Suspended</option>
                        </select>
                      </div>
                      <div><label className={labelCls}>Enrollment Status</label>
                        <select name="enrollment_status" value={formData.enrollment_status} onChange={handleChange} className={selectCls}>
                          <option>Enrolled</option><option>Not Enrolled</option>
                        </select>
                      </div>
                      <div><label className={labelCls}>Date Enrolled</label>
                        <input type="date" name="date_enrolled" value={formData.date_enrolled} onChange={handleChange} className={inputCls} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={sectionHead}>Academic Background</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={labelCls}>LRN (Learner Reference Number)</label>
                        <input type="text" name="lrn" value={formData.lrn} onChange={handleChange} maxLength={12} placeholder="12-digit LRN" className={inputCls} />
                      </div>
                      <div><label className={labelCls}>Last Year Attended</label>
                        <input type="text" name="last_year_attended" value={formData.last_year_attended} onChange={handleChange} placeholder="e.g. 2022-2023" className={inputCls} />
                      </div>
                      <div className="md:col-span-2"><label className={labelCls}>Last School Attended</label>
                        <input type="text" name="last_school_attended" value={formData.last_school_attended} onChange={handleChange} className={inputCls} />
                      </div>
                      <div className="md:col-span-2"><label className={labelCls}>Honors / Awards Received</label>
                        <textarea name="honors_received" value={formData.honors_received} onChange={handleChange} rows={3} placeholder="e.g. With Honors, Best in Math..." className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ── Medical Records ───────────────────────────────────────── */}
              {activeSection === 'medical' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-sm font-semibold uppercase tracking-wider border-b pb-2 flex-1 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`}>Medical Records & Emergency Contacts</h4>
                    <button type="button" onClick={addMedicalRow} className="ml-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add Record
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
                            </select>
                          </div>
                          <div className="md:row-span-2"><label className={labelCls}>Existing Conditions / Allergies</label>
                            <textarea value={m.existing_conditions} onChange={e => handleMedicalChange(i, 'existing_conditions', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="None reported" />
                          </div>
                          <div><label className={labelCls}>Emergency Contact Name</label>
                            <input type="text" value={m.emergency_contact_name} onChange={e => handleMedicalChange(i, 'emergency_contact_name', e.target.value)} className={inputCls} />
                          </div>
                          <div><label className={labelCls}>Emergency Contact Number</label>
                            <input type="text" value={m.emergency_contact_number} onChange={e => handleMedicalChange(i, 'emergency_contact_number', e.target.value)} className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Skills ────────────────────────────────────────────────── */}
              {activeSection === 'skills' && (
                <div>
                  <h4 className={sectionHead}>Skills & Certifications</h4>
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
                              <input type="checkbox" id={`skill-${skill.id}`} checked={isSelected} onChange={() => toggleSkill(skill)}
                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer" />
                              <label htmlFor={`skill-${skill.id}`} className={`font-semibold text-sm cursor-pointer flex-1 ${boldText}`}>
                                {skill.skill_name}
                                <span className={`ml-2 text-xs font-normal ${subText}`}>{skill.skill_category}</span>
                              </label>
                            </div>
                            {isSelected && (
                              <div className={`mt-2 pl-7 space-y-2 border-t pt-3 ${dark ? 'border-slate-700' : 'border-brand-100'}`}>
                                <div>
                                  <label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Proficiency Level</label>
                                  <select value={sel.skill_level} onChange={e => updateSkillPivot(skill.id, 'skill_level', e.target.value)} className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-800 focus:border-brand-400'}`}>
                                    <option value="">Select Level</option>
                                    {['Beginner','Intermediate','Advanced','Expert'].map(l => <option key={l}>{l}</option>)}
                                  </select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id={`cert-${skill.id}`} checked={sel.certification}
                                    onChange={e => updateSkillPivot(skill.id, 'certification', e.target.checked)}
                                    className="w-3.5 h-3.5 text-brand-600 rounded border-slate-300" />
                                  <label htmlFor={`cert-${skill.id}`} className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Has Certification</label>
                                </div>
                                {sel.certification && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Certification Name</label>
                                      <input type="text" value={sel.certification_name} onChange={e => updateSkillPivot(skill.id, 'certification_name', e.target.value)}
                                        className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                                    </div>
                                    <div>
                                      <label className={`block text-xs font-medium mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Date Obtained</label>
                                      <input type="date" value={sel.certification_date} onChange={e => updateSkillPivot(skill.id, 'certification_date', e.target.value)}
                                        className={`w-full rounded-lg border px-2 py-1 text-xs ${dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`} />
                                    </div>
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

              {/* ── Violations ────────────────────────────────────────────── */}
              {activeSection === 'violations' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-sm font-semibold uppercase tracking-wider border-b pb-2 flex-1 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`}>Violations / Disciplinary Records</h4>
                    <button type="button" onClick={addViolationRow} className="ml-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add Violation
                    </button>
                  </div>
                  {violations.length === 0 ? (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-xl text-center">
                      <svg className="w-10 h-10 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-green-700 font-semibold text-sm">No violations recorded.</p>
                      <p className="text-green-600 text-xs mt-1">Click "Add Violation" to record one.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {violations.map((v, i) => (
                        <div key={i} className={`border p-4 rounded-xl relative ${v.severity_level === 'High' ? (dark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50/20') : v.severity_level === 'Medium' ? (dark ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50/20') : cardBg}`}>
                          <button type="button" onClick={() => removeViolationRow(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <p className={`text-xs font-bold uppercase mb-3 ${subText}`}>Violation #{i + 1}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2"><label className={labelCls}>Violation Type *</label>
                              <input required type="text" value={v.violation_type} onChange={e => handleViolationChange(i, 'violation_type', e.target.value)} className={inputCls} />
                            </div>
                            <div><label className={labelCls}>Severity *</label>
                              <select value={v.severity_level} onChange={e => handleViolationChange(i, 'severity_level', e.target.value)} className={selectCls}>
                                <option>Low</option><option>Medium</option><option>High</option>
                              </select>
                            </div>
                            <div><label className={labelCls}>Date Reported *</label>
                              <input required type="date" value={v.date_reported} onChange={e => handleViolationChange(i, 'date_reported', e.target.value)} className={inputCls} />
                            </div>
                            <div><label className={labelCls}>Reported By</label>
                              <input type="text" value={v.reported_by} onChange={e => handleViolationChange(i, 'reported_by', e.target.value)} className={inputCls} />
                            </div>
                            <div><label className={labelCls}>Status *</label>
                              <select value={v.status} onChange={e => handleViolationChange(i, 'status', e.target.value)} className={selectCls}>
                                <option>Pending</option><option>Under Review</option><option>Resolved</option>
                              </select>
                            </div>
                            <div className="md:col-span-3"><label className={labelCls}>Description</label>
                              <textarea value={v.description} onChange={e => handleViolationChange(i, 'description', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                            </div>
                            <div className="md:col-span-2"><label className={labelCls}>Action Taken</label>
                              <textarea value={v.action_taken} onChange={e => handleViolationChange(i, 'action_taken', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                            </div>
                            <div><label className={labelCls}>Resolution Date</label>
                              <input type="date" value={v.resolution_date} onChange={e => handleViolationChange(i, 'resolution_date', e.target.value)} className={inputCls} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className={`px-6 py-3 flex justify-end gap-3 border-t ${footerBg}`}>
              <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${cancelBtn}`}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
