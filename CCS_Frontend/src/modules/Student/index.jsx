import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import StudentProfileTabs from './StudentProfileTabs';
import { useDarkMode } from '../../context/DarkModeContext';

const StudentModule = () => {
  const dark = useDarkMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, enrolled: 0, notEnrolled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Tailwind utility helpers keyed on dark mode ──────────────────
  const card   = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const header = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const tabBar = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const tabContent = dark ? 'bg-slate-950/40' : 'bg-slate-50/20';
  const divider = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const statIcon1 = dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-500';
  const statIcon2 = dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-500';
  const statIcon3 = dark ? 'bg-slate-800 text-slate-500'   : 'bg-slate-100 text-slate-400';
  const exportBtn = dark
    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const data = await api.students.getAll();
        setStudents(data);
        const enrolledCount    = data.filter(s => s.enrollment_status === 'Enrolled').length;
        const notEnrolledCount = data.filter(s => s.enrollment_status === 'Not Enrolled').length;
        setStats({ total: data.length, enrolled: enrolledCount, notEnrolled: notEnrolledCount });
      } catch (error) {
        console.error("Failed to load students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = async (id) => {
    try {
      setIsLoading(true);
      const data = await api.students.get(id);
      setSelectedStudent(data);
      setActiveTab('personal_details');
    } catch (error) {
      console.error("Failed to load student details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.students.getAll();
      setStudents(data);
      const enrolledCount    = data.filter(s => s.enrollment_status === 'Enrolled').length;
      const notEnrolledCount = data.filter(s => s.enrollment_status === 'Not Enrolled').length;
      setStats({ total: data.length, enrolled: enrolledCount, notEnrolled: notEnrolledCount });
      return data;
    } catch (error) {
      console.error("Failed to reload students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent  = () => setIsEditModalOpen(true);
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        await api.students.delete(id);
        await reloadStudents();
        setSelectedStudent(null);
        setActiveTab('overview');
      } catch (error) {
        console.error("Failed to delete student:", error);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  const tabs = [
    { id: 'overview',              label: 'Overview' },
    { id: 'personal_details',      label: 'Personal Details' },
    { id: 'skills_certifications', label: 'Skills & Certifications' },
    { id: 'academic_history',      label: 'Academic History' },
    { id: 'violations',            label: 'Violations' },
  ];

  return (
    <div className="flex flex-col h-full w-full">

      {/* ── Module Header ─────────────────────────────────────────── */}
      <div className={`flex justify-between items-end mb-8 p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${header}`}>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors duration-300 ${boldText}`}>
            Student Information
          </h1>
          <p className={`transition-colors duration-300 ${labelText}`}>
            Manage student profiles, academic records, and personal histories.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('http://localhost:8000/api/students/export/csv', '_blank')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${exportBtn}`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/30"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* ── Main Content Card ─────────────────────────────────────── */}
      <div className={`flex-1 rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-colors duration-300 ${card}`}>

        {/* Tabs */}
        <div className={`flex border-b px-6 pt-2 transition-colors duration-300 ${tabBar}`}>
          {tabs.filter(tab => selectedStudent || tab.id === 'overview' || tab.id === 'personal_details').map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'overview') setSelectedStudent(null);
                setActiveTab(tab.id);
              }}
              className={`px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-brand-500'
                  : dark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-t-lg'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`flex-1 p-8 overflow-y-auto transition-colors duration-300 ${tabContent}`}>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Student List */}
              <div className={`p-6 rounded-xl border shadow-sm col-span-2 transition-colors duration-300 ${card}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${boldText}`}>Recent Students</h3>
                  <button className="text-sm text-brand-500 hover:text-brand-400 font-medium">View All</button>
                </div>

                <div className={`divide-y max-h-[500px] overflow-y-auto pr-2 ${divider}`}>
                  {isLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className={`py-8 text-center ${labelText}`}>No students found.</div>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentClick(student.id)}
                        className={`py-4 flex items-center justify-between group cursor-pointer -mx-4 px-4 rounded-lg transition-colors ${rowHover}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold group-hover:text-brand-500 transition-colors ${boldText}`}>
                              {student.first_name} {student.middle_name ? student.middle_name[0] + '. ' : ''}{student.last_name}
                            </p>
                            <p className={`text-xs ${labelText}`}>
                              {student.program || 'N/A'} - {student.year_level || 'N/A'}
                            </p>
                            <p className={`text-xs ${labelText}`}>
                              {student.student_number ? `No. ${student.student_number}` : `ID: ${student.id}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {student.enrollment_status === 'Enrolled' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                              {student.enrollment_status}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
                              {student.enrollment_status}
                            </span>
                          )}
                          <p className={`text-xs mt-1 ${labelText}`}>ID: {student.id}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-300 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${labelText}`}>Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statIcon1}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Total Students</span>
                      </div>
                      <span className={`text-lg font-bold ${boldText}`}>{isLoading ? '...' : stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statIcon2}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Currently Enrolled</span>
                      </div>
                      <span className={`text-lg font-bold ${boldText}`}>{isLoading ? '...' : stats.enrolled}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${statIcon3}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                        <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Not Enrolled</span>
                      </div>
                      <span className={`text-lg font-bold ${boldText}`}>{isLoading ? '...' : stats.notEnrolled}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* No student selected */}
          {activeTab !== 'overview' && !selectedStudent && (
            <div className="h-full flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <svg className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className={`text-lg font-bold mb-1 ${boldText}`}>No Student Selected</h3>
              <p className={labelText}>Please select a student from the Overview tab to view their detailed profile.</p>
              <button
                onClick={() => setActiveTab('overview')}
                className={`mt-6 px-4 py-2 font-medium rounded-lg transition-colors ${dark ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                Return to Overview
              </button>
            </div>
          )}

          {/* Student profile */}
          {activeTab !== 'overview' && selectedStudent && (
            <StudentProfileTabs
              activeTab={activeTab}
              student={selectedStudent}
              onEditClick={handleEditStudent}
              onDeleteClick={handleDeleteStudent}
            />
          )}

        </div>
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStudentAdded={() => reloadStudents()}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onStudentUpdated={async () => {
          await reloadStudents();
          if (selectedStudent) handleStudentClick(selectedStudent.id);
        }}
      />
    </div>
  );
};

export default StudentModule;
