// ===============================
// FLORES SOLIS CALENDAR ENGINE
// ===============================

const MS_PER_DAY = 86400000;

// ---------- Leap year logic ----------
function isGregorianLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function violaDays(fsYear) {
  return isGregorianLeapYear(fsYear + 1) ? 30 : 29;
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
let followNow = true; // IMPORTANT FIX

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

// ---------- Moon phase ----------
function getMoonPhase(date) {
  const lp = 29.530588853;
  const newMoon = new Date(2000, 0, 6, 18, 14);
  const diff = (date - newMoon) / MS_PER_DAY;
  const phase = (diff % lp + lp) % lp;

  if (phase < 1.84566) return ["🌑", "New Moon"];
  if (phase < 5.53699) return ["🌒", "Waxing Crescent"];
  if (phase < 9.22831) return ["🌓", "First Quarter"];
  if (phase < 12.91963) return ["🌔", "Waxing Gibbous"];
  if (phase < 16.61096) return ["🌕", "Full Moon"];
  if (phase < 20.30228) return ["🌖", "Waning Gibbous"];
  if (phase < 23.99361) return ["🌗", "Last Quarter"];
  return ["🌘", "Waning Crescent"];
}

// ---------- Render ----------
function render() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const months = getFSMonths(fsYear);
  const era = fsYear < 0 ? "AEV" : "PEV";
  const displayYear = Math.abs(fsYear);

  document.getElementById("month-title").textContent =
    `${months[fsMonth].name} ${displayYear} ${era}`;

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

  const [emoji, name] = getMoonPhase(g);
  document.getElementById("lunar-phase").textContent =
    `Lunar Phase: ${emoji} ${name}`;
}

// ---------- Manual FS input ----------
function goToFSDate() {
  followNow = false;
  fsMonth = parseInt(monthSelect.value);
  fsDay = parseInt(dayInput.value);
  fsYear = parseInt(yearInput.value);
  render();
}

// ---------- Gregorian → FS ----------
function convertGregorian() {
  followNow = false;
  const date = new Date(gregorianInput.value);
  const fs = gregorianToFS(date);
  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;
  render();
}

// ---------- Clock ----------
function startClock() {
  setInterval(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const adjusted = new Date(utc + utcOffset * 3600000);
    clock.textContent = adjusted.toLocaleTimeString();

    if (followNow) {
      const fs = gregorianToFS(adjusted);
      fsYear = fs.year;
      fsMonth = fs.month;
      fsDay = fs.day;
      render();
    }
  }, 1000);
}

utcOffset.addEventListener("change", e => {
  utcOffset = parseFloat(e.target.value);
});

// ---------- Init ----------
(() => {
  const fs = gregorianToFS(new Date());
  fsYear = fs.year;
  fsMonth = fs.month;
  fsDay = fs.day;
  render();
  startClock();
})();
