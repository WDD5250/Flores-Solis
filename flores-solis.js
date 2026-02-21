// =======================================
// FLORES SOLIS CALENDAR (FIXED + SYNCED)
// =======================================

// ---------- Leap logic ----------
function isGregorianLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function violaDays(fsYear) {
  // February belongs to Gregorian year fsYear + 1
  return isGregorianLeapYear(fsYear + 1) ? 30 : 29;
}

// ---------- Month definition ----------
function getFSMoths(fsYear) {
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

// ---------- State ----------
let fsYear = 0;
let fsMonth = 0;
let fsDay = 1;

// ---------- Gregorian → FS ----------
function gregorianToFS(date) {
  const gYear = date.getFullYear();
  const fsStartThisYear = new Date(gYear, 2, 20); // Mar 20

  const year = date >= fsStartThisYear ? gYear : gYear - 1;
  const fsStart = new Date(year, 2, 20);

  let offset = Math.floor((date - fsStart) / 86400000);
  const months = getFSMoths(year);

  let m = 0;
  let d = offset + 1;

  while (d > months[m].days) {
    d -= months[m].days;
    m++;
  }

  return { year, month: m, day: d };
}

// ---------- FS → Gregorian ----------
function fsToGregorian(year, month, day) {
  const fsStart = new Date(year, 2, 20);
  const months = getFSMoths(year);

  let offset = day - 1;
  for (let i = 0; i < month; i++) offset += months[i].days;

  return new Date(fsStart.getTime() + offset * 86400000);
}

// ---------- UI helpers ----------
function populateMonthSelect() {
  const select = document.getElementById("monthSelect");
  select.innerHTML = "";

  getFSMoths(fsYear).forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
}

// ---------- Render ----------
function render() {
  const months = getFSMoths(fsYear);
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  // Clamp day if month/year changed
  if (fsDay > months[fsMonth].days) {
    fsDay = months[fsMonth].days;
  }

  // Title
  document.getElementById("title").textContent =
    `${months[fsMonth].name} ${fsYear} PEV`;

  // Inputs
  populateMonthSelect();
  document.getElementById("monthSelect").value = fsMonth;
  document.getElementById("dayInput").value = fsDay;
  document.getElementById("yearInput").value = fsYear;

  // Calendar grid
  for (let i = 1; i <= months[fsMonth].days; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    if (i === fsDay) cell.classList.add("today");
    cell.textContent = i;
    grid.appendChild(cell);
  }

  // Gregorian equivalent (ALWAYS synced)
  const g = fsToGregorian(fsYear, fsMonth, fsDay);
  document.getElementById("gregorian-output").textContent =
    `Gregorian equivalent: ${g.toDateString()}`;
}

// ---------- Navigation ----------
function changeMonth(delta) {
  fsMonth += delta;

  if (fsMonth < 0) {
    fsMonth = 11;
    fsYear--;
  } else if (fsMonth > 11) {
    fsMonth = 0;
    fsYear++;
  }

  render();
}

// ---------- Manual FS input ----------
function goToFSDate() {
  const m = parseInt(document.getElementById("monthSelect").value);
  const d = parseInt(document.getElementById("dayInput").value);
  const y = parseInt(document.getElementById("yearInput").value);

  if (isNaN(m) || isNaN(d) || isNaN(y)) return;

  fsYear = y;
  fsMonth = m;
  fsDay = d;

  render();
}

// ---------- Gregorian → FS ----------
function convertGregorian() {
  const val = document.getElementById("gregorianInput").value;
  if (!val) return;

  const date = new Date(val);
  const fs = gregorianToFS(date);

  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;

  render();
}

// ---------- Today ----------
function goToToday() {
  const today = new Date();
  const fs = gregorianToFS(today);

  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;

  render();
}

// ---------- Init ----------
goToToday();
