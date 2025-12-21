let currentWeek = 0;
let currentReason = null;

/* -----------------------------
   COUNTDOWN (ONLY FOR REASON CARD)
----------------------------- */

function getNextMonday() {
  const now = new Date();
  const day = now.getDay(); // Sun=0
  const daysUntilMonday = day === 0 ? 1 : 8 - day;

  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  return nextMonday;
}

function updateCountdown() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  const next = getNextMonday();
  const now = new Date();
  const diff = next - now;
  if (diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  countdownEl.innerText =
    `${days} dagar · ${hours} timmar · ${minutes} minuter`;
}

/* -----------------------------
   WEEK CALCULATION (SWEDISH LOGIC)
----------------------------- */

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCurrentWeek(startDateStr) {
  const startDate = normalizeDate(startDateStr);
  const today = normalizeDate(new Date());

  if (today < startDate) return 0;

  let week = 1;
  let cursor = new Date(startDate);

  const day = cursor.getDay(); // Sun=0
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  cursor.setDate(cursor.getDate() + daysUntilMonday);

  while (cursor <= today && week < 52) {
    week++;
    cursor.setDate(cursor.getDate() + 7);
  }

  return week;
}

/* -----------------------------
   WEEKLY PASSWORD GATE
----------------------------- */

function tryWeeklyPassword() {
  const input = document
    .getElementById("weeklyPasswordInput")
    .value
    .trim()
    .toLowerCase();

  const correct = currentReason.password.trim().toLowerCase();

  if (input === correct) {
    showReason();
  } else {
    document.getElementById("weeklyError").innerText =
      "E du duem i huet äller. Tänk på ett gemensamt minne 💭";
  }
}

function revealAnyway() {
  showReason();
}

/* -----------------------------
   SHOW REASON (UNLOCK)
----------------------------- */

function showReason() {
  // Hide gate
  document.getElementById("weeklyGate").style.display = "none";

  // Show reason card
  const reasonCard = document.getElementById("reasonCard");
  reasonCard.style.display = "block";

  document.getElementById("reason").innerText =
    currentReason.reason;

  document.getElementById("memory").innerText =
    "Den här veckan vill jag att du minns:\n\n" + currentReason.memory;

  // Show mom card
  document.getElementById("momCard").style.display = "block";

  loadMomReason(currentWeek);

  // Start countdown only after unlock
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

/* -----------------------------
   LOAD WEEK (CLEAN, SINGLE FLOW)
----------------------------- */

function loadWeek() {
  fetch("/static/json/reasons.json")
    .then(res => res.json())
    .then(data => {
      const START_DATE = "2025-12-24";
      currentWeek = getCurrentWeek(START_DATE);

      const weeklyGate = document.getElementById("weeklyGate");
      const reasonCard = document.getElementById("reasonCard");
      const momCard = document.getElementById("momCard");
      const weekTitle = document.getElementById("weekTitle");

      // Reset UI
      weeklyGate.style.display = "block";
      reasonCard.style.display = "none";
      momCard.style.display = "none";

      document.getElementById("weeklyPasswordInput").value = "";
      document.getElementById("weeklyError").innerText = "";

      // Before start date
      if (currentWeek === 0) {
        weekTitle.innerText = "Kommer snart 🎄";
        document.getElementById("weeklyHint").innerText =
          "Din första anledning kommer på julafton ❤️";
        return;
      }

      currentReason = data.reasons.find(r => r.week === currentWeek);

      if (!currentReason) {
        weekTitle.innerText = `Vecka ${currentWeek}`;
        document.getElementById("weeklyHint").innerText =
          "Något gick fel kontakta Niclis 💔";
        return;
      }

      weekTitle.innerText = `Vecka ${currentWeek} av 52`;
      document.getElementById("weeklyHint").innerText =
        currentReason.passwordHint;
    })
    .catch(err => {
      console.error("Failed to load reasons.json", err);
    });
}

/* -----------------------------
   MOM REASON (UNCHANGED, CORRECT)
----------------------------- */

function saveMomReason(currentWeek) {
  const textarea = document.getElementById("momReason");
  const msg = document.getElementById("savedMsg");
  const key = `momReasonWeek${currentWeek}`;

  if (localStorage.getItem(key)) {
    msg.innerText = "Redan lagt till denna veckan 💕";
    return;
  }

  const text = textarea.value.trim();
  if (!text) return;

  localStorage.setItem(key, text);
  textarea.disabled = true;
  msg.innerText = "Sparad ❤️";
}

function loadMomReason(currentWeek) {
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

/* -----------------------------
   INIT
----------------------------- */

window.addEventListener("DOMContentLoaded", loadWeek);

