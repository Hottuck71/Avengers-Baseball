// Avengers Baseball - full game.js with UI hooks integrated

const $ = (sel) => document.querySelector(sel);
const canvas = $("#game");
const ctx = canvas.getContext("2d");

const state = {
  scene: "menu",
  delta: 0,
  last: performance.now(),
  teams: null,
  homeAtBatIndex: 0,
  awayAtBatIndex: 0,
  inning: 1,
  half: "top",
  outs: 0,
  bases: [null, null, null],
  score: { home: 0, away: 0 },
  pitch: null,
  swingWindow: null,
  selectedTeam: "homeTeam",
  strikes: 0
};

const ui = {
  start: $("#btnStart"),
  teamSelect: $("#teamSelect"),
  status: $("#status"),
  btnPitch: $("#btnPitch"),
  btnSwing: $("#btnSwing"),
  btnReset: $("#btnReset"),
  homeScore: $("#homeScore"),
  awayScore: $("#awayScore")
};

// --- UI Event Hooks ---
ui.start.addEventListener("click", () => startGame());
ui.teamSelect.addEventListener("change", (e) => { state.selectedTeam = e.target.value; });
ui.btnPitch.addEventListener("click", () => schedulePitch());
ui.btnSwing.addEventListener("click", () => attemptSwing());
ui.btnReset.addEventListener("click", () => resetInning());

window.addEventListener("keydown", (e) => {
  if (state.scene === "bat") {
    if (e.code === "Space") attemptSwing();
    if (e.code === "ArrowLeft") aimX -= 10;
    if (e.code === "ArrowRight") aimX += 10;
  }
});

let aimX = canvas.width * 0.5;

// --- Initialization ---
async function init() {
  await loadTeams();
  populateTeamSelect();
  loop(performance.now());
}

async function loadTeams() {
  const res = await fetch("teams.json");
  state.teams = await res.json();
}

function populateTeamSelect() {
  ui.teamSelect.innerHTML = "";
  for (const key of ["homeTeam", "awayTeam"]) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = state.teams[key].name;
    ui.teamSelect.appendChild(opt);
  }
}

// --- Game Flow ---
function startGame() {
  resetInning();
  state.scene = "bat";
  ui.status.textContent = "Space/Click Swing | Arrows Aim";
}

function resetInning() {
  state.outs = 0;
  state.strikes = 0;
  state.bases = [null, null, null];
  schedulePitch();
}

function schedulePitch() {
  state.pitch = {
    x: canvas.width * 0.5,
    y: 120,
    vx: randRange(-0.8, 0.8),
    vy: randRange(2.4, 3.0),
    speed: randRange(2.6, 3.2),
    radius: 8
  };
  state.swingWindow = {
    startY: 320,
    endY: 380,
    goodX: canvas.width * 0.5 + randRange(-40, 40)
  };
}

function attemptSwing() {
  const p = state.pitch;
  if (!p) return;
  const withinY = p.y >= state.swingWindow.startY && p.y <= state.swingWindow.endY;
  const distX = Math.abs(p.x - aimX);
  const sweetSpot = distX < 25 && withinY;

  if (sweetSpot) {
    const power = 0.6 + randRange(-0.15, 0.15
