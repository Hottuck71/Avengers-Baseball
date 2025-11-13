// Hook UI buttons
document.getElementById("btnPitch").addEventListener("click", schedulePitch);
document.getElementById("btnSwing").addEventListener("click", attemptSwing);
document.getElementById("btnReset").addEventListener("click", resetInning);

function updateScoreUI() {
  document.getElementById("homeScore").textContent = `Avengers: ${state.score.home}`;
  document.getElementById("awayScore").textContent = `Comets: ${state.score.away}`;
}
