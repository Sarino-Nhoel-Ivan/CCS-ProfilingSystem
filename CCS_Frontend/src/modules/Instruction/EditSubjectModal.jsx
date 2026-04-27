import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const EditSubjectModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const dark = useDarkMode();
  const [formData, setFormData] = useState({
    subject_code: '',
    descriptive_title: '',
    lec_units: 3,
    lab_units: 0,
    pre_requisites: '',
    program: 'BSIT',
    year_level: '1st Year',
    semester: '1st Semester',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        subject_code: initialData.subject_code || '',
        descriptive_title: initialData.descriptive_title || '',
        lec_units: initialData.lec_units || 0,
        lab_units: initialData.lab_units || 0,
        pre_requisites: initialData.pre_requisites || '',
        program: initialData.program || 'BSIT',
        year_level: initialData.year_level || '1st Year',
        semester: initialData.semester || '1st Semester',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Dark mode tokens
  const modalBg  = dark ? 'bg-slate-900'        : 'bg-white';
  const headerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const titleClr = dark ? 'text-slate-100'       : 'text-slate-800';
  const closeBtn = dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100';
  const labelClr = dark ? 'text-slate-300'       : 'text-slate-700';
  const inputCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-brand-400/50 focus:border-brand-500'
    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-brand-500/50';
  const divider  = dark ? 'border-slate-700/60'  : 'border-slate-100';
  const cancelBtn= dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100';
  const errBox   = dark ? 'bg-red-900/30 border-red-800/50 text-red-300' : 'bg-red-50 border-red-100 text-red-600';

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!formData.subject_code || !formData.descriptive_title)
        throw new Error('Subject code and descriptive title are required.');
      await api.subjects.update(initialData.id, { ...formData, pre_requisites: formData.pre_requisites || null });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${modalBg} rounded-2xl shadow-xl w-full max-w-lg overflow-hidden`}>

        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${headerBg}`}>
          <h2 className={`text-xl font-bold ${titleClr}`}>Edit Subject</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${closeBtn}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className={`p-4 border rounded-xl text-sm flex items-start ${errBox}`}>
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {[
              { name: 'subject_code', label: 'Subject Code', placeholder: 'e.g. IT 111', required: true },
              { name: 'descriptive_title', label: 'Descriptive Title', placeholder: 'e.g. Introduction to Computing', required: true },
            ].map(f => (
              <div key={f.name}>
                <label className={`block text-sm font-semibold mb-1 ${labelClr}`}>
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text" name={f.name} value={formData[f.name]}
                  onChange={handleChange} placeholder={f.placeholder} required={f.required}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              {[{ name: 'lec_units', label: 'Lec Units' }, { name: 'lab_units', label: 'Lab Units' }].map(f => (
                <div key={f.name}>
                  <label className={`block text-sm font-semibold mb-1 ${labelClr}`}>
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" name={f.name} value={formData[f.name]}
                    onChange={handleChange} min="0" required
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-1 ${labelClr}`}>Pre-requisite(s)</label>
              <input
                type="text" name="pre_requisites" value={formData.pre_requisites}
                onChange={handleChange} placeholder="e.g. IT 111, CS 101 (Optional)"
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${inputCls}`}
              />
            </div>
          </div>

          <div className={`flex justify-end space-x-3 pt-4 border-t ${divider}`}>
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${cancelBtn}`}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/30 disabled:opacity-50 flex items-center">
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving...</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubjectModal;
