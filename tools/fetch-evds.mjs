/**
 * TCMB EVDS → data/paranindegeri-data.json
 * Kullanım: set TCMB_API_KEY=xxx && node tools/fetch-evds.mjs
 * GitHub Actions: secret TCMB_API_KEY ile otomatik çalışır.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSehirler } from './build-sehirler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'paranindegeri-data.json');
const OUT_LEGACY = path.join(ROOT, 'data', 'liradex-data.json');

const API_KEY = process.env.TCMB_API_KEY;
const EVDS_BASE = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';
const EVDS_ALTIN = 'TP.MK.KUL.YTL';

const DEFAULT_TUFE = {
  2003: 18.4, 2004: 9.3, 2005: 7.7, 2006: 9.6, 2007: 8.4, 2008: 10.1,
  2009: 6.5, 2010: 6.4, 2011: 10.4, 2012: 6.2, 2013: 7.4, 2014: 8.2,
  2015: 8.8, 2016: 8.5, 2017: 11.9, 2018: 20.3, 2019: 11.8, 2020: 14.6,
  2021: 19.6, 2022: 72.3, 2023: 64.8, 2024: 44.4, 2025: 32.0
};
const DEFAULT_DOLAR = {
  2003: 1.49, 2004: 1.83, 2005: 1.43, 2006: 1.56, 2007: 1.31, 2008: 1.26,
  2009: 1.55, 2010: 1.56, 2011: 1.67, 2012: 1.80, 2013: 1.90, 2014: 2.19,
  2015: 2.72, 2016: 3.02, 2017: 3.65, 2018: 4.84, 2019: 5.95, 2020: 7.02,
  2021: 8.90, 2022: 16.57, 2023: 23.77, 2024: 32.50, 2025: 38.20
};
const DEFAULT_ALTIN = {
  2003: 42, 2004: 52, 2005: 58, 2006: 72, 2007: 85, 2008: 95, 2009: 110,
  2010: 125, 2011: 145, 2012: 165, 2013: 185, 2014: 210, 2015: 250,
  2016: 290, 2017: 340, 2018: 420, 2019: 520, 2020: 680, 2021: 950,
  2022: 1450, 2023: 2100, 2024: 2850, 2025: 3200
};

function parseSayi(v) {
  if (v == null || v === '') return NaN;
  const s = String(v).trim();
  if (s.includes(',') && s.includes('.')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(s.replace(',', '.'));
}

function tarihYil(t) {
  const m = String(t || '').match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function degerAnahtari(items, kod) {
  const row = items[0];
  const alt = kod.replace(/\./g, '_');
  if (row[kod] !== undefined) return kod;
  if (row[alt] !== undefined) return alt;
  return Object.keys(row).find(k => k !== 'Tarih' && k !== 'UNIXTIME');
}

async function evdsCek(seri, opts = {}) {
  if (!API_KEY) throw new Error('TCMB_API_KEY ortam değişkeni tanımlı değil');
  const params = new URLSearchParams({
    series: seri,
    startDate: '01-01-2003',
    endDate: '31-12-2025',
    type: 'json',
    frequency: opts.frequency || '5',
    ...(opts.aggregationTypes ? { aggregationTypes: opts.aggregationTypes } : {})
  });
  const url = EVDS_BASE + params.toString();
  const res = await fetch(url, { headers: { key: API_KEY } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${seri} HTTP ${res.status}: ${text.slice(0, 120)}`);
  if (text.trim().startsWith('<')) throw new Error(`${seri} HTML yanıt`);
  return JSON.parse(text).items || [];
}

function yillikSon(items, kod) {
  const key = degerAnahtari(items, kod);
  const son = {};
  for (const row of items) {
    const y = tarihYil(row.Tarih);
    const v = parseSayi(row[key]);
    if (y && !isNaN(v)) son[y] = v;
  }
  return son;
}

function yillikOrt(items, kod) {
  const key = degerAnahtari(items, kod);
  const g = {};
  for (const row of items) {
    const y = tarihYil(row.Tarih);
    const v = parseSayi(row[key]);
    if (!y || isNaN(v)) continue;
    if (!g[y]) g[y] = { t: 0, n: 0 };
    g[y].t += v;
    g[y].n++;
  }
  const son = {};
  for (const y of Object.keys(g)) {
    son[y] = Math.round((g[y].t / g[y].n) * 100) / 100;
  }
  return son;
}

function yillikTufe(items, kod) {
  const key = degerAnahtari(items, kod);
  const vals = items.map(r => parseSayi(r[key])).filter(v => !isNaN(v));
  if (vals.length && vals.every(v => v > -50 && v < 200)) return yillikSon(items, kod);
  const idx = yillikSon(items, kod);
  const yillar = Object.keys(idx).map(Number).sort((a, b) => a - b);
  const oran = {};
  for (let i = 1; i < yillar.length; i++) {
    const a = idx[yillar[i - 1]], b = idx[yillar[i]];
    if (a > 0 && b > 0) oran[yillar[i]] = Math.round((b / a - 1) * 1000) / 10;
  }
  return oran;
}

function birlestir(def, yeni) {
  return { ...def, ...yeni };
}

function sonYil(...objs) {
  return Math.max(...objs.flatMap(o => Object.keys(o).map(Number)));
}

async function main() {
  console.log('EVDS verisi çekiliyor…');
  const [tufeI, dolarI, altinI] = await Promise.all([
    evdsCek('TP.FE.OKTG01'),
    evdsCek('TP.DK.USD.A', { aggregationTypes: 'avg' }),
    evdsCek(EVDS_ALTIN, { aggregationTypes: 'avg' })
  ]);

  const tufe = birlestir(DEFAULT_TUFE, yillikTufe(tufeI, 'TP.FE.OKTG01'));
  const dolar = birlestir(DEFAULT_DOLAR, yillikOrt(dolarI, 'TP.DK.USD.A'));
  const altin = birlestir(DEFAULT_ALTIN, yillikOrt(altinI, EVDS_ALTIN));

  const mevcutPath = fs.existsSync(OUT) ? OUT : (fs.existsSync(OUT_LEGACY) ? OUT_LEGACY : null);
  const mevcut = mevcutPath ? JSON.parse(fs.readFileSync(mevcutPath, 'utf8')) : null;

  let sehirler = buildSehirler();
  if (mevcut?.sehirler) {
    for (const [k, v] of Object.entries(mevcut.sehirler)) {
      if (v && v.otomatik === false) sehirler[k] = v;
    }
  }

  const paket = {
    guncelleme_tarihi: new Date().toISOString(),
    kaynak: 'TCMB EVDS + 81 il kira (otomatik)',
    bugun_yil: sonYil(tufe, dolar, altin),
    tufe,
    dolar,
    altin,
    sehirler
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const json = JSON.stringify(paket, null, 2);
  fs.writeFileSync(OUT, json, 'utf8');
  fs.writeFileSync(OUT_LEGACY, json, 'utf8');
  console.log('Yazıldı:', OUT);
  console.log('Veri yılı:', paket.bugun_yil);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
