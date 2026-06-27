async function fetchMatches(){
  if(!CONFIG.SHEET_API){
    return demoMatches();
  }
  const res = await fetch(CONFIG.SHEET_API + "?action=getMatches", { cache: "no-store" });
  if(!res.ok) throw new Error("Gagal mengambil data match");
  const data = await res.json();
  return Array.isArray(data.matches) ? data.matches : data;
}

function normalizeMatch(row){
  return {
    id: row.id || row.matchId || row["Match ID"] || row["MatchID"] || "",
    home: row.home || row.teamA || row["Team A"] || row["Home Team"] || "Team A",
    away: row.away || row.teamB || row["Team B"] || row["Away Team"] || "Team B",
    date: row.date || row.tanggal || row["Tanggal"] || row["Date"] || "",
    time: row.time || row.jam || row["Jam"] || row["Time"] || "",
    homeScore: row.homeScore ?? row["Home Score"] ?? row["Score A"] ?? "",
    awayScore: row.awayScore ?? row["Away Score"] ?? row["Score B"] ?? "",
    stage: row.stage || row.group || row["Group / Stage"] || row["Group / Stage"] || row["Group"] || "World Cup",
    status: String(row.status || row["Status"] || "UPCOMING").toUpperCase(),
    homeOdds: row.homeOdds ?? row["Home Odds"] ?? "",
    awayOdds: row.awayOdds ?? row["Away Odds"] ?? "",
    aiScore: row.aiScore || row["AI Score"] || "",
    aiConfidence: row.aiConfidence || row["AI Confidence"] || "",
    aiInsight: row.aiInsight || row["AI Insight"] || row.analysis || row["Analysis"] || "",
    homeFlag: row.homeFlag || row["Home Flag"] || "",
    awayFlag: row.awayFlag || row["Away Flag"] || ""
  };
}

function demoMatches(){
  return [
    {id:"M041",home:"Argentina",away:"Austria",date:"22/06/2026",time:"23:00",stage:"Group J",status:"UPCOMING",homeOdds:"0.82",awayOdds:"-0.92"},
    {id:"M042",home:"France",away:"Iraq",date:"23/06/2026",time:"04:00",stage:"Group I",status:"UPCOMING",homeOdds:"0.80",awayOdds:"-0.90"},
    {id:"M043",home:"Norway",away:"Senegal",date:"23/06/2026",time:"07:00",stage:"Group I",status:"UPCOMING",homeOdds:"0.78",awayOdds:"-0.88"},
    {id:"M044",home:"Jordan",away:"Algeria",date:"23/06/2026",time:"10:00",stage:"Group J",status:"LIVE",homeOdds:"-0.95",awayOdds:"0.85"},
    {id:"M040",home:"New Zealand",away:"Egypt",date:"22/06/2026",time:"08:00",stage:"Group G",status:"FINISHED",homeScore:"1",awayScore:"2",homeOdds:"0.72",awayOdds:"-0.82"}
  ];
}
