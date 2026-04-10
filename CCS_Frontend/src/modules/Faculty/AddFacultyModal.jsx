import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const AddFacultyModal = ({ isOpen, onClose, onFacultyAdded }) => {
  const dark = useDarkMode();
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    position: 'Instructor I',
    employment_status: 'Full-Time',
    hire_date: new Date().toISOString().split('T')[0],
    email: '',
    contact_number: '',
    office_location: '',
    department_id: ''
  });

  // Dark mode tokens
  const modalBg   = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const headerBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const footerBg  = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const inp = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-brand-500'}`;
  const sel = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-brand-400' : 'bg-white border-slate-300 text-slate-900 focus:border-brand-500'}`;
  const lbl = `block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`;
  const boldText  = dark ? 'text-slate-100' : 'text-slate-900';
  const sectionHead = `text-sm font-semibold uppercase tracking-wider mb-4 border-b pb-2 ${dark ? 'text-brand-400 border-slate-700' : 'text-brand-600 border-brand-100'}`;
  const cancelBtn = dark
    ? 'bg-slate-800 text-slate-200 ring-1 ring-inset ring-slate-600 hover:bg-slate-700'
    : 'bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50';

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const deptData = await api.departments.getAll();
      setDepartments(deptData);
      if (deptData.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: deptData[0].id }));
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!formData.email || !formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address (e.g. faculty@pnc.edu.ph).');
      return;
    }
    if (!formData.department_id) {
      setError('Please select a department.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.faculties.create({
        ...formData,
        email: formData.email.trim(),
      });
      onFacultyAdded();
      onClose();
      setFormData({...formData, first_name: '', last_name: '', email: '', contact_number: ''});
    } catch (err) {
      setError(err.message || 'Failed to create faculty. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border ${modalBg}`}>

          <div className={`px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b ${headerBg}`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold leading-6 ${boldText}`}>
                Register New Faculty Member
              </h3>
              <button onClick={onClose} className={`${dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-500'}`}>
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto max-h-[70vh]">

            {error && (
              <div className={`mb-6 border-l-4 border-red-500 p-4 rounded-md flex items-center ${dark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className={sectionHead}>Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className={sectionHead}>Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Position *</label>
                    <input required type="text" name="position" value={formData.position} onChange={handleChange} placeholder="e.g. Associate Professor" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Department *</label>
                    <select required name="department_id" value={formData.department_id} onChange={handleChange} className={sel}>
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.department_name}</option>
                      ))}
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
                    <input required type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className={inp} />
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div>
                <h4 className={sectionHead}>Contact & Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. faculty@pnc.edu.ph" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Contact Number</label>
                    <input required type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Office Location</label>
                    <input required type="text" name="office_location" value={formData.office_location} onChange={handleChange} placeholder="e.g. Room 402, IT Bldg" className={inp} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 mt-8 -mx-6 -mb-4 border-t ${footerBg}`}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 sm:ml-3 sm:w-auto transition-colors disabled:opacity-50 relative"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Register Faculty'
                )}
              </button>
              <button
                type="button"
                className={`mt-3 inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold shadow-sm sm:mt-0 sm:w-auto transition-colors ${cancelBtn}`}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFacultyModal;
