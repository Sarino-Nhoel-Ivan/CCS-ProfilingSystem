import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import AddFacultyModal from './AddFacultyModal';
import EditFacultyModal from './EditFacultyModal';
import FacultyDetailModal from './FacultyDetailModal';
import { useDarkMode } from '../../context/DarkModeContext';

const FacultyModule = () => {
  const dark = useDarkMode();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const card      = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  const divider   = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const exportBtn = dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
  const avatarBg  = dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-100 text-brand-600';
  const statIcon1 = dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-500';
  const statIcon2 = dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-500';

  const [faculties, setFaculties] = useState([]);
  const [stats, setStats] = useState({ total: 0, fullTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const reloadFaculties = async () => {
    try {
      setIsLoading(true);
      const data = await api.faculties.getAll();
      setFaculties(data);
      const fullTimeCount = data.filter(f => f.employment_status === 'Full-Time').length;
      setStats({ total: data.length, fullTime: fullTimeCount });
      return data;
    } catch (error) {
      console.error("Failed to load faculties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { reloadFaculties(); }, []);

  const handleFacultyClick  = (f) => {
    setSelectedFaculty(f);
    setIsDetailModalOpen(true);
    navigate(`/admin/reports/${f.id}`, { replace: true });
  };

  // Load faculty from URL param on mount
  useEffect(() => {
    if (routeId) {
      api.faculties.get(routeId).then(f => { setSelectedFaculty(f); setIsDetailModalOpen(true); }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleEditFaculty   = (f) => { setSelectedFaculty(f); setIsEditModalOpen(true); };
  const handleDeleteFaculty = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty member? This action cannot be undone.")) {
      try {
        await api.faculties.delete(id);
        await reloadFaculties();
        setIsDetailModalOpen(false);
        setSelectedFaculty(null);
      } catch { alert("Failed to delete faculty. Please try again."); }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">

      {/* Header */}
      <div className={`flex justify-between items-end mb-8 p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${card}`}>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors duration-300 ${boldText}`}>Faculty Information</h1>
          <p className={`transition-colors duration-300 ${labelText}`}>Manage faculty directory, employment details, and department assignments.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.open('http://localhost:8000/api/faculties/export/csv', '_blank')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${exportBtn}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Export
          </button>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/30">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Faculty
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Faculty List */}
          <div className={`p-6 rounded-xl border shadow-sm col-span-2 transition-colors duration-300 ${card}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold transition-colors duration-300 ${boldText}`}>Faculty Directory</h3>
              <button className="text-sm text-brand-500 hover:text-brand-400 font-medium">View All</button>
            </div>
            <div className={`divide-y max-h-[600px] overflow-y-auto pr-2 ${divider}`}>
              {isLoading ? (
                <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
              ) : faculties.length === 0 ? (
                <div className={`py-8 text-center ${labelText}`}>No faculty members found.</div>
              ) : (
                faculties.map((faculty) => (
                  <div key={faculty.id} onClick={() => handleFacultyClick(faculty)}
                    className={`py-4 flex items-center justify-between group cursor-pointer -mx-4 px-4 rounded-lg transition-colors ${rowHover}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarBg}`}>
                        {faculty.first_name[0]}{faculty.last_name[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold group-hover:text-brand-500 transition-colors ${boldText}`}>
                          {faculty.first_name} {faculty.middle_name ? faculty.middle_name[0] + '. ' : ''}{faculty.last_name}
                        </p>
                        <p className={`text-xs flex items-center mt-1 ${labelText}`}>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {faculty.position} • {faculty.department?.department_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        faculty.employment_status === 'Full-Time'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                      }`}>{faculty.employment_status}</span>
                      <p className={`text-xs mt-2 flex items-center justify-end ${labelText}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {faculty.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-300 ${card}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${labelText}`}>Faculty Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statIcon1}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Total Faculties</span>
                  </div>
                  <span className={`text-lg font-bold ${boldText}`}>{isLoading ? '...' : stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statIcon2}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Full-Time</span>
                  </div>
                  <span className={`text-lg font-bold ${boldText}`}>{isLoading ? '...' : stats.fullTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddFacultyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFacultyAdded={() => reloadFaculties()} />
      <FacultyDetailModal isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedFaculty(null); navigate('/admin/reports', { replace: true }); }}
        faculty={selectedFaculty}
        onEditClick={(f) => { setIsDetailModalOpen(false); handleEditFaculty(f); }}
        onDeleteClick={handleDeleteFaculty} />
      <EditFacultyModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        faculty={selectedFaculty}
        onFacultyUpdated={async () => {
          const data = await reloadFaculties();
          if (selectedFaculty) {
            const updated = data?.find(f => f.id === selectedFaculty.id);
            if (updated) { setSelectedFaculty(updated); setIsDetailModalOpen(true); }
          }
        }} />
    </div>
  );
};

export default FacultyModule;
