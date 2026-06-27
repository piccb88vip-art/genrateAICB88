async function generatePrediction(match){
  const m = normalizeMatch(match);

  // Default: Prediksi AI langsung dari browser.
  // Tidak butuh Gemini, tidak butuh API key, tidak bocor data.
  if(CONFIG.AI_MODE === "gemini" && CONFIG.SHEET_API){
    try{
      const url = `${CONFIG.SHEET_API}?action=generatePrediction&id=${encodeURIComponent(m.id)}`;
      const res = await fetch(url, { cache:"no-store" });
      if(res.ok){
        const data = await res.json();
        if(data && data.aiScore) return data;
      }
    }catch(e){
      console.warn("Gemini gagal, pakai CB88 Local AI", e);
    }
  }

  await wait(650);
  return cb88LocalAI(m);
}

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hashText(text){
  let h = 2166136261;
  for(let i=0;i<text.length;i++){
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function clamp(num, min, max){
  return Math.max(min, Math.min(max, num));
}

function cb88LocalAI(m){
  const seed = hashText(`${m.id}|${m.home}|${m.away}|${m.date}|${m.time}|${m.stage}`);
  const homeOdds = parseFloat(String(m.homeOdds).replace(",","."));
  const awayOdds = parseFloat(String(m.awayOdds).replace(",","."));

  let homePower = 50 + ((seed % 17) - 8);
  let awayPower = 50 + (((seed >> 4) % 17) - 8);

  // Odds market biasanya bikin prediksi terasa lebih masuk akal.
  if(!Number.isNaN(homeOdds)) homePower += homeOdds * 10;
  if(!Number.isNaN(awayOdds)) awayPower += awayOdds * 10;

  // Stage besar dibuat lebih ketat, biar hasilnya tidak norak.
  const bigStage = /final|semi|quarter|16|knock|besar|playoff/i.test(m.stage);
  if(bigStage){
    homePower = (homePower * 0.96) + 2;
    awayPower = (awayPower * 0.96) + 2;
  }

  const total = Math.max(1, homePower + awayPower + 25);
  let homePct = Math.round((homePower / total) * 100);
  let awayPct = Math.round((awayPower / total) * 100);
  let drawPct = 100 - homePct - awayPct;

  homePct = clamp(homePct, 24, 55);
  awayPct = clamp(awayPct, 22, 53);
  drawPct = clamp(100 - homePct - awayPct, 18, 34);

  // Rapikan agar total tetap 100.
  const diff = 100 - (homePct + drawPct + awayPct);
  if(homePct >= awayPct) homePct += diff; else awayPct += diff;

  const gap = Math.abs(homePct - awayPct);
  const favorite = homePct >= awayPct ? m.home : m.away;
  const underdog = homePct >= awayPct ? m.away : m.home;

  let homeScore, awayScore;
  if(gap <= 4){
    homeScore = seed % 2 ? 1 : 2;
    awayScore = homeScore;
  }else if(homePct > awayPct){
    homeScore = gap > 13 ? 2 : 1;
    awayScore = gap > 18 ? 0 : 1;
  }else{
    homeScore = gap > 18 ? 0 : 1;
    awayScore = gap > 13 ? 2 : 1;
  }

  // Variasi kecil agar tidak template banget.
  if((seed % 9) === 0 && !bigStage){
    homeScore = clamp(homeScore + 1, 0, 3);
  }
  if((seed % 11) === 0 && !bigStage){
    awayScore = clamp(awayScore + 1, 0, 3);
  }

  const confidence = clamp(63 + gap + (bigStage ? -3 : 2), 62, 87);
  const tempo = ["ketat", "cepat", "hati-hati", "terbuka", "penuh tekanan"][seed % 5];
  const keyFactor = [
    "momentum permainan",
    "efektivitas peluang",
    "transisi cepat",
    "kedisiplinan lini belakang",
    "kontrol bola di area tengah"
  ][(seed >> 3) % 5];

  const insightBank = [
    `Prediksi CLICKBET88 membaca laga ${m.home} vs ${m.away} akan berjalan ${tempo}. ${favorite} sedikit lebih menonjol dari sisi ${keyFactor}, tapi ${underdog} masih punya peluang bikin kejutan kalau mampu menahan tekanan awal.`,
    `Model prediksi CLICKBET88 melihat duel ini cukup tricky. Skor ${homeScore}-${awayScore} muncul karena perbedaan peluang tidak terlalu jauh, dengan faktor utama pada ${keyFactor} dan cara kedua tim menjaga tempo pertandingan.`,
    `Insight CLICKBET88 menilai ${favorite} punya kans lebih kuat untuk mengunci hasil, namun laga ini bukan tipe yang aman-aman saja. Kalau ${underdog} bisa memanfaatkan celah kecil, pertandingan bisa berubah cepat.`,
    `Simulasi CLICKBET88 memproyeksikan skor ${homeScore}-${awayScore}. Arah laga cenderung ${tempo}, dengan ${favorite} unggul tipis berdasarkan kombinasi odds, stage pertandingan, dan potensi peluang gol.`
  ];

  return {
    aiScore: `${homeScore}-${awayScore}`,
    confidence,
    homePct,
    drawPct,
    awayPct,
    favorite,
    insight: insightBank[seed % insightBank.length] + " Prediksi ini hanya insight pertandingan, bukan jaminan hasil akhir."
  };
}

// Backward compatibility kalau file lama masih memanggil localPrediction.
function localPrediction(match){
  return cb88LocalAI(normalizeMatch(match));
}
