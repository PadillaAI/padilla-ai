const pptxgen = require('pptxgenjs');
const path = require('path');
const IMG = f => path.join(__dirname, 'img', f);

const NAVY='1E2761', DEEP='141C43', PANEL='24306B', ICE='CADCFC', AMBER='E9A03B',
      AMBER_D='C9812A', WHITE='FFFFFF', SLATE='5A6478', BODY='2A3145', MIST='F4F7FD',
      GREEN='4E8A6B';
const HFONT='Cambria', BFONT='Calibri';
const sh = (o) => Object.assign({type:'outer', color:'0B1030', blur:12, offset:4, angle:45, opacity:0.28}, o||{});

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';                       // 10" x 5.625"
pres.author = 'Nancy Chung';
pres.company = 'Select National Properties';
pres.title = 'PowerPoint Skills Test';
pres.subject = 'Campus Recruiting — Austin, Texas';
pres.theme = { headFontFace: HFONT, bodyFontFace: BFONT };

pres.defineSlideMaster({
  title: 'SNP_DARK', background: { color: DEEP },
  objects: [
    { rect: { x:0, y:0, w:10, h:5.625, fill:{ color: DEEP } } },
    { ellipse: { x:7.6, y:-1.5, w:4.2, h:4.2, fill:{ color: PANEL } } },
    { ellipse: { x:-1.2, y:3.9, w:3.0, h:3.0, fill:{ color: PANEL } } },
  ],
});
pres.defineSlideMaster({
  title: 'SNP_LIGHT', background: { color: WHITE },
  objects: [
    { ellipse: { x:8.9, y:-1.1, w:2.6, h:2.6, fill:{ color: MIST } } },
    { ellipse: { x:-0.9, y:4.6, w:2.2, h:2.2, fill:{ color: MIST } } },
  ],
});

const T = (slide, text, opt) => slide.addText(text, Object.assign({ isTextBox:true, margin:0 }, opt));

/* ============================ SLIDE 1 — TITLE ============================ */
{
  const s = pres.addSlide({ masterName:'SNP_DARK' });
  T(s, 'SELECT NATIONAL PROPERTIES', { x:0.55, y:0.55, w:4.6, h:0.3, fontSize:11.5, bold:true,
      color:AMBER, fontFace:BFONT, charSpacing:3 });
  T(s, "Build What's Next in Austin", { x:0.52, y:0.92, w:4.6, h:1.45, fontSize:36, bold:true,
      color:WHITE, fontFace:HFONT, lineSpacingMultiple:0.95, valign:'top' });
  T(s, 'Careers for new college graduates at our new Austin, Texas office', {
      x:0.55, y:2.42, w:4.3, h:0.6, fontSize:14, color:ICE, fontFace:BFONT, lineSpacingMultiple:1.15 });
  s.addShape(pres.ShapeType.roundRect, { x:0.55, y:3.28, w:4.35, h:1.0, rectRadius:0.12,
      fill:{ color:PANEL }, line:{ color:AMBER, width:1.5 }, shadow: sh({blur:14, offset:5}) });
  T(s, [
      { text:'Presented by Nancy Chung', options:{ fontSize:16, bold:true, color:WHITE, breakLine:true } },
      { text:'Human Resources Director', options:{ fontSize:11.5, color:ICE } },
    ], { x:0.85, y:3.45, w:3.8, h:0.7, fontFace:BFONT, valign:'middle' });
  s.addImage({ path:IMG('01-skyline.png'), x:4.98, y:1.02, w:4.5, h:2.5, shadow: sh({blur:18, offset:7, opacity:0.45}) });
  T(s, 'Austin, Texas — our newest office', { x:4.98, y:3.62, w:4.5, h:0.3, fontSize:10.5,
      color:ICE, fontFace:BFONT, align:'right', italic:true });
  T(s, 'Campus Recruiting  •  Fall 2026', { x:0.55, y:4.62, w:5, h:0.3, fontSize:10.5, color:'8E9BC9', fontFace:BFONT });
  s.addNotes('Welcome and introduction. Nancy Chung, HR Director, is recruiting new graduates for the new Austin, Texas office of Select National Properties.');
}

/* ====================== SLIDE 2 — BACKGROUND, PART 1 ====================== */
{
  const s = pres.addSlide({ masterName:'SNP_LIGHT' });
  T(s, 'Who We Are', { x:0.55, y:0.42, w:6, h:0.55, fontSize:32, bold:true, color:NAVY, fontFace:HFONT });
  T(s, 'A diversified real estate company serving clients nationwide', {
      x:0.57, y:1.0, w:5.5, h:0.32, fontSize:13, color:SLATE, fontFace:BFONT, italic:true });
  const rows = [
    ['1','What we do','We develop, build, manage, and acquire a wide variety of properties nationwide.'],
    ['2','Our mission','To lead the real estate development business through integrity, high ethical standards, and operational expertise.'],
    ['3','Commercial portfolio','Shopping malls, mixed-use town center developments, high-rise office buildings, and office parks.'],
    ['4','And much more','Industrial buildings and warehouses, multifamily housing, educational facilities, and hospitals.'],
  ];
  rows.forEach((r, i) => {
    const y = 1.5 + i*0.92;
    s.addShape(pres.ShapeType.ellipse, { x:0.55, y:y+0.04, w:0.42, h:0.42, fill:{ color: i%2 ? NAVY : AMBER },
      line:{ color:'FFFFFF', width:0 } });
    T(s, r[0], { x:0.55, y:y+0.04, w:0.42, h:0.42, fontSize:14, bold:true, color:WHITE, fontFace:BFONT,
      align:'center', valign:'middle' });
    T(s, [
      { text:r[1], options:{ fontSize:13.5, bold:true, color:NAVY, breakLine:true } },
      { text:r[2], options:{ fontSize:11.5, color:BODY } },
    ], { x:1.15, y:y, w:4.85, h:0.78, fontFace:BFONT, lineSpacingMultiple:1.05 });
  });
  s.addImage({ path:IMG('02-portfolio.png'), x:6.35, y:1.5, w:3.1, h:3.1, rounding:true, shadow: sh({blur:16, offset:6}) });
  T(s, 'Malls  •  Offices  •  Industrial  •  Housing  •  Hospitals', {
      x:5.95, y:4.72, w:3.9, h:0.3, fontSize:9.5, color:SLATE, fontFace:BFONT, align:'center' });
  s.addNotes('Company background, part 1: what Select National Properties does, our mission, and the property types in our portfolio.');
}

/* ====================== SLIDE 3 — BACKGROUND, PART 2 ====================== */
{
  const s = pres.addSlide({ masterName:'SNP_LIGHT' });
  T(s, 'Where We Build', { x:0.55, y:0.42, w:6, h:0.55, fontSize:32, bold:true, color:NAVY, fontFace:HFONT });
  T(s, 'Our hometown, our national footprint, and what we stand for', {
      x:0.57, y:1.0, w:6, h:0.3, fontSize:13, color:SLATE, fontFace:BFONT, italic:true });
  s.addShape(pres.ShapeType.rect, { x:0.55, y:1.32, w:4.32, h:2.82, fill:{ color:WHITE },
      line:{ color:ICE, width:1 }, shadow: sh({blur:16, offset:6, opacity:0.35}) });
  s.addImage({ path:IMG('03-sustainable.png'), x:0.69, y:1.46, w:4.04, h:2.54 });
  T(s, 'Quality construction, built to last', { x:0.55, y:4.24, w:4.32, h:0.3, fontSize:10.5,
      color:SLATE, fontFace:BFONT, italic:true, align:'center' });
  const blocks = [
    ['Hometown roots', 'Residential developments are located mainly in and around our hometown of Chicago.'],
    ['A national footprint', 'Commercial and public buildings in our portfolio are located nationwide.'],
    ['Respected for quality', 'The company is well respected for its focus on quality in everything we build.'],
    ['Committed to community', 'We are committed to the environment and to the economic development of the areas where we operate.'],
  ];
  blocks.forEach((b, i) => {
    const y = 1.42 + i*0.79;
    s.addShape(pres.ShapeType.roundRect, { x:5.2, y:y, w:4.25, h:0.68, rectRadius:0.1,
      fill:{ color: i%2 ? MIST : 'EAF0FC' }, line:{ color:'FFFFFF', width:0 } });
    T(s, [
      { text:b[0] + '  ', options:{ fontSize:12.5, bold:true, color: i===3 ? GREEN : NAVY } },
      { text:b[1], options:{ fontSize:10.5, color:BODY } },
    ], { x:5.38, y:y+0.04, w:3.9, h:0.6, fontFace:BFONT, valign:'middle', lineSpacingMultiple:1.02 });
  });
  T(s, 'Integrity  •  Ethics  •  Operational expertise', {
      x:5.2, y:4.64, w:4.25, h:0.3, fontSize:10, bold:true, color:AMBER_D, fontFace:BFONT, align:'center' });
  s.addNotes('Company background, part 2: where we build, our reputation for quality, and our commitment to the environment and to local economic development.');
}

/* ========================= SLIDE 4 — CHART (FIG 1) ======================== */
{
  const s = pres.addSlide({ masterName:'SNP_LIGHT' });
  T(s, 'Sales Growth by Sector', { x:0.5, y:0.34, w:6.4, h:0.5, fontSize:32, bold:true, color:NAVY, fontFace:HFONT });
  T(s, 'Figure 1 — sales in millions of dollars, 2022 through 2024', {
      x:0.52, y:0.88, w:6.4, h:0.3, fontSize:12, color:SLATE, fontFace:BFONT, italic:true });
  s.addChart(pres.ChartType.bar, [
    { name:'Residential', labels:['2022','2023','2024'], values:[125,158,209] },
    { name:'Commercial',  labels:['2022','2023','2024'], values:[167,219,282] },
    { name:'Land',        labels:['2022','2023','2024'], values:[95,132,191] },
  ], {
    x:0.45, y:1.28, w:6.4, h:3.9,
    barDir:'col', barGrouping:'clustered', barGapWidthPct:55,
    chartColors:[NAVY, AMBER, GREEN],
    showTitle:true, title:'Sales by Sector ($ millions)', titleFontSize:13, titleColor:NAVY, titleFontFace:BFONT,
    showValue:true, dataLabelPosition:'outEnd', dataLabelFontSize:9, dataLabelColor:BODY, dataLabelFontFace:BFONT,
    showLegend:true, legendPos:'b', legendFontSize:10, legendColor:BODY, legendFontFace:BFONT,
    catAxisLabelColor:BODY, catAxisLabelFontSize:11, catAxisLabelFontFace:BFONT, catAxisLineShow:true,
    valAxisLabelColor:SLATE, valAxisLabelFontSize:9, valAxisLabelFontFace:BFONT, valAxisMinVal:0, valAxisMaxVal:320,
    valGridLine:{ color:'E2E8F5', size:1 }, catGridLine:{ style:'none' },
    border:{ pt:0, color:'FFFFFF' }, fill:'FFFFFF',
  });
  s.addShape(pres.ShapeType.rect, { x:7.02, y:1.25, w:2.51, h:1.81, fill:{ color:NAVY }, line:{ color:NAVY, width:0 } });
  s.addImage({ path:IMG('04-growth.png'), x:7.05, y:1.28, w:2.45, h:1.75 });
  s.addShape(pres.ShapeType.roundRect, { x:7.05, y:3.2, w:2.45, h:1.05, rectRadius:0.12, fill:{ color:NAVY },
      line:{ color:'FFFFFF', width:0 }, shadow: sh({blur:10, offset:4, opacity:0.22}) });
  T(s, [
    { text:'$682M', options:{ fontSize:25, bold:true, color:AMBER, breakLine:true } },
    { text:'total sales in 2024', options:{ fontSize:10.5, color:ICE } },
  ], { x:7.05, y:3.28, w:2.45, h:0.9, fontFace:BFONT, align:'center', valign:'middle' });
  s.addShape(pres.ShapeType.roundRect, { x:7.05, y:4.4, w:2.45, h:0.5, rectRadius:0.1, fill:{ color:'EAF0FC' },
      line:{ color:'FFFFFF', width:0 } });
  T(s, '+76% growth since 2022', { x:7.05, y:4.4, w:2.45, h:0.5, fontSize:12, bold:true, color:NAVY,
      fontFace:BFONT, align:'center', valign:'middle' });
  s.addNotes('Figure 1 as a clustered column chart. Every sector has grown each year; total sales rose from $387M in 2022 to $682M in 2024.');
}

/* ========================= SLIDE 5 — TABLE (FIG 2) ======================== */
{
  const s = pres.addSlide({ masterName:'SNP_LIGHT' });
  T(s, 'Now Recruiting', { x:0.5, y:0.34, w:6.4, h:0.5, fontSize:32, bold:true, color:NAVY, fontFace:HFONT });
  T(s, 'Figure 2 — professional opportunities for new college graduates', {
      x:0.52, y:0.88, w:6.4, h:0.3, fontSize:12, color:SLATE, fontFace:BFONT, italic:true });
  const hdr = { fill:{ color:NAVY }, color:WHITE, bold:true, fontSize:13, align:'center', valign:'middle' };
  const rows = [
    [{ text:'Position', options:hdr }, { text:'Description', options:hdr }, { text:'Salary', options:hdr }],
    ['Civil Engineer',
     'Applies knowledge of design, construction procedures, zoning and building codes, and building materials to render structural designs.',
     '$79,340'],
    ['Project Manager',
     'Prepares and reviews facilities plans, construction contract bid documents, and specifications for projects. Monitors project progress and costs.',
     '$85,000'],
    ['Accountant',
     'Performs professional accounting work, including auditing, analyzing, and verifying fiscal records and reports.',
     '$64,000'],
  ];
  const body = rows.map((r, i) => {
    if (i === 0) return r;
    return [
      { text:r[0], options:{ bold:true, color:NAVY, fontSize:12.5, align:'left', valign:'middle' } },
      { text:r[1], options:{ color:BODY, fontSize:10.5, align:'left', valign:'middle' } },
      { text:r[2], options:{ bold:true, color:AMBER_D, fontSize:13, align:'center', valign:'middle' } },
    ];
  });
  s.addTable(body, {
    x:0.5, y:1.45, w:5.95, colW:[1.35, 3.35, 1.25],
    rowH:[0.45, 0.95, 1.0, 0.92],
    border:{ type:'solid', color:'D6E0F3', pt:1 },
    fill:{ color:'FFFFFF' }, fontFace:BFONT, margin:0.08,
    valign:'middle', autoPage:false,
  });
  s.addShape(pres.ShapeType.roundRect, { x:6.84, y:1.57, w:2.78, h:1.82, rectRadius:0.08, fill:{ color:AMBER },
      line:{ color:'FFFFFF', width:0 } });
  s.addImage({ path:IMG('05-careers.png'), x:6.72, y:1.45, w:2.78, h:1.82 });
  s.addShape(pres.ShapeType.roundRect, { x:6.72, y:3.5, w:2.78, h:1.1, rectRadius:0.12, fill:{ color:AMBER },
      line:{ color:'FFFFFF', width:0 }, shadow: sh({blur:10, offset:4, opacity:0.2}) });
  T(s, [
    { text:'Interviewing on campus', options:{ fontSize:13, bold:true, color:'1B2140', breakLine:true } },
    { text:'Bring a résumé — we hire year-round', options:{ fontSize:10, color:'2A3145' } },
  ], { x:6.78, y:3.58, w:2.66, h:0.94, fontFace:BFONT, align:'center', valign:'middle' });
  T(s, 'Salaries shown are starting annual salaries for the Austin office.', {
      x:0.5, y:4.92, w:5.95, h:0.3, fontSize:10, color:SLATE, fontFace:BFONT, italic:true });
  s.addNotes('Figure 2 as a three-column, four-row table: position, description, and starting salary for each opening.');
}

/* ========================= SLIDE 6 — YOUTUBE VIDEO ======================= */
{
  const s = pres.addSlide({ masterName:'SNP_DARK' });
  T(s, 'See It for Yourself', { x:0.55, y:0.42, w:6, h:0.5, fontSize:32, bold:true, color:WHITE, fontFace:HFONT });
  T(s, 'Press play in Slide Show view', { x:0.57, y:0.96, w:5.5, h:0.3, fontSize:12, color:ICE,
      fontFace:BFONT, italic:true });
  s.addMedia({ type:'online', link:'https://www.youtube.com/embed/jNQXAC9IVRw',
      x:0.55, y:1.4, w:5.55, h:3.12 });
  s.addImage({ path:IMG('06-campus.png'), x:6.45, y:1.45, w:2.95, h:2.11, rotate:3, shadow: sh({blur:16, offset:6, opacity:0.5}) });
  T(s, [
    { text:'From campus to career', options:{ fontSize:15, bold:true, color:AMBER, breakLine:true } },
    { text:'Our Austin team is built around new graduates who want responsibility early and mentoring along the way.',
      options:{ fontSize:11.5, color:ICE } },
  ], { x:6.45, y:3.78, w:2.98, h:1.1, fontFace:BFONT, lineSpacingMultiple:1.1 });
  T(s, 'Video: embedded from YouTube', { x:0.55, y:4.62, w:5.55, h:0.3, fontSize:10, color:'8E9BC9', fontFace:BFONT });
  s.addNotes('Play the embedded YouTube video here. To use a different clip: Insert > Video > Online Video, then paste the YouTube link.');
}

/* ========================= SLIDE 7 — SMARTART =========================== */
{
  const s = pres.addSlide({ masterName:'SNP_LIGHT' });
  T(s, 'Your Path to Joining Us', { x:0.5, y:0.34, w:6.4, h:0.5, fontSize:32, bold:true, color:NAVY, fontFace:HFONT });
  T(s, 'Five steps from your campus interview to your first Austin project', {
      x:0.52, y:0.88, w:6.4, h:0.3, fontSize:12, color:SLATE, fontFace:BFONT, italic:true });
  // SmartArt graphic frame is injected here in post-processing (placeholder shape is replaced)
  s.addShape(pres.ShapeType.rect, { x:0.5, y:1.35, w:6.35, h:2.55, fill:{ color:'FFFFFF' },
      line:{ color:'FFFFFF', width:0 }, shapeName:'SMARTART_SLOT' });
  s.addShape(pres.ShapeType.ellipse, { x:7.02, y:1.3, w:2.5, h:2.5, fill:{ color:AMBER },
      line:{ color:'FFFFFF', width:0 } });
  s.addImage({ path:IMG('07-people.png'), x:7.12, y:1.4, w:2.3, h:2.3, rounding:true });
  T(s, 'A team you grow with', { x:6.92, y:3.9, w:2.7, h:0.3, fontSize:11, bold:true, color:NAVY,
      fontFace:BFONT, align:'center' });
  s.addShape(pres.ShapeType.roundRect, { x:0.5, y:4.28, w:6.35, h:0.85, rectRadius:0.12, fill:{ color:MIST },
      line:{ color:'FFFFFF', width:0 } });
  T(s, [
    { text:'Ready to start?  ', options:{ fontSize:13.5, bold:true, color:NAVY } },
    { text:'Stop by our table after this session and talk with Nancy Chung about the Austin office.',
      options:{ fontSize:11.5, color:BODY } },
  ], { x:0.75, y:4.38, w:5.85, h:0.65, fontFace:BFONT, valign:'middle', lineSpacingMultiple:1.05 });
  s.addNotes('SmartArt process graphic: Apply Online, Campus Interview, Office Visit, Offer, Day One in Austin. Close by inviting students to the recruiting table.');
}

pres.writeFile({ fileName: path.join(__dirname, 'raw.pptx') }).then(f => console.log('wrote', f));
