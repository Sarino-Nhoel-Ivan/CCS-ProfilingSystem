import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { api } from '../../utils/api';

const ThemeCtx = createContext(true);
const useTheme = () => useContext(ThemeCtx);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',   label: 'My Profile',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'subjects',  label: 'My Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'schedule',  label: 'My Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'students',  label: 'My Students', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-term Grades Submission Deadline', date: 'Mar 22, 2026', tag: 'Deadline', color: 'from-red-500 to-pink-500',    desc: 'Please submit all mid-term grades through the faculty portal before March 22, 2026.' },
  { id: 2, title: 'Faculty Meeting — March 16, 2026',    date: 'Mar 16, 2026', tag: 'Meeting',  color: 'from-blue-500 to-purple-500', desc: 'Mandatory faculty meeting at 2:00 PM in the CCS Conference Room. Attendance is required.' },
  { id: 3, title: 'New Section Added to Your Schedule',  date: 'Mar 10, 2026', tag: 'Update',   color: 'from-emerald-500 to-teal-500',desc: 'Section BSIT-3A has been added to your schedule for IT 311 starting March 17.' },
  { id: 4, title: 'IT Week 2026 — Faculty Coordinators', date: 'Mar 8, 2026',  tag: 'Event',    color: 'from-brand-500 to-amber-500', desc: 'Faculty coordinators for IT Week 2026 are requested to submit their event proposals by March 15.' },
];

/* ── helpers ── */
const fmt = (d) => { try { return d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—'; } catch { return d||'—'; } };
const val = (v) => (v!==null&&v!==undefined&&v!=='') ? v : '—';
const mkInp = (dark) => dark
  ? 'w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition'
  : 'w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition';
const mkLbl = (dark) => `block text-xs font-semibold mb-1.5 uppercase tracking-wide ${dark?'text-slate-400':'text-slate-500'}`;
const fmtTime = (t) => { if(!t) return '—'; const [h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr<12?'AM':'PM'}`; };

/* ── UI atoms ── */
const Spinner = () => { const dark=useTheme(); return <div className="flex items-center justify-center py-16"><div className={`w-8 h-8 border-4 rounded-full animate-spin border-t-brand-500 ${dark?'border-slate-700':'border-slate-200'}`}/></div>; };
const ErrMsg = ({msg}) => msg ? <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm">{msg}</div> : null;

const SectionCard = ({title,icon,action,children}) => {
  const dark=useTheme();
  return (
    <div className={`rounded-2xl border overflow-hidden ${dark?'bg-slate-800/50 border-slate-700/40':'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark?'border-slate-700/40 bg-slate-900/50':'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2.5"><span className="text-base">{icon}</span><h4 className="text-xs font-bold uppercase tracking-widest text-brand-500">{title}</h4></div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const Row = ({label,value}) => {
  const dark=useTheme();
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b last:border-0" style={{borderColor:'rgba(100,116,139,0.12)'}}>
      <span className={`text-xs shrink-0 w-44 ${dark?'text-slate-500':'text-slate-400'}`}>{label}</span>
      <span className={`text-xs font-medium text-right break-words ${dark?'text-slate-200':'text-slate-700'}`}>{value}</span>
    </div>
  );
};

const BtnEdit = ({onClick,label='Edit'}) => {
  const dark=useTheme();
  return <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${dark?'text-slate-400 hover:text-slate-200 hover:bg-slate-700':'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>{label}</button>;
};

const BtnDanger = ({onClick,loading,children}) => (
  <button onClick={onClick} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50">
    {loading?<div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"/>:children}
  </button>
);

const AddBtn = ({onClick,label}) => (
  <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-500 text-xs font-semibold transition-all">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>{label}
  </button>
);

const BtnPrimary = ({children,loading,onClick,disabled}) => (
  <button onClick={onClick} disabled={loading||disabled} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all disabled:opacity-50">
    {loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:children}
  </button>
);

const BtnGhost = ({children,onClick}) => {
  const dark=useTheme();
  return <button onClick={onClick} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${dark?'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300':'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'}`}>{children}</button>;
};

const FModal = ({title,onClose,children,footer,wide}) => {
  const dark=useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-sm ${dark?'bg-slate-950/80':'bg-slate-900/40'}`} onClick={onClose}/>
      <div className={`relative w-full border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${wide?'max-w-3xl':'max-w-2xl'} ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
          <h3 className={`text-base font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`transition-colors ${dark?'text-slate-500 hover:text-slate-300':'text-slate-400 hover:text-slate-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer&&<div className={`px-6 py-4 border-t flex justify-end gap-3 ${dark?'border-slate-700/60 bg-slate-900/80':'border-slate-100 bg-slate-50'}`}>{footer}</div>}
      </div>
    </div>
  );
};

const NavLink = ({item,active,sidebarExpanded,onSelect}) => {
  const dark=useTheme(); const isActive=active===item.id;
  return (
    <button onClick={()=>onSelect(item.id)} title={!sidebarExpanded?item.label:''}
      className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative ${sidebarExpanded?'px-4':'px-0 justify-center'} ${isActive?'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50':dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
      {isActive&&<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]"/>}
      <svg className={`w-5 h-5 shrink-0 transition-all duration-300 ${sidebarExpanded?'mr-3':'mr-0'} ${isActive?'text-brand-400':dark?'text-slate-500 group-hover:text-slate-300':'text-slate-400 group-hover:text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon}/>
      </svg>
      <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded?'opacity-100 w-auto inline-block':'opacity-0 w-0 hidden'}`}>{item.label}</span>
    </button>
  );
};

/* ════ DASHBOARD PANEL ════ */
const DashboardPanel = ({user,initials,subjectsCount,studentsCount,schedulesCount}) => {
  const dark=useTheme();
  const stats=[
    {label:'Subjects Handled',val:subjectsCount,icon:'📚',dc:'from-blue-500/20 to-purple-500/10 border-blue-500/20',lc:'bg-blue-50 border-blue-100'},
    {label:'Total Students',  val:studentsCount, icon:'👥',dc:'from-brand-500/20 to-amber-500/10 border-brand-500/20',lc:'bg-orange-50 border-orange-100'},
    {label:'Schedules',       val:schedulesCount,icon:'🗂️',dc:'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',lc:'bg-emerald-50 border-emerald-100'},
    {label:'Upcoming Events', val:'2',           icon:'📅',dc:'from-rose-500/20 to-pink-500/10 border-rose-500/20',lc:'bg-rose-50 border-rose-100'},
  ];
  return (
    <div className="space-y-6">
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark?'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border-blue-500/20':'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'}`}>
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none"/>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">{initials}</div>
          <div>
            <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>Welcome back,</p>
            <h2 className={`text-2xl font-bold ${dark?'text-white':'text-slate-800'}`}>{user?.name} 👋</h2>
            <p className={`text-sm mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>CCS Faculty Member · Profile Hub</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className={`rounded-2xl border p-4 ${dark?`bg-gradient-to-br ${s.dc}`:s.lc}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${dark?'text-white':'text-slate-800'}`}>{s.val}</div>
            <div className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${dark?'text-slate-400':'text-slate-500'}`}>📢 Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a=>(
            <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${dark?'bg-slate-800/50 border-slate-700/40 hover:border-slate-600':'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-gradient-to-b ${a.color}`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className={`text-sm font-semibold ${dark?'text-slate-200':'text-slate-700'}`}>{a.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${a.color} text-white`}>{a.tag}</span>
                    <span className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{a.date}</span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed ${dark?'text-slate-400':'text-slate-500'}`}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════ PROFILE MODALS ════ */

const BasicInfoModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const [form,setForm]=useState({first_name:faculty.first_name??'',middle_name:faculty.middle_name??'',last_name:faculty.last_name??'',suffix:faculty.suffix??'',position:faculty.position??'',employment_status:faculty.employment_status??'',hire_date:faculty.hire_date?faculty.hire_date.split('T')[0]:'',department_id:faculty.department_id??''});
  const [depts,setDepts]=useState([]); const [saving,setSaving]=useState(false); const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  useEffect(()=>{api.departments.getAll().then(setDepts).catch(()=>{});},[]);
  const save=async()=>{setSaving(true);setErr(null);try{onSaved(await api.faculties.update(faculty.id,form));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title="Edit Basic Information" onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={lbl}>First Name *</label><input className={inp} value={form.first_name} onChange={set('first_name')}/></div>
        <div><label className={lbl}>Middle Name</label><input className={inp} value={form.middle_name} onChange={set('middle_name')}/></div>
        <div><label className={lbl}>Last Name *</label><input className={inp} value={form.last_name} onChange={set('last_name')}/></div>
        <div><label className={lbl}>Suffix</label><input className={inp} value={form.suffix} onChange={set('suffix')} placeholder="Jr., Sr., III..."/></div>
        <div><label className={lbl}>Position / Title</label><input className={inp} value={form.position} onChange={set('position')} placeholder="Instructor, Professor..."/></div>
        <div><label className={lbl}>Employment Status</label><select className={`${inp} appearance-none`} value={form.employment_status} onChange={set('employment_status')}><option value="">Select...</option><option>Full-Time</option><option>Part-Time</option></select></div>
        <div><label className={lbl}>Hire Date</label><input type="date" className={inp} value={form.hire_date} onChange={set('hire_date')}/></div>
        <div><label className={lbl}>Department / Program</label><select className={`${inp} appearance-none`} value={form.department_id} onChange={set('department_id')}><option value="">Select...</option>{depts.map(d=><option key={d.id} value={d.id}>{d.department_name}</option>)}</select></div>
      </div>
    </FModal>
  );
};

const ContactModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const [form,setForm]=useState({contact_number:faculty.contact_number??'',office_location:faculty.office_location??'',office_hours:faculty.office_hours??''});
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{setSaving(true);setErr(null);try{onSaved(await api.faculties.update(faculty.id,form));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title="Edit Contact Details" onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        <div><label className={lbl}>Contact Number</label><input className={inp} value={form.contact_number} onChange={set('contact_number')} placeholder="+63 9XX XXX XXXX"/></div>
        <div><label className={lbl}>Office Location / Consultation Room</label><input className={inp} value={form.office_location} onChange={set('office_location')} placeholder="e.g. Room 201, CCS Building"/></div>
        <div><label className={lbl}>Office Hours / Availability</label><input className={inp} value={form.office_hours} onChange={set('office_hours')} placeholder="e.g. MWF 1:00–3:00 PM"/></div>
      </div>
    </FModal>
  );
};

const TextFieldModal = ({title,fieldKey,value,faculty,onClose,onSaved}) => {
  const dark=useTheme();const [text,setText]=useState(value??'');const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const save=async()=>{setSaving(true);setErr(null);try{onSaved(await api.faculties.update(faculty.id,{[fieldKey]:text}));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  return (
    <FModal title={title} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/><textarea className={`${mkInp(dark)} resize-none`} rows={6} value={text} onChange={e=>setText(e.target.value)} placeholder="Write here..."/>
    </FModal>
  );
};

const SocialLinksModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const [form,setForm]=useState({linkedin:'',researchgate:'',orcid:'',website:'',twitter:'',...(faculty.social_links??{})});
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{setSaving(true);setErr(null);try{onSaved(await api.faculties.update(faculty.id,{social_links:form}));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title="Edit Social & Professional Links" onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        {[['linkedin','LinkedIn URL'],['researchgate','ResearchGate URL'],['orcid','ORCID URL'],['website','Personal Website'],['twitter','Twitter / X URL']].map(([k,label])=>(
          <div key={k}><label className={lbl}>{label}</label><input className={inp} value={form[k]} onChange={set(k)} placeholder="https://..."/></div>
        ))}
      </div>
    </FModal>
  );
};

const ListEditorModal = ({title,items,fields,onClose,onSave}) => {
  const dark=useTheme();
  const [list,setList]=useState(items?.length?items.map(i=>({...i})):[]);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const addRow=()=>setList(l=>[...l,Object.fromEntries(fields.map(f=>[f.key,'']))]);
  const removeRow=(i)=>setList(l=>l.filter((_,idx)=>idx!==i));
  const setField=(i,k,v)=>setList(l=>l.map((row,idx)=>idx===i?{...row,[k]:v}:row));
  const save=async()=>{setSaving(true);setErr(null);try{await onSave(list.filter(r=>Object.values(r).some(v=>v)));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={title} onClose={onClose} wide footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        {list.map((row,i)=>(
          <div key={i} className={`p-4 rounded-xl border relative ${dark?'bg-slate-800/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}>
            <button onClick={()=>removeRow(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
              {fields.map(f=>(
                <div key={f.key} className={f.full?'sm:col-span-2':''}>
                  <label className={lbl}>{f.label}</label>
                  {f.textarea
                    ?<textarea className={`${inp} resize-none`} rows={2} value={row[f.key]??''} onChange={e=>setField(i,f.key,e.target.value)} placeholder={f.placeholder??''}/>
                    :<input className={inp} value={row[f.key]??''} onChange={e=>setField(i,f.key,e.target.value)} placeholder={f.placeholder??''}/>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addRow} className="w-full py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold transition-all flex items-center justify-center gap-2" style={{borderColor:'rgba(242,101,34,0.3)',color:'rgb(242,101,34)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>Add Entry
        </button>
      </div>
    </FModal>
  );
};

/* ════ PROFILE PANEL ════ */
const ProfilePanel = ({faculty,loading,err,onReload}) => {
  const dark=useTheme();
  const [modal,setModal]=useState(null);
  const [photoUploading,setPhotoUploading]=useState(false);
  const [photoErr,setPhotoErr]=useState(null);

  const refresh=(updated)=>{onReload(updated);setModal(null);};

  const handlePhoto=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>10*1024*1024){setPhotoErr('Max 10 MB.');e.target.value='';return;}
    setPhotoErr(null);setPhotoUploading(true);
    try{const res=await api.faculties.uploadPhoto(faculty.id,file);onReload(res.faculty);}
    catch(ex){setPhotoErr(ex.message||'Upload failed.');}
    finally{setPhotoUploading(false);e.target.value='';}
  };

  if(loading) return <Spinner/>;
  if(err) return <div className={`rounded-2xl border p-8 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}><p className="text-red-400 text-sm">{err}</p></div>;
  if(!faculty) return null;

  const f=faculty;
  const fullName=[f.first_name,f.middle_name?f.middle_name[0]+'.':null,f.last_name,f.suffix].filter(Boolean).join(' ');
  const initials=`${f.first_name?.[0]??''}${f.last_name?.[0]??''}`.toUpperCase();
  const photoUrl=f.profile_photo?`http://localhost:8000/storage/${f.profile_photo}?v=${f.updated_at??Date.now()}`:null;

  const Tag=({text,color='blue'})=>{
    const colors={blue:dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700',green:dark?'bg-green-900/40 text-green-300':'bg-green-100 text-green-700',amber:dark?'bg-amber-900/40 text-amber-300':'bg-amber-100 text-amber-700',purple:dark?'bg-purple-900/40 text-purple-300':'bg-purple-100 text-purple-700',slate:dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'};
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors[color]}`}>{text}</span>;
  };

  const Empty=({text})=><p className={`text-xs text-center py-4 ${dark?'text-slate-500':'text-slate-400'}`}>{text}</p>;

  return (
    <div className="space-y-5">
      {modal==='basic'    &&<BasicInfoModal faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}
      {modal==='contact'  &&<ContactModal   faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}
      {modal==='bio'      &&<TextFieldModal title="Edit Biography" fieldKey="biography" value={f.biography} faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}
      {modal==='research' &&<TextFieldModal title="Edit Research Interests" fieldKey="research_interests" value={f.research_interests} faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}
      {modal==='social'   &&<SocialLinksModal faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}
      {modal==='education'&&<ListEditorModal title="Edit Educational Attainment" items={f.educational_attainment??[]} fields={[{key:'degree',label:'Degree / Certification',placeholder:'e.g. Master of Science in IT'},{key:'institution',label:'Institution',placeholder:'e.g. University of the Philippines'},{key:'year',label:'Year Completed',placeholder:'e.g. 2018'},{key:'field',label:'Field of Study',placeholder:'e.g. Information Technology'}]} onClose={()=>setModal(null)} onSave={async(list)=>refresh(await api.faculties.update(f.id,{educational_attainment:list}))}/>}
      {modal==='expertise'&&<ListEditorModal title="Edit Areas of Expertise" items={(f.expertise_areas??[]).map(e=>typeof e==='string'?{area:e}:e)} fields={[{key:'area',label:'Area / Specialization',placeholder:'e.g. Machine Learning, Web Development'}]} onClose={()=>setModal(null)} onSave={async(list)=>refresh(await api.faculties.update(f.id,{expertise_areas:list.map(r=>r.area).filter(Boolean)}))}/>}
      {modal==='experience'&&<ListEditorModal title="Edit Work Experience" items={f.work_experience??[]} fields={[{key:'title',label:'Position / Role',placeholder:'e.g. Senior Developer'},{key:'company',label:'Company / Institution',placeholder:'e.g. Acme Corp'},{key:'period',label:'Period',placeholder:'e.g. 2015–2020'},{key:'type',label:'Type',placeholder:'Teaching / Industry'},{key:'description',label:'Description',placeholder:'Brief description...',textarea:true,full:true}]} onClose={()=>setModal(null)} onSave={async(list)=>refresh(await api.faculties.update(f.id,{work_experience:list}))}/>}
      {modal==='achievements'&&<ListEditorModal title="Edit Achievements & Awards" items={f.achievements??[]} fields={[{key:'title',label:'Award / Achievement',placeholder:'e.g. Best Research Paper'},{key:'organization',label:'Awarding Body',placeholder:'e.g. IEEE Philippines'},{key:'year',label:'Year',placeholder:'e.g. 2023'}]} onClose={()=>setModal(null)} onSave={async(list)=>refresh(await api.faculties.update(f.id,{achievements:list}))}/>}
      {modal==='publications'&&<ListEditorModal title="Edit Publications & Research" items={f.publications??[]} fields={[{key:'title',label:'Title',placeholder:'Publication title',full:true},{key:'journal',label:'Journal / Conference',placeholder:'e.g. IEEE Access'},{key:'year',label:'Year',placeholder:'e.g. 2024'},{key:'url',label:'URL / DOI',placeholder:'https://...'}]} onClose={()=>setModal(null)} onSave={async(list)=>refresh(await api.faculties.update(f.id,{publications:list}))}/>}

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark?'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border-blue-500/20':'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'}`}>
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none"/>
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {photoUploading?<div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"/>:photoUrl?<img src={photoUrl} alt="Profile" className="w-full h-full object-cover"/>:<span>{initials}</span>}
            </div>
            {!photoUploading&&(<><label htmlFor="faculty-photo" className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span className="text-white text-[10px] font-semibold">Change</span></label><input id="faculty-photo" type="file" accept="image/*" className="hidden" onChange={handlePhoto}/></>)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {photoErr&&<div className="mb-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-1.5">{photoErr}</div>}
            <h2 className={`text-xl font-bold ${dark?'text-white':'text-slate-800'}`}>{fullName}</h2>
            <p className={`text-sm font-medium mt-0.5 ${dark?'text-brand-400':'text-brand-600'}`}>{val(f.position)}</p>
            <p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{val(f.email)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
              {f.department?.department_name&&<Tag text={f.department.department_name} color="blue"/>}
              {f.employment_status&&<Tag text={f.employment_status} color={f.employment_status==='Full-Time'?'green':'amber'}/>}
              {f.id&&<Tag text={`ID: ${f.id}`} color="slate"/>}
            </div>
          </div>
          <BtnEdit onClick={()=>setModal('basic')}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Contact Details" icon="📬" action={<BtnEdit onClick={()=>setModal('contact')}/>}>
          <Row label="School Email"    value={val(f.email)}/><Row label="Contact Number"  value={val(f.contact_number)}/><Row label="Office Location" value={val(f.office_location)}/><Row label="Office Hours"    value={val(f.office_hours)}/>
        </SectionCard>
        <SectionCard title="Employment Details" icon="🏢" action={<BtnEdit onClick={()=>setModal('basic')}/>}>
          <Row label="Employee / Faculty ID" value={val(f.id)}/><Row label="Position / Title" value={val(f.position)}/><Row label="Employment Status" value={val(f.employment_status)}/><Row label="Date Hired" value={fmt(f.hire_date)}/><Row label="Department" value={val(f.department?.department_name)}/>
        </SectionCard>
        <SectionCard title="Educational Attainment" icon="🎓" action={<BtnEdit onClick={()=>setModal('education')}/>}>
          {f.educational_attainment?.length>0?(<div className="space-y-3">{f.educational_attainment.map((e,i)=>(<div key={i} className={`p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}><p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{e.degree}</p><p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{e.institution}{e.year?` · ${e.year}`:''}</p>{e.field&&<p className={`text-xs mt-0.5 ${dark?'text-slate-500':'text-slate-400'}`}>{e.field}</p>}</div>))}</div>):<Empty text="No entries yet. Click Edit to add."/>}
        </SectionCard>
        <SectionCard title="Areas of Expertise" icon="🧠" action={<BtnEdit onClick={()=>setModal('expertise')}/>}>
          {f.expertise_areas?.length>0?(<div className="flex flex-wrap gap-2">{f.expertise_areas.map((e,i)=>(<span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${dark?'bg-purple-900/40 text-purple-300 border border-purple-700/30':'bg-purple-100 text-purple-700'}`}>{typeof e==='string'?e:e.area}</span>))}</div>):<Empty text="No expertise areas listed yet."/>}
        </SectionCard>
        <SectionCard title="Work Experience" icon="💼" action={<BtnEdit onClick={()=>setModal('experience')}/>}>
          {f.work_experience?.length>0?(<div className="space-y-3">{f.work_experience.map((e,i)=>(<div key={i} className={`p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}><div className="flex items-start justify-between gap-2"><div><p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{e.title}</p><p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{e.company}{e.period?` · ${e.period}`:''}</p></div>{e.type&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'}`}>{e.type}</span>}</div>{e.description&&<p className={`text-xs mt-1.5 leading-relaxed ${dark?'text-slate-500':'text-slate-400'}`}>{e.description}</p>}</div>))}</div>):<Empty text="No work experience listed yet."/>}
        </SectionCard>
        <SectionCard title="Research Interests" icon="🔬" action={<BtnEdit onClick={()=>setModal('research')}/>}>
          {f.research_interests?<p className={`text-sm leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{f.research_interests}</p>:<Empty text="No research interests listed yet."/>}
        </SectionCard>
        <SectionCard title="Biography" icon="📝" action={<BtnEdit onClick={()=>setModal('bio')}/>}>
          {f.biography?<p className={`text-sm leading-relaxed ${dark?'text-slate-300':'text-slate-600'}`}>{f.biography}</p>:<Empty text="No biography added yet."/>}
        </SectionCard>
        <SectionCard title="Achievements & Awards" icon="🏆" action={<BtnEdit onClick={()=>setModal('achievements')}/>}>
          {f.achievements?.length>0?(<div className="space-y-2">{f.achievements.map((a,i)=>(<div key={i} className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 shrink-0">🥇</span><div><p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{a.title}</p><p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>{a.organization}{a.year?` · ${a.year}`:''}</p></div></div>))}</div>):<Empty text="No achievements listed yet."/>}
        </SectionCard>
        <SectionCard title="Publications & Research Papers" icon="📄" action={<BtnEdit onClick={()=>setModal('publications')}/>}>
          {f.publications?.length>0?(<div className="space-y-3">{f.publications.map((p,i)=>(<div key={i} className={`p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}><p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{p.title}</p><p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{p.journal}{p.year?` · ${p.year}`:''}</p>{p.url&&<a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline mt-0.5 block truncate">{p.url}</a>}</div>))}</div>):<Empty text="No publications listed yet."/>}
        </SectionCard>
        <SectionCard title="Social & Professional Links" icon="🔗" action={<BtnEdit onClick={()=>setModal('social')}/>}>
          {f.social_links&&Object.values(f.social_links).some(v=>v)?(<div className="space-y-2">{Object.entries(f.social_links).filter(([,v])=>v).map(([k,v])=>(<div key={k} className="flex items-center gap-2"><span className={`text-xs w-28 shrink-0 capitalize ${dark?'text-slate-500':'text-slate-400'}`}>{k}</span><a href={v} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline truncate">{v}</a></div>))}</div>):<Empty text="No links added yet."/>}
        </SectionCard>
      </div>
    </div>
  );
};

/* ════ MY SUBJECTS PANEL ════ */
const SubjectDetailModal = ({subject,students,schedules,onClose}) => {
  const dark=useTheme();
  const subjectSchedules=schedules.filter(s=>s.subject_id===subject.id);
  const sections=[...new Set(subjectSchedules.map(s=>s.section?.section_name).filter(Boolean))];
  const enrolledStudents=students.filter(s=>s.section&&sections.includes(s.section));
  return (
    <FModal title={`${subject.subject_code} — ${subject.descriptive_title}`} onClose={onClose} wide>
      <div className="space-y-5">
        {/* Subject Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['Total Units',subject.total_units],['Lec Units',subject.lec_units],['Lab Units',subject.lab_units],['Pre-requisite',subject.pre_requisites||'None']].map(([l,v])=>(
            <div key={l} className={`rounded-xl border p-3 text-center ${dark?'bg-slate-800/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}>
              <p className={`text-lg font-bold ${dark?'text-white':'text-slate-800'}`}>{v}</p>
              <p className={`text-[10px] mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{l}</p>
            </div>
          ))}
        </div>
        {/* Schedules */}
        <SectionCard title="Class Schedules" icon="🗓️">
          {subjectSchedules.length===0?<p className={`text-xs text-center py-3 ${dark?'text-slate-500':'text-slate-400'}`}>No schedules found.</p>:(
            <div className="space-y-2">
              {subjectSchedules.map(s=>(
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-xs font-bold w-24 shrink-0 ${dark?'text-brand-400':'text-brand-600'}`}>{s.day_of_week}</span>
                  <span className={`text-xs ${dark?'text-slate-300':'text-slate-700'}`}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</span>
                  <span className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>{s.section?.section_name} · {s.room}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        {/* Enrolled Students */}
        <SectionCard title={`Enrolled Students (${enrolledStudents.length})`} icon="👥">
          {enrolledStudents.length===0?<p className={`text-xs text-center py-3 ${dark?'text-slate-500':'text-slate-400'}`}>No students found in assigned sections.</p>:(
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {enrolledStudents.map(s=>{
                const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${dark?'text-slate-100':'text-slate-800'}`}>{s.first_name} {s.last_name}</p>
                      <p className={`text-[10px] ${dark?'text-slate-500':'text-slate-400'}`}>{s.student_number} · {s.section}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </FModal>
  );
};

const SubjectsPanel = ({facultyId}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load subjects.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  const subjectMap={};
  schedules.forEach(s=>{
    if(s.subject&&!subjectMap[s.subject.id]) subjectMap[s.subject.id]={...s.subject,sections:[]};
    if(s.subject&&s.section) subjectMap[s.subject.id].sections.push(s.section.section_name);
  });
  const subjects=Object.values(subjectMap);
  const filtered=subjects.filter(s=>s.subject_code?.toLowerCase().includes(search.toLowerCase())||s.descriptive_title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {selected&&<SubjectDetailModal subject={selected} students={students} schedules={schedules} onClose={()=>setSelected(null)}/>}
      <div className="relative">
        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input className={`${mkInp(dark)} pl-9`} placeholder="Search subjects..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {filtered.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">📚</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>{search?'No subjects match your search.':'No subjects assigned yet.'}</p>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(subj=>{
            const subjectSchedules=schedules.filter(s=>s.subject_id===subj.id);
            const sections=[...new Set(subjectSchedules.map(s=>s.section?.section_name).filter(Boolean))];
            const studentCount=students.filter(s=>s.section&&sections.includes(s.section)).length;
            return (
              <button key={subj.id} onClick={()=>setSelected(subj)} className={`text-left rounded-2xl border p-5 transition-all ${dark?'bg-slate-800/50 border-slate-700/40 hover:border-brand-500/50':'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md shadow-sm'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{subj.subject_code}</span>
                    <h4 className={`text-sm font-semibold mt-2 ${dark?'text-slate-100':'text-slate-800'}`}>{subj.descriptive_title}</h4>
                  </div>
                  <div className={`text-center shrink-0 px-3 py-1.5 rounded-xl ${dark?'bg-slate-700/50':'bg-slate-100'}`}>
                    <p className={`text-lg font-bold ${dark?'text-white':'text-slate-800'}`}>{subj.total_units}</p>
                    <p className={`text-[10px] ${dark?'text-slate-400':'text-slate-500'}`}>units</p>
                  </div>
                </div>
                <div className={`text-xs space-y-1 ${dark?'text-slate-400':'text-slate-500'}`}>
                  <p>Lec: {subj.lec_units} · Lab: {subj.lab_units} · {studentCount} student{studentCount!==1?'s':''}</p>
                  {subj.pre_requisites&&<p>Pre-req: {subj.pre_requisites}</p>}
                  {sections.length>0&&<div className="flex flex-wrap gap-1 mt-2">{[...new Set(sections)].map(sec=><span key={sec} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{sec}</span>)}</div>}
                </div>
                <p className={`text-[10px] mt-3 ${dark?'text-brand-400':'text-brand-600'}`}>Click to view details →</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════ MY SCHEDULE PANEL ════ */
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const ScheduleModal = ({record,facultyId,onClose,onSaved}) => {
  const dark=useTheme();
  const empty={day_of_week:'Monday',start_time:'',end_time:'',room:'',subject_id:'',section_id:''};
  const [form,setForm]=useState(record?{...record,subject_id:record.subject_id??'',section_id:record.section_id??''}:empty);
  const [subjects,setSubjects]=useState([]);const [sections,setSections]=useState([]);const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  useEffect(()=>{Promise.all([api.subjects.getAll(),api.sections.getAll()]).then(([s,sec])=>{setSubjects(s);setSections(sec);}).catch(()=>{});},[]);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);setErr(null);
    try{
      const payload={...form,faculty_id:facultyId};
      if(record) await api.schedules.update(record.id,payload);
      else await api.schedules.create(payload);
      onSaved();
    }catch(e){setErr(e.message);}
    finally{setSaving(false);}
  };
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={record?'Edit Schedule':'Add Schedule'} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record?'Save Changes':'Add Schedule'}</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Day of Week</label><select className={`${inp} appearance-none`} value={form.day_of_week} onChange={set('day_of_week')}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={lbl}>Room</label><input className={inp} value={form.room} onChange={set('room')} placeholder="e.g. Room 301"/></div>
        <div><label className={lbl}>Start Time</label><input type="time" className={inp} value={form.start_time} onChange={set('start_time')}/></div>
        <div><label className={lbl}>End Time</label><input type="time" className={inp} value={form.end_time} onChange={set('end_time')}/></div>
        <div><label className={lbl}>Subject</label><select className={`${inp} appearance-none`} value={form.subject_id} onChange={set('subject_id')}><option value="">Select subject...</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.subject_code} — {s.descriptive_title}</option>)}</select></div>
        <div><label className={lbl}>Section</label><select className={`${inp} appearance-none`} value={form.section_id} onChange={set('section_id')}><option value="">Select section...</option>{sections.map(s=><option key={s.id} value={s.id}>{s.section_name}</option>)}</select></div>
      </div>
    </FModal>
  );
};

const SchedulePanel = ({facultyId}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [modal,setModal]=useState(null);
  const [deleting,setDeleting]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load schedule.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  const del=async(id)=>{
    setDeleting(id);setConfirmDel(null);
    try{await api.schedules.delete(id);await load();}
    catch{alert('Failed to delete.');}
    finally{setDeleting(null);}
  };

  const byDay=DAYS.reduce((acc,d)=>{acc[d]=schedules.filter(s=>s.day_of_week===d);return acc;},{});

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  return (
    <div className="space-y-5">
      {modal&&<ScheduleModal record={modal==='add'?null:modal} facultyId={facultyId} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load();}}/>}
      {/* Confirm delete dialog */}
      {confirmDel&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`absolute inset-0 backdrop-blur-sm ${dark?'bg-slate-950/80':'bg-slate-900/40'}`} onClick={()=>setConfirmDel(null)}/>
          <div className={`relative w-full max-w-sm border rounded-2xl shadow-2xl p-6 ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${dark?'text-slate-100':'text-slate-800'}`}>Delete Schedule?</p>
            <p className={`text-xs mb-5 ${dark?'text-slate-400':'text-slate-500'}`}>This will remove the schedule entry for <span className="font-semibold">{confirmDel.subject?.descriptive_title}</span> on {confirmDel.day_of_week}.</p>
            <div className="flex justify-end gap-3"><BtnGhost onClick={()=>setConfirmDel(null)}>Cancel</BtnGhost><button onClick={()=>del(confirmDel.id)} disabled={deleting===confirmDel.id} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">{deleting===confirmDel.id&&<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}Delete</button></div>
          </div>
        </div>
      )}
      <div className="flex justify-end"><AddBtn onClick={()=>setModal('add')} label="Add Schedule"/></div>
      {schedules.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">📅</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>No schedule entries yet.</p>
        </div>
      ):(
        <div className="space-y-4">
          {DAYS.map(day=>byDay[day].length===0?null:(
            <div key={day}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>{day}</p>
              <div className="space-y-2">
                {byDay[day].map(s=>{
                  const secName=s.section?.section_name;
                  const studentCount=secName?students.filter(st=>st.section===secName).length:0;
                  return (
                    <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${dark?'bg-slate-800/50 border-slate-700/40 hover:border-slate-600':'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                      <div className={`text-center shrink-0 w-20 px-2 py-1.5 rounded-xl ${dark?'bg-slate-700/50':'bg-slate-100'}`}>
                        <p className={`text-xs font-bold ${dark?'text-slate-200':'text-slate-700'}`}>{fmtTime(s.start_time)}</p>
                        <p className={`text-[10px] ${dark?'text-slate-500':'text-slate-400'}`}>{fmtTime(s.end_time)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{s.subject?.descriptive_title??'—'}</p>
                        <p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>{s.subject?.subject_code} · {secName??'—'} · {s.room}</p>
                        {studentCount>0&&<p className={`text-[10px] mt-0.5 ${dark?'text-emerald-400':'text-emerald-600'}`}>{studentCount} student{studentCount!==1?'s':''}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <BtnEdit onClick={()=>setModal(s)}/>
                        <BtnDanger onClick={()=>setConfirmDel(s)} loading={deleting===s.id}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </BtnDanger>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════ MY STUDENTS PANEL ════ */

/* Violation CRUD Modal */
const ViolationModal = ({violation,student,facultyName,onClose,onSaved}) => {
  const dark=useTheme();
  const empty={violation_type:'',description:'',date_reported:new Date().toISOString().split('T')[0],reported_by:facultyName??'',severity_level:'Low',action_taken:'',status:'Pending',resolution_date:''};
  const [form,setForm]=useState(violation?{...violation,date_reported:violation.date_reported?.split('T')[0]??'',resolution_date:violation.resolution_date?.split('T')[0]??''}:empty);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);setErr(null);
    try{
      if(violation) await api.students.updateViolation(student.id,violation.id,form);
      else await api.students.addViolation(student.id,form);
      onSaved();onClose();
    }catch(e){setErr(e.message);}
    finally{setSaving(false);}
  };
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={violation?'Edit Violation':'Add Violation'} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{violation?'Save Changes':'Add Violation'}</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className={lbl}>Violation Type *</label><input className={inp} value={form.violation_type} onChange={set('violation_type')} placeholder="e.g. Academic Dishonesty"/></div>
        <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Describe the violation..."/></div>
        <div><label className={lbl}>Date Reported *</label><input type="date" className={inp} value={form.date_reported} onChange={set('date_reported')}/></div>
        <div><label className={lbl}>Reported By</label><input className={inp} value={form.reported_by} onChange={set('reported_by')}/></div>
        <div><label className={lbl}>Severity Level *</label><select className={`${inp} appearance-none`} value={form.severity_level} onChange={set('severity_level')}><option>Low</option><option>Medium</option><option>High</option></select></div>
        <div><label className={lbl}>Status *</label><select className={`${inp} appearance-none`} value={form.status} onChange={set('status')}><option>Pending</option><option>Under Review</option><option>Resolved</option></select></div>
        <div className="sm:col-span-2"><label className={lbl}>Action Taken</label><textarea className={`${inp} resize-none`} rows={2} value={form.action_taken} onChange={set('action_taken')} placeholder="Describe action taken..."/></div>
        <div><label className={lbl}>Resolution Date</label><input type="date" className={inp} value={form.resolution_date} onChange={set('resolution_date')}/></div>
      </div>
    </FModal>
  );
};

/* Full Student Detail Modal with Violations CRUD */
const StudentDetailModal = ({student:initialStudent,facultyName,onClose}) => {
  const dark=useTheme();
  const [student,setStudent]=useState(initialStudent);
  const [tab,setTab]=useState('info');
  const [violModal,setViolModal]=useState(null); // null | 'add' | violation object
  const [deleting,setDeleting]=useState(null);

  const reload=async()=>{
    try{const fresh=await api.students.get(student.id);setStudent(fresh);}catch{}
  };

  const deleteViolation=async(v)=>{
    if(!window.confirm('Delete this violation record?')) return;
    setDeleting(v.id);
    try{await api.students.deleteViolation(student.id,v.id);await reload();}
    catch{alert('Failed to delete.');}
    finally{setDeleting(null);}
  };

  const s=student;
  const fullName=[s.first_name,s.middle_name,s.last_name,s.suffix].filter(Boolean).join(' ');
  const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();

  const TABS=[{id:'info',label:'Info'},{id:'violations',label:`Violations (${s.violations?.length??0})`},{id:'academic',label:'Academic'},{id:'medical',label:'Medical'}];

  const severityColor=(sev)=>{
    if(sev==='High') return dark?'bg-red-900/40 text-red-300':'bg-red-100 text-red-700';
    if(sev==='Medium') return dark?'bg-amber-900/40 text-amber-300':'bg-amber-100 text-amber-700';
    return dark?'bg-green-900/40 text-green-300':'bg-green-100 text-green-700';
  };
  const statusColor=(st)=>{
    if(st==='Resolved') return dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700';
    if(st==='Under Review') return dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700';
    return dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600';
  };

  return (
    <FModal title="Student Details" onClose={onClose} wide>
      {violModal&&<ViolationModal violation={violModal==='add'?null:violModal} student={s} facultyName={facultyName} onClose={()=>setViolModal(null)} onSaved={reload}/>}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
          <div>
            <h2 className={`text-lg font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{fullName}</h2>
            {s.student_number&&<p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>Student No. {s.student_number}</p>}
            <div className="flex gap-2 mt-1 flex-wrap">
              {s.enrollment_status&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{s.enrollment_status}</span>}
              {s.year_level&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{s.year_level}</span>}
              {s.program&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'}`}>{s.program}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl ${dark?'bg-slate-800':'bg-slate-100'}`}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t.id?dark?'bg-slate-700 text-slate-100 shadow':'bg-white text-slate-800 shadow':dark?'text-slate-400 hover:text-slate-200':'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
          ))}
        </div>

        {/* Tab: Info */}
        {tab==='info'&&(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Personal Info" icon="👤">
              <Row label="Gender" value={val(s.gender)}/><Row label="Date of Birth" value={fmt(s.birth_date)}/><Row label="Nationality" value={val(s.nationality)}/><Row label="Civil Status" value={val(s.civil_status)}/><Row label="Religion" value={val(s.religion)}/>
            </SectionCard>
            <SectionCard title="Contact" icon="📞">
              <Row label="Email" value={val(s.email)}/><Row label="Mobile" value={val(s.contact_number)}/><Row label="Alt. Contact" value={val(s.alternate_contact_number)}/><Row label="Address" value={val([s.barangay,s.city,s.province].filter(Boolean).join(', ')||null)}/>
            </SectionCard>
            <SectionCard title="Enrollment" icon="🎓">
              <Row label="Program" value={val(s.program)}/><Row label="Year Level" value={val(s.year_level)}/><Row label="Section" value={val(s.section)}/><Row label="Student Type" value={val(s.student_type)}/><Row label="Date Enrolled" value={fmt(s.date_enrolled)}/>
            </SectionCard>
            {s.guardians?.length>0&&(
              <SectionCard title="Guardian" icon="👨‍👩‍👦">
                <Row label="Name" value={val(s.guardians[0].full_name)}/><Row label="Relationship" value={val(s.guardians[0].relationship)}/><Row label="Contact" value={val(s.guardians[0].contact_number)}/><Row label="Email" value={val(s.guardians[0].email)}/>
              </SectionCard>
            )}
          </div>
        )}

        {/* Tab: Violations */}
        {tab==='violations'&&(
          <div className="space-y-4">
            <div className="flex justify-end"><AddBtn onClick={()=>setViolModal('add')} label="Add Violation"/></div>
            {!s.violations?.length?(
              <div className={`rounded-2xl border p-10 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
                <span className="text-4xl mb-2 block">✅</span>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>No violations on record.</p>
              </div>
            ):(
              <div className="space-y-3">
                {s.violations.map(v=>(
                  <div key={v.id} className={`p-4 rounded-2xl border ${dark?'bg-slate-800/50 border-slate-700/40':'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{v.violation_type}</p>
                        <p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>Reported: {fmt(v.date_reported)}{v.reported_by?` · by ${v.reported_by}`:''}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${severityColor(v.severity_level)}`}>{v.severity_level}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(v.status)}`}>{v.status}</span>
                      </div>
                    </div>
                    {v.description&&<p className={`text-xs mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>{v.description}</p>}
                    {v.action_taken&&<p className={`text-xs italic ${dark?'text-slate-500':'text-slate-400'}`}>Action: {v.action_taken}</p>}
                    <div className="flex justify-end gap-1 mt-3">
                      <BtnEdit onClick={()=>setViolModal(v)} label="Edit"/>
                      <BtnDanger onClick={()=>deleteViolation(v)} loading={deleting===v.id}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete
                      </BtnDanger>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Academic */}
        {tab==='academic'&&(
          <div className="space-y-3">
            <SectionCard title="Academic Background" icon="📖">
              <Row label="LRN" value={val(s.lrn)}/><Row label="Last School Attended" value={val(s.last_school_attended)}/><Row label="Last Year Attended" value={val(s.last_year_attended)}/><Row label="Honors Received" value={val(s.honors_received)}/>
            </SectionCard>
            {s.academicHistories?.length>0&&(
              <SectionCard title="Academic History" icon="📋">
                <div className="space-y-2">
                  {s.academicHistories.map((h,i)=>(
                    <div key={i} className={`p-3 rounded-xl border ${dark?'bg-slate-900/50 border-slate-700/40':'bg-slate-50 border-slate-200'}`}>
                      <Row label="School Year" value={val(h.school_year)}/><Row label="Year Level" value={val(h.year_level)}/><Row label="GWA" value={val(h.gwa)}/><Row label="Status" value={val(h.status)}/>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {s.skills?.length>0&&(
              <SectionCard title="Skills" icon="🛠️">
                <div className="flex flex-wrap gap-2">
                  {s.skills.map((sk,i)=><span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${dark?'bg-purple-900/40 text-purple-300':'bg-purple-100 text-purple-700'}`}>{sk.skill_name}</span>)}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* Tab: Medical */}
        {tab==='medical'&&(
          <div>
            {!s.medicalHistories?.length?(
              <div className={`rounded-2xl border p-10 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>No medical records on file.</p>
              </div>
            ):(
              <div className="space-y-3">
                {s.medicalHistories.map((m,i)=>(
                  <SectionCard key={i} title="Medical Record" icon="🏥">
                    <Row label="Blood Type" value={val(m.bloodtype)}/><Row label="Existing Conditions" value={val(m.existing_conditions)}/><Row label="Emergency Contact" value={val(m.emergency_contact_name)}/><Row label="Emergency Number" value={val(m.emergency_contact_number)}/>
                  </SectionCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FModal>
  );
};

const StudentsPanel = ({facultyId,facultyName}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);
  const [sectionFilter,setSectionFilter]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load students.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  const sections=[...new Set(schedules.map(s=>s.section?.section_name).filter(Boolean))];
  const filtered=students.filter(s=>{
    const name=`${s.first_name} ${s.last_name}`.toLowerCase();
    const matchSearch=name.includes(search.toLowerCase())||(s.student_number?.includes(search));
    const matchSection=!sectionFilter||s.section===sectionFilter;
    return matchSearch&&matchSection;
  });

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  return (
    <div className="space-y-5">
      {selected&&<StudentDetailModal student={selected} facultyName={facultyName} onClose={()=>setSelected(null)}/>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input className={`${mkInp(dark)} pl-9`} placeholder="Search by name or student number..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {sections.length>0&&<select className={`${mkInp(dark)} appearance-none w-full sm:w-48`} value={sectionFilter} onChange={e=>setSectionFilter(e.target.value)}><option value="">All Sections</option>{sections.map(sec=><option key={sec}>{sec}</option>)}</select>}
      </div>
      <p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{filtered.length} student{filtered.length!==1?'s':''} found</p>
      {filtered.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">👥</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>{search||sectionFilter?'No students match your filters.':'No students found in your sections.'}</p>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s=>{
            const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();
            const violCount=s.violations?.length??0;
            return (
              <button key={s.id} onClick={()=>setSelected(s)} className={`text-left p-4 rounded-2xl border transition-all ${dark?'bg-slate-800/50 border-slate-700/40 hover:border-brand-500/50 hover:bg-slate-800':'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${dark?'text-slate-100':'text-slate-800'}`}>{s.first_name} {s.last_name}</p>
                    {s.student_number&&<p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{s.student_number}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.section&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{s.section}</span>}
                  {s.year_level&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{s.year_level}</span>}
                  {violCount>0&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-red-900/40 text-red-300':'bg-red-100 text-red-700'}`}>{violCount} violation{violCount!==1?'s':''}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════ MAIN COMPONENT ════ */
const FacultyDashboard = ({user,onLogout}) => {
  const [active,setActive]=useState('dashboard');
  const [sidebarPinned,setSidebarPinned]=useState(false);
  const [sidebarHovered,setSidebarHovered]=useState(false);
  const [dark,setDark]=useState(()=>localStorage.getItem('fd_theme')!=='light');
  const [faculty,setFaculty]=useState(null);
  const [loadingProfile,setLoadingProfile]=useState(false);
  const [profileErr,setProfileErr]=useState(null);
  const [subjectsCount,setSubjectsCount]=useState('—');
  const [studentsCount,setStudentsCount]=useState('—');
  const [schedulesCount,setSchedulesCount]=useState('—');

  const toggleTheme=()=>setDark(d=>{const next=!d;localStorage.setItem('fd_theme',next?'dark':'light');return next;});

  const loadFaculty=useCallback(async()=>{
    if(!user?.faculty_id) return;
    setLoadingProfile(true);setProfileErr(null);
    try{setFaculty(await api.faculties.get(user.faculty_id));}
    catch{setProfileErr('Could not load profile data.');}
    finally{setLoadingProfile(false);}
  },[user?.faculty_id]);

  useEffect(()=>{loadFaculty();},[loadFaculty]);

  useEffect(()=>{
    if(!user?.faculty_id) return;
    api.schedules.getAll().then(all=>{
      const mine=all.filter(s=>s.faculty_id===user.faculty_id);
      setSchedulesCount(mine.length);
      setSubjectsCount(new Set(mine.map(s=>s.subject_id).filter(Boolean)).size);
    }).catch(()=>{});
    Promise.all([api.students.getAll(),api.schedules.getAll()]).then(([allStu,allSch])=>{
      const mySec=new Set(allSch.filter(s=>s.faculty_id===user.faculty_id).map(s=>s.section?.section_name).filter(Boolean));
      setStudentsCount(allStu.filter(s=>s.section&&mySec.has(s.section)).length);
    }).catch(()=>{});
  },[user?.faculty_id]);

  const sidebarExpanded=sidebarPinned||sidebarHovered;
  const initials=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()??'FC';
  const activeNav=NAV_ITEMS.find(n=>n.id===active);
  const facultyName=faculty?[faculty.first_name,faculty.last_name].filter(Boolean).join(' '):user?.name;

  const renderPanel=()=>{
    switch(active){
      case 'dashboard': return <DashboardPanel user={user} initials={initials} subjectsCount={subjectsCount} studentsCount={studentsCount} schedulesCount={schedulesCount}/>;
      case 'profile':   return <ProfilePanel faculty={faculty} loading={loadingProfile} err={profileErr} onReload={(updated)=>setFaculty(updated)}/>;
      case 'subjects':  return <SubjectsPanel facultyId={user?.faculty_id}/>;
      case 'schedule':  return <SchedulePanel facultyId={user?.faculty_id}/>;
      case 'students':  return <StudentsPanel facultyId={user?.faculty_id} facultyName={facultyName}/>;
      default:          return null;
    }
  };

  return (
    <ThemeCtx.Provider value={dark}>
      <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${dark?'bg-slate-950':'bg-slate-100'}`}>
        {dark&&<><div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"/><div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"/></>}

        {/* Sidebar */}
        <aside className={`relative z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out shrink-0 ${sidebarExpanded?'w-64 shadow-2xl shadow-slate-900/50':'w-16'} ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200 shadow-sm'}`}
          onMouseEnter={()=>setSidebarHovered(true)} onMouseLeave={()=>setSidebarHovered(false)}>
          <div className={`flex items-center border-b h-20 overflow-hidden ${dark?'border-slate-800':'border-slate-100'} ${sidebarExpanded?'px-5 gap-3':'justify-center px-0'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shrink-0 shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            {sidebarExpanded&&<div className="min-w-0"><p className={`text-sm font-bold truncate ${dark?'text-slate-100':'text-slate-800'}`}>CCS Faculty</p><p className={`text-[10px] truncate ${dark?'text-slate-500':'text-slate-400'}`}>Profile Hub</p></div>}
          </div>
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 ${sidebarExpanded?'px-3':'px-2'}`}>
            {NAV_ITEMS.map(item=><NavLink key={item.id} item={item} active={active} sidebarExpanded={sidebarExpanded} onSelect={setActive}/>)}
          </nav>
          <div className={`border-t py-4 space-y-1 ${dark?'border-slate-800':'border-slate-100'} ${sidebarExpanded?'px-3':'px-2'}`}>
            <button onClick={toggleTheme} title={!sidebarExpanded?(dark?'Light Mode':'Dark Mode'):''} className={`w-full flex items-center py-3 rounded-xl transition-all ${sidebarExpanded?'px-4':'px-0 justify-center'} ${dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <svg className={`w-5 h-5 shrink-0 ${sidebarExpanded?'mr-3':'mr-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{dark?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>}</svg>
              {sidebarExpanded&&<span className="text-sm font-medium">{dark?'Light Mode':'Dark Mode'}</span>}
            </button>
            <button onClick={()=>setSidebarPinned(p=>!p)} title={!sidebarExpanded?'Pin Sidebar':''} className={`w-full flex items-center py-3 rounded-xl transition-all ${sidebarExpanded?'px-4':'px-0 justify-center'} ${dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <svg className={`w-5 h-5 shrink-0 ${sidebarExpanded?'mr-3':'mr-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={sidebarPinned?"M11 19l-7-7 7-7m8 14l-7-7 7-7":"M13 5l7 7-7 7M5 5l7 7-7 7"}/></svg>
              {sidebarExpanded&&<span className="text-sm font-medium">{sidebarPinned?'Unpin Sidebar':'Pin Sidebar'}</span>}
            </button>
            <button onClick={onLogout} title={!sidebarExpanded?'Logout':''} className={`w-full flex items-center py-3 rounded-xl transition-all ${sidebarExpanded?'px-4':'px-0 justify-center'} text-red-400 hover:bg-red-500/10`}>
              <svg className={`w-5 h-5 shrink-0 ${sidebarExpanded?'mr-3':'mr-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              {sidebarExpanded&&<span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className={`flex items-center justify-between px-6 h-20 border-b shrink-0 ${dark?'bg-slate-900/80 border-slate-800 backdrop-blur-xl':'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <h1 className={`text-lg font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{activeNav?.label??'Dashboard'}</h1>
              <p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{user?.name} · CCS Faculty</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow`}>{initials}</div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            {renderPanel()}
          </div>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
};

export default FacultyDashboard;
