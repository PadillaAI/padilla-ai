const sharp = require('sharp');
const path = require('path');
const OUT = path.join(__dirname, 'img');

const NAVY='#1E2761', DEEP='#141C43', ICE='#CADCFC', AMBER='#E9A03B',
      AMBER_D='#C9812A', WHITE='#FFFFFF', SLATE='#5A6478', MID='#2F3C7E',
      GREEN='#4E8A6B', LGREEN='#8FBF9F', GLASS='#3C4E8F';

const S = (w,h,body,defs='') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

/* ---------- 1. Austin skyline at dusk ---------- */
function skyline(){
  const w=1800,h=1000;
  const defs=`
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="${DEEP}"/><stop offset="55%" stop-color="${MID}"/>
     <stop offset="82%" stop-color="#8A6AA0"/><stop offset="100%" stop-color="${AMBER}"/>
   </linearGradient>
   <linearGradient id="towerBack" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#2A3468"/><stop offset="100%" stop-color="#1A2350"/>
   </linearGradient>
   <linearGradient id="towerFront" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#151D45"/><stop offset="100%" stop-color="#0E1533"/>
   </linearGradient>
   <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#3B4A86"/><stop offset="100%" stop-color="#1B2450"/>
   </linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  // sun
  b+=`<circle cx="1330" cy="360" r="110" fill="#F6C069" opacity="0.95"/>`;
  // stars
  const stars=[[140,120],[320,80],[520,170],[760,90],[980,150],[1180,70],[1460,140],[1660,100],[240,240],[620,260],[1380,250]];
  stars.forEach(([x,y],i)=>{b+=`<circle cx="${x}" cy="${y}" r="${i%3===0?3.5:2.3}" fill="#FFFFFF" opacity="${0.5+(i%3)*0.15}"/>`;});
  // lone star emblem
  b+=`<g transform="translate(1600,190) scale(1.5)" fill="${AMBER}" opacity="0.9"><polygon points="0,-34 9.6,-11.4 34,-10.5 15,4.5 21.5,28 0,14 -21.5,28 -15,4.5 -34,-10.5 -9.6,-11.4"/></g>`;
  // back skyline
  const back=[[60,470,110,'url(#towerBack)'],[190,520,90,'url(#towerBack)'],[300,430,120,'url(#towerBack)'],
              [440,500,80,'url(#towerBack)'],[540,560,130,'url(#towerBack)'],[690,470,95,'url(#towerBack)'],
              [1020,500,110,'url(#towerBack)'],[1150,540,85,'url(#towerBack)'],[1250,460,120,'url(#towerBack)'],
              [1390,520,100,'url(#towerBack)'],[1510,480,140,'url(#towerBack)'],[1670,540,110,'url(#towerBack)']];
  back.forEach(([x,y,bw,f])=>{b+=`<rect x="${x}" y="${y}" width="${bw}" height="${800-y}" fill="${f}"/>`;});
  // signature tower (Frost-like crown) center-left
  b+=`<g fill="url(#towerFront)">
      <rect x="770" y="300" width="150" height="500"/>
      <polygon points="770,300 845,190 920,300"/>
      <rect x="838" y="120" width="14" height="80"/>
      <rect x="600" y="360" width="120" height="440"/>
      <polygon points="600,360 660,290 720,360"/>
      <rect x="950" y="380" width="130" height="420"/>
      <rect x="1005" y="320" width="20" height="60"/>
     </g>`;
  // window grid on front towers
  const win=(x0,y0,cols,rows,gapx,gapy)=>{let s='';
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){
      const on=((c*7+r*3)%5)!==0;
      s+=`<rect x="${x0+c*gapx}" y="${y0+r*gapy}" width="12" height="16" fill="${on?'#F6C069':'#4A5690'}" opacity="${on?0.85:0.5}"/>`;}
    return s;};
  b+=win(790,330,5,22,28,21)+win(620,395,3,18,32,22)+win(970,410,4,17,30,22);
  // water
  b+=`<rect x="0" y="800" width="${w}" height="200" fill="url(#water)"/>`;
  // bridge
  b+=`<path d="M0,830 L${w},830" stroke="#0E1533" stroke-width="16"/>`;
  for(let x=60;x<w;x+=150){b+=`<path d="M${x},830 q75,60 150,0" fill="none" stroke="#0E1533" stroke-width="10"/>`;}
  // reflections
  b+=`<g opacity="0.30" fill="#F6C069">`;
  for(let x=140;x<w-120;x+=170){b+=`<rect x="${x}" y="${895+((x/170)%3)*26}" width="84" height="7" rx="3.5"/>`;}
  b+=`</g>`;
  return S(w,h,b,defs);
}

/* ---------- 2. Portfolio of property types (square) ---------- */
function portfolio(){
  const w=1200,h=1200;
  const defs=`<linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8F0FE"/><stop offset="100%" stop-color="${ICE}"/></linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#bg2)"/>`;
  b+=`<circle cx="600" cy="600" r="560" fill="#FFFFFF" opacity="0.45"/>`;
  // ground
  b+=`<rect x="0" y="905" width="${w}" height="295" fill="#B9CCEC"/>`;
  b+=`<rect x="0" y="905" width="${w}" height="14" fill="${MID}" opacity="0.25"/>`;
  // high-rise office (left)
  b+=`<g><rect x="265" y="330" width="185" height="575" fill="${NAVY}"/>
      <rect x="265" y="330" width="185" height="38" fill="${MID}"/>`;
  for(let r=0;r<11;r++)for(let c=0;c<4;c++)
    b+=`<rect x="${285+c*42}" y="${392+r*45}" width="28" height="28" fill="${(r+c)%4===0?AMBER:ICE}" opacity="0.9"/>`;
  b+=`</g>`;
  // mid-rise mixed-use (center)
  b+=`<g><rect x="495" y="500" width="215" height="405" fill="${GLASS}"/>`;
  for(let r=0;r<7;r++)for(let c=0;c<4;c++)
    b+=`<rect x="${516+c*49}" y="${534+r*51}" width="34" height="33" fill="${(r*c)%5===0?AMBER:'#DCE7FB'}" opacity="0.92"/>`;
  b+=`<rect x="495" y="845" width="215" height="60" fill="${NAVY}"/>
      <rect x="565" y="863" width="76" height="42" fill="${AMBER}"/></g>`;
  // hospital (right, with cross)
  b+=`<g><rect x="745" y="590" width="170" height="315" fill="#FFFFFF" stroke="${NAVY}" stroke-width="10"/>
      <rect x="800" y="502" width="60" height="90" fill="#FFFFFF" stroke="${NAVY}" stroke-width="10"/>
      <g fill="#D24B4B"><rect x="817" y="518" width="26" height="62" rx="4"/><rect x="799" y="536" width="62" height="26" rx="4"/></g>`;
  for(let r=0;r<4;r++)for(let c=0;c<3;c++)
    b+=`<rect x="${768+c*48}" y="${625+r*54}" width="32" height="32" fill="${ICE}" stroke="${MID}" stroke-width="4"/>`;
  b+=`</g>`;
  // warehouse (far right, low)
  b+=`<g><polygon points="945,745 1040,690 1135,745 1135,905 945,905" fill="${SLATE}"/>
      <rect x="995" y="805" width="72" height="100" fill="${ICE}"/>
      <rect x="1082" y="780" width="42" height="42" fill="${ICE}"/></g>`;
  // townhomes (foreground left)
  b+=`<g>`;
  [[105,785],[185,785]].forEach(([x,y],i)=>{
    b+=`<polygon points="${x},${y} ${x+40},${y-46} ${x+80},${y}" fill="${AMBER_D}"/>
        <rect x="${x+8}" y="${y}" width="64" height="120" fill="${i%2?'#F2E3CC':'#FFF7EA'}" stroke="${NAVY}" stroke-width="5"/>
        <rect x="${x+30}" y="${y+56}" width="24" height="64" fill="${NAVY}"/>`;});
  b+=`</g>`;
  // trees
  [[910,880],[1170,885],[470,885]].forEach(([x,y])=>{
    b+=`<rect x="${x-6}" y="${y-30}" width="12" height="40" fill="#6B4A2F"/><circle cx="${x}" cy="${y-52}" r="34" fill="${GREEN}"/>`;});
  return S(w,h,b,defs);
}

/* ---------- 3. Sustainable / community building ---------- */
function sustainable(){
  const w=1600,h=1000;
  const defs=`<linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#DCEAF7"/><stop offset="100%" stop-color="#F4F9F4"/></linearGradient>
     <linearGradient id="glass3" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0%" stop-color="#5E77C4"/><stop offset="100%" stop-color="${NAVY}"/></linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#sky3)"/>`;
  b+=`<circle cx="1330" cy="200" r="95" fill="#F6C069"/><circle cx="1330" cy="200" r="150" fill="#F6C069" opacity="0.2"/>`;
  // rolling hills
  b+=`<path d="M0,760 q300,-110 620,-30 q320,80 620,-40 q200,-80 360,10 L${w},1000 L0,1000 Z" fill="#CFE4D4"/>`;
  b+=`<path d="M0,830 q380,-90 760,-10 q380,80 840,-30 L${w},1000 L0,1000 Z" fill="#A9CFB7"/>`;
  // main green tower with terraces
  b+=`<g><rect x="560" y="250" width="300" height="600" fill="url(#glass3)"/>`;
  for(let r=0;r<6;r++){
    const y=300+r*95;
    b+=`<rect x="548" y="${y}" width="324" height="20" fill="#EAF2E9"/>`;
    for(let c=0;c<5;c++) b+=`<circle cx="${572+c*64}" cy="${y-8}" r="16" fill="${r%2?GREEN:LGREEN}"/>`;
    for(let c=0;c<4;c++) b+=`<rect x="${580+c*74}" y="${y+28}" width="54" height="56" fill="${ICE}" opacity="0.9"/>`;
  }
  b+=`<rect x="670" y="790" width="80" height="60" fill="${AMBER}"/></g>`;
  // side buildings
  b+=`<rect x="330" y="470" width="190" height="380" fill="#3E4F9B"/>`;
  for(let r=0;r<5;r++)for(let c=0;c<3;c++) b+=`<rect x="${352+c*56}" y="${500+r*66}" width="40" height="44" fill="${ICE}" opacity="0.85"/>`;
  b+=`<rect x="900" y="540" width="210" height="310" fill="#4A5EA8"/>`;
  for(let r=0;r<4;r++)for(let c=0;c<3;c++) b+=`<rect x="${925+c*64}" y="${570+r*68}" width="46" height="46" fill="${ICE}" opacity="0.85"/>`;
  // solar panels
  b+=`<g transform="translate(1180,700)"><rect x="-10" y="0" width="230" height="16" fill="${SLATE}"/>
      <g transform="skewX(-16)"><rect x="0" y="-80" width="220" height="80" fill="#2C3E70"/>
      <g stroke="#7E92C9" stroke-width="4">
      <line x1="55" y1="-80" x2="55" y2="0"/><line x1="110" y1="-80" x2="110" y2="0"/><line x1="165" y1="-80" x2="165" y2="0"/>
      <line x1="0" y1="-40" x2="220" y2="-40"/></g></g></g>`;
  // trees
  [[180,840,70],[260,860,52],[1420,850,64],[1500,865,46],[120,870,44]].forEach(([x,y,r])=>{
    b+=`<rect x="${x-8}" y="${y-r*0.5}" width="16" height="${r*0.8}" fill="#6B4A2F"/>
        <circle cx="${x}" cy="${y-r*0.75}" r="${r}" fill="${GREEN}"/>
        <circle cx="${x-r*0.5}" cy="${y-r*0.45}" r="${r*0.62}" fill="${LGREEN}"/>`;});
  // leaf accent
  b+=`<g transform="translate(1310,430) rotate(-20)">
      <path d="M0,0 C 0,-90 70,-140 140,-140 C 140,-60 80,0 0,0 Z" fill="${GREEN}"/>
      <path d="M8,-6 C 50,-50 96,-86 132,-132" stroke="#EAF7EE" stroke-width="7" fill="none"/></g>`;
  return S(w,h,b,defs);
}

/* ---------- 4. Growth / rising skyline arrow ---------- */
function growth(){
  const w=1400,h=1000;
  const defs=`<linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0%" stop-color="${NAVY}"/><stop offset="100%" stop-color="#2B3A7D"/></linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#bg4)"/>`;
  b+=`<circle cx="1120" cy="250" r="230" fill="#FFFFFF" opacity="0.06"/>`;
  b+=`<circle cx="250" cy="820" r="180" fill="#FFFFFF" opacity="0.05"/>`;
  // grid
  b+=`<g stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="3">`;
  for(let y=220;y<=880;y+=110) b+=`<line x1="150" y1="${y}" x2="1280" y2="${y}"/>`;
  b+=`</g>`;
  b+=`<line x1="150" y1="880" x2="1280" y2="880" stroke="${ICE}" stroke-width="8"/>`;
  b+=`<line x1="150" y1="180" x2="150" y2="880" stroke="${ICE}" stroke-width="8"/>`;
  // bars as buildings
  const bars=[[250,560],[480,440],[710,330],[940,200]];
  bars.forEach(([x,y],i)=>{
    const bw=170, fill=i===bars.length-1?AMBER:ICE;
    b+=`<rect x="${x}" y="${y}" width="${bw}" height="${880-y}" fill="${fill}" opacity="${i===3?1:0.55+i*0.12}"/>`;
    for(let r=0;r<Math.floor((880-y)/70);r++)for(let c=0;c<3;c++)
      b+=`<rect x="${x+22+c*50}" y="${y+28+r*70}" width="28" height="34" fill="${NAVY}" opacity="0.35"/>`;
  });
  // arrow
  b+=`<path d="M230,640 L470,510 L700,400 L960,235" fill="none" stroke="${AMBER}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`;
  [[230,640],[470,510],[700,400]].forEach(([x,y])=>{b+=`<circle cx="${x}" cy="${y}" r="20" fill="#FFFFFF"/><circle cx="${x}" cy="${y}" r="10" fill="${AMBER}"/>`;});
  b+=`<polygon points="1080,170 960,300 890,190" fill="${AMBER}"/>`;
  b+=`<polygon points="1090,165 1010,180 1075,245" fill="#FFD79A"/>`;
  return S(w,h,b,defs);
}

/* ---------- 5. Careers: hard hat, blueprint, ledger ---------- */
function careers(){
  const w=1500,h=980;
  const defs=`<linearGradient id="bg5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E9F0FD"/></linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#bg5)"/>`;
  b+=`<circle cx="250" cy="300" r="210" fill="${ICE}" opacity="0.55"/>`;
  b+=`<circle cx="760" cy="640" r="230" fill="${ICE}" opacity="0.45"/>`;
  b+=`<circle cx="1250" cy="300" r="200" fill="${ICE}" opacity="0.55"/>`;
  // hard hat (civil engineer)
  b+=`<g transform="translate(250,320)">
      <path d="M-150,40 a150,130 0 0 1 300,0 Z" fill="${AMBER}"/>
      <path d="M-40,-86 a44,80 0 0 1 80,0" fill="${AMBER_D}"/>
      <rect x="-186" y="34" width="372" height="34" rx="17" fill="${AMBER_D}"/>
      <rect x="-70" y="-30" width="140" height="18" rx="9" fill="#FFFFFF" opacity="0.7"/></g>`;
  // blueprint + ruler (project manager)
  b+=`<g transform="translate(760,640)">
      <rect x="-190" y="-140" width="380" height="270" rx="12" fill="${NAVY}"/>
      <g stroke="#7E92C9" stroke-width="3" opacity="0.7">`;
  for(let x=-160;x<=160;x+=40) b+=`<line x1="${x}" y1="-116" x2="${x}" y2="106"/>`;
  for(let y=-116;y<=106;y+=37) b+=`<line x1="-166" y1="${y}" x2="166" y2="${y}"/>`;
  b+=`</g>
      <g fill="none" stroke="#FFFFFF" stroke-width="7">
      <rect x="-120" y="-80" width="140" height="160"/><rect x="30" y="-80" width="90" height="70"/>
      <line x1="30" y1="40" x2="120" y2="40"/><line x1="75" y1="40" x2="75" y2="80"/></g>
      <g fill="${AMBER}"><rect x="-120" y="-100" width="140" height="10"/><rect x="60" y="-10" width="60" height="10"/></g></g>`;
  // calculator / ledger (accountant)
  b+=`<g transform="translate(1250,300)">
      <rect x="-120" y="-165" width="240" height="330" rx="20" fill="${MID}"/>
      <rect x="-92" y="-136" width="184" height="78" rx="8" fill="#DCE7FB"/>
      <g fill="${AMBER}"><rect x="-64" y="-112" width="120" height="14" rx="7"/></g>`;
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)
    b+=`<rect x="${-92+c*64}" y="${-34+r*64}" width="48" height="48" rx="10" fill="#FFFFFF" opacity="0.92"/>`;
  b+=`<rect x="36" y="-34" width="56" height="112" rx="12" fill="${AMBER}"/>
      <rect x="36" y="94" width="56" height="48" rx="10" fill="${AMBER_D}"/></g>`;
  // connecting dots
  b+=`<g stroke="${MID}" stroke-width="5" stroke-dasharray="14 16" opacity="0.45" fill="none">
      <path d="M400,400 Q 560,560 610,600"/><path d="M910,600 Q 1080,470 1120,410"/></g>`;
  return S(w,h,b,defs);
}

/* ---------- 6. Campus recruiting (grad cap + campus) ---------- */
function campus(){
  const w=1400,h=1000;
  const defs=`<linearGradient id="bg6" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="${NAVY}"/><stop offset="100%" stop-color="#3A4B93"/></linearGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#bg6)"/>`;
  b+=`<circle cx="1150" cy="760" r="260" fill="#FFFFFF" opacity="0.06"/>`;
  // campus hall
  b+=`<g transform="translate(700,640)">
      <rect x="-360" y="0" width="720" height="250" fill="#E7EEFB"/>
      <rect x="-120" y="-120" width="240" height="370" fill="#F4F8FF"/>
      <polygon points="-140,-120 0,-240 140,-120" fill="${AMBER}"/>
      <rect x="-14" y="-300" width="28" height="70" fill="${ICE}"/><circle cx="0" cy="-310" r="16" fill="${AMBER}"/>
      <g fill="${NAVY}">`;
  for(let c=0;c<5;c++) b+=`<rect x="${-96+c*44}" y="-60" width="22" height="200"/>`;
  b+=`</g>
      <rect x="-44" y="120" width="88" height="130" fill="${NAVY}"/>
      <g fill="${MID}">`;
  for(let c=0;c<4;c++){b+=`<rect x="${-340+c*52}" y="40" width="34" height="54" rx="4"/><rect x="${-340+c*52}" y="130" width="34" height="54" rx="4"/>`;}
  for(let c=0;c<4;c++){b+=`<rect x="${172+c*52}" y="40" width="34" height="54" rx="4"/><rect x="${172+c*52}" y="130" width="34" height="54" rx="4"/>`;}
  b+=`</g></g>`;
  // steps
  b+=`<rect x="0" y="890" width="${w}" height="110" fill="#C7D5F0"/>`;
  b+=`<rect x="520" y="890" width="360" height="26" fill="#AFC1E6"/>`;
  // graduation cap large
  b+=`<g transform="translate(330,260) rotate(-8)">
      <polygon points="0,-60 220,20 0,100 -220,20" fill="#0E1533"/>
      <polygon points="0,-60 220,20 0,100 -220,20" fill="#FFFFFF" opacity="0.06"/>
      <path d="M-120,52 L-120,150 C-120,200 120,200 120,150 L120,52" fill="#1A234E"/>
      <circle cx="218" cy="22" r="13" fill="${AMBER}"/>
      <path d="M218,22 L246,150" stroke="${AMBER}" stroke-width="9" fill="none"/>
      <path d="M246,150 l-22,60 l44,0 z" fill="${AMBER}"/></g>`;
  // stars/confetti
  [[1080,190,26,AMBER],[1230,330,18,ICE],[960,330,16,ICE],[1180,120,14,AMBER],[860,180,12,ICE]].forEach(([x,y,r,c])=>{
    b+=`<g transform="translate(${x},${y}) scale(${r/34})" fill="${c}" opacity="0.9"><polygon points="0,-34 9.6,-11.4 34,-10.5 15,4.5 21.5,28 0,14 -21.5,28 -15,4.5 -34,-10.5 -9.6,-11.4"/></g>`;});
  return S(w,h,b,defs);
}

/* ---------- 7. Hiring path: people + handshake (square) ---------- */
function people(){
  const w=1200,h=1200;
  const defs=`<radialGradient id="bg7" cx="50%" cy="45%" r="70%">
     <stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="${ICE}"/></radialGradient>`;
  let b=`<rect width="${w}" height="${h}" fill="url(#bg7)"/>`;
  b+=`<circle cx="600" cy="600" r="470" fill="${MID}" opacity="0.08"/>`;
  b+=`<circle cx="600" cy="600" r="350" fill="${MID}" opacity="0.08"/>`;
  // ring of five people icons
  const colors=[NAVY,AMBER,MID,GREEN,'#7B5EA7'];
  for(let i=0;i<5;i++){
    const a=(-90+i*72)*Math.PI/180, R=400;
    const x=600+R*Math.cos(a), y=600+R*Math.sin(a);
    b+=`<g transform="translate(${x},${y})">
        <circle cx="0" cy="0" r="112" fill="#FFFFFF"/>
        <circle cx="0" cy="0" r="112" fill="none" stroke="${colors[i]}" stroke-width="12"/>
        <circle cx="0" cy="-30" r="36" fill="${colors[i]}"/>
        <path d="M-58,58 a58,62 0 0 1 116,0 Z" fill="${colors[i]}"/></g>`;
  }
  // center handshake
  b+=`<circle cx="600" cy="600" r="185" fill="${NAVY}"/>`;
  b+=`<g transform="translate(600,600)">
      <rect x="-86" y="-78" width="80" height="164" fill="${ICE}"/>
      <rect x="6" y="-116" width="80" height="202" fill="#FFFFFF"/>
      <polygon points="6,-116 46,-158 86,-116" fill="${AMBER}"/>
      <g fill="${NAVY}" opacity="0.85">`;
  for(let r=0;r<4;r++)for(let c=0;c<2;c++) b+=`<rect x="${-74+c*34}" y="${-60+r*38}" width="22" height="24"/>`;
  for(let r=0;r<5;r++)for(let c=0;c<2;c++) b+=`<rect x="${18+c*34}" y="${-98+r*38}" width="22" height="24"/>`;
  b+=`</g><rect x="-30" y="40" width="46" height="46" fill="${AMBER}"/></g>`;
  // connecting arcs
  b+=`<g fill="none" stroke="${MID}" stroke-width="7" stroke-dasharray="18 20" opacity="0.5">
      <circle cx="600" cy="600" r="400"/></g>`;
  return S(w,h,b,defs);
}

async function render(name, svg, width, round, crop){
  let img = sharp(Buffer.from(svg), {density:200}).resize({width});
  if(crop){ img = sharp(await img.png().toBuffer()).extract(crop).resize({width}); }
  if(round){
    const meta = await sharp(Buffer.from(svg)).metadata();
    const h = Math.round(width * meta.height / meta.width);
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}"><rect x="0" y="0" width="${width}" height="${h}" rx="${round}" ry="${round}" fill="#fff"/></svg>`);
    img = sharp(await img.png().toBuffer()).composite([{input:mask, blend:'dest-in'}]);
  }
  await img.png().toFile(path.join(OUT,name));
  console.log('wrote', name);
}

(async()=>{
  await render('01-skyline.png', skyline(), 1800, 40);
  await render('02-portfolio.png', portfolio(), 1200, 0, {left:90, top:178, width:1020, height:1020});
  await render('03-sustainable.png', sustainable(), 1600, 0);
  await render('04-growth.png', growth(), 1400, 0);
  await render('05-careers.png', careers(), 1500, 44);
  await render('06-campus.png', campus(), 1400, 0);
  await render('07-people.png', people(), 1200, 0);
})();
