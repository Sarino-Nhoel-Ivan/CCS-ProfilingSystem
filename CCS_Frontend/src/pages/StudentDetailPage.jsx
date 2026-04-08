import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import StudentProfileTabs from '../modules/Student/StudentProfileTabs';
import { useDarkMode } from '../context/DarkModeContext';

/**
 * Dynamic route: /admin/users/:id  /student/users/:id  /faculty/users/:id
 * Loads a student by :id and renders their full profile.
 */
const StudentDetailPage = ({ backPath }) => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dark         = useDarkMode();
  const [student, setStudent]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    api.students.get(id)
      .then(setStudent)
      .catch(() => setError('Student not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const card = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
      <button onClick={() => navigate(backPath ?? -1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Go Back
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={() => navigate(backPath ?? -1)}
        className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-800'}`}>
        <ArrowLeftIcon className="w-4 h-4" />
        Back to list
      </button>

      {/* Profile */}
      <StudentProfileTabs
        activeTab="personal_details"
        student={student}
        onEditClick={() => {}}
        onDeleteClick={() => {}}
      />
    </div>
  );
};

export default StudentDetailPage;
