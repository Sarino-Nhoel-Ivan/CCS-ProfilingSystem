import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const SearchModule = () => {
  const dark = useDarkMode();
  const card      = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const subText   = dark ? 'text-slate-400' : 'text-slate-500';
  const inputBg   = dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-500';
  const tabBg     = dark ? 'bg-slate-800' : 'bg-slate-100';
  const tabActive = dark ? 'bg-slate-700 text-brand-400' : 'bg-white text-brand-600';
  const tabInact  = dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700';
  const filterBg  = dark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200';
  const filterBtn = (active) => active
    ? (dark ? 'bg-brand-900/40 text-brand-400 border-brand-600' : 'bg-brand-100 text-brand-700 border-brand-300')
    : (dark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100');
  const resultCard = dark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50/50 border-slate-100 hover:border-slate-300';
  const emptyCard  = dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100';
  const tHead     = dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200';
  const tRow      = dark ? 'border-slate-700/60 hover:bg-slate-800/60' : 'border-slate-100 hover:bg-slate-50/50';

  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults]               = useState({ students: [], faculties: [], subjects: [], events: [] });
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ skills: [], affiliations: [], events: [], violations: false });
  const [advancedResults, setAdvancedResults] = useState([]);
  const [hasSearched, setHasSearched]       = useState(false);

  // Real skills from DB
  const [availableSkills, setAvailableSkills] = useState([]);
  useEffect(() => {
    api.skills.getAll().then(data => setAvailableSkills(data)).catch(() => {});
  }, []);

  // Quick-query presets for lab demo
  const QUICK_QUERIES = [
    { label: '🏀 Basketball skill', filters: { skills: [], skillNames: ['Basketball'], affiliations: [], events: [], violations: false } },
    { label: '💻 Programming skill', filters: { skills: [], skillNames: ['Programming'], affiliations: [], events: [], violations: false } },
    { label: '🌐 Web Development', filters: { skills: [], skillNames: ['Web Development'], affiliations: [], events: [], violations: false } },
    { label: '✅ Clean Record only', filters: { skills: [], skillNames: [], affiliations: [], events: [], violations: true } },
  ];

  const applyQuickQuery = (preset) => {
    setIsAdvancedMode(true);
    const skillIds = availableSkills
      .filter(s => preset.filters.skillNames.includes(s.skill_name))
      .map(s => s.id);
    setAdvancedFilters({ skills: skillIds, affiliations: [], events: [], violations: preset.filters.violations });
    setHasSearched(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isAdvancedMode) {
      if (debouncedQuery.trim().length >= 2) performSearch(debouncedQuery);
      else setResults({ students: [], faculties: [], subjects: [], events: [] });
    }
  }, [debouncedQuery, isAdvancedMode]);

  const performSearch = async (query) => {
    setIsLoading(true); setError(null);
    try { const data = await api.search.query(query); setResults(data); }
    catch (err) { setError(err.message || 'Search failed.'); }
    finally { setIsLoading(false); }
  };

  const performAdvancedSearch = async () => {
    setIsLoading(true); setError(null); setHasSearched(true);
    try {
      const payload = {
        searchQuery,
        skills: advancedFilters.skills,
        affiliations: advancedFilters.affiliations,
        events: advancedFilters.events,
        ...(advancedFilters.violations ? { violations: false } : {}),
      };
      const data = await api.students.advancedSearch(payload);
      setAdvancedResults(data);
    } catch (err) { setError(err.message || 'Advanced search failed.'); }
    finally { setIsLoading(false); }
  };

  const toggleSkill = (id) => setAdvancedFilters(p => ({
    ...p, skills: p.skills.includes(id) ? p.skills.filter(x => x !== id) : [...p.skills, id]
  }));
  const toggleAffil = (name) => setAdvancedFilters(p => ({
    ...p, affiliations: p.affiliations.includes(name) ? p.affiliations.filter(x => x !== name) : [...p.affiliations, name]
  }));

  const hasStandardResults = Object.values(results).some(arr => arr?.length > 0);
  const isSearchEmpty = debouncedQuery.trim().length < 2 && !isAdvancedMode;

  // Group skills by category for display
  const skillsByCategory = availableSkills.reduce((acc, s) => {
    const cat = s.skill_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const renderResultSection = (title, items, type, icon, colorClass, bgClass) => {
    if (!items || items.length === 0) return null;
    return (
      <div className={`rounded-2xl p-6 shadow-sm border mb-6 transition-colors duration-300 ${card}`}>
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 ${bgClass} ${colorClass} rounded-lg flex items-center justify-center mr-3`}>{icon}</div>
          <h3 className={`text-lg font-bold ${boldText}`}>{title} <span className={`text-sm font-medium ml-2 ${subText}`}>({items.length})</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`p-4 rounded-xl border transition-colors ${resultCard}`}>
              <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full ${bgClass} ${colorClass} flex items-center justify-center font-bold text-xs mr-3 shrink-0`}>
                  {type === 'student' || type === 'faculty' ? item.first_name[0] : type === 'subject' ? item.subject_code[0] : item.eventName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${boldText}`}>
                    {type === 'student' || type === 'faculty' ? `${item.first_name} ${item.last_name}` : type === 'subject' ? item.subject_code : item.eventName}
                  </h4>
                  <p className={`text-xs truncate mt-0.5 ${subText}`}>
                    {type === 'student' ? item.email : type === 'faculty' ? item.position : type === 'subject' ? item.descriptive_title : item.eventType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Search Header ── */}
      <div className={`rounded-2xl p-8 shadow-sm border relative overflow-hidden transition-all duration-300 ${card}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 opacity-40 ${dark ? 'bg-brand-900' : 'bg-brand-50'}`} />
        <div className={`absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl -ml-10 -mb-10 opacity-40 ${dark ? 'bg-blue-900' : 'bg-blue-50'}`} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 tracking-tight ${boldText}`}>System-Wide Search</h2>
            <p className={`mb-4 max-w-md mx-auto text-sm ${subText}`}>Search students, faculty, subjects, and events — or run advanced profiling queries.</p>
            <div className="flex justify-center mb-4">
              <div className={`p-1 rounded-xl inline-flex shadow-inner ${tabBg}`}>
                <button onClick={() => setIsAdvancedMode(false)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${!isAdvancedMode ? tabActive : tabInact}`}>Global Search</button>
                <button onClick={() => setIsAdvancedMode(true)}  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${isAdvancedMode  ? tabActive : tabInact}`}>Advanced Query</button>
              </div>
            </div>
          </div>

          {/* Search input */}
          <div className="relative max-w-3xl mx-auto mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${isLoading ? 'text-brand-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAdvancedMode ? 'Optional: filter by name...' : 'Search by name, email, subject code, or event...'}
              className={`w-full pl-11 pr-10 py-3.5 border-2 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium shadow-sm ${inputBg}`} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Quick query presets */}
          {isAdvancedMode && (
            <div className="max-w-3xl mx-auto mb-2">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${subText}`}>⚡ Quick Queries</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUERIES.map(q => (
                  <button key={q.label} onClick={() => applyQuickQuery(q)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${dark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-brand-900/40 hover:border-brand-600 hover:text-brand-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'}`}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced filters */}
          {isAdvancedMode && (
            <div className={`mt-4 p-6 border rounded-2xl text-left shadow-inner ${filterBg}`}>
              {/* Skills */}
              <div className="mb-5">
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  💡 Required Skills
                  {advancedFilters.skills.length > 0 && <span className="ml-2 text-brand-400 font-black">{advancedFilters.skills.length} selected</span>}
                </h4>
                {Object.keys(skillsByCategory).length === 0 ? (
                  <p className={`text-xs ${subText}`}>Loading skills...</p>
                ) : (
                  Object.entries(skillsByCategory).map(([cat, skills]) => (
                    <div key={cat} className="mb-3">
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <button key={skill.id} onClick={() => toggleSkill(skill.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterBtn(advancedFilters.skills.includes(skill.id))}`}>
                            {skill.skill_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Affiliations */}
              <div className="mb-5">
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>🏛️ Affiliations</h4>
                <div className="flex flex-wrap gap-2">
                  {['Student Council', 'Programming Club', 'Sports Society', 'Debate Team', 'JPCS', 'SSC'].map(a => (
                    <button key={a} onClick={() => toggleAffil(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterBtn(advancedFilters.affiliations.includes(a))}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex flex-col md:flex-row items-center justify-between border-t pt-4 gap-4 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={advancedFilters.violations}
                      onChange={() => setAdvancedFilters(p => ({ ...p, violations: !p.violations }))} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${advancedFilters.violations ? 'bg-emerald-500' : dark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow ${advancedFilters.violations ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Clean Record Only (No Violations)</span>
                </label>
                <button onClick={performAdvancedSearch} disabled={isLoading}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 min-w-[160px] justify-center">
                  {isLoading
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Running...</>
                    : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Run Query</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${emptyCard}`}>
          <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${dark ? 'border-slate-700 border-t-brand-500' : 'border-slate-200 border-t-brand-500'}`} />
          <p className={`font-medium animate-pulse ${subText}`}>Running query...</p>
        </div>
      )}

      {/* Advanced results */}
      {!isLoading && isAdvancedMode && hasSearched && (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${card}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${boldText}`}>
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Query Results
              </h3>
              <p className={`text-sm mt-0.5 ${subText}`}>{advancedResults.length} student{advancedResults.length !== 1 ? 's' : ''} matched your criteria</p>
            </div>
            {advancedResults.length > 0 && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${dark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-100 text-brand-700'}`}>{advancedResults.length} results</span>
            )}
          </div>

          {advancedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className={`text-base font-bold ${boldText}`}>No students matched</p>
              <p className={`text-sm mt-1 ${subText}`}>Try loosening your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs uppercase tracking-wider border-b ${tHead}`}>
                    <th className="py-3 px-5 text-left font-bold">Student</th>
                    <th className="py-3 px-5 text-left font-bold hidden md:table-cell">Program</th>
                    <th className="py-3 px-5 text-left font-bold">Skills</th>
                    <th className="py-3 px-5 text-left font-bold hidden lg:table-cell">Affiliations</th>
                    <th className="py-3 px-5 text-center font-bold">Record</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? 'divide-slate-700/40' : 'divide-slate-100'}`}>
                  {advancedResults.map(s => (
                    <tr key={s.id} className={`transition-colors ${tRow}`}>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-100 text-brand-600'}`}>
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${boldText}`}>{s.first_name} {s.last_name}</p>
                            <p className={`text-xs ${subText}`}>{s.student_number || `ID: ${s.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`py-4 px-5 text-sm hidden md:table-cell ${subText}`}>
                        {s.program || s.course?.course_code || '—'} {s.year_level ? `· ${s.year_level}` : ''}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1">
                          {s.skills?.slice(0, 3).map(sk => (
                            <span key={sk.id} className={`px-2 py-0.5 rounded text-xs border ${dark ? 'bg-blue-900/30 text-blue-400 border-blue-700/40' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{sk.skill_name}</span>
                          ))}
                          {s.skills?.length > 3 && <span className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>+{s.skills.length - 3}</span>}
                          {(!s.skills || s.skills.length === 0) && <span className={`text-xs italic ${subText}`}>None</span>}
                        </div>
                      </td>
                      <td className={`py-4 px-5 text-xs hidden lg:table-cell ${subText}`}>
                        {s.affiliations?.length > 0 ? s.affiliations.map(a => a.organization_name).slice(0, 2).join(', ') + (s.affiliations.length > 2 ? ` +${s.affiliations.length - 2}` : '') : '—'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {s.violations?.length > 0
                          ? <span className={`text-xs font-bold px-2 py-1 rounded-full ${dark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>{s.violations.length} violation{s.violations.length > 1 ? 's' : ''}</span>
                          : <span className={`text-xs font-bold px-2 py-1 rounded-full ${dark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>Clean ✓</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Standard search results */}
      {!isLoading && !isAdvancedMode && (
        isSearchEmpty ? (
          <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed ${emptyCard}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-800 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <p className={`text-lg font-medium ${boldText}`}>Enter a search term to begin</p>
            <p className={`text-sm mt-1 max-w-sm text-center ${subText}`}>Type at least 2 characters to search across Students, Faculty, Subjects, and Events.</p>
          </div>
        ) : !hasStandardResults ? (
          <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border ${emptyCard}`}>
            <p className={`text-lg font-medium ${boldText}`}>No matches found</p>
            <p className={`text-sm mt-1 ${subText}`}>Nothing matched "{debouncedQuery}". Try a different term.</p>
          </div>
        ) : (
          <div>
            {renderResultSection('Students', results.students, 'student',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>,
              dark ? 'text-brand-400' : 'text-brand-600', dark ? 'bg-brand-900/40' : 'bg-brand-50')}
            {renderResultSection('Faculty', results.faculties, 'faculty',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
              dark ? 'text-emerald-400' : 'text-emerald-600', dark ? 'bg-emerald-900/40' : 'bg-emerald-50')}
            {renderResultSection('Subjects', results.subjects, 'subject',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
              dark ? 'text-amber-400' : 'text-amber-600', dark ? 'bg-amber-900/40' : 'bg-amber-50')}
            {renderResultSection('Events', results.events, 'event',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
              dark ? 'text-purple-400' : 'text-purple-600', dark ? 'bg-purple-900/40' : 'bg-purple-50')}
          </div>
        )
      )}
    </div>
  );
};

export default SearchModule;
