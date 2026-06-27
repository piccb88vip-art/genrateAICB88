let MATCHES = [];

async function init(){
  document.querySelectorAll("#loginTop,#loginHero,#loginBottom").forEach(a=>a.href = CONFIG.LOGIN_URL);
  document.querySelector(".bg-layer").style.backgroundImage = `url('${CONFIG.BACKGROUND}')`;
  try{
    MATCHES = await fetchMatches();
    renderMatches(MATCHES);
  }catch(err){
    console.error(err);
    MATCHES = demoMatches();
    renderMatches(MATCHES);
  }
}

document.addEventListener("click", async (e)=>{
  const btn = e.target.closest(".generate-btn");
  if(btn){
    const match = MATCHES.map(normalizeMatch).find(m=>m.id === btn.dataset.id);
    if(!match) return;
    btn.textContent = "Membaca Prediksi...";
    btn.disabled = true;
    const ai = await generatePrediction(match);
    btn.textContent = "Generate Prediksi CLICKBET88";
    btn.disabled = false;
    openPrediction(match, ai);
  }
  if(e.target.id === "closeModal" || e.target.id === "predictionModal"){
    document.getElementById("predictionModal").classList.add("hidden");
  }
  if(e.target.matches(".mini-btn")) init();
});

init();
