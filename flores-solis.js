// Flores Solis month data
const FS_MONTHS = [
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
  { name: "Viola", days: 29 } // +1 on leap years
];

let fsYear, fsMonth, fsDay;

// Leap year rule (Gregorian-compatible for now)
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Convert Gregorian → Flores Solis
function gregorianToFS(date) {
  const year = date.getFullYear();
  const startOfFSYear = new Date(year, 2, 20); // March 20

  let fsY = date >= startOfFSYear ? year : year - 1;
  let dayOffset = Math.floor((date - new Date(fsY, 2, 20)) / 86400000);

  let month = 0;
  let day = dayOffset + 1;

  let months = FS_MONTHS.map(m => ({ ...m }));
  if (isLeapYear(fsY)) months[11].days = 30;

  while (day > months[month].days) {
    day -= months[month].days;
    month++;
  }

  return { year: fsY, month, day };
}

// Render calendar grid
function render() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const months = FS_MONTHS.map(m => ({ ...m }));
  if (isLeapYear(fsYear)) months[11].days = 30;

  document.getElementById("title").textContent =
    `${months[fsMonth].name} ${fsYear} PEV`;

  for (let i = 1; i <= months[fsMonth].days; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    if (i === fsDay) cell.classList.add("today");
    cell.textContent = i;
    grid.appendChild(cell);
  }
}

// Navigation
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

// Init
goToToday();
