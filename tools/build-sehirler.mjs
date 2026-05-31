/**
 * 81 il yaşam maliyeti — TCMB m² kira + ankraj şehir ölçeklemesi.
 */
import { TCMB_M2, TCMB_M2_TR } from './tcmb-kira-m2.js';
import { ILLER } from './turkiye-iller.js';

const KIRA_11_M2 = 50.3;
const KIRA_21_M2 = 76.1;

export const ANCHORS = {
  istanbul: {
    ad: 'İstanbul', emoji: '🌉',
    kira: { '1+1': { ort: 18500 }, '2+1': { ort: 28000 } },
    market: { mutevazi: 4500, orta: 6200, rahat: 9000 },
    ulasim: { toplutas: 2800, arac: 6500 },
    fatura: { ort: 3100 }, disarida: { tabak: 250 }, saglik: 1200,
    eglence: { mutevazi: 1200, orta: 2400, rahat: 4500 }, iletisim: 500
  },
  ankara: {
    ad: 'Ankara', emoji: '🏛️',
    kira: { '1+1': { ort: 13000 }, '2+1': { ort: 19000 } },
    market: { mutevazi: 4000, orta: 5500, rahat: 8000 },
    ulasim: { toplutas: 2200, arac: 5800 },
    fatura: { ort: 2800 }, disarida: { tabak: 200 }, saglik: 1000,
    eglence: { mutevazi: 1000, orta: 2000, rahat: 3800 }, iletisim: 500
  },
  izmir: {
    ad: 'İzmir', emoji: '🌊',
    kira: { '1+1': { ort: 15000 }, '2+1': { ort: 22000 } },
    market: { mutevazi: 4200, orta: 5800, rahat: 8500 },
    ulasim: { toplutas: 2400, arac: 6000 },
    fatura: { ort: 2900 }, disarida: { tabak: 220 }, saglik: 1100,
    eglence: { mutevazi: 1100, orta: 2200, rahat: 4000 }, iletisim: 500
  },
  bursa: {
    ad: 'Bursa', emoji: '⛰️',
    kira: { '1+1': { ort: 12000 }, '2+1': { ort: 17000 } },
    market: { mutevazi: 3800, orta: 5200, rahat: 7500 },
    ulasim: { toplutas: 2000, arac: 5500 },
    fatura: { ort: 2600 }, disarida: { tabak: 180 }, saglik: 950,
    eglence: { mutevazi: 900, orta: 1800, rahat: 3200 }, iletisim: 500
  },
  antalya: {
    ad: 'Antalya', emoji: '☀️',
    kira: { '1+1': { ort: 14000 }, '2+1': { ort: 21000 } },
    market: { mutevazi: 4000, orta: 5600, rahat: 8200 },
    ulasim: { toplutas: 2100, arac: 5600 },
    fatura: { ort: 2700 }, disarida: { tabak: 210 }, saglik: 1000,
    eglence: { mutevazi: 1000, orta: 2100, rahat: 3900 }, iletisim: 500
  },
  adana: {
    ad: 'Adana', emoji: '🌶️',
    kira: { '1+1': { ort: 9500 }, '2+1': { ort: 14000 } },
    market: { mutevazi: 3500, orta: 4800, rahat: 7000 },
    ulasim: { toplutas: 1800, arac: 5000 },
    fatura: { ort: 2400 }, disarida: { tabak: 150 }, saglik: 850,
    eglence: { mutevazi: 800, orta: 1600, rahat: 2800 }, iletisim: 450
  },
  konya: {
    ad: 'Konya', emoji: '🕌',
    kira: { '1+1': { ort: 8500 }, '2+1': { ort: 12500 } },
    market: { mutevazi: 3200, orta: 4500, rahat: 6500 },
    ulasim: { toplutas: 1600, arac: 4800 },
    fatura: { ort: 2300 }, disarida: { tabak: 140 }, saglik: 800,
    eglence: { mutevazi: 700, orta: 1400, rahat: 2500 }, iletisim: 450
  },
  gaziantep: {
    ad: 'Gaziantep', emoji: '🥙',
    kira: { '1+1': { ort: 9000 }, '2+1': { ort: 13500 } },
    market: { mutevazi: 3400, orta: 4700, rahat: 6800 },
    ulasim: { toplutas: 1700, arac: 4900 },
    fatura: { ort: 2350 }, disarida: { tabak: 145 }, saglik: 820,
    eglence: { mutevazi: 750, orta: 1500, rahat: 2700 }, iletisim: 450
  }
};

function round(n) {
  return Math.max(0, Math.round(n));
}

function olcek(anchor, m2, anchorM2) {
  const r = m2 / anchorM2;
  const f = Math.pow(r, 0.78);
  return {
    kira: {
      '1+1': { ort: round(m2 * KIRA_11_M2) },
      '2+1': { ort: round(m2 * KIRA_21_M2) }
    },
    market: {
      mutevazi: round(anchor.market.mutevazi * f),
      orta: round(anchor.market.orta * f),
      rahat: round(anchor.market.rahat * f)
    },
    ulasim: {
      toplutas: round(anchor.ulasim.toplutas * f),
      arac: round(anchor.ulasim.arac * f)
    },
    fatura: { ort: round(anchor.fatura.ort * f) },
    disarida: { tabak: round(anchor.disarida.tabak * f) },
    saglik: round(anchor.saglik * f),
    eglence: {
      mutevazi: round(anchor.eglence.mutevazi * f),
      orta: round(anchor.eglence.orta * f),
      rahat: round(anchor.eglence.rahat * f)
    },
    iletisim: anchor.iletisim
  };
}

/** @returns {Record<string, object>} */
export function buildSehirler() {
  const sehirler = {};
  for (const il of ILLER) {
    const m2 = TCMB_M2[il.id] ?? TCMB_M2_TR;
    const anchorKey = il.anchor;
    const anchor = ANCHORS[anchorKey];
    const anchorM2 = TCMB_M2[anchorKey] ?? TCMB_M2_TR;
    const olcekli = olcek(anchor, m2, anchorM2);
    sehirler[il.id] = {
      ad: il.ad,
      emoji: il.emoji,
      otomatik: true,
      kira_kaynak: 'TCMB birim kira (m²)',
      m2_kira: m2,
      ...olcekli
    };
  }
  return sehirler;
}
