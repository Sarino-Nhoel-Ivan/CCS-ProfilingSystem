import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, studentName }) => {
  const dark = useDarkMode();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-xl border p-6 transition-colors ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Icon */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>Delete Student</h2>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>This action cannot be undone.</p>
          </div>
        </div>

        <p className={`text-sm mb-6 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          Are you sure you want to delete{' '}
          <span className={`font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{studentName}</span>?
          All associated records will be permanently removed.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
