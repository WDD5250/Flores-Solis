const MS_DAY = 86400000;

/* ===== DOM ===== */
const monthSelect = document.getElementById("monthSelect");
const dayInput = document.getElementById("dayInput");
const yearInput = document.getElementById("yearInput");
const calendarGrid = document.getElementById("calendar-grid");
const monthTitle = document.getElementById("month-title");
const gregorianOutput = document.getElementById("gregorian-output");
const lunarPhase = document.getElementById("lunar-phase");
const clockEl = document.getElementById("clock");
const utcSelect = document.getElementById("utcSelect");
const plus30 = document.getElementById("plus30");
const plus45 = document.getElementById("plus45");
const dst = document.getElementById("dst");
const aboutSection = document.getElementById("about-section");

/* ===== State ===== */
let fsYear, fsMonth, fsDay;
let liveMode = true;
let utcOffset = 0;

/* ===== Leap ===== */
const isLeap = y =>
  (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const violaDays = y => isLeap(y + 1) ? 30 : 29;

/* ===== Months ===== */
function fsMonths(y){
  return [
    ["Narcissus",31],["Serrulata",30],["Convallaria",31],
    ["Rosa",31],["Helianthus",32],["Gladiolus",31],
    ["Aster",30],["Tagetes",30],["Chrysanthemum",30],
    ["Pulcherrima",29],["Galanthus",30],["Viola",violaDays(y)]
  ];
}

/* ===== Safe Date ===== */
function mkDate(y,m,d){
  const t=new Date(0);
  t.setFullYear(y,m,d);
  t.setHours(0,0,0,0);
  return t;
}

/* ===== Conversions ===== */
function gregorianToFS(date){
  const y=date.getFullYear();
  const start=mkDate(y,2,20);
  const fy=date>=start?y:y-1;
  let off=Math.floor((date-mkDate(fy,2,20))/MS_DAY);
  let m=0,d=off+1,ms=fsMonths(fy);
  while(d>ms[m][1]){ d-=ms[m][1]; m++; }
  return {y:fy,m,d};
}

function fsToGregorian(y,m,d){
  let off=d-1,ms=fsMonths(y);
  for(let i=0;i<m;i++) off+=ms[i][1];
  return new Date(mkDate(y,2,20).getTime()+off*MS_DAY);
}

/* ===== Moon ===== */
function moon(date){
  const syn=29.530588853;
  const ref=new Date(2000,0,6,18,14);
  const a=((date-ref)/MS_DAY%syn+syn)%syn;
  return a<1.8?"🌑 New Moon":
         a<5.5?"🌒 Waxing Crescent":
         a<9.2?"🌓 First Quarter":
         a<12.9?"🌔 Waxing Gibbous":
         a<16.6?"🌕 Full Moon":
         a<20.3?"🌖 Waning Gibbous":
         a<24.0?"🌗 Last Quarter":
                "🌘 Waning Crescent";
}

/* ===== Render ===== */
function render(){
  const ms=fsMonths(fsYear);
  monthSelect.innerHTML="";
  ms.forEach((m,i)=>monthSelect.add(new Option(m[0],i)));
  monthSelect.value=fsMonth;
  dayInput.value=fsDay;
  yearInput.value=fsYear;

  calendarGrid.innerHTML="";
  for(let i=1;i<=ms[fsMonth][1];i++){
    const d=document.createElement("div");
    d.className="day"+(i===fsDay?" today":"");
    d.textContent=i;
    calendarGrid.appendChild(d);
  }

  const era=fsYear<0?"AEV":"PEV";
  monthTitle.textContent=`${ms[fsMonth][0]} ${Math.abs(fsYear)} ${era}`;

  const g=fsToGregorian(fsYear,fsMonth,fsDay);
  gregorianOutput.textContent="Gregorian: "+g.toDateString();
  lunarPhase.textContent="Lunar Phase: "+moon(g);
}

/* ===== Controls ===== */
function goToFSDate(){
  liveMode=false;
  fsMonth=+monthSelect.value;
  fsDay=+dayInput.value;
  fsYear=+yearInput.value;
  render();
}

function setToNow(){
  liveMode=true;
}

function convertGregorian(){
  liveMode=false;
  const fs=gregorianToFS(new Date(gregorianInput.value));
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
}

/* ===== UTC ===== */
const offsets = [
  "-12","-11","-10","-9","-8","-7","-6","-5","-4","-3","-2","-1",
  "+0","+1","+2","+3","+4","+5","+6","+7.5","+8","+9","+10","+11","+12","+13","+14"
];

offsets.forEach(o=>{
  utcSelect.add(new Option(`UTC${o.startsWith("-")?o:"+"+o}`, o));
});

function applyUTC(){
  utcOffset=parseFloat(utcSelect.value);
  if(plus30.checked) utcOffset+=0.5;
  if(plus45.checked) utcOffset+=0.75;
  if(dst.checked) utcOffset+=1;
}

/* ===== Clock ===== */
setInterval(()=>{
  const now=new Date();
  const utc=now.getTime()+now.getTimezoneOffset()*60000;
  const local=new Date(utc+utcOffset*3600000);
  clockEl.textContent=local.toLocaleTimeString();
  if(liveMode){
    const fs=gregorianToFS(local);
    fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
    render();
  }
},1000);

/* ===== About ===== */
function toggleAbout(){
  aboutSection.style.display=
    aboutSection.style.display==="block"?"none":"block";
}

/* ===== Init ===== */
(function(){
  const fs=gregorianToFS(new Date());
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
})();
