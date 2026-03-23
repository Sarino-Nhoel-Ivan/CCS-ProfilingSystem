import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

// Helpers
const getAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const d = new Date(birthDate);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

const getYearLevelColor = (yearLevel, dark) => {
  if (dark) {
    const c = {
      '1st Year': 'bg-sky-900/50 text-sky-300',
      '2nd Year': 'bg-violet-900/50 text-violet-300',
      '3rd Year': 'bg-amber-900/50 text-amber-300',
      '4th Year': 'bg-emerald-900/50 text-emerald-300',
    };
    return c[yearLevel] || 'bg-brand-900/40 text-brand-300';
  }
  const c = {
    '1st Year': 'bg-sky-100 text-sky-700',
    '2nd Year': 'bg-violet-100 text-violet-700',
    '3rd Year': 'bg-amber-100 text-amber-700',
    '4th Year': 'bg-emerald-100 text-emerald-700',
  };
  return c[yearLevel] || 'bg-brand-100 text-brand-600';
};

const getStudentTypeBadge = (type, dark) => {
  if (dark) {
    const m = {
      'Regular':    'bg-green-900/40  text-green-300  border border-green-700',
      'Irregular':  'bg-amber-900/40  text-amber-300  border border-amber-700',
      'Returnee':   'bg-sky-900/40    text-sky-300    border border-sky-700',
      'Shiftee':    'bg-violet-900/40 text-violet-300 border border-violet-700',
      'Transferee': 'bg-indigo-900/40 text-indigo-300 border border-indigo-700',
      'Graduated':  'bg-blue-900/40   text-blue-300   border border-blue-700',
      'Dropped':    'bg-red-900/40    text-red-300    border border-red-700',
      'LOA':        'bg-orange-900/40 text-orange-300 border border-orange-700',
      'Suspended':  'bg-rose-900/40   text-rose-300   border border-rose-700',
    };
    return m[type] || 'bg-slate-700 text-slate-300 border border-slate-600';
  }
  const m = {
    'Regular':    'bg-green-100  text-green-800  border border-green-200',
    'Irregular':  'bg-amber-100  text-amber-800  border border-amber-200',
    'Returnee':   'bg-sky-100    text-sky-800    border border-sky-200',
    'Shiftee':    'bg-violet-100 text-violet-800 border border-violet-200',
    'Transferee': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    'Graduated':  'bg-blue-100   text-blue-800   border border-blue-200',
    'Dropped':    'bg-red-100    text-red-800    border border-red-200',
    'LOA':        'bg-orange-100 text-orange-800 border border-orange-200',
    'Suspended':  'bg-rose-100   text-rose-800   border border-rose-200',
  };
  return m[type] || 'bg-slate-100 text-slate-700 border border-slate-200';
};

const StudentProfileTabs = ({ activeTab, student, onEditClick, onDeleteClick }) => {
  const dark = useDarkMode();

  // Theme tokens
  const wrap      = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const subText   = dark ? 'text-slate-400' : 'text-slate-500';
  const divider   = dark ? 'border-slate-700/60' : 'border-slate-100';
  const section   = dark ? 'border-slate-700/60' : 'border-slate-200';
  const labelRow  = dark ? 'text-slate-400' : 'text-slate-500';
  const valueRow  = dark ? 'text-slate-200' : 'text-slate-800';
  const addrBox   = dark ? 'bg-slate-800 text-slate-200'  : 'bg-slate-50 text-slate-800';
  const addrLabel = dark ? 'text-slate-500' : 'text-slate-400';
  const cardBdr   = dark ? 'border-slate-700/60 bg-slate-800' : 'border-slate-200 bg-white';
  const theadRow  = dark ? 'bg-slate-800 text-slate-400'   : 'bg-slate-50 text-slate-500';
  const tbDivide  = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const trHover   = dark ? 'hover:bg-slate-800'  : 'hover:bg-slate-50';
  const editBtn   = dark ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-slate-100' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900';
  const actionBox = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const skillCard = dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white';
  const skillFoot = dark ? 'border-slate-700' : 'border-slate-100';
  const skillLevel= dark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-600';
  const affCard   = dark ? 'border-slate-700' : 'border-slate-200';
  const affIcon   = dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-500';
  const medCard   = dark ? 'bg-red-900/20 border-red-800/40' : 'bg-red-50/50 border-red-100';
  const medHead   = dark ? 'border-red-800/40 text-slate-300' : 'border-red-100 text-slate-700';
  const medBlood  = dark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700';
  const condLabel = dark ? 'text-slate-500' : 'text-slate-500';
  const condText  = dark ? 'text-slate-200' : 'text-slate-800';
  const emergBox  = dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-50';
  const emergIcon = dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500';
  const honorsBox = dark ? 'bg-amber-900/20 border-amber-800/40' : 'bg-amber-50/60 border-amber-100';

  if (!student) return null;

  return (
    <div className={`p-6 rounded-2xl shadow-sm border min-h-[500px] transition-colors duration-300 ${wrap}`}>

      {/* Student Header Summary */}
      <div className={`flex items-center space-x-6 mb-8 pb-6 border-b ${divider}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 ${getYearLevelColor(student.year_level, dark)}`}>
          {student.first_name[0]}{student.last_name[0]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className={`text-2xl font-bold ${boldText}`}>
              {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name} {student.suffix || ''}
            </h2>
            <div className="flex space-x-2">
              <button onClick={() => onEditClick(student)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center ${editBtn}`}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={() => onDeleteClick(student.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center ${dark ? 'text-red-400 bg-red-900/30 hover:bg-red-900/50' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>
          <div className={`flex space-x-4 mt-2 text-sm ${subText}`}>
            <span className="flex items-center">
              <svg className={`w-4 h-4 mr-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              Student No: {student.student_number || student.id}
            </span>
            <span className="flex items-center">
              <svg className={`w-4 h-4 mr-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {student.program || 'N/A'} · {student.year_level}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStudentTypeBadge(student.student_type, dark)}`}>
              {student.student_type}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal_details' && (
        <div className="space-y-10">

          {/* Basic Info + Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Basic Information</h3>
              <div className="space-y-3">
                {[
                  ['Gender', student.gender],
                  ['Place of Birth', student.place_of_birth],
                  ['Nationality', student.nationality],
                  ['Civil Status', student.civil_status],
                  ['Religion', student.religion],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className={`text-sm ${labelRow}`}>{label}</span>
                    <span className={`font-medium text-sm ${valueRow}`}>{val || 'N/A'}</span>
                  </div>
                ))}
                <div className="flex justify-between items-baseline">
                  <span className={`text-sm ${labelRow}`}>Birth Date</span>
                  <div className="text-right">
                    <span className={`font-medium text-sm ${valueRow}`}>
                      {student.birth_date ? new Date(student.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                    {getAge(student.birth_date) !== null && (
                      <span className={`ml-2 text-xs ${subText}`}>({getAge(student.birth_date)} yrs old)</span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className={`text-lg font-bold mt-8 mb-4 border-b pb-2 ${boldText} ${divider}`}>Enrollment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${labelRow}`}>Date Enrolled</span>
                  <span className={`font-medium text-sm ${valueRow}`}>
                    {student.date_enrolled ? new Date(student.date_enrolled).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                {student.section && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${labelRow}`}>Section</span>
                    <span className={`font-medium text-sm ${valueRow}`}>{student.section}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={`text-sm ${labelRow}`}>Student Type</span>
                  <span className={`font-medium text-sm ${valueRow}`}>{student.student_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${labelRow}`}>Enrollment Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    student.enrollment_status === 'Enrolled'
                      ? (dark ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200')
                      : (dark ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-slate-100 text-slate-600 border border-slate-200')
                  }`}>{student.enrollment_status || 'N/A'}</span>
                </div>
              </div>

              <h3 className={`text-lg font-bold mt-8 mb-4 border-b pb-2 ${boldText} ${divider}`}>Contact Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${labelRow}`}>Email Address</span>
                  <span className="font-medium text-sm text-brand-500">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${labelRow}`}>Contact Number</span>
                  <span className={`font-medium text-sm ${valueRow}`}>{student.contact_number}</span>
                </div>
                {student.alternate_contact_number && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${labelRow}`}>Alt. Number</span>
                    <span className={`font-medium text-sm ${valueRow}`}>{student.alternate_contact_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Address</h3>
              <div className={`space-y-3 p-4 rounded-lg ${addrBox}`}>
                {[['Street', student.street], ['Barangay', student.barangay]].map(([label, val]) => (
                  <p key={label} className="text-sm">
                    <span className={`block text-xs uppercase mb-1 ${addrLabel}`}>{label}</span>
                    {val || 'N/A'}
                  </p>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm"><span className={`block text-xs uppercase mb-1 ${addrLabel}`}>City</span>{student.city}</p>
                  <p className="text-sm"><span className={`block text-xs uppercase mb-1 ${addrLabel}`}>Province</span>{student.province || 'N/A'}</p>
                </div>
                <p className="text-sm"><span className={`block text-xs uppercase mb-1 ${addrLabel}`}>Zip Code</span>{student.zip_code || 'N/A'}</p>
              </div>

              <h3 className={`text-lg font-bold mt-8 mb-4 border-b pb-2 ${boldText} ${divider}`}>Guardians</h3>
              {student.guardians && student.guardians.length > 0 ? (
                <div className="space-y-4">
                  {student.guardians.map(g => (
                    <div key={g.id} className={`border text-sm p-3 rounded-lg shadow-sm ${cardBdr}`}>
                      <p className={`font-bold ${boldText}`}>{g.full_name} <span className={`font-normal text-xs ${subText}`}>({g.relationship})</span></p>
                      <p className={`text-xs mt-1 ${subText}`}>{g.contact_number}</p>
                      <p className={`text-xs ${subText}`}>{g.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm italic ${subText}`}>No guardians recorded.</p>
              )}
            </div>
          </div>

          {/* Medical Records + Emergency Contacts */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t ${divider}`}>
            <div>
              <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Medical Records</h3>
              {student.medical_histories && student.medical_histories.length > 0 ? (
                <div className="space-y-4">
                  {student.medical_histories.map(mh => (
                    <div key={mh.id} className={`border p-4 rounded-xl ${medCard}`}>
                      <div className={`flex justify-between items-center mb-3 pb-3 border-b ${medHead}`}>
                        <span className={`font-semibold text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Blood Type</span>
                        <span className={`font-bold px-3 py-1 rounded text-sm ${medBlood}`}>{mh.bloodtype || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className={`text-xs font-semibold uppercase block mb-1 ${condLabel}`}>Existing Conditions / Allergies</span>
                        <p className={`text-sm ${condText}`}>{mh.existing_conditions || 'None reported'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm italic ${subText}`}>No medical history recorded.</p>
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Emergency Contacts</h3>
              {student.medical_histories && student.medical_histories.length > 0 ? (
                <div className="space-y-3">
                  {student.medical_histories.map(mh => (
                    <div key={mh.id} className={`flex items-center space-x-4 p-4 rounded-lg ${emergBox}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emergIcon}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${boldText}`}>{mh.emergency_contact_name}</p>
                        <p className="text-sm text-brand-500 font-medium">{mh.emergency_contact_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm italic ${subText}`}>No emergency contacts recorded.</p>
              )}
            </div>
          </div>

          {/* Affiliations */}
          <div className={`pt-4 border-t ${divider}`}>
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Affiliations & Organizations</h3>
            {student.affiliations && student.affiliations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.affiliations.map(aff => (
                  <div key={aff.id} className={`border p-4 rounded-xl flex items-start space-x-4 ${affCard}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${affIcon}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${boldText}`}>{aff.organization_name}</h4>
                      <p className={`text-xs mb-1 ${subText}`}>{aff.position} • {aff.status}</p>
                      <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Joined: {aff.date_joined} {aff.date_ended ? `- Ended: ${aff.date_ended}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm italic ${subText}`}>No affiliations recorded.</p>
            )}
          </div>

        </div>
      )}

      {/* Skills & Certifications Tab */}
      {activeTab === 'skills_certifications' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Skills & Certifications</h3>
          {student.skills && student.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.skills.map(skill => (
                <div key={skill.id} className={`border p-4 rounded-xl ${skillCard}`}>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-white bg-brand-500 px-2 py-0.5 rounded uppercase tracking-wider">{skill.skill_category}</span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 ${boldText}`}>{skill.skill_name}</h4>
                  <p className={`text-xs mb-3 line-clamp-2 ${subText}`}>{skill.description}</p>
                  <div className={`mt-auto pt-3 border-t flex justify-between items-center ${skillFoot}`}>
                    <span className={`text-xs font-medium border px-2 py-1 rounded ${skillLevel}`}>Level: {skill.pivot?.skill_level || 'N/A'}</span>
                    {skill.pivot?.certification && (
                      <span className={`text-xs flex items-center font-medium ${dark ? 'text-green-400' : 'text-green-600'}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Certified
                      </span>
                    )}
                  </div>
                  {skill.pivot?.certification && (
                    <div className={`mt-2 text-xs ${subText}`}>
                      <p className="font-semibold">{skill.pivot.certification_name}</p>
                      <p>Date: {skill.pivot.certification_date}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm italic ${subText}`}>No skills recorded.</p>
          )}
        </div>
      )}

      {/* Academic History Tab */}
      {activeTab === 'academic_history' && (
        <div className="space-y-8">
          {/* Academic Background */}
          <div>
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Academic Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg space-y-3 ${addrBox}`}>
                {[['LRN', student.lrn], ['Last School Attended', student.last_school_attended], ['Last Year Attended', student.last_year_attended]].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className={`text-sm ${labelRow}`}>{label}</span>
                    <span className={`font-medium text-sm text-right max-w-[60%] ${valueRow}`}>{val || 'N/A'}</span>
                  </div>
                ))}
              </div>
              <div className={`border p-4 rounded-lg ${honorsBox}`}>
                <span className={`text-xs font-bold uppercase block mb-2 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>Honors / Awards Received</span>
                <p className={`text-sm ${valueRow}`}>{student.honors_received || 'None recorded'}</p>
              </div>
            </div>
          </div>

          {/* Academic History */}
          <div>
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Academic History</h3>
            {student.academic_histories && student.academic_histories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className={`${theadRow}`}>
                      <th className="p-3 font-semibold rounded-tl-lg">School Year</th>
                      <th className="p-3 font-semibold">Semester</th>
                      <th className="p-3 font-semibold text-center">GPA</th>
                      <th className="p-3 font-semibold">Standing</th>
                      <th className="p-3 font-semibold text-right rounded-tr-lg">Units</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tbDivide}`}>
                    {student.academic_histories.map(ah => (
                      <tr key={ah.id} className={trHover}>
                        <td className={`p-3 ${valueRow}`}>{ah.school_year}</td>
                        <td className={`p-3 ${valueRow}`}>{ah.semester}</td>
                        <td className="p-3 text-center font-bold text-brand-500">{ah.gpa}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ah.academic_standing === 'Good Standing'
                              ? (dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700')
                              : (dark ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                          }`}>{ah.academic_standing}</span>
                        </td>
                        <td className={`p-3 text-right ${subText}`}>{ah.completed_units} / {ah.total_units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-sm italic ${subText}`}>No academic history recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${boldText} ${divider}`}>Violations / Disciplinary Records</h3>
          {student.violations && student.violations.length > 0 ? (
            <div className="space-y-4">
              {student.violations.map(v => (
                <div key={v.id} className={`border p-4 rounded-xl ${
                  v.severity_level === 'High'
                    ? (dark ? 'border-red-800/50 bg-red-900/20' : 'border-red-200 bg-red-50/30')
                    : v.severity_level === 'Medium'
                    ? (dark ? 'border-yellow-800/50 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50/30')
                    : (dark ? 'border-slate-700' : 'border-slate-200')
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-sm ${boldText}`}>{v.violation_type}</h4>
                      <p className={`text-xs mt-1 ${subText}`}>Reported: {v.date_reported} by {v.reported_by}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      v.severity_level === 'High'
                        ? (dark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700')
                        : v.severity_level === 'Medium'
                        ? (dark ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                        : (dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700')
                    }`}>{v.severity_level}</span>
                  </div>
                  <p className={`text-sm mt-3 mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{v.description}</p>
                  <div className={`p-3 rounded border text-sm ${actionBox}`}>
                    <p className={`font-semibold text-xs uppercase mb-1 ${boldText}`}>Action Taken</p>
                    <p className={`mb-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{v.action_taken || 'Pending'}</p>
                    <div className={`flex justify-between items-center text-xs border-t pt-2 ${dark ? 'border-slate-700 text-slate-500' : 'border-slate-50 text-slate-500'}`}>
                      <span>Status: <strong className={v.status === 'Resolved' ? 'text-green-500' : 'text-yellow-500'}>{v.status}</strong></span>
                      <span>Resolution Date: {v.resolution_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`border p-6 rounded-xl text-center ${dark ? 'bg-green-900/20 border-green-800/40' : 'bg-green-50 border-green-100'}`}>
              <svg className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-green-500' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h4 className={`text-lg font-bold mb-1 ${dark ? 'text-green-300' : 'text-green-800'}`}>Clean Record</h4>
              <p className={`text-sm ${dark ? 'text-green-500' : 'text-green-600'}`}>This student has no recorded violations.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StudentProfileTabs;
