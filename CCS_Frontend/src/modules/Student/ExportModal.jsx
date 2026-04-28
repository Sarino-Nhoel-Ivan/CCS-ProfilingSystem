import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  XMarkIcon, DocumentArrowDownIcon, TableCellsIcon,
  UserIcon, UsersIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => (v == null || v === '' ? 'N/A' : String(v));
const fmtDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d.replace ? d.replace(' ', 'T') : d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d; }
};

// ── PDF: single student ───────────────────────────────────────────────────────
const exportSinglePDF = async (student) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const orange = [242, 101, 34];
  const slate  = [30, 41, 59];
  const W = doc.internal.pageSize.getWidth();

  // Header bar with logo
  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 32, 'F');
  
  // Add CCS logo (centered at top)
  try {
    const logoImg = await fetch('/ccs_logo.jpg').then(r => r.blob()).then(b => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(b);
    }));
    doc.addImage(logoImg, 'JPEG', (W - 15) / 2, 3, 15, 15);
  } catch (e) {
    console.warn('Logo not loaded:', e);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('CCS Profiling System', W / 2, 21, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Pamantasan ng Cabuyao — College of Computing Studies', W / 2, 26, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('STUDENT PROFILE REPORT', W / 2, 30, { align: 'center' });
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W - 14, 6, { align: 'right' });

  // Student name banner
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 32, W, 20, 'F');
  doc.setTextColor(...slate);
  doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text(`${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`, 14, 44);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Student No: ${fmt(student.student_number)}  ·  ${fmt(student.program)}  ·  ${fmt(student.year_level)}  ·  ${fmt(student.student_type)}`, 14, 50);

  let y = 58;

  const section = (title) => {
    doc.setFillColor(...orange);
    doc.rect(14, y, W - 28, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 16, y + 4.2);
    y += 9;
  };

  const row2col = (pairs) => {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      body: pairs,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, textColor: slate },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 45 },
        1: { cellWidth: 'auto' },
        2: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 45 },
        3: { cellWidth: 'auto' },
      },
      headStyles: { fillColor: [241, 245, 249] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    y = doc.lastAutoTable.finalY + 5;
  };

  // Personal Information
  section('Personal Information');
  row2col([
    ['Gender', fmt(student.gender), 'Nationality', fmt(student.nationality)],
    ['Birth Date', fmtDate(student.birth_date), 'Civil Status', fmt(student.civil_status)],
    ['Place of Birth', fmt(student.place_of_birth), 'Religion', fmt(student.religion)],
    ['Email', fmt(student.email), 'Contact No.', fmt(student.contact_number)],
  ]);

  // Address
  section('Address');
  row2col([
    ['Street', fmt(student.street), 'Barangay', fmt(student.barangay)],
    ['City', fmt(student.city), 'Province', fmt(student.province)],
    ['Zip Code', fmt(student.zip_code), '', ''],
  ]);

  // Enrollment
  section('Enrollment Details');
  row2col([
    ['Program', fmt(student.program), 'Year Level', fmt(student.year_level)],
    ['Section', fmt(student.section) || 'None', 'Student Type', fmt(student.student_type)],
    ['Date Enrolled', fmtDate(student.date_enrolled), 'Status', fmt(student.enrollment_status)],
  ]);

  // Guardians
  if (student.guardians?.length) {
    section('Guardians');
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      head: [['Name', 'Relationship', 'Contact', 'Email']],
      body: student.guardians.map(g => [fmt(g.full_name), fmt(g.relationship), fmt(g.contact_number), fmt(g.email)]),
      theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: orange, textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  // Medical
  if (student.medical_histories?.length) {
    section('Medical History');
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      head: [['Blood Type', 'Conditions / Allergies', 'Emergency Contact', 'Emergency No.']],
      body: student.medical_histories.map(m => [fmt(m.bloodtype), fmt(m.existing_conditions), fmt(m.emergency_contact_name), fmt(m.emergency_contact_number)]),
      theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  // Violations
  if (student.violations?.length) {
    section('Violations');
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      head: [['Type', 'Date', 'Severity', 'Status', 'Description']],
      body: student.violations.map(v => [fmt(v.violation_type), fmtDate(v.date_reported), fmt(v.severity_level), fmt(v.status), fmt(v.description)]),
      theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  // Skills
  if (student.skills?.length) {
    section('Skills & Competencies');
    autoTable(doc, {
      startY: y, margin: { left: 14, right: 14 },
      head: [['Skill Name', 'Proficiency Level']],
      body: student.skills.map(s => [fmt(s.skill_name), fmt(s.pivot?.proficiency_level || 'N/A')]),
      theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: orange, textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}  ·  CCS Profiling System  ·  Pamantasan ng Cabuyao`, W / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
  }

  doc.save(`student_${student.student_number || student.id}_${student.last_name}.pdf`);
};

// ── PDF: all students ─────────────────────────────────────────────────────────
const exportAllPDF = async (students) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const orange = [242, 101, 34];
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 26, 'F');
  
  // Add CCS logo (centered)
  try {
    const logoImg = await fetch('/ccs_logo.jpg').then(r => r.blob()).then(b => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(b);
    }));
    doc.addImage(logoImg, 'JPEG', (W - 12) / 2, 3, 12, 12);
  } catch (e) {
    console.warn('Logo not loaded:', e);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('CCS Profiling System — All Students Report', W / 2, 18, { align: 'center' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Pamantasan ng Cabuyao  ·  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  Total: ${students.length} students`, W / 2, 23, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    margin: { left: 10, right: 10 },
    head: [['#', 'Student No.', 'Full Name', 'Program', 'Year', 'Section', 'Type', 'Status', 'Email', 'Contact', 'Skills']],
    body: students.map((s, i) => [
      i + 1,
      fmt(s.student_number),
      `${s.first_name} ${s.middle_name ? s.middle_name[0] + '. ' : ''}${s.last_name}`,
      fmt(s.program),
      fmt(s.year_level),
      fmt(s.section) || 'None',
      fmt(s.student_type),
      fmt(s.enrollment_status),
      fmt(s.email),
      fmt(s.contact_number),
      s.skills?.length ? s.skills.map(sk => sk.skill_name).join(', ') : 'N/A',
    ]),
    theme: 'striped',
    styles: { fontSize: 6.5, cellPadding: 2 },
    headStyles: { fillColor: orange, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0:  { cellWidth: 7 },
      1:  { cellWidth: 20 },
      2:  { cellWidth: 32 },
      3:  { cellWidth: 28 },
      4:  { cellWidth: 16 },
      5:  { cellWidth: 14 },
      6:  { cellWidth: 16 },
      7:  { cellWidth: 18 },
      8:  { cellWidth: 42 },
      9:  { cellWidth: 22 },
      10: { cellWidth: 'auto' },
    },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}  ·  CCS Profiling System`, W / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
  }

  doc.save(`all_students_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ── XLSX: all students with actual embedded bar charts ────────────────────────
// Uses SheetJS (xlsx) for the workbook + manual chart XML injection into the zip.
const exportAllXLSX = async (students) => {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // ── helpers ──
  const orange = '00F26522';
  const white  = '00FFFFFF';
  const hdrStyle = {
    fill: { fgColor: { rgb: 'F26522' }, patternType: 'solid' },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
  };
  const altStyle = {
    fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' },
  };

  // ── Sheet 1: Student List ──────────────────────────────────────────────────
  const headers = ['#','Student No.','First Name','Middle Name','Last Name','Program',
    'Year Level','Section','Student Type','Enrollment Status','Email','Contact Number',
    'Gender','Birth Date','City','Province','Date Enrolled','Violations'];

  const rows = students.map((s, i) => [
    i + 1, fmt(s.student_number), fmt(s.first_name), fmt(s.middle_name), fmt(s.last_name),
    fmt(s.program), fmt(s.year_level), fmt(s.section) || 'None', fmt(s.student_type),
    fmt(s.enrollment_status), fmt(s.email), fmt(s.contact_number), fmt(s.gender),
    fmtDate(s.birth_date), fmt(s.city), fmt(s.province), fmtDate(s.date_enrolled),
    s.violations?.length || 0,
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws1['!cols'] = [4,13,14,13,14,24,11,10,13,18,30,15,9,18,14,14,18,11].map(w => ({ wch: w }));
  ws1['!rows'] = [{ hpt: 20 }]; // header row height
  // Style header cells
  headers.forEach((_, ci) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (!ws1[addr]) ws1[addr] = {};
    ws1[addr].s = hdrStyle;
  });
  // Freeze header
  ws1['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws1, 'Student List');

  // ── Analytics data ─────────────────────────────────────────────────────────
  const total      = students.length || 1;
  const enrolled   = students.filter(s => s.enrollment_status === 'Enrolled').length;
  const notEnrolled = total - enrolled;
  const violations = students.reduce((a, s) => a + (s.violations?.length || 0), 0);

  const yearLabels  = ['1st Year','2nd Year','3rd Year','4th Year'];
  const yearCounts  = yearLabels.map(y => students.filter(s => s.year_level === y).length);

  const programs = [...new Set(students.map(s => s.program).filter(Boolean))];
  const progCounts = programs.map(p => students.filter(s => s.program === p).length);
  const progOrder  = programs.map((p, i) => ({ p, c: progCounts[i] })).sort((a, b) => b.c - a.c);
  const progLabels = progOrder.map(x => x.p);
  const progVals   = progOrder.map(x => x.c);

  const types = [...new Set(students.map(s => s.student_type).filter(Boolean))];
  const typeOrder = types.map(t => ({ t, c: students.filter(s => s.student_type === t).length })).sort((a, b) => b.c - a.c);

  // Skills breakdown — count how many students have each skill
  const skillMap = {};
  students.forEach(s => {
    (s.skills || []).forEach(sk => {
      const name = sk.skill_name || sk.name || 'Unknown';
      skillMap[name] = (skillMap[name] || 0) + 1;
    });
  });
  const skillOrder = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 15); // top 15
  const skillLabels = skillOrder.map(([name]) => name);
  const skillVals   = skillOrder.map(([, count]) => count);

  // ── Sheet 2: Analytics ─────────────────────────────────────────────────────
  const analyticsAoa = [
    ['CCS PROFILING SYSTEM — DATA ANALYTICS REPORT', '', ''],
    [`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, '', ''],
    [],
    ['SUMMARY', 'Value', '%'],
    ['Total Students',   total,       '100%'],
    ['Enrolled',         enrolled,    `${Math.round((enrolled/total)*100)}%`],
    ['Not Enrolled',     notEnrolled, `${Math.round((notEnrolled/total)*100)}%`],
    ['Total Violations', violations,  ''],
    [],
    ['STUDENTS BY YEAR LEVEL', 'Count', '%'],
    ...yearLabels.map((y, i) => [y, yearCounts[i], `${Math.round((yearCounts[i]/total)*100)}%`]),
    [],
    ['STUDENTS BY PROGRAM', 'Count', '%'],
    ...progLabels.map((p, i) => [p, progVals[i], `${Math.round((progVals[i]/total)*100)}%`]),
    [],
    ['STUDENTS BY TYPE', 'Count', '%'],
    ...typeOrder.map(({ t, c }) => [t, c, `${Math.round((c/total)*100)}%`]),
    [],
    ['TOP SKILLS', 'Students', '%'],
    ...skillLabels.map((sk, i) => [sk, skillVals[i], `${Math.round((skillVals[i]/total)*100)}%`]),
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(analyticsAoa);
  ws2['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 12 }];

  // Style section headers
  const sectionRows = [3, 9, 9 + yearLabels.length + 2, 9 + yearLabels.length + 2 + progLabels.length + 2];
  sectionRows.forEach(r => {
    ['A','B','C'].forEach(col => {
      const addr = `${col}${r + 1}`;
      if (ws2[addr]) ws2[addr].s = hdrStyle;
    });
  });

  XLSX.utils.book_append_sheet(wb, ws2, 'Analytics');

  // ── Sheet 3: Violations ────────────────────────────────────────────────────
  const vHeaders = ['Student No.','Student Name','Program','Year Level',
    'Violation Type','Date Reported','Severity','Status','Description'];
  const vRows = [];
  students.forEach(s => {
    (s.violations || []).forEach(v => {
      vRows.push([
        fmt(s.student_number), `${s.first_name} ${s.last_name}`,
        fmt(s.program), fmt(s.year_level), fmt(v.violation_type),
        fmtDate(v.date_reported), fmt(v.severity_level), fmt(v.status), fmt(v.description),
      ]);
    });
  });
  const ws3 = XLSX.utils.aoa_to_sheet([vHeaders, ...vRows]);
  ws3['!cols'] = [13,22,22,11,22,16,11,16,34].map(w => ({ wch: w }));
  const redHdr = {
    fill: { fgColor: { rgb: 'EF4444' }, patternType: 'solid' },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    alignment: { horizontal: 'center' },
  };
  vHeaders.forEach((_, ci) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (!ws3[addr]) ws3[addr] = {};
    ws3[addr].s = redHdr;
  });
  ws3['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws3, 'Violations');

  // ── Write with cell styles (requires xlsx-js-style or write with bookSST) ──
  // Use XLSX.write with type 'array' then inject chart XML into the zip
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });

  // ── Inject chart XML into the XLSX zip ────────────────────────────────────
  // XLSX files are ZIP archives. We open the zip, add chart XML files,
  // and update the relationships so Excel renders the charts.
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(wbout);

  // ── Build chart XML for bar charts (embedded data, no sheet references) ──
  const escXml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const buildBarChartXml = (chartId, title, categories, values, color) => {
    const catXml = categories.map((c, i) =>
      `<c:pt idx="${i}"><c:v>${escXml(c)}</c:v></c:pt>`).join('');
    const valXml = values.map((v, i) =>
      `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('');
    const ptCount = categories.length;
    const axCat = chartId * 1000 + 1;
    const axVal = chartId * 1000 + 2;
    // Compute a clean max for the Y axis (next round number above max value)
    const maxVal = Math.max(...values, 1);
    const yMax = Math.ceil(maxVal / Math.max(1, Math.pow(10, Math.floor(Math.log10(maxVal))))) *
                 Math.max(1, Math.pow(10, Math.floor(Math.log10(maxVal))));

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:chart>
    <c:title>
      <c:tx><c:rich><a:bodyPr/><a:lstStyle/>
        <a:p><a:pPr><a:defRPr b="1" sz="1200"/></a:pPr>
          <a:r><a:rPr lang="en-US" b="1"/><a:t>${escXml(title)}</a:t></a:r>
        </a:p>
      </c:rich></c:tx>
      <c:overlay val="0"/>
    </c:title>
    <c:autoTitleDeleted val="0"/>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:spPr>
            <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
            <a:ln><a:noFill/></a:ln>
          </c:spPr>
          <c:dLbls>
            <c:numFmt formatCode="General" sourceLinked="0"/>
            <c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>
            <c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr b="1" sz="900"/></a:pPr></a:p></c:txPr>
            <c:showLegendKey val="0"/>
            <c:showVal val="1"/>
            <c:showCatName val="0"/>
            <c:showSerName val="0"/>
            <c:showPercent val="0"/>
            <c:showBubbleSize val="0"/>
          </c:dLbls>
          <c:cat>
            <c:strLit>
              <c:ptCount val="${ptCount}"/>
              ${catXml}
            </c:strLit>
          </c:cat>
          <c:val>
            <c:numLit>
              <c:formatCode>General</c:formatCode>
              <c:ptCount val="${ptCount}"/>
              ${valXml}
            </c:numLit>
          </c:val>
        </c:ser>
        <c:axId val="${axCat}"/>
        <c:axId val="${axVal}"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="${axCat}"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:numFmt formatCode="General" sourceLinked="0"/>
        <c:tickLblPos val="nextTo"/>
        <c:spPr><a:ln><a:solidFill><a:srgbClr val="D1D5DB"/></a:solidFill></a:ln></c:spPr>
        <c:txPr><a:bodyPr rot="-2700000"/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr></a:p></c:txPr>
        <c:crossAx val="${axVal}"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
        <c:noMultiLvlLbl val="0"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="${axVal}"/>
        <c:scaling>
          <c:orientation val="minMax"/>
          <c:min val="0"/>
          <c:max val="${yMax}"/>
        </c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:numFmt formatCode="General" sourceLinked="0"/>
        <c:tickLblPos val="nextTo"/>
        <c:spPr><a:ln><a:solidFill><a:srgbClr val="D1D5DB"/></a:solidFill></a:ln></c:spPr>
        <c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900"/></a:pPr></a:p></c:txPr>
        <c:crossAx val="${axCat}"/>
        <c:crossBetween val="between"/>
        <c:majorUnit val="1"/>
      </c:valAx>
    </c:plotArea>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
  </c:chart>
  <c:spPr>
    <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
    <a:ln><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln>
  </c:spPr>
</c:chartSpace>`;
  };

  // Year level chart
  const chart1Xml = buildBarChartXml(1, 'Students by Year Level', yearLabels, yearCounts, 'F26522');
  // Program chart
  const chart2Xml = buildBarChartXml(2, 'Students by Program', progLabels, progVals, '3B82F6');
  // Skills chart (only if there are skills)
  const chart3Xml = skillLabels.length > 0
    ? buildBarChartXml(3, 'Top Skills', skillLabels, skillVals, '22C55E')
    : null;

  // Add chart files to zip
  zip.file('xl/charts/chart1.xml', chart1Xml);
  zip.file('xl/charts/chart2.xml', chart2Xml);
  if (chart3Xml) zip.file('xl/charts/chart3.xml', chart3Xml);

  // Chart relationships
  zip.file('xl/charts/_rels/chart1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);
  zip.file('xl/charts/_rels/chart2.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);
  if (chart3Xml) zip.file('xl/charts/_rels/chart3.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);

  // Drawing XML for sheet 2 (Analytics) — positions all 3 charts side by side
  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
  <xdr:twoCellAnchor moveWithCells="1" sizeWithCells="1">
    <xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>2</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>11</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>14</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro=""><xdr:nvGraphicFramePr>
      <xdr:cNvPr id="2" name="Chart 1"/><xdr:cNvGraphicFramePr/>
    </xdr:nvGraphicFramePr>
    <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
    <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
      <c:chart r:id="rId1"/>
    </a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/>
  </xdr:twoCellAnchor>
  <xdr:twoCellAnchor moveWithCells="1" sizeWithCells="1">
    <xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>15</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>11</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>27</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro=""><xdr:nvGraphicFramePr>
      <xdr:cNvPr id="3" name="Chart 2"/><xdr:cNvGraphicFramePr/>
    </xdr:nvGraphicFramePr>
    <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
    <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
      <c:chart r:id="rId2"/>
    </a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/>
  </xdr:twoCellAnchor>${chart3Xml ? `
  <xdr:twoCellAnchor moveWithCells="1" sizeWithCells="1">
    <xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>28</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>11</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>40</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro=""><xdr:nvGraphicFramePr>
      <xdr:cNvPr id="4" name="Chart 3"/><xdr:cNvGraphicFramePr/>
    </xdr:nvGraphicFramePr>
    <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
    <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
      <c:chart r:id="rId3"/>
    </a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/>
  </xdr:twoCellAnchor>` : ''}
</xdr:wsDr>`;

  zip.file('xl/drawings/drawing1.xml', drawingXml);

  // Drawing relationships
  const drawingRelsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart2.xml"/>${chart3Xml ? `
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart3.xml"/>` : ''}
</Relationships>`;
  zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRelsContent);

  // Patch sheet2 XML to reference the drawing
  const sheet2Path = 'xl/worksheets/sheet2.xml';
  let sheet2Xml = await zip.file(sheet2Path)?.async('string') || '';
  if (sheet2Xml && !sheet2Xml.includes('<drawing')) {
    // Ensure xmlns:r is declared on the root <worksheet> element so r:id is valid
    if (!sheet2Xml.includes('xmlns:r=')) {
      sheet2Xml = sheet2Xml.replace(
        '<worksheet ',
        '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      );
    }
    // Insert drawing reference before </worksheet>
    sheet2Xml = sheet2Xml.replace('</worksheet>',
      '<drawing r:id="rId1"/></worksheet>');
    zip.file(sheet2Path, sheet2Xml);
  }

  // Patch sheet2 relationships to include drawing
  const sheet2RelsPath = 'xl/worksheets/_rels/sheet2.xml.rels';
  let sheet2Rels = await zip.file(sheet2RelsPath)?.async('string') || '';
  if (!sheet2Rels) {
    sheet2Rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
  }
  // Use rId1 — must not conflict with existing rels; check and use a safe ID
  const drawingRelId = sheet2Rels.includes('rId1') ? 'rId99' : 'rId1';
  // Fix the drawing reference in sheet XML to use the actual ID chosen
  if (drawingRelId !== 'rId1') {
    sheet2Xml = (await zip.file(sheet2Path)?.async('string')) || sheet2Xml;
    sheet2Xml = sheet2Xml.replace('r:id="rId1"', `r:id="${drawingRelId}"`);
    zip.file(sheet2Path, sheet2Xml);
  }
  sheet2Rels = sheet2Rels.replace('</Relationships>',
    `<Relationship Id="${drawingRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
  zip.file(sheet2RelsPath, sheet2Rels);

  // Patch [Content_Types].xml to register chart and drawing content types
  let contentTypes = await zip.file('[Content_Types].xml')?.async('string') || '';
  const chartType    = 'application/vnd.openxmlformats-officedocument.drawingml.chart+xml';
  const drawingType  = 'application/vnd.openxmlformats-officedocument.drawing+xml';
  if (!contentTypes.includes('chart1.xml')) {
    contentTypes = contentTypes.replace('</Types>',
      `<Override PartName="/xl/charts/chart1.xml" ContentType="${chartType}"/>` +
      `<Override PartName="/xl/charts/chart2.xml" ContentType="${chartType}"/>` +
      (chart3Xml ? `<Override PartName="/xl/charts/chart3.xml" ContentType="${chartType}"/>` : '') +
      `<Override PartName="/xl/drawings/drawing1.xml" ContentType="${drawingType}"/>` +
      `</Types>`);
    zip.file('[Content_Types].xml', contentTypes);
  }

  // Generate final blob and download
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `students_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ── Modal Component ───────────────────────────────────────────────────────────
const ExportModal = ({ isOpen, onClose, students, selectedStudent }) => {
  const dark = useDarkMode();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null); // 'single-pdf' | 'all-pdf' | 'all-xlsx'

  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const footerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!exportType) return;
    setIsExporting(true);
    try {
      if (exportType === 'single-pdf' && selectedStudent) {
        await exportSinglePDF(selectedStudent);
      } else if (exportType === 'all-pdf') {
        await exportAllPDF(students);
      } else if (exportType === 'all-xlsx') {
        await exportAllXLSX(students);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message || 'Unknown error'}. Check the browser console for details.`);
    } finally {
      setIsExporting(false);
    }
  };

  const options = [
    ...(selectedStudent ? [{
      id: 'single-pdf',
      icon: UserIcon,
      iconBg: dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500',
      title: 'Single Student — PDF',
      desc: `Export full profile of ${selectedStudent.first_name} ${selectedStudent.last_name} as a PDF document.`,
      badge: 'PDF',
      badgeCls: dark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
    }] : []),
    {
      id: 'all-pdf',
      icon: UsersIcon,
      iconBg: dark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-500',
      title: 'All Students — PDF',
      desc: `Export a summary table of all ${students.length} students as a PDF document.`,
      badge: 'PDF',
      badgeCls: dark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
    },
    {
      id: 'all-xlsx',
      icon: TableCellsIcon,
      iconBg: dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-500',
      title: 'All Students — XLSX with Charts',
      desc: `Export all ${students.length} students with 3 sheets: Student List (styled), Analytics (with bar charts for Year Level & Program), and Violations.`,
      badge: 'XLSX',
      badgeCls: dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-5 border-b ${divider} ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-orange-50/60 to-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                <DocumentArrowDownIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-base font-bold ${boldText}`}>Export / Generate Report</h2>
                <p className={`text-xs ${subText}`}>Choose the format and scope for your export.</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="p-5 space-y-3">
            {options.map(opt => (
              <button key={opt.id} onClick={() => setExportType(opt.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  exportType === opt.id
                    ? (dark ? 'border-orange-500/60 bg-orange-900/20 ring-1 ring-orange-500/40' : 'border-orange-400 bg-orange-50 ring-1 ring-orange-400/30')
                    : (dark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/60' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${boldText}`}>{opt.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.badgeCls}`}>{opt.badge}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${subText}`}>{opt.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                  exportType === opt.id
                    ? 'border-orange-500 bg-orange-500'
                    : (dark ? 'border-slate-600' : 'border-slate-300')
                }`}>
                  {exportType === opt.id && <div className="w-full h-full rounded-full bg-white scale-50 block" />}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-5 py-4 flex justify-end gap-3 border-t ${footerBg}`}>
            <button onClick={onClose} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Cancel
            </button>
            <button onClick={handleExport} disabled={!exportType || isExporting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-40 flex items-center gap-2 min-w-[130px] justify-center">
              {isExporting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exporting...</>
                : <><DocumentArrowDownIcon className="w-4 h-4" />Export</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
