const MS = 86400000;
let fsYear, fsMonth, fsDay;
let utcOffset = 0;
let followNow = true;

// Leap rule
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const violaDays = y => isLeap(y + 1) ? 30 : 29;

// Months
function months(y) {
  return [
    ["Narcissus",31],["Serrulata",30],["Convallaria",31],
    ["Rosa",31],["Helianthus",32],["Gladiolus",31],
    ["Aster",30],["Tagetes",30],["Chrysanthemum",30],
    ["Pulcherrima",29],["Galanthus",30],["Viola",violaDays(y)]
  ];
}

// Safe date
function mkDate(y,m,d){
  const t=new Date(0);
  t.setFullYear(y,m,d);
  t.setHours(0,0,0,0);
  return t;
}

// Conversions
function g2fs(date){
  const y=date.getFullYear();
  const start=mkDate(y,2,20);
  const fy=date>=start?y:y-1;
  let off=Math.floor((date-mkDate(fy,2,20))/MS);
  let m=0, d=off+1, ms=months(fy);
  while(d>ms[m][1]){ d-=ms[m][1]; m++; }
  return {y:fy,m,d};
}

function fs2g(y,m,d){
  let off=d-1, ms=months(y);
  for(let i=0;i<m;i++) off+=ms[i][1];
  return new Date(mkDate(y,2,20).getTime()+off*MS);
}

// Moon phase
function moon(date){
  const p=29.530588853;
  const n=new Date(2000,0,6,18,14);
  const a=((date-n)/MS%p+p)%p;
  return a<1.8?["🌑","New Moon"]:
         a<5.5?["🌒","Waxing Crescent"]:
         a<9.2?["🌓","First Quarter"]:
         a<12.9?["🌔","Waxing Gibbous"]:
         a<16.6?["🌕","Full Moon"]:
         a<20.3?["🌖","Waning Gibbous"]:
         a<24.0?["🌗","Last Quarter"]:
                 ["🌘","Waning Crescent"];
}

// Render
function render(){
  const ms=months(fsYear);
  monthSelect.innerHTML="";
  ms.forEach((m,i)=>monthSelect.add(new Option(m[0],i)));

  monthSelect.value=fsMonth;
  dayInput.value=fsDay;
  yearInput.value=fsYear;

  calendarGrid.innerHTML="";
  for(let i=1;i<=ms[fsMonth][1];i++){
    const c=document.createElement("div");
    c.className="day"+(i===fsDay?" today":"");
    c.textContent=i;
    calendarGrid.appendChild(c);
  }

  const era=fsYear<0?"AEV":"PEV";
  monthTitle.textContent=`${ms[fsMonth][0]} ${Math.abs(fsYear)} ${era}`;

  const g=fs2g(fsYear,fsMonth,fsDay);
  gregorianOutput.textContent=`Gregorian: ${g.toDateString()}`;
  const [e,n]=moon(g);
  lunarPhase.textContent=`Lunar Phase: ${e} ${n}`;
}

// Controls
function goToFSDate(){
  followNow=false;
  fsMonth=+monthSelect.value;
  fsDay=+dayInput.value;
  fsYear=+yearInput.value;
  render();
}

function convertGregorian(){
  followNow=false;
  const fs=g2fs(new Date(gregorianInput.value));
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
}

// Clock
setInterval(()=>{
  const now=new Date();
  const utc=now.getTime()+now.getTimezoneOffset()*60000;
  const t=new Date(utc+utcOffset*3600000);
  clock.textContent=t.toLocaleTimeString();
  if(followNow){
    const fs=g2fs(t);
    fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
    render();
  }
},1000);

utcOffset.addEventListener("change",e=>utcOffset=+e.target.value);

// About
function toggleAbout(){
  aboutSection.style.display =
    aboutSection.style.display==="block"?"none":"block";
}

// Init
(() => {
  const fs=g2fs(new Date());
  fsYear=fs.y; fsMonth=fs.m; fsDay=fs.d;
  render();
})();
