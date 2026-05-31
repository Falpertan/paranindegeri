# Paranın Değeri — Cloudflare Pages (Seçim Arşivi gibi)

**Domain:** [paranindegeri.com](https://paranindegeri.com)

## İlk kurulum

**Adım adım:** `DEPLOY-ILK.md` dosyasına bakın.

1. GitHub’da boş repo **paranindegeri** oluştur
2. `d:\Liradex` içinde **YAYIN.bat** çalıştır (push)
2. Cloudflare Pages → repo bağla → build komutu yok, output = kök dizin
3. Her ayın 5’inde (veya Actions → “Paranın Değeri veri güncelleme” → Run workflow) `data/paranindegeri-data.json` otomatik güncellenir ve push edilir

## Manuel veri güncelleme

```bat
set TCMB_API_KEY=...
node tools/fetch-evds.mjs
git add data/paranindegeri-data.json
git commit -m "chore: TCMB veri güncellemesi"
git push
```

## Cloudflare

| Ayar | Değer |
|------|--------|
| **EVDS_API_KEY** | Pages → Settings → Environment variables (Production) |
| **Functions** | `functions/evds-proxy.js` → `/evds-proxy` (admin panelden EVDS) |

Pages → **Custom domains** → `paranindegeri.com` ve `www.paranindegeri.com` ekle (www → kök yönlendirme önerilir).

## Veri akışı

| | |
|--|--|
| **Otomatik** | GitHub Actions ayda 1 kez EVDS çeker → `data/paranindegeri-data.json` → Cloudflare deploy |
| **Manuel** | Admin → JSON indir → `data/paranindegeri-data.json` → push |
| **Ziyaretçi** | Site açılınca `data/paranindegeri-data.json` yüklenir |

Eski dosya adı `liradex-data.json` hâlâ yedek olarak okunur (geçiş için).

## Yerel EVDS (CORS)

```bat
EVDS-PROXY.bat
```

Proxy: `http://127.0.0.1:8799/evds-proxy`

## Kontrol listesi

- [ ] `paranindegeri.com` DNS Cloudflare’e yönlü
- [ ] `data/paranindegeri-data.json` erişilebilir (404 değil)
- [ ] GitHub Secret: `TCMB_API_KEY`
- [ ] Gmail: **iletisim.secimarsivi@gmail.com** (Seçim Arşivi ile ortak; sitedeki mailto ile aynı olsun)

## İletişim e-postası (Gmail)

Site şu adresi kullanır: **iletisim.secimarsivi@gmail.com** (Seçim Arşivi ile paylaşımlı kutu).
