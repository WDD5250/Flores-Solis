// ===============================
// FLORES SOLIS CALENDAR ENGINE
// ===============================

// ---------- Constants ----------
const MS_PER_DAY = 86400000;

// ---------- Leap year logic ----------
function isGregorianLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Viola leap day if Feb 29 occurs during Viola
function violaDays(fsYear) {
  const gregorianFebYear = fsYear + 1;
  return isGregorianLeapYear(gregorianFebYear) ? 30 : 29;
}

// ---------- Flores Solis months ----------
function getFSMonths(fsYear) {
  return [
    { name: "Narcissus", days: 31 },
    { name: "Serrulata", days: 30 },
    { name: "Convallaria", days: 31 },
    { name: "Rosa", days: 31 },
    { name: "Helianthus", days: 32 },
    { name: "Gladiolus", days: 31 },
    { name: "Aster", days: 30 },
    { name: "Tagetes", days: 30 },
    { name: "Chrysanthemum", days: 30 },
    { name: "Pulcherrima", days: 29 },
    { name: "Galanthus", days: 30 },
    { name: "Viola", days: violaDays(fsYear) }
  ];
}

// ---------- Safe date creation (FIXES YEAR 0–99 BUG) ----------
function makeDate(year, month, day) {
  const d = new Date(0);
  d.setFullYear(year, month, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- State ----------
let fsYear, fsMonth, fsDay;

// ---------- Gregorian → Flores Solis ----------
function gregorianToFS(date) {
  const gYear = date.getFullYear();
  const fsStartThisYear = makeDate(gYear, 2, 20);

  const fsYear = date >= fsStartThisYear ? gYear : gYear - 1;
  const fsStart = makeDate(fsYear, 2, 20);

  let offset = Math.floor((date - fsStart) / MS_PER_DAY);
  const months = getFSMonths(fsYear);

  let month = 0;
  let day = offset + 1;

  while (day > months[month].days) {
    day -= months[month].days;
    month++;
  }

  return { year: fsYear, month, day };
}

// ---------- Flores Solis → Gregorian ----------
function fsToGregorian(fsYear, fsMonth, fsDay) {
  const fsStart = makeDate(fsYear, 2, 20);
  const months = getFSMonths(fsYear);

  let offset = fsDay - 1;
  for (let i = 0; i < fsMonth; i++) {
    offset += months[i].days;
  }

  return new Date(fsStart.getTime() + offset * MS_PER_DAY);
}

// ---------- Populate month selector ----------
function populateMonthSelect(fsYear) {
  const select = document.getElementById("monthSelect");
  select.innerHTML = "";

  getFSMonths(fsYear).forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
}

// ---------- Render ----------
function render() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const months = getFSMonths(fsYear);
  const era = fsYear < 0 ? "AEV" : "PEV";
  const displayYear = Math.abs(fsYear);

  document.getElementById("title").textContent =
    `Flores Solis Calendar — ${months[fsMonth].name} ${displayYear} ${era}`;

  populateMonthSelect(fsYear);

  document.getElementById("monthSelect").value = fsMonth;
  document.getElementById("dayInput").value = fsDay;
  document.getElementById("yearInput").value = fsYear;

  for (let i = 1; i <= months[fsMonth].days; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    if (i === fsDay) cell.classList.add("today");
    cell.textContent = i;
    grid.appendChild(cell);
  }

  const g = fsToGregorian(fsYear, fsMonth, fsDay);
  document.getElementById("gregorian-output").textContent =
    `Gregorian: ${g.toDateString()}`;
}

// ---------- Navigation ----------
function changeMonth(delta) {
  fsMonth += delta;

  if (fsMonth < 0) {
    fsMonth = 11;
    fsYear--;
  }
  if (fsMonth > 11) {
    fsMonth = 0;
    fsYear++;
  }

  fsDay = 1;
  render();
}

function goToToday() {
  const today = new Date();
  const fs = gregorianToFS(today);
  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;
  render();
}

// ---------- Manual FS input ----------
function goToFSDate() {
  const m = parseInt(document.getElementById("monthSelect").value);
  const d = parseInt(document.getElementById("dayInput").value);
  const y = parseInt(document.getElementById("yearInput").value);

  const months = getFSMonths(y);
  if (d < 1 || d > months[m].days) {
    alert("Invalid day for selected month");
    return;
  }

  fsYear = y;
  fsMonth = m;
  fsDay = d;
  render();
}

// ---------- Gregorian → FS input ----------
function convertGregorian() {
  const input = document.getElementById("gregorianInput").value;
  if (!input) return;

  const date = new Date(input);
  const fs = gregorianToFS(date);

  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;
  render();
}

// ---------- Live Clock ----------
function startClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  }, 1000);
}

// ---------- Init ----------
goToToday();
startClock();
