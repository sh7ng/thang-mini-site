const $ = (s) => document.querySelector(s);

const greetings = [
  "Xin chào.",
  "Chào bạn.",
  "Một ngày mới.",
  "Rất vui gặp bạn.",
  "Hey, Jacob đây.",
  "Bạn đang làm gì vậy?",
  "Chúc bạn một ngày nhẹ nhàng."
];

const randomLines = [
  "Có những ngày không cần phải làm gì thật lớn.",
  "Uống nước đi.",
  "Mọi thứ rồi sẽ ổn.",
  "Đôi khi nghỉ ngơi cũng là một việc cần làm.",
  "Hôm nay thử đi bộ một chút.",
  "Bạn không cần phải vội.",
  "Một ý tưởng nhỏ cũng đáng để bắt đầu.",
  "Internet rộng lắm. Đây chỉ là một góc nhỏ."
];

function pad(n){ return String(n).padStart(2,"0"); }

function updateClock(){
  const now = new Date();
  const clock = $("#clock");
  if(clock) clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = $("#dateText");
  if(date) date.textContent = new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}).format(now);
  const year = $("#year");
  if(year) year.textContent = now.getFullYear();
}

function setupGreeting(){
  const greeting = $("#greeting");
  if(greeting) greeting.textContent = greetings[Math.floor(Math.random()*greetings.length)];
  const line = $("#dailyLine");
  if(line) line.textContent = randomLines[Math.floor(Math.random()*randomLines.length)];
}

function setupTheme(){
  const btn = $("#themeToggle");
  const saved = localStorage.getItem("jacob-theme");
  if(saved === "dark") document.body.classList.add("dark");
  if(!btn) return;
  btn.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("jacob-theme", document.body.classList.contains("dark") ? "dark":"light");
  });
}

function weatherInfo(code){
  if(code === 0) return ["☀","Trời quang"];
  if([1,2].includes(code)) return ["◐","Ít mây"];
  if(code === 3) return ["☁","Nhiều mây"];
  if([45,48].includes(code)) return ["≋","Sương mù"];
  if([51,53,55,56,57].includes(code)) return ["☂","Mưa phùn"];
  if([61,63,65,66,67].includes(code)) return ["☂","Mưa"];
  if([71,73,75,77].includes(code)) return ["❄","Tuyết"];
  if([80,81,82].includes(code)) return ["☂","Mưa rào"];
  if([95,96,99].includes(code)) return ["ϟ","Dông"];
  return ["•","Không rõ"];
}

function formatDay(dateString, index){
  const d = new Date(`${dateString}T12:00:00`);
  if(index === 0) return "Hôm nay";
  if(index === 1) return "Ngày mai";
  return new Intl.DateTimeFormat("vi-VN",{weekday:"long"}).format(d).replace(/^\w/, c=>c.toUpperCase());
}

async function loadWeather(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Weather request failed");
  return res.json();
}

function renderWeather(data){
  const currentCode = data.current.weather_code;
  const [icon, summary] = weatherInfo(currentCode);
  const curTemp = $("#currentTemp");
  if(curTemp) curTemp.textContent = `${Math.round(data.current.temperature_2m)}°`;
  if($("#weatherIcon")) $("#weatherIcon").textContent = icon;
  if($("#currentSummary")) $("#currentSummary").textContent = summary;
  if($("#currentHigh")) $("#currentHigh").textContent = `${Math.round(data.daily.temperature_2m_max[0])}°`;
  if($("#currentLow")) $("#currentLow").textContent = `${Math.round(data.daily.temperature_2m_min[0])}°`;
  if($("#rainChance")) $("#rainChance").textContent = `${data.daily.precipitation_probability_max[0] ?? 0}%`;

  const grid = $("#forecastGrid");
  if(!grid) return;
  grid.innerHTML = "";
  // 3 ngày sắp tới: ngày mai + 2 ngày tiếp theo.
  for(let i=1;i<=3;i++){
    const [ic, desc] = weatherInfo(data.daily.weather_code[i]);
    const card = document.createElement("article");
    card.className = "forecast-card card";
    card.innerHTML = `
      <div class="forecast-day">${formatDay(data.daily.time[i],i)}</div>
      <div class="forecast-icon" title="${desc}">${ic}</div>
      <div>
        <div class="forecast-temp">${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
        <div class="forecast-rain">Mưa ${data.daily.precipitation_probability_max[i] ?? 0}%</div>
      </div>`;
    grid.appendChild(card);
  }
}

async function initWeather(){
  const title = $("#weatherTitle");
  const location = $("#locationText");
  const fallback = {lat:21.0285, lon:105.8542, name:"Hà Nội"};
  async function go(lat,lon,name){
    try{
      const data = await loadWeather(lat,lon);
      renderWeather(data);
      if(location) location.textContent = name || "Vị trí hiện tại";
    }catch{
      if($("#currentSummary")) $("#currentSummary").textContent = "Không lấy được dữ liệu thời tiết.";
    }
  }
  if(title) title.textContent = "Hôm nay";
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p=>go(p.coords.latitude,p.coords.longitude,"Vị trí hiện tại"),
      ()=>go(fallback.lat,fallback.lon,fallback.name),
      {enableHighAccuracy:false,timeout:7000,maximumAge:600000}
    );
  }else{
    go(fallback.lat,fallback.lon,fallback.name);
  }
  const refresh = $("#refreshWeather");
  if(refresh) refresh.addEventListener("click",()=>initWeather());
}

// Ngày lễ: các ngày lễ chính theo quy định chung.
// Tết và Quốc khánh có thể có lịch nghỉ thực tế/hoán đổi do cơ quan có thẩm quyền công bố.
const holidayTemplates = [
  {month:1,day:1,name:"Tết Dương lịch",note:"01 ngày"},
  {month:4,day:30,name:"Ngày Giải phóng miền Nam 30/4",note:"01 ngày"},
  {month:5,day:1,name:"Ngày Quốc tế Lao động 1/5",note:"01 ngày"},
  {month:9,day:2,name:"Quốc khánh 2/9",note:"02 ngày nghỉ theo quy định; ngày liền kề có thể thay đổi"},
];

// Tết Nguyên đán và Giỗ Tổ được khai báo cho các năm gần đây.
// Ngày nghỉ thực tế có thể được bố trí khác theo quyết định từng năm.
const lunarHolidays = {
  2026: [
    {date:"2026-02-17",name:"Tết Nguyên đán",note:"05 ngày theo quy định; lịch nghỉ thực tế theo thông báo hằng năm"},
    {date:"2026-03-26",name:"Giỗ Tổ Hùng Vương",note:"Mùng 10 tháng 3 âm lịch"}
  ],
  2027: [
    {date:"2027-02-06",name:"Tết Nguyên đán",note:"05 ngày theo quy định; lịch nghỉ thực tế theo thông báo hằng năm"},
    {date:"2027-04-16",name:"Giỗ Tổ Hùng Vương",note:"Mùng 10 tháng 3 âm lịch"}
  ],
  2028: [
    {date:"2028-01-26",name:"Tết Nguyên đán",note:"05 ngày theo quy định; lịch nghỉ thực tế theo thông báo hằng năm"},
    {date:"2028-04-05",name:"Giỗ Tổ Hùng Vương",note:"Mùng 10 tháng 3 âm lịch"}
  ]
};

function buildHolidayList(year){
  const list = holidayTemplates.map(h=>({
    date:`${year}-${pad(h.month)}-${pad(h.day)}`,
    name:h.name,note:h.note
  }));
  return list.concat(lunarHolidays[year] || []).sort((a,b)=>a.date.localeCompare(b.date));
}

function holidayDate(d){ return new Date(`${d}T00:00:00`); }

function initHolidays(){
  const listEl = $("#holidayList");
  const nextName = $("#nextHolidayName");
  if(!listEl && !nextName) return;

  const now = new Date();
  now.setHours(0,0,0,0);
  let all = [];
  for(let y=now.getFullYear(); y<=now.getFullYear()+2; y++) all.push(...buildHolidayList(y));
  all.sort((a,b)=>a.date.localeCompare(b.date));

  const upcoming = all.filter(h=>holidayDate(h.date) >= now);
  const next = upcoming[0];
  if(next){
    if(nextName) nextName.textContent = next.name;
    if($("#nextHolidayDate")) $("#nextHolidayDate").textContent = `${new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}).format(holidayDate(next.date))} · ${next.note}`;
    updateHolidayCountdown(next.date);
    window.__nextHolidayTimer = setInterval(()=>updateHolidayCountdown(next.date),1000);
  }

  if(listEl){
    listEl.innerHTML = upcoming.slice(0,12).map(h=>{
      const d=holidayDate(h.date);
      return `<article class="holiday-item">
        <div><div class="holiday-name">${h.name}</div><div class="holiday-date">${new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"}).format(d)}</div></div>
        <div class="holiday-days">${h.note}</div>
      </article>`;
    }).join("");
  }
}

function updateHolidayCountdown(dateString){
  const el=$("#holidayCountdown");
  if(!el) return;
  const target=holidayDate(dateString);
  const diff=Math.max(0,target-new Date());
  const days=Math.floor(diff/86400000);
  const hours=Math.floor(diff%86400000/3600000);
  const mins=Math.floor(diff%3600000/60000);
  const secs=Math.floor(diff%60000/1000);
  el.textContent=`${days} ngày ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

function initRandom(){
  const btn=$("#randomButton"), text=$("#randomText");
  if(!btn||!text) return;
  btn.addEventListener("click",()=>{
    const next=randomLines[Math.floor(Math.random()*randomLines.length)];
    text.animate([{opacity:.2,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:300,easing:"ease-out"});
    text.textContent=next;
  });
}

function initGame(){
  const input=$("#guessInput"), button=$("#guessButton"), msg=$("#gameMessage"), restart=$("#restartGame");
  if(!input||!button||!msg) return;
  let secret=Math.floor(Math.random()*100)+1, attempts=10;
  function end(){button.disabled=true;input.disabled=true;restart.classList.remove("hidden")}
  button.addEventListener("click",()=>{
    const guess=Number(input.value);
    if(!guess||guess<1||guess>100){msg.textContent="Hãy nhập một số từ 1 đến 100.";return}
    attempts--;
    if(guess===secret){msg.textContent=`Acertou! Là số ${secret}. 🎉`;end();return}
    if(attempts<=0){msg.textContent=`Hết lượt. Số đúng là ${secret}.`;end();return}
    msg.textContent=guess<secret?`Lớn hơn. Còn ${attempts} lượt.`:`Nhỏ hơn. Còn ${attempts} lượt.`;
    input.select();
  });
  input.addEventListener("keydown",e=>{if(e.key==="Enter")button.click()});
  restart.addEventListener("click",()=>location.reload());
}

updateClock();
setInterval(updateClock,1000);
setupGreeting();
setupTheme();
initRandom();
initGame();
initHolidays();
if(document.body.dataset.page==="home") initWeather();
