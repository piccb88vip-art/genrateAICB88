const SHEET_NAME = 'MATCH';
const GEMINI_MODEL = 'gemini-1.5-flash';

function doGet(e) {
  const action = e.parameter.action || 'getMatches';
  if (action === 'getMatches') return json(getMatches());
  if (action === 'generatePrediction') return json(generatePrediction(e.parameter.id));
  return json({ error: 'Unknown action' });
}

function getMatches() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sh.getDataRange().getDisplayValues();
  const headers = values.shift();
  const matches = values.filter(r => r[0]).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return {
      id: obj['Match ID'],
      teamA: obj['Team A'],
      teamB: obj['Team B'],
      tanggal: obj['Tanggal'],
      jam: obj['Jam'],
      stage: obj['Group / Stage'],
      status: obj['Status'],
      homeOdds: obj['Home Odds'],
      awayOdds: obj['Away Odds'],
      aiScore: obj['AI Score'],
      aiConfidence: obj['AI Confidence'],
      aiInsight: obj['AI Insight'],
      homeFlag: obj['Home Flag'],
      awayFlag: obj['Away Flag']
    };
  });
  return { matches, updatedAt: new Date().toISOString() };
}

function generatePrediction(matchId) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sh.getDataRange().getDisplayValues();
  const headers = values[0];
  const idCol = headers.indexOf('Match ID');
  const rowIndex = values.findIndex((r, i) => i > 0 && r[idCol] === matchId);
  if (rowIndex < 1) return { error: 'Match tidak ditemukan' };

  const row = values[rowIndex];
  const get = name => row[headers.indexOf(name)] || '';
  const teamA = get('Team A');
  const teamB = get('Team B');
  const stage = get('Group / Stage');
  const homeOdds = get('Home Odds');
  const awayOdds = get('Away Odds');

  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    return localPrediction_(teamA, teamB, stage, homeOdds, awayOdds);
  }

  const prompt = `Buat prediksi sepak bola singkat dalam Bahasa Indonesia untuk ${teamA} vs ${teamB}. Stage: ${stage}. Home Odds: ${homeOdds}. Away Odds: ${awayOdds}. Format JSON valid saja: {"aiScore":"2-1","confidence":78,"homePct":45,"drawPct":28,"awayPct":27,"favorite":"Team","insight":"..."}. Jangan beri klaim pasti, sebutkan ini insight bukan jaminan.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const res = UrlFetchApp.fetch(url, { method:'post', contentType:'application/json', payload: JSON.stringify(payload), muteHttpExceptions:true });
  const text = JSON.parse(res.getContentText()).candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = text.replace(/```json|```/g,'').trim();
  try { return JSON.parse(cleaned); } catch(err) { return localPrediction_(teamA, teamB, stage, homeOdds, awayOdds); }
}

function localPrediction_(teamA, teamB, stage, homeOdds, awayOdds) {
  const h = Number(homeOdds) || 0;
  const a = Number(awayOdds) || 0;
  let homePct = Math.max(24, Math.min(62, Math.round(50 + h * 10)));
  let awayPct = Math.max(20, Math.min(58, Math.round(50 + a * 10)));
  let drawPct = Math.max(18, 100 - homePct - awayPct);
  const favorite = homePct >= awayPct ? teamA : teamB;
  return {
    aiScore: Math.abs(homePct-awayPct) < 8 ? '1-1' : (homePct > awayPct ? '2-1' : '1-2'),
    confidence: Math.max(61, Math.min(84, 62 + Math.abs(homePct-awayPct))),
    homePct, drawPct, awayPct, favorite,
    insight: `CLICKBET88 Insight membaca ${teamA} vs ${teamB} sebagai laga yang cukup ketat. ${favorite} sedikit lebih menonjol dari kombinasi odds dan stage pertandingan. Prediksi ini hanya insight, bukan jaminan hasil akhir.`
  };
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
