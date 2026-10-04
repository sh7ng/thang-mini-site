const greetings = [
  "Hôm nay bạn thế nào?",
  "Internet vẫn đang hoạt động.",
  "Bạn đang ở đây. Thế là đủ.",
  "Có lẽ bạn nên uống một cốc nước.",
  "Chúc bạn một ngày bình thường.",
  "Hôm nay cũng là một ngày để bắt đầu.",
  "Không cần vội. Mọi thứ vẫn còn đó.",
  "Một góc nhỏ trên Internet đang chờ bạn.",
  "Bạn đến đúng lúc rồi.",
  "Thử bấm một nút xem sao."
];

function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  const date = document.getElementById("date");
  if (clock) clock.textContent = now.toLocaleTimeString("vi-VN", { hour12: false });
  if (date) date.textContent = now.toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
  });
}
updateClock();
setInterval(updateClock, 1000);

function setGreeting() {
  const el = document.getElementById("greeting");
  if (!el) return;
  el.textContent = greetings[Math.floor(Math.random() * greetings.length)];
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}
setGreeting();

const randomGreeting = document.getElementById("randomGreeting");
if (randomGreeting) randomGreeting.addEventListener("click", setGreeting);

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}
const savedTheme = localStorage.getItem("theme");
if (savedTheme) applyTheme(savedTheme);
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  });
}

// Weather via Open-Meteo: no API key, no account required.
async function loadWeather() {
  const el = document.getElementById("weather");
  if (!el) return;
  try {
    let lat = 21.1861, lon = 106.0763, place = "Bắc Ninh";
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3500 })
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        place = "Vị trí của bạn";
      } catch (_) {}
    }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather");
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const icons = {
      0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
      51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",
      71:"🌨️",73:"🌨️",75:"❄️",80:"🌦️",81:"🌧️",82:"🌧️",
      95:"⛈️",96:"⛈️",99:"⛈️"
    };
    el.textContent = `${icons[code] || "🌤️"} ${temp}°C · ${place}`;
  } catch (_) {
    el.textContent = "☁️ Thời tiết chưa có sẵn";
  }
}
loadWeather();