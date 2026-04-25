import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';
import { cache } from '../../utils/api';

// Year level → section prefix map
const YEAR_PREFIX = { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4' };
const PROGRAM_CODE = { 'Information Technology': 'IT', 'Computer Science': 'CS', 'BSIT': 'IT', 'BSCS': 'CS' };
const SECTION_LETTERS = ['A','B','C','D','E'];

// Generate section name from year + program
const makeSectionName = (year, program, letter) => {
  const yr = YEAR_PREFIX[year] || '1';
  const code = PROGRAM_CODE[program] || 'IT';
  return `${yr}${code}-${letter}`;
};

// ── Field wrapper defined OUTSIDE the modal so it never re-mounts ──────────
const Field = ({ label, required, hint, labelCls, hintCls, children }) => (
  <div>
    <label className={`block text-sm font-semibold mb-1 ${labelCls}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className={`text-xs mt-1 ${hintCls}`}>{hint}</p>}
  </div>
);

const AssignScheduleModal = ({ isOpen, onClose, onSuccess }) => {
  const dark = useDarkMode();

  // ── form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '10:00',
    room: '',
    subject_id: '',
    faculty_id: '',
    section_id: '',
    // used only for "create section" flow
    _year_level: '1st Year',
    _program: 'BSIT',
    _section_letter: 'A',
  });

  const [options, setOptions]         = useState({ subjects: [], faculties: [], sections: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);
  const [sectionMode, setSectionMode] = useState('existing'); // 'existing' | 'create'

  useEffect(() => {
    if (isOpen) { setError(null); fetchOptions(); }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      setIsLoading(true);
      // Bust section cache so we always get fresh data
      cache.bust('sections');
      const [subjects, faculties, sections] = await Promise.all([
        api.subjects.getAll(),
        api.faculties.getAll(),
        api.sections.getAll(),
      ]);
      setOptions({ subjects, faculties, sections });

      // Auto-select first values
      setFormData(prev => ({
        ...prev,
        subject_id: subjects.length ? String(subjects[0].id) : '',
        faculty_id: faculties.length ? String(faculties[0].id) : '',
        section_id: sections.length ? String(sections[0].id) : '',
      }));

      // If no sections exist, default to create mode
      if (sections.length === 0) setSectionMode('create');
      else setSectionMode('existing');

    } catch (err) {
      setError('Failed to load form options: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── subjects filtered by selected section's year level ────────────────────
  const filteredSubjects = useMemo(() => {
    if (sectionMode === 'existing') {
      const sec = options.sections.find(s => String(s.id) === String(formData.section_id));
      const yr = sec?.year_level;
      if (!yr) return options.subjects;
      return options.subjects.filter(s => !s.year_level || s.year_level === yr);
    } else {
      // create mode — filter by chosen year level
      const yr = formData._year_level;
      return options.subjects.filter(s => !s.year_level || s.year_level === yr);
    }
  }, [options.subjects, options.sections, formData.section_id, formData._year_level, sectionMode]);

  // Auto-select first filtered subject ONLY when the filter key changes,
  // not on every render. Using a ref to track the previous filter key
  // prevents this effect from firing while the user types in other fields.
  const prevFilterKey = React.useRef('');
  const filterKey = sectionMode === 'existing'
    ? `existing-${formData.section_id}`
    : `create-${formData._year_level}`;

  useEffect(() => {
    if (filterKey === prevFilterKey.current) return; // filter didn't change — skip
    prevFilterKey.current = filterKey;
    if (filteredSubjects.length > 0 && !filteredSubjects.find(s => String(s.id) === String(formData.subject_id))) {
      setFormData(prev => ({ ...prev, subject_id: String(filteredSubjects[0].id) }));
    }
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── preview section name in create mode ───────────────────────────────────
  const previewSectionName = makeSectionName(formData._year_level, formData._program, formData._section_letter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let sectionId = formData.section_id;

      // If creating a new section, create it first
      if (sectionMode === 'create') {
        // Find course_id — look for BSIT/BSCS program record first, then any IT/CS course
        const courses = await api.courses.getAll();
        const prefix = formData._program; // 'BSIT' or 'BSCS'
        const altPrefix = formData._program === 'BSIT' ? 'IT' : 'CS';

        // 1. Exact program code match (BSIT / BSCS)
        let course = courses.find(c => c.course_code === prefix);
        // 2. Any course starting with IT / CS
        if (!course) course = courses.find(c => c.course_code?.startsWith(altPrefix));
        // 3. Any course at all as last resort
        if (!course) course = courses[0];

        try {
          const newSection = await api.sections.create({
            section_name: previewSectionName,
            year_level: formData._year_level,
            semester: '1st Semester',
            course_id: course?.id ?? null,
          });
          sectionId = newSection.id;
          cache.bust('sections');
        } catch (sectionErr) {
          // Section creation failed — likely the backend hasn't been deployed yet
          // or the section already exists. Give a clear message.
          const msg = sectionErr.message || '';
          if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('already')) {
            throw new Error(`Section "${previewSectionName}" already exists. Switch to "Existing" tab and select it.`);
          }
          throw new Error(
            `Could not create section "${previewSectionName}". ` +
            `This usually means the backend needs to be redeployed. ` +
            `Try switching to "Existing" tab if the section already exists, ` +
            `or contact your administrator.`
          );
        }
      }

      await api.schedules.create({
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room,
        subject_id: formData.subject_id,
        faculty_id: formData.faculty_id,
        section_id: sectionId,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── theme tokens ──────────────────────────────────────────────────────────
  const modalBg   = dark ? 'bg-slate-900'        : 'bg-white';
  const headerBg  = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const titleClr  = dark ? 'text-slate-100'       : 'text-slate-800';
  const closeBtn  = dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100';
  const labelClr  = dark ? 'text-slate-300'       : 'text-slate-700';
  const secHead   = dark ? 'text-slate-400'        : 'text-slate-500';
  const inputCls  = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-brand-400/50 focus:border-brand-400'
    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-brand-500/50 focus:border-brand-500';
  const selectCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 focus:ring-brand-400/50 focus:border-brand-400'
    : 'bg-white border-slate-200 text-slate-800 focus:ring-brand-500/50 focus:border-brand-500';
  const divider   = dark ? 'border-slate-700/60'  : 'border-slate-100';
  const cancelBtn = dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100';
  const errBox    = dark ? 'bg-red-900/30 border-red-800/50 text-red-300' : 'bg-red-50 border-red-100 text-red-600';
  const spinBorder = dark ? 'border-slate-700 border-t-brand-500' : 'border-slate-200 border-t-brand-600';
  const infoBox   = dark ? 'bg-brand-900/20 border-brand-700/40 text-brand-300' : 'bg-brand-50 border-brand-200 text-brand-700';
  const tabActive = dark ? 'bg-brand-600 text-white' : 'bg-brand-600 text-white';
  const tabInactive = dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${modalBg} rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden`}>

        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${headerBg}`}>
          <div>
            <h2 className={`text-xl font-bold ${titleClr}`}>Assign New Schedule</h2>
            <p className={`text-xs mt-0.5 ${secHead}`}>Link a subject, faculty, and section to a time slot.</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${closeBtn}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`w-10 h-10 border-4 rounded-full animate-spin ${spinBorder}`} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {error && (
              <div className={`p-4 border rounded-xl text-sm flex items-start gap-3 ${errBox}`}>
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ── Section ── */}
            <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${secHead}`}>Section</h3>
                {/* Toggle existing / create new */}
                <div className={`flex rounded-lg border overflow-hidden text-xs ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button type="button" onClick={() => setSectionMode('existing')}
                    className={`px-3 py-1.5 font-semibold transition-colors ${sectionMode === 'existing' ? tabActive : tabInactive}`}>
                    Existing
                  </button>
                  <button type="button" onClick={() => setSectionMode('create')}
                    className={`px-3 py-1.5 font-semibold transition-colors ${sectionMode === 'create' ? tabActive : tabInactive}`}>
                    + New Section
                  </button>
                </div>
              </div>

              {sectionMode === 'existing' ? (
                options.sections.length === 0 ? (
                  <div className={`p-3 rounded-xl border text-sm ${infoBox}`}>
                    No sections exist yet. Switch to <strong>"+ New Section"</strong> to create one while assigning.
                  </div>
                ) : (
                  <Field labelCls={labelClr} hintCls={secHead} label="Select Section" required>
                    <select name="section_id" value={formData.section_id} onChange={handleChange} required
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                      {options.sections.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.section_name} — {s.year_level} · {s.semester} · {s.course?.course_code || s.course?.course_name || ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                )
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Field labelCls={labelClr} hintCls={secHead} label="Year Level" required>
                      <select name="_year_level" value={formData._year_level} onChange={handleChange}
                        className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </Field>
                    <Field labelCls={labelClr} hintCls={secHead} label="Program" required>
                      <select name="_program" value={formData._program} onChange={handleChange}
                        className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                        <option value="BSIT">BSIT</option>
                        <option value="BSCS">BSCS</option>
                      </select>
                    </Field>
                    <Field labelCls={labelClr} hintCls={secHead} label="Section" required>
                      <select name="_section_letter" value={formData._section_letter} onChange={handleChange}
                        className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                        {SECTION_LETTERS.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${infoBox}`}>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Section <strong className="mx-1">{previewSectionName}</strong> will be created automatically.
                  </div>
                </div>
              )}
            </div>

            {/* ── Subject & Faculty ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${secHead}`}>Subject</h3>
                <Field labelCls={labelClr} hintCls={secHead} label="Select Subject" required
                  hint={filteredSubjects.length < options.subjects.length
                    ? `Showing ${filteredSubjects.length} of ${options.subjects.length} subjects for selected year level`
                    : undefined}>
                  {filteredSubjects.length === 0 ? (
                    <div className={`p-3 rounded-xl border text-sm ${infoBox}`}>
                      No subjects found for this year level. Add subjects in the Instruction tab first.
                    </div>
                  ) : (
                    <select name="subject_id" value={formData.subject_id} onChange={handleChange} required
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                      {filteredSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.subject_code} — {s.descriptive_title} ({s.total_units} units)
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${secHead}`}>Faculty</h3>
                <Field labelCls={labelClr} hintCls={secHead} label="Assign Faculty" required>
                  {options.faculties.length === 0 ? (
                    <div className={`p-3 rounded-xl border text-sm ${infoBox}`}>
                      No faculty found. Add faculty in the Faculty Management tab first.
                    </div>
                  ) : (
                    <select name="faculty_id" value={formData.faculty_id} onChange={handleChange} required
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                      {options.faculties.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.first_name} {f.last_name} — {f.position || f.department?.department_name || 'Faculty'}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </div>

            {/* ── Time & Location ── */}
            <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${secHead}`}>Time & Location</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <Field labelCls={labelClr} hintCls={secHead} label="Day" required>
                    <select name="day_of_week" value={formData.day_of_week} onChange={handleChange} required
                      className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${selectCls}`}>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div>
                  <Field labelCls={labelClr} hintCls={secHead} label="Start Time" required>
                    <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required
                      className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`} />
                  </Field>
                </div>
                <div>
                  <Field labelCls={labelClr} hintCls={secHead} label="End Time" required>
                    <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required
                      className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`} />
                  </Field>
                </div>
                <div>
                  <Field labelCls={labelClr} hintCls={secHead} label="Room" required>
                    <input type="text" name="room" value={formData.room} onChange={handleChange}
                      placeholder="e.g. IT Lb 1" required
                      className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`} />
                  </Field>
                </div>
              </div>
            </div>

            <div className={`flex justify-end space-x-3 pt-2 border-t ${divider}`}>
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${cancelBtn}`}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || filteredSubjects.length === 0 || options.faculties.length === 0}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/30 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : 'Assign Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignScheduleModal;
