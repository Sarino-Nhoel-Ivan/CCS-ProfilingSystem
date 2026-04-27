import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const AddFacultyModal = ({ isOpen, onClose, onFacultyAdded }) => {
  const dark = useDarkMode();
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const defaultForm = {
    first_name: '', middle_name: '', last_name: '',
    gender: '', date_of_birth: '',
    position: 'Instructor I', employment_status: 'Full-Time',
    hire_date: new Date().toISOString().split('T')[0],
    email: '', contact_number: '', office_location: '',
    office_hours: '', department_id: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const footerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';

  const inp = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors ${
    dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-orange-400'
         : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20'}`;
  const sel = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors ${
    dark ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-orange-400'
         : 'bg-white border-slate-200 text-slate-900 focus:border-orange-400'}`;
  const lbl = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`;

  useEffect(() => {
    if (isOpen) {
      setFormData(defaultForm);
      setError(null);
      api.departments.getAll()
        .then(data => {
          setDepartments(data);
          if (data.length > 0) setFormData(prev => ({ ...prev, department_id: data[0].id }));
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Phone: digits only, enforce 09 prefix, max 11 chars
  const handlePhone = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && !val.startsWith('09')) {
      val = '09' + val.replace(/^0*9?/, '');
    }
    val = val.slice(0, 11);
    setFormData(prev => ({ ...prev, contact_number: val }));
  };

  const validate = () => {
    if (!formData.first_name.trim()) return 'First name is required.';
    if (!formData.last_name.trim())  return 'Last name is required.';
    if (!formData.email?.trim())     return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      return 'Please enter a valid email address (e.g. faculty@pnc.edu.ph).';
    if (formData.contact_number && formData.contact_number.length > 0) {
      if (!formData.contact_number.startsWith('09'))
        return 'Contact number must start with 09.';
      if (formData.contact_number.length !== 11)
        return 'Contact number must be exactly 11 digits (e.g. 09XXXXXXXXX).';
    }
    if (!formData.department_id) return 'Please select a department.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    setIsSubmitting(true);
    try {
      await api.faculties.create({ ...formData, email: formData.email.trim() });
      onFacultyAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create faculty. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const SectionHeader = ({ label }) => (
    <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>
      <span className="w-4 h-px bg-orange-400" />
      {label}
    </p>
  );

  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}` || '?';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border ${modalBg}`}>

          {/* Hero header */}
          <div className={`px-6 pt-6 pb-5 border-b ${divider} ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-orange-50/60 to-white'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>CCS Profiling System</p>
                <h3 className={`text-lg font-extrabold leading-tight ${boldText}`}>Register New Faculty Member</h3>
                <p className={`text-xs mt-0.5 ${subText}`}>Fill in the details below to add a new faculty member.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto max-h-[60vh]">

            {error && (
              <div className={`mb-5 border-l-4 border-red-500 p-3.5 rounded-xl flex items-center gap-3 ${dark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <svg className="h-4 w-4 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">

              {/* Personal Information */}
              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
                <SectionHeader label="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>First Name *</label>
                    <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Middle Name</label>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Last Name *</label>
                    <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={sel}>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inp} />
                  </div>
                  <div className={`p-3 rounded-xl border text-xs ${dark ? 'bg-amber-900/20 border-amber-700/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    <p className="font-bold mb-0.5">🔑 Default Password</p>
                    <p>{formData.date_of_birth ? `Birthdate: ${new Date(formData.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}` : 'Set birthdate above, or hire date will be used.'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
                <SectionHeader label="Employment Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Position *</label>
                    <input required type="text" name="position" value={formData.position} onChange={handleChange} placeholder="e.g. Associate Professor" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Department *</label>
                    <select required name="department_id" value={formData.department_id} onChange={handleChange} className={sel}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Employment Status</label>
                    <select name="employment_status" value={formData.employment_status} onChange={handleChange} className={sel}>
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Adjunct</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Hire Date</label>
                    <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className={inp} />
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className={`p-4 rounded-xl border ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
                <SectionHeader label="Contact & Location" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. faculty@pnc.edu.ph" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Contact Number <span className={`normal-case font-normal ${dark ? 'text-slate-500' : 'text-slate-400'}`}>(starts with 09)</span></label>
                    <input type="text" name="contact_number" value={formData.contact_number}
                      onChange={handlePhone} placeholder="09XXXXXXXXX" maxLength={11} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Office Location</label>
                    <input type="text" name="office_location" value={formData.office_location} onChange={handleChange} placeholder="e.g. Room 402, IT Bldg" className={inp} />
                  </div>
                  <div className="md:col-span-3">
                    <label className={lbl}>Consultation Hours</label>
                    <input type="text" name="office_hours" value={formData.office_hours} onChange={handleChange} placeholder="e.g. Mon–Fri 9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM" className={inp} />
                    <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Students will see this to know when to visit the CCS office.</p>
                  </div>
                </div>
              </div>

            </div>
          </form>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-end gap-3 border-t ${footerBg}`}>
            <button type="button" onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Cancel
            </button>
            <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center gap-2 min-w-[130px] justify-center">
              {isSubmitting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                : 'Register Faculty'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddFacultyModal;
