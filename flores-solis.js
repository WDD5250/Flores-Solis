// ===============================
// FLORES SOLIS CALENDAR ENGINE
// ===============================

const MS_PER_DAY = 86400000;

// ---------- Leap year logic ----------
function isGregorianLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function violaDays(fsYear) {
  const gregorianFebYear = fsYear + 1;
  return isGregorianLeapYear(gregorianFebYear) ? 30 : 29;
}

// ---------- FS months ----------
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

// ---------- Safe date creation ----------
function makeDate(year, month, day) {
  const d = new Date(0);
  d.setFullYear(year, month, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- State ----------
let fsYear, fsMonth, fsDay;
let utcOffset = 0;

// ---------- Gregorian → FS ----------
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

// ---------- FS → Gregorian ----------
function fsToGregorian(fsYear, fsMonth, fsDay) {
  const fsStart = makeDate(fsYear, 2, 20);
  const months = getFSMonths(fsYear);

  let offset = fsDay - 1;
  for (let i = 0; i < fsMonth; i++) offset += months[i].days;

  return new Date(fsStart.getTime() + offset * MS_PER_DAY);
}

// ---------- Populate month select ----------
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

// ---------- Lunar phase ----------
function getMoonPhase(date) {
  const lp = 29.530588853; // lunar period in days
  const newMoon = new Date(2000,0,6,18,14); // reference new moon
  const diff = (date - newMoon)/MS_PER_DAY;
  const phase = (diff % lp + lp) % lp;
  if(phase < 1.84566) return "New Moon";
  else if(phase < 5.53699) return "Waxing Crescent";
  else if(phase < 9.22831) return "First Quarter";
  else if(phase < 12.91963) return "Waxing Gibbous";
  else if(phase < 16.61096) return "Full Moon";
  else if(phase < 20.30228) return "Waning Gibbous";
  else if(phase < 23.99361) return "Last Quarter";
  else if(phase < 27.68493) return "Waning Crescent";
  else return "New Moon";
}

// ---------- Render ----------
function updateLunarPhase() {
  const g = fsToGregorian(fsYear, fsMonth, fsDay);
  const phase = getMoonPhase(g);
  document.getElementById("lunar-phase").textContent = "Lunar Phase: " + phase;
}

function render() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const months = getFSMonths(fsYear);
  const era = fsYear < 0 ? "AEV" : "PEV";
  const displayYear = Math.abs(fsYear);

  // Display month/year as title inside calendar
  document.getElementById("month-title").textContent = `${months[fsMonth].name} ${displayYear} ${era}`;

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

  updateLunarPhase();
}

// ---------- Navigation ----------
function changeMonth(delta) {
  fsMonth += delta;
  if (fsMonth < 0) { fsMonth = 11; fsYear--; }
  if (fsMonth > 11) { fsMonth = 0; fsYear++; }
  fsDay = 1;
  render();
}

function goToToday() {
  const now = new Date();
  const fs = gregorianToFS(now);
  fsYear = fs.year; fsMonth = fs.month; fsDay = fs.day;
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

  fsYear = y; fsMonth = m; fsDay = d;
  render();
}

// ---------- Gregorian → FS input ----------
function convertGregorian() {
  const input = document.getElementById("gregorianInput").value;
  if (!input) return;

  const date = new Date(input);
  const fs = gregorianToFS(date);
  fsYear = fs.year; fsMonth = fs.month; fsDay = fs.day;
  render();
}

// ---------- Clock ----------
function startClock() {
  setInterval(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const adjusted = new Date(utc + utcOffset * 3600000);
    document.getElementById("clock").textContent = adjusted.toLocaleTimeString();

    // Update FS date if day changes
    const fs = gregorianToFS(adjusted);
    if (fsYear !== fs.year || fsMonth !== fs.month || fsDay !== fs.day) {
      fsYear = fs.year; fsMonth = fs.month; fsDay = fs.day;
      render();
    }
  }, 1000);
}

document.getElementById("utcOffset").addEventListener("change", (e) => {
  utcOffset = parseFloat(e.target.value);
});

// ---------- About toggle ----------
function toggleAbout() {
  const sec = document.getElementById("about-section");
  sec.style.display = sec.style.display === "none" ? "block" : "none";
}

// ---------- Initialize ----------
goToToday();
startClock();
