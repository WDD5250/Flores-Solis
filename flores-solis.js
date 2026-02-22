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
const sec30 = document.getElementById("sec30");
const sec45 = document.getElementById("sec45");
const customSeconds = document.getElementById("customSeconds");
const dst = document.getElementById("dst");
const aboutSection = document.getElementById("about-section");

/* ===== State ===== */
let fsYear, fsMonth, fsDay;
let utcMsOffset = 0;

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

/* ===== Conversion ===== */
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
  fsMonth=+monthSelect.value;
  fsDay=+dayInput.value;
  fsYear=+yearInput.value;
  render();
}

function setToNow(){
  const now = getDisplayTime();
  const fs = gregorianToFS(now);
  fsYear = fs.y;
  fsMonth = fs.m;
  fsDay = fs.d;
  render();
}

function convertGregorian(){
  const fs=gregorianToFS(new Date(gregorianInput.value));
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
}

/* ===== UTC ===== */
const baseOffsets = [
  "-12","-11","-10","-9","-8","-7","-6","-5","-4","-3","-2","-1",
  "+0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12","+13","+14"
];

baseOffsets.forEach(o=>{
  utcSelect.add(new Option(`UTC${o}`, o));
});

function applyUTC(){
  let hours = parseFloat(utcSelect.value);
  let seconds = 0;
  if(sec30.checked) seconds += 30;
  if(sec45.checked) seconds += 45;
  seconds += parseInt(customSeconds.value || 0);
  if(dst.checked) hours += 1;

  utcMsOffset = hours*3600000 + seconds*1000;
}

/* ===== Clock ===== */
function getDisplayTime(){
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset()*60000;
  return new Date(utc + utcMsOffset);
}

setInterval(()=>{
  clockEl.textContent = getDisplayTime().toLocaleTimeString();
},1000);

/* ===== About ===== */
function toggleAbout(){
  aboutSection.style.display =
    aboutSection.style.display==="block"?"none":"block";
}

/* ===== Init ===== */
(function(){
  const fs = gregorianToFS(new Date());
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
})();
