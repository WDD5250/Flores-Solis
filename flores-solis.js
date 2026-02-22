/* =========================
   Flores Solis Calendar JS
   ========================= */

const MS_DAY = 86400000;

// ---------- DOM ----------
const monthSelect = document.getElementById("monthSelect");
const dayInput = document.getElementById("dayInput");
const yearInput = document.getElementById("yearInput");
const calendarGrid = document.getElementById("calendar-grid");
const monthTitle = document.getElementById("month-title");
const gregorianOutput = document.getElementById("gregorian-output");
const lunarPhase = document.getElementById("lunar-phase");
const clockEl = document.getElementById("clock");
const utcInput = document.getElementById("utcOffset");
const aboutSection = document.getElementById("about-section");

// ---------- State ----------
let fsYear = 0;
let fsMonth = 0;
let fsDay = 1;
let followNow = true;
let utcOffset = 0;

// ---------- Leap rules ----------
const isLeap = y =>
  (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const violaDays = y => isLeap(y + 1) ? 30 : 29;

// ---------- Months ----------
function fsMonths(y) {
  return [
    ["Narcissus",31],["Serrulata",30],["Convallaria",31],
    ["Rosa",31],["Helianthus",32],["Gladiolus",31],
    ["Aster",30],["Tagetes",30],["Chrysanthemum",30],
    ["Pulcherrima",29],["Galanthus",30],["Viola",violaDays(y)]
  ];
}

// ---------- Safe date ----------
function mkDate(y,m,d){
  const t = new Date(0);
  t.setFullYear(y,m,d);
  t.setHours(0,0,0,0);
  return t;
}

// ---------- Gregorian → FS ----------
function gregorianToFS(date){
  const y = date.getFullYear();
  const start = mkDate(y,2,20);
  const fy = date >= start ? y : y - 1;

  let offset = Math.floor((date - mkDate(fy,2,20)) / MS_DAY);
  let m = 0;
  let d = offset + 1;
  const months = fsMonths(fy);

  while (d > months[m][1]) {
    d -= months[m][1];
    m++;
  }

  return { y: fy, m, d };
}

// ---------- FS → Gregorian ----------
function fsToGregorian(y,m,d){
  let offset = d - 1;
  const months = fsMonths(y);
  for (let i=0;i<m;i++) offset += months[i][1];
  return new Date(mkDate(y,2,20).getTime() + offset * MS_DAY);
}

// ---------- Moon phase ----------
function getMoonPhase(date){
  const synodic = 29.530588853;
  const ref = new Date(2000,0,6,18,14);
  const age = ((date - ref)/MS_DAY % synodic + synodic) % synodic;

  if (age < 1.8) return "🌑 New Moon";
  if (age < 5.5) return "🌒 Waxing Crescent";
  if (age < 9.2) return "🌓 First Quarter";
  if (age < 12.9) return "🌔 Waxing Gibbous";
  if (age < 16.6) return "🌕 Full Moon";
  if (age < 20.3) return "🌖 Waning Gibbous";
  if (age < 24.0) return "🌗 Last Quarter";
  return "🌘 Waning Crescent";
}

// ---------- Render ----------
function render(){
  const months = fsMonths(fsYear);

  monthSelect.innerHTML = "";
  months.forEach((m,i)=>{
    monthSelect.add(new Option(m[0], i));
  });

  monthSelect.value = fsMonth;
  dayInput.value = fsDay;
  yearInput.value = fsYear;

  calendarGrid.innerHTML = "";
  for (let i=1;i<=months[fsMonth][1];i++){
    const cell = document.createElement("div");
    cell.className = "day" + (i === fsDay ? " today" : "");
    cell.textContent = i;
    calendarGrid.appendChild(cell);
  }

  const era = fsYear < 0 ? "AEV" : "PEV";
  monthTitle.textContent =
    `${months[fsMonth][0]} ${Math.abs(fsYear)} ${era}`;

  const g = fsToGregorian(fsYear,fsMonth,fsDay);
  gregorianOutput.textContent = "Gregorian: " + g.toDateString();
  lunarPhase.textContent = "Lunar Phase: " + getMoonPhase(g);
}

// ---------- Controls ----------
function goToFSDate(){
  followNow = false;
  fsMonth = +monthSelect.value;
  fsDay = +dayInput.value;
  fsYear = +yearInput.value;
  render();
}

function convertGregorian(){
  followNow = false;
  const g = new Date(document.getElementById("gregorianInput").value);
  const fs = gregorianToFS(g);
  fsYear = fs.y;
  fsMonth = fs.m;
  fsDay = fs.d;
  render();
}

// ---------- Clock ----------
setInterval(()=>{
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset()*60000;
  const local = new Date(utc + utcOffset*3600000);

  clockEl.textContent = local.toLocaleTimeString();

  if (followNow){
    const fs = gregorianToFS(local);
    fsYear = fs.y;
    fsMonth = fs.m;
    fsDay = fs.d;
    render();
  }
},1000);

// ---------- UTC control ----------
utcInput.min = -12;
utcInput.max = 14;
utcInput.step = 0.5;

utcInput.addEventListener("change", e=>{
  utcOffset = Math.max(-12, Math.min(14, +e.target.value));
  e.target.value = utcOffset;
});

// ---------- About ----------
function toggleAbout(){
  aboutSection.style.display =
    aboutSection.style.display === "block" ? "none" : "block";
}

// ---------- Init ----------
(function init(){
  const fs = gregorianToFS(new Date());
  fsYear = fs.y;
  fsMonth = fs.m;
  fsDay = fs.d;
  render();
})();
