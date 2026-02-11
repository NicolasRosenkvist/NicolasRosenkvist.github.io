let currentWeek = 0;
let maxUnlockedWeek = 0;
let reasonsData = [];
let direction = 1;

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCurrentWeek(startDateStr) {
  const startDate = normalizeDate(startDateStr);
  const today = normalizeDate(new Date());

  if (today < startDate) return 1;

  let week = 1;
  let cursor = new Date(startDate);

  const day = cursor.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  cursor.setDate(cursor.getDate() + daysUntilMonday);

  while (cursor <= today && week < 52) {
    week++;
    cursor.setDate(cursor.getDate() + 7);
  }

  return week;
}

function renderWeek() {
  const weekObj = reasonsData.find(r => r.week === currentWeek);
  if (!weekObj) return;

  const card = document.getElementById("mainCard");

  card.classList.remove("slide-in-left", "slide-in-right");
  card.classList.add(direction === 1 ? "slide-out-left" : "slide-out-right");

  setTimeout(() => {
    document.getElementById("weekNumber").innerText = currentWeek;
    document.getElementById("reason").innerText = weekObj.reason;
    document.getElementById("memory").innerText = weekObj.memory;

    document.getElementById("prevBtn").disabled = currentWeek <= 1;
    document.getElementById("nextBtn").disabled = currentWeek >= maxUnlockedWeek;

    loadMomReason();

    card.classList.remove("slide-out-left", "slide-out-right");
    card.classList.add(direction === 1 ? "slide-in-right" : "slide-in-left");
  }, 200);
}

function goPrev() {
  if (currentWeek > 1) {
    direction = -1;
    currentWeek--;
    renderWeek();
  }
}

function goNext() {
  if (currentWeek < maxUnlockedWeek) {
    direction = 1;
    currentWeek++;
    renderWeek();
  }
}

function saveMomReason() {
  const textarea = document.getElementById("momReason");
  const msg = document.getElementById("savedMsg");
  const key = `momReasonWeek${currentWeek}`;

  const text = textarea.value.trim();
  if (!text) return;

  localStorage.setItem(key, text);
  textarea.disabled = true;
  msg.innerText = "Sparad ❤️";
}

function loadMomReason() {
  const textarea = document.getElementById("momReason");
  const msg = document.getElementById("savedMsg");
  const key = `momReasonWeek${currentWeek}`;

  const saved = localStorage.getItem(key);

  if (saved) {
    textarea.value = saved;
    textarea.disabled = true;
    msg.innerText = "Vecka sparad ❤️";
  } else {
    textarea.value = "";
    textarea.disabled = false;
    msg.innerText = "";
  }
}

function enableSwipe() {
  let startX = 0;

  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  document.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50) goNext();
    if (diff < -50) goPrev();
  });
}

function init() {
  fetch("/static/json/reasons.json")
    .then(res => res.json())
    .then(data => {
      reasonsData = data.reasons;

      maxUnlockedWeek = getCurrentWeek("2025-12-24");
      currentWeek = maxUnlockedWeek;

      renderWeek();
    });

  document.getElementById("prevBtn").addEventListener("click", goPrev);
  document.getElementById("nextBtn").addEventListener("click", goNext);
  document.getElementById("saveBtn").addEventListener("click", saveMomReason);

  enableSwipe();
}

window.addEventListener("DOMContentLoaded", init);
