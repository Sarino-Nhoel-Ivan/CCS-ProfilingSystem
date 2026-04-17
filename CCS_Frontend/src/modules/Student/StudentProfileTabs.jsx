import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { STORAGE_URL } from '../../utils/config';
import {
  CheckBadgeIcon,
  SparklesIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';

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
        <div className="w-20 h-20 rounded-full shrink-0 overflow-hidden">
          {(() => {
            const src = student.profile_photo
              ? (student.profile_photo.startsWith('http')
                  ? student.profile_photo
                  : `${STORAGE_URL}/${student.profile_photo}`)
              : null;
            return src
              ? <img src={src} alt={`${student.first_name} ${student.last_name}`} className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
              : null;
          })()}
          <div className={`w-full h-full flex items-center justify-center font-bold text-2xl ${getYearLevelColor(student.year_level, dark)}`}
            style={{ display: student.profile_photo ? 'none' : 'flex' }}>
            {student.first_name[0]}{student.last_name[0]}
          </div>
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
        <div className="space-y-5">

          {/* Row 1: Basic Info + Enrollment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Basic Information</p>
              <div className="space-y-0">
                {[['Gender',student.gender],['Place of Birth',student.place_of_birth],['Nationality',student.nationality],['Civil Status',student.civil_status],['Religion',student.religion]].map(([label,val])=>(
                  <div key={label} className={`flex items-center justify-between py-2.5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
                    <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>{label}</span>
                    <span className={`text-sm font-semibold ${valueRow}`}>{val||'N/A'}</span>
                  </div>
                ))}
                <div className={`flex items-center justify-between py-2.5`}>
                  <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Birth Date</span>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${valueRow}`}>{student.birth_date?new Date(student.birth_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'N/A'}</span>
                    {getAge(student.birth_date)!==null&&<span className={`ml-2 text-xs ${subText}`}>({getAge(student.birth_date)} yrs old)</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Enrollment Details</p>
              <div className="space-y-0">
                {[['Date Enrolled',student.date_enrolled?new Date(student.date_enrolled).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'N/A'],['Section',student.section],['Student Type',student.student_type]].map(([label,val])=>(
                  <div key={label} className={`flex items-center justify-between py-2.5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
                    <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>{label}</span>
                    <span className={`text-sm font-semibold ${valueRow}`}>{val||'N/A'}</span>
                  </div>
                ))}
                <div className={`flex items-center justify-between py-2.5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
                  <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Enrollment Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${student.enrollment_status==='Enrolled'?(dark?'bg-green-900/40 text-green-300 border border-green-700':'bg-green-100 text-green-700 border border-green-200'):(dark?'bg-slate-700 text-slate-300 border border-slate-600':'bg-slate-100 text-slate-600 border border-slate-200')}`}>
                    {student.enrollment_status==='Enrolled'&&<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>}{student.enrollment_status||'N/A'}
                  </span>
                </div>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-5 mb-3 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Contact Details</p>
              <div className="space-y-0">
                <div className={`flex items-center justify-between py-2.5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
                  <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Email</span>
                  <span className={`text-sm font-semibold ${dark?'text-orange-400':'text-orange-600'}`}>{student.email||'N/A'}</span>
                </div>
                <div className={`flex items-center justify-between py-2.5 ${student.alternate_contact_number?`border-b ${dark?'border-slate-700/60':'border-slate-100'}`:''}`}>
                  <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Contact Number</span>
                  <span className={`text-sm font-semibold ${valueRow}`}>{student.contact_number||'N/A'}</span>
                </div>
                {student.alternate_contact_number&&(
                  <div className="flex items-center justify-between py-2.5">
                    <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>Alt. Number</span>
                    <span className={`text-sm font-semibold ${valueRow}`}>{student.alternate_contact_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Address + Guardians */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Address</p>
              <div className="grid grid-cols-2 gap-2">
                {[{label:'Street',value:student.street,full:true},{label:'Barangay',value:student.barangay,full:true},{label:'City',value:student.city},{label:'Province',value:student.province},{label:'Zip Code',value:student.zip_code}].map(({label,value,full})=>(
                  <div key={label} className={`${full?'col-span-2':''} ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-100'} border rounded-xl p-3`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${dark?'text-slate-500':'text-slate-400'}`}>{label}</p>
                    <p className={`text-sm font-semibold ${valueRow}`}>{value||'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Guardians</p>
              {student.guardians&&student.guardians.length>0?(
                <div className="space-y-3">
                  {student.guardians.map(g=>(
                    <div key={g.id} className={`flex items-start gap-3 p-3 rounded-xl border ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${dark?'bg-orange-900/40 text-orange-400':'bg-orange-50 text-orange-600'}`}>{g.full_name?.[0]||'?'}</div>
                      <div><p className={`text-sm font-bold ${boldText}`}>{g.full_name}<span className={`ml-1.5 text-xs font-normal ${subText}`}>({g.relationship})</span></p>
                        <p className={`text-xs mt-0.5 ${subText}`}>{g.contact_number}</p>
                        <p className={`text-xs ${subText}`}>{g.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ):(
                <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark?'border-slate-700 bg-slate-800/40':'border-slate-100 bg-white'}`}>
                  <svg className={`w-8 h-8 mb-2 ${dark?'text-slate-600':'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <p className={`text-xs ${subText}`}>No guardians recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Medical + Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Medical Records</p>
              {student.medical_histories&&student.medical_histories.length>0?(
                <div className="space-y-3">
                  {student.medical_histories.map(mh=>(
                    <div key={mh.id} className={`rounded-xl border p-4 ${medCard}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${dark?'text-slate-400':'text-slate-500'}`}>Blood Type</span>
                        <span className={`font-bold text-sm px-3 py-1 rounded-lg ${medBlood}`}>{mh.bloodtype||'Unknown'}</span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${condLabel}`}>Conditions / Allergies</p>
                      <p className={`text-sm ${condText}`}>{mh.existing_conditions||'None reported'}</p>
                    </div>
                  ))}
                </div>
              ):(
                <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark?'border-slate-700 bg-slate-800/40':'border-slate-100 bg-white'}`}>
                  <svg className={`w-8 h-8 mb-2 ${dark?'text-slate-600':'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <p className={`text-xs ${subText}`}>No medical history recorded</p>
                </div>
              )}
            </div>
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Emergency Contacts</p>
              {student.medical_histories&&student.medical_histories.length>0&&student.medical_histories.some(mh=>mh.emergency_contact_name)?(
                <div className="space-y-3">
                  {student.medical_histories.filter(mh=>mh.emergency_contact_name).map(mh=>(
                    <div key={mh.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${emergIcon}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${boldText}`}>{mh.emergency_contact_name||'N/A'}</p>
                        <p className={`text-xs font-semibold ${dark?'text-orange-400':'text-orange-600'}`}>{mh.emergency_contact_number||'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ):(
                <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark?'border-slate-700 bg-slate-800/40':'border-slate-100 bg-white'}`}>
                  <svg className={`w-8 h-8 mb-2 ${dark?'text-slate-600':'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <p className={`text-xs ${subText}`}>No emergency contacts recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Affiliations */}
          <div className={`rounded-2xl border p-5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/60 border-slate-100'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}><span className="w-4 h-px bg-orange-400" />Affiliations & Organizations</p>
            {student.affiliations&&student.affiliations.length>0?(
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.affiliations.map(aff=>(
                  <div key={aff.id} className={`flex items-start gap-3 p-3 rounded-xl border ${affCard}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${affIcon}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${boldText}`}>{aff.organization_name}</p>
                      <p className={`text-xs ${subText}`}>{aff.position} · {aff.status}</p>
                      <p className={`text-xs mt-0.5 ${dark?'text-slate-500':'text-slate-400'}`}>Joined: {aff.date_joined}{aff.date_ended?` — Ended: ${aff.date_ended}`:''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark?'border-slate-700 bg-slate-800/40':'border-slate-100 bg-white'}`}>
                <svg className={`w-8 h-8 mb-2 ${dark?'text-slate-600':'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p className={`text-xs ${subText}`}>No affiliations recorded</p>
              </div>
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
              {student.skills.map(skill => {
                const isCertified = skill.pivot?.certification;
                const isAcademic  = skill.skill_category?.toLowerCase() === 'academic';
                return (
                  <div key={skill.id} className={`relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group ${dark ? `skillCard hover:shadow-brand-500/20 hover:border-brand-500/40` : `skillCard hover:shadow-orange-200/80 hover:border-orange-300/60`} ${skillCard}`}>
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isAcademic ? 'bg-gradient-to-b from-brand-400 to-brand-600' : 'bg-gradient-to-b from-orange-400 to-orange-500'}`} />
                    <div className="pl-4 pr-5 pt-5 pb-5">
                      {/* Category badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isAcademic ? (dark ? 'bg-brand-900/40 text-brand-300' : 'bg-brand-50 text-brand-600') : (dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-50 text-orange-600')}`}>
                          {isAcademic ? <AcademicCapIcon className="w-3 h-3" /> : <SparklesIcon className="w-3 h-3" />}
                          {skill.skill_category}
                        </span>
                        {isCertified && (
                          <CheckBadgeSolid className={`w-5 h-5 ${dark ? 'text-green-400' : 'text-green-500'}`} />
                        )}
                      </div>

                      {/* Skill name & description */}
                      <h4 className={`font-bold text-sm mb-1 ${boldText}`}>{skill.skill_name}</h4>
                      <p className={`text-xs mb-4 line-clamp-2 ${subText}`}>{skill.description || 'No description available.'}</p>

                      {/* Level + certified footer */}
                      <div className={`pt-3 border-t flex items-center justify-between ${skillFoot}`}>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-lg ${skillLevel}`}>
                          <TagIcon className="w-3 h-3" />
                          {skill.pivot?.skill_level || 'N/A'}
                        </span>
                        {isCertified
                          ? <span className={`inline-flex items-center gap-1 text-xs font-semibold ${dark ? 'text-green-400' : 'text-green-600'}`}>
                              <CheckBadgeIcon className="w-4 h-4" />
                              Certified
                            </span>
                          : <span className={`text-xs ${subText}`}>Not certified</span>
                        }
                      </div>

                      {/* Certification details */}
                      {isCertified && (skill.pivot.certification_name || skill.pivot.certification_date) && (
                        <div className={`mt-3 p-3 rounded-xl text-xs space-y-1 ${dark ? 'bg-green-900/20 border border-green-800/40' : 'bg-green-50 border border-green-100'}`}>
                          {skill.pivot.certification_name && (
                            <p className={`font-semibold flex items-center gap-1.5 ${dark ? 'text-green-300' : 'text-green-700'}`}>
                              <CheckBadgeIcon className="w-3.5 h-3.5 shrink-0" />
                              {skill.pivot.certification_name}
                            </p>
                          )}
                          {skill.pivot.certification_date && (
                            <p className={`flex items-center gap-1.5 ${dark ? 'text-green-400/70' : 'text-green-600/80'}`}>
                              <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                              {skill.pivot.certification_date}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 rounded-2xl border ${dark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
              <SparklesIcon className={`w-10 h-10 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm font-medium ${subText}`}>No skills recorded.</p>
            </div>
          )}
        </div>
      )}

      {/* Academic History Tab */}
      {activeTab === 'academic_history' && (
        <div className="space-y-5">

          {/* Section header */}
          <div className={`flex items-center justify-between pb-4 border-b ${divider}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${boldText}`}>Academic History</h3>
                <p className={`text-xs ${subText}`}>Schools attended and academic performance records</p>
              </div>
            </div>
            {student.academic_histories && student.academic_histories.length > 0 && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {student.academic_histories.length} record{student.academic_histories.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {student.academic_histories && student.academic_histories.length > 0 ? (
            <div className="space-y-4">
              {student.academic_histories.map((ah, idx) => {
                const isGoodStanding = ah.academic_standing === 'Good Standing';
                const gpa = parseFloat(ah.gpa);
                // Philippine GPA: 1.0 is highest, 5.0 is failing — normalize for ring (1.0=100%, 5.0=0%)
                const gpaPct = !isNaN(gpa) ? Math.round(Math.max(0, Math.min(100, ((5 - gpa) / 4) * 100))) : 0;
                const gpaColor = gpa <= 1.5 ? '#22c55e' : gpa <= 2.5 ? '#f97316' : gpa <= 3.0 ? '#eab308' : '#ef4444';
                const completedUnits = parseInt(ah.completed_units) || 0;
                const totalUnits    = parseInt(ah.total_units) || 0;
                const unitsPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

                return (
                  <div key={ah.id} className={`relative rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${dark ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isGoodStanding ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-gradient-to-b from-yellow-400 to-amber-500'}`} />
                    <div className="pl-4 pr-5 pt-5 pb-5">
                      <div className="flex items-start gap-4">

                        {/* GPA Ring */}
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth="3" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke={gpaColor} strokeWidth="3"
                                strokeDasharray={`${gpaPct} ${100 - gpaPct}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-sm font-extrabold leading-none`} style={{ color: gpaColor }}>{ah.gpa || '—'}</span>
                              <span className={`text-[8px] font-bold uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>GPA</span>
                            </div>
                          </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h4 className={`font-bold text-sm leading-tight ${boldText}`}>{ah.school_name || 'Unknown School'}</h4>
                              <div className={`flex items-center gap-3 mt-1 text-xs ${subText}`}>
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {ah.school_year}
                                </span>
                                <span className={`${dark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                                <span>{ah.semester}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                  #{idx + 1}
                                </span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              isGoodStanding
                                ? (dark ? 'bg-green-900/40 text-green-300 border border-green-800/50' : 'bg-green-100 text-green-700 border border-green-200')
                                : (dark ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/50' : 'bg-yellow-100 text-yellow-700 border border-yellow-200')
                            }`}>
                              {isGoodStanding
                                ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              }
                              {ah.academic_standing || 'N/A'}
                            </span>
                          </div>

                          {/* Units progress bar */}
                          {totalUnits > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Units Completed</span>
                                <span className={`text-[10px] font-bold ${boldText}`}>{completedUnits} / {totalUnits}</span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <div className={`h-full rounded-full transition-all duration-700 ${isGoodStanding ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-amber-500'}`}
                                  style={{ width: `${unitsPct}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Honors */}
                          {ah.honors && (
                            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${dark ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              {ah.honors}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-14 rounded-2xl border ${dark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <AcademicCapIcon className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <h4 className={`text-base font-bold mb-1 ${boldText}`}>No Academic History</h4>
              <p className={`text-sm ${subText}`}>No academic records have been recorded for this student.</p>
            </div>
          )}
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="space-y-5">

          {/* Section header with count badge */}
          <div className={`flex items-center justify-between pb-4 border-b ${divider}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </div>
              <div>
                <h3 className={`text-base font-bold ${boldText}`}>Violations / Disciplinary Records</h3>
                <p className={`text-xs ${subText}`}>Incident and disciplinary history for this student</p>
              </div>
            </div>
            {student.violations && student.violations.length > 0 && (
              <div className="flex items-center gap-2">
                {['High','Medium','Low'].map(level => {
                  const count = student.violations.filter(v => v.severity_level === level).length;
                  if (!count) return null;
                  const cls = level === 'High'
                    ? (dark ? 'bg-red-900/40 text-red-300 border-red-800/50' : 'bg-red-100 text-red-700 border-red-200')
                    : level === 'Medium'
                    ? (dark ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200')
                    : (dark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200');
                  return (
                    <span key={level} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
                      {count} {level}
                    </span>
                  );
                })}
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {student.violations.length} total
                </span>
              </div>
            )}
          </div>

          {student.violations && student.violations.length > 0 ? (
            <div className="space-y-4">
              {student.violations.map((v, idx) => {
                const isHigh   = v.severity_level === 'High';
                const isMedium = v.severity_level === 'Medium';
                const isResolved = v.status === 'Resolved';

                const cardBg = isHigh
                  ? (dark ? 'bg-red-950/40 border-red-800/50' : 'bg-red-50/60 border-red-200')
                  : isMedium
                  ? (dark ? 'bg-yellow-950/30 border-yellow-800/40' : 'bg-yellow-50/60 border-yellow-200')
                  : (dark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200');

                const accentBar = isHigh
                  ? 'bg-gradient-to-b from-red-500 to-red-600'
                  : isMedium
                  ? 'bg-gradient-to-b from-yellow-400 to-yellow-500'
                  : (dark ? 'bg-slate-600' : 'bg-slate-300');

                const severityBadge = isHigh
                  ? (dark ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-200')
                  : isMedium
                  ? (dark ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-200')
                  : (dark ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-slate-100 text-slate-600 border border-slate-200');

                const severityIcon = isHigh
                  ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  : isMedium
                  ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

                return (
                  <div key={v.id} className={`relative rounded-2xl border overflow-hidden ${cardBg}`}>
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

                    <div className="pl-5 pr-5 pt-4 pb-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold text-slate-400`}>#{idx + 1}</span>
                            <h4 className={`font-bold text-sm ${boldText}`}>{v.violation_type}</h4>
                          </div>
                          <p className={`text-xs mt-1 flex items-center gap-1.5 ${subText}`}>
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {v.date_reported ? new Date(v.date_reported).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : v.date_reported}
                            <span className={`mx-1 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Reported by {v.reported_by}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${severityBadge}`}>
                          {severityIcon}
                          {v.severity_level}
                        </span>
                      </div>

                      {/* Description */}
                      {v.description && (
                        <p className={`text-sm mb-3 leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {v.description}
                        </p>
                      )}

                      {/* Action taken box */}
                      <div className={`rounded-xl border p-3.5 ${dark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Action Taken</p>
                        <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{v.action_taken || 'No action recorded yet.'}</p>

                        <div className={`flex items-center justify-between mt-3 pt-2.5 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isResolved
                              ? (dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700')
                              : (dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700')
                          }`}>
                            {isResolved
                              ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                            }
                            {v.status}
                          </span>
                          <span className={`text-xs ${subText}`}>
                            Resolution: <span className={`font-semibold ${boldText}`}>{v.resolution_date || 'N/A'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-14 rounded-2xl border ${dark ? 'bg-green-950/30 border-green-800/40' : 'bg-green-50/60 border-green-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-green-900/40' : 'bg-green-100'}`}>
                <svg className={`w-8 h-8 ${dark ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className={`text-base font-bold mb-1 ${dark ? 'text-green-300' : 'text-green-800'}`}>Clean Record</h4>
              <p className={`text-sm ${dark ? 'text-green-500' : 'text-green-600'}`}>This student has no recorded violations.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StudentProfileTabs;
