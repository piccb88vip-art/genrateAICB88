# CLICKBET88 World Cup Smart Predictor

Project siap upload ke GitHub Pages.

## File penting
- `index.html` = halaman utama
- `css/style.css` = style desktop
- `css/mobile.css` = style mobile
- `js/config.js` = semua link penting
- `apps-script/Code.gs` = API Google Sheets + Gemini optional

## Google Sheet MATCH
Header yang disarankan:

Match ID | Team A | Team B | Tanggal | Jam | Score A | Score B | Group / Stage | Status | Home Odds | Away Odds | AI Score | AI Confidence | AI Insight | Home Flag | Away Flag

Status: `UPCOMING`, `LIVE`, `FINISHED`.

## Setup Apps Script
1. Buka Google Sheet.
2. Extensions → Apps Script.
3. Paste isi `apps-script/Code.gs`.
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Copy Web App URL.
8. Paste ke `js/config.js` bagian `SHEET_API`.

## Gemini AI Optional
Kalau mau AI Gemini:
1. Apps Script → Project Settings → Script Properties.
2. Tambahkan `GEMINI_API_KEY`.
3. Di `js/config.js`, ubah `AI_MODE` menjadi `gemini`.

Kalau tidak pakai Gemini, mode `local` tetap jalan.

## Prediksi AI CLICKBET88

Default project ini sudah memakai mode:

```js
AI_MODE: "local"
```

Artinya tombol **Generate Prediksi CLICKBET88** langsung mengeluarkan:
- Prediksi skor
- Confidence %
- Persentase Home / Draw / Away
- Insight pertandingan versi CLICKBET88

Mode ini tidak butuh Gemini API. Google Sheet cukup dipakai untuk jadwal, tanggal, jam, stage, status, dan odds.

Kalau suatu saat ingin Gemini asli, ubah `AI_MODE` menjadi `gemini` dan isi `SHEET_API` dengan Apps Script yang sudah terhubung ke Gemini.
