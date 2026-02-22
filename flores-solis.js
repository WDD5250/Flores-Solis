const MS_DAY = 86400000;

/* ===== DOM ===== */
const $ = id => document.getElementById(id);
const monthSelect = $("monthSelect");
const dayInput = $("dayInput");
const yearInput = $("yearInput");
const grid = $("calendar-grid");
const monthTitle = $("month-title");
const leapInfo = $("leap-info");
const gregorianOut = $("gregorian-output");
const lunarOut = $("lunar-phase");
const clockEl = $("clock");
const utcSelect = $("utcSelect");
const sec30 = $("sec30");
const sec45 = $("sec45");
const customSeconds = $("customSeconds");
const dst = $("dst");
const viewMode = $("viewMode");

/* ===== State ===== */
let fsYear, fsMonth, fsDay;
let utcMsOffset = 0;

/* ===== Leap ===== */
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
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

/* ===== Dates ===== */
function mkDate(y,m,d){
  const t=new Date(0);
  t.setFullYear(y,m,d);
  t.setHours(0,0,0,0);
  return t;
}

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

  grid.innerHTML="";

  const mode = viewMode.value;

  const renderMonth = (y,m)=>{
    const days = fsMonths(y)[m][1];
    for(let d=1;d<=days;d++){
      const cell=document.createElement("div");
      cell.className="day"+(y===fsYear&&m===fsMonth&&d===fsDay?" today":"");
      cell.textContent=d;
      cell.onclick=()=>{
        fsYear=y; fsMonth=m; fsDay=d;
        render();
      };
      grid.appendChild(cell);
    }
  };

  if(mode==="month"){
    renderMonth(fsYear,fsMonth);
  } else {
    for(let m=0;m<12;m++) renderMonth(fsYear,m);
  }

  const era = fsYear<0?"AEV":"PEV";
  monthTitle.textContent = `${ms[fsMonth][0]} ${Math.abs(fsYear)} ${era}`;

  const leap = isLeap(fsYear);
  const prev = fsYear - (leap?4:fsYear%4||4);
  const next = prev + 4;
  leapInfo.innerHTML =
    `${leap?"Leap Year":"Non-Leap Year"} · 
     <a href="#" onclick="jumpYear(${prev})">Prev Leap</a> ·
     <a href="#" onclick="jumpYear(${next})">Next Leap</a>`;

  const g = fsToGregorian(fsYear,fsMonth,fsDay);
  gregorianOut.textContent = "Gregorian: " + g.toDateString();
  lunarOut.textContent = "Lunar Phase: " + moon(g);
}

/* ===== Navigation ===== */
function shiftDay(n){
  fsDay+=n;
  const days=fsMonths(fsYear)[fsMonth][1];
  if(fsDay<1){ shiftMonth(-1); fsDay=fsMonths(fsYear)[fsMonth][1]; }
  if(fsDay>days){ shiftMonth(1); fsDay=1; }
  render();
}

function shiftMonth(n){
  fsMonth+=n;
  if(fsMonth<0){ fsMonth=11; fsYear--; }
  if(fsMonth>11){ fsMonth=0; fsYear++; }
  fsDay=Math.min(fsDay,fsMonths(fsYear)[fsMonth][1]);
  render();
}

function jumpYear(y){
  fsYear=y;
  fsDay=Math.min(fsDay,fsMonths(fsYear)[fsMonth][1]);
  render();
}

/* ===== Controls ===== */
function goToFSDate(){
  fsMonth=+monthSelect.value;
  fsDay=+dayInput.value;
  fsYear=+yearInput.value;
  render();
}

function setToNow(){
  const fs=gregorianToFS(getDisplayTime());
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
}

function convertGregorian(){
  const fs=gregorianToFS(new Date(gregorianInput.value));
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
}

/* ===== UTC ===== */
["-12","-11","-10","-9","-8","-7","-6","-5","-4","-3","-2","-1",
 "+0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12","+13","+14"]
.forEach(o=>utcSelect.add(new Option(`UTC${o}`,o)));

function applyUTC(){
  let h=parseFloat(utcSelect.value);
  let s=(sec30.checked?30:0)+(sec45.checked?45:0)+(+customSeconds.value||0);
  if(dst.checked) h++;
  utcMsOffset=h*3600000+s*1000;
}

/* ===== Clock ===== */
function getDisplayTime(){
  const now=new Date();
  const utc=now.getTime()+now.getTimezoneOffset()*60000;
  return new Date(utc+utcMsOffset);
}

setInterval(()=>clockEl.textContent=getDisplayTime().toLocaleTimeString(),1000);

/* ===== UI ===== */
function toggleAbout(){ $("about").style.display^="block"; }
function toggleSettings(){ $("settings").style.display^="block"; }
function toggleDark(){ document.body.classList.toggle("light"); }

/* ===== Init ===== */
(()=>{
  document.body.classList.remove("light");
  const fs=gregorianToFS(new Date());
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
})();
