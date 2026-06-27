const flagMap = {
  "Mexico":"mx","South Africa":"za","Korea Republic":"kr","Czechia":"cz","Canada":"ca","Bosnia and Herzegovina":"ba","United States":"us","USA":"us","Paraguay":"py","Qatar":"qa","Switzerland":"ch","Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct","Australia":"au","Turkiye":"tr","Turkey":"tr","Germany":"de","Curacao":"cw","Netherlands":"nl","Japan":"jp","Ivory Coast":"ci","Ecuador":"ec","Sweden":"se","Tunisia":"tn","Spain":"es","Cape Verde":"cv","Belgium":"be","Egypt":"eg","Saudi Arabia":"sa","Uruguay":"uy","Iran":"ir","New Zealand":"nz","France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no","Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo","Portugal":"pt","DR Congo":"cd","England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa","Uzbekistan":"uz","Colombia":"co","Italy":"it"
};
function flagUrl(team, custom){
  if(custom) return custom;
  const code = flagMap[team];
  return code ? `https://flagcdn.com/w160/${code}.png` : CONFIG.DEFAULT_FLAG;
}
function esc(v){return String(v ?? "").replace(/[&<>'"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function fixtureCard(match){
  const m = normalizeMatch(match);
  const score = (m.status === "FINISHED" || m.status === "LIVE") && m.homeScore !== "" ? `${esc(m.homeScore)} - ${esc(m.awayScore)}` : "VS";
  return `<article class="fixture-card">
    <div class="match-date">${esc(m.date)} • ${esc(m.time)} WIB • ${esc(m.stage)} <span class="status-pill">${esc(m.status)}</span></div>
    <div class="teams">
      <div class="team"><img class="flag" src="${flagUrl(m.home,m.homeFlag)}" onerror="this.src='${CONFIG.DEFAULT_FLAG}'"><b>${esc(m.home)}</b></div>
      <div class="vs">${score}</div>
      <div class="team"><img class="flag" src="${flagUrl(m.away,m.awayFlag)}" onerror="this.src='${CONFIG.DEFAULT_FLAG}'"><b>${esc(m.away)}</b></div>
    </div>
    <div class="odds"><span>Home Odds: ${esc(m.homeOdds || '-')}</span><span>Away Odds: ${esc(m.awayOdds || '-')}</span></div>
    <button class="generate-btn" data-id="${esc(m.id)}">Generate Prediksi CLICKBET88</button>
  </article>`;
}
function resultRow(match){
  const m = normalizeMatch(match);
  return `<div class="result-row">
    <b>FT</b>
    <span>${esc(m.home)}</span>
    <span class="score">${esc(m.homeScore || '0')} - ${esc(m.awayScore || '0')}</span>
    <span class="away-name">${esc(m.away)}</span>
    <span class="detail-cell">${esc(m.date)}</span>
  </div>`;
}
function renderMatches(matches){
  const data = matches.map(normalizeMatch);
  const live = data.filter(m=>m.status === "LIVE");
  const upcoming = data.filter(m=>m.status === "UPCOMING" || m.status === "MENUNGGU").slice(0,12);
  const finished = data.filter(m=>m.status === "FINISHED" || m.status === "SELESAI").slice(0,10);

  document.getElementById("live").classList.toggle("hidden", live.length === 0);
  document.getElementById("liveList").innerHTML = live.map(fixtureCard).join("");
  document.getElementById("upcomingList").innerHTML = upcoming.map(fixtureCard).join("") || emptyState("Belum ada jadwal upcoming.");
  document.getElementById("completedList").innerHTML = finished.map(resultRow).join("") || emptyState("Belum ada hasil pertandingan.");
}
function emptyState(text){ return `<div class="fixture-card"><b>${esc(text)}</b></div>`; }
function openPrediction(match, ai){
  const m = normalizeMatch(match);
  const modal = document.getElementById("predictionModal");
  const content = document.getElementById("modalContent");
  content.innerHTML = `<div class="hero-badge">${esc(m.stage)} • ${esc(m.date)} ${esc(m.time)} WIB</div>
    <h2 class="ai-title">${esc(m.home)} vs ${esc(m.away)}</h2>
    <div class="ai-score">${esc(ai.aiScore)}</div>
    <div><b>Confidence ${esc(ai.confidence)}%</b><div class="confidence"><div style="width:${esc(ai.confidence)}%"></div></div></div>
    <div class="prob-grid">
      <div><b>${esc(ai.homePct)}%</b><span>${esc(m.home)}</span></div>
      <div><b>${esc(ai.drawPct)}%</b><span>Seri</span></div>
      <div><b>${esc(ai.awayPct)}%</b><span>${esc(m.away)}</span></div>
    </div>
    <p class="ai-text">${esc(ai.insight)}</p>
    <a class="primary-btn" href="${CONFIG.LOGIN_URL}" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:18px">Betting Sekarang</a>`;
  modal.classList.remove("hidden");
}
