const MS_DAY = 86400000;

/* ========= DOM ========= */
const $ = id => document.getElementById(id);
const grid = $("calendar-grid");
const monthTitle = $("month-title");
const leapInfo = $("leap-info");
const gregorianOut = $("gregorian-output");
const lunarOut = $("lunar-phase");
const clockEl = $("clock");

const monthSelect = $("monthSelect");
const dayInput = $("dayInput");
const yearInput = $("yearInput");
const viewMode = $("viewMode");

/* ========= STATE ========= */
let fsYear, fsMonth, fsDay;
let utcMsOffset = 0;

/* ========= LEAP ========= */
const isLeap = y =>
  ((y + 1) % 4 === 0 && (y + 1) % 100 !== 0) || ((y + 1) % 400 === 0);

const violaDays = y => isLeap(y) ? 30 : 29;

/* ========= MONTHS ========= */
const monthNames = [
  "Narcissus","Serrulata","Convallaria","Rosa",
  "Helianthus","Gladiolus","Aster","Tagetes",
  "Chrysanthemum","Pulcherrima","Galanthus","Viola"
];

function fsMonths(y){
  return [
    31,30,31,31,32,31,30,30,30,29,30,violaDays(y)
  ];
}

/* ========= DATE CONVERSION ========= */
function mkDate(y,m,d){
  const t = new Date(0);
  t.setUTCFullYear(y,m,d);
  return t;
}

function fsToGregorian(y,m,d){
  let offset = d - 1;
  const months = fsMonths(y);
  for(let i=0;i<m;i++) offset += months[i];
  return new Date(mkDate(y,2,20).getTime() + offset * MS_DAY);
}

function gregorianToFS(date){
  const y = date.getUTCFullYear();
  const start = mkDate(y,2,20);
  const fy = date >= start ? y : y - 1;

  let offset = Math.floor((date - mkDate(fy,2,20)) / MS_DAY);
  const months = fsMonths(fy);

  let m = 0;
  while(offset >= months[m]){
    offset -= months[m];
    m++;
  }
  return { y: fy, m, d: offset + 1 };
}

/* ========= MOON ========= */
function moonPhase(date){
  const syn = 29.530588853;
  const ref = new Date(Date.UTC(2000,0,6,18,14));
  const age = ((date - ref) / MS_DAY) % syn;
  const a = (age + syn) % syn;

  return a < 1.8 ? "🌑 New Moon" :
         a < 5.5 ? "🌒 Waxing Crescent" :
         a < 9.2 ? "🌓 First Quarter" :
         a < 12.9 ? "🌔 Waxing Gibbous" :
         a < 16.6 ? "🌕 Full Moon" :
         a < 20.3 ? "🌖 Waning Gibbous" :
         a < 24.0 ? "🌗 Last Quarter" :
                    "🌘 Waning Crescent";
}

/* ========= RENDER ========= */
function render(){
  grid.innerHTML = "";

  const months = fsMonths(fsYear);
  const era = fsYear < 0 ? "AEV" : "PEV";
  monthTitle.textContent =
    `${monthNames[fsMonth]} ${Math.abs(fsYear)} ${era}`;

  leapInfo.innerHTML =
    isLeap(fsYear)
    ? "Leap Year"
    : "Non-Leap Year";

  const g = fsToGregorian(fsYear, fsMonth, fsDay);
  gregorianOut.textContent = "Gregorian: " + g.toUTCString().slice(0,16);
  lunarOut.textContent = "Lunar Phase: " + moonPhase(g);

  if(viewMode.value === "month"){
    renderSingleMonth(fsYear, fsMonth);
  } else {
    renderYear(fsYear);
  }
}

/* ========= MONTH GRID ========= */
function renderSingleMonth(y,m){
  const days = fsMonths(y)[m];

  for(let d=1; d<=days; d++){
    const cell = document.createElement("div");
    cell.className = "day";
    if(y===fsYear && m===fsMonth && d===fsDay)
      cell.classList.add("today");

    cell.textContent = d;
    cell.onclick = () => {
      fsYear=y; fsMonth=m; fsDay=d;
      render();
    };
    grid.appendChild(cell);
  }
}

/* ========= YEARLY GRID (FIXED) ========= */
function renderYear(y){
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(4, 1fr)";
  grid.style.gap = "12px";

  for(let m=0; m<12; m++){
    const box = document.createElement("div");
    box.style.border = "1px solid var(--border)";
    box.style.borderRadius = "8px";
    box.style.padding = "6px";

    const title = document.createElement("div");
    title.textContent = monthNames[m];
    title.style.textAlign = "center";
    title.style.fontSize = "0.85em";
    title.style.marginBottom = "4px";
    box.appendChild(title);

    const mini = document.createElement("div");
    mini.style.display = "grid";
    mini.style.gridTemplateColumns = "repeat(7, 1fr)";
    mini.style.gap = "3px";

    const days = fsMonths(y)[m];
    for(let d=1; d<=days; d++){
      const cell = document.createElement("div");
      cell.textContent = d;
      cell.style.fontSize = "0.65em";
      cell.style.textAlign = "center";
      cell.style.cursor = "pointer";

      if(y===fsYear && m===fsMonth && d===fsDay){
        cell.style.background = "var(--accent)";
        cell.style.color = "#000";
      }

      cell.onclick = () => {
        fsYear=y; fsMonth=m; fsDay=d;
        viewMode.value="month";
        render();
      };

      mini.appendChild(cell);
    }

    box.appendChild(mini);
    grid.appendChild(box);
  }
}

/* ========= NAV ========= */
function shiftDay(n){
  fsDay += n;
  const days = fsMonths(fsYear)[fsMonth];
  if(fsDay < 1){ fsMonth--; if(fsMonth<0){fsMonth=11;fsYear--;} fsDay=fsMonths(fsYear)[fsMonth]; }
  if(fsDay > days){ fsDay=1; fsMonth++; if(fsMonth>11){fsMonth=0;fsYear++;} }
  render();
}

function shiftMonth(n){
  fsMonth += n;
  if(fsMonth<0){fsMonth=11;fsYear--;}
  if(fsMonth>11){fsMonth=0;fsYear++;}
  fsDay=Math.min(fsDay,fsMonths(fsYear)[fsMonth]);
  render();
}

/* ========= CLOCK ========= */
function getNow(){
  const now = new Date();
  return new Date(now.getTime() + utcMsOffset);
}

setInterval(()=>{
  clockEl.textContent = getNow().toLocaleTimeString();
},1000);

/* ========= INIT ========= */
(()=>{
  const fs = gregorianToFS(new Date());
  fsYear = fs.y;
  fsMonth = fs.m;
  fsDay = fs.d;
  render();
})();
