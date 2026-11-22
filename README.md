# Formula 1a 🏎️

Brauzerda (telefon va kompyuter) ishlaydigan 3D Formula‑1 poyga o‘yini. Three.js asosida, bitta `index.html` fayl.

## O‘ynash
`index.html` ni brauzerda oching (Three.js CDN dan yuklanadi, internet kerak).

## Imkoniyatlar
- 3 trassa: Grand Prix, Shahar, Tezkor
- Rejimlar: Poyga, Vaqtga qarshi (arvoh mashina), Chempionat
- Realistik fizika: shina modeli, prijim kuchi, DRS, slipstream, traction control
- Kun vaqti (kunduz / kechqurun / tun) va yomg‘ir
- Garaj: 8 livreya, ranglar, raqam
- 360° kamera (ekranni tortib aylantirish), 3 kamera rejimi
- Telefon boshqaruvi: tugmalar yoki giroskop, avto‑gaz, tormoz yordamchisi
- Uchqunlar, tutun, shina izlari, shikastlanish

## Progress va iqtisod (v2)
- Tangalar, XP va daraja, 5 liga (Bronza → Chempionlar) kubok bilan
- 4 mashina (Rookie R1 → Apex X4), 4 detal × 5 daraja (kartochka + tanga)
- 6 pilot bonuslari bilan, sandiqlar (ehtimollar ko‘rsatilgan), kunlik bonus
- Shinalar: Yumshoq / O‘rta / Qattiq / Yomg‘ir, eskirish, PIT (Q tugmasi)
- O‘zgaruvchan ob-havo: poyga o‘rtasida yomg‘ir boshlanishi mumkin
- Rejimlar: Liga poygasi, Duel 1v1, Vaqtga qarshi, Chempionat
- Tillar: O‘zbek, Русский, English
- Reklama: `src/meta.js` dagi `Ads` moduli hozir test rejimida (AdMob / CrazyGames / AdSense SDK keyin ulanadi)

## Boshqaruv (kompyuter)
| Tugma | Vazifa |
|---|---|
| ← → / A D | Rul |
| ↑ / W | Gaz |
| ↓ / S / Probel | Tormoz / orqaga |
| E | DRS |
| Q | PIT so‘rash |
| C | Kamera |
| R | Trassaga qaytish |
| P / Esc | Pauza |

## Tuzilma
```
index.html        — tayyor o‘yin (build natijasi)
src/head.html     — HTML + CSS + interfeys
src/sim.js        — trassalar va fizika (brauzersiz test qilinadi)
src/game.js       — grafika, mashina, menyu, ovoz, rejimlar
src/meta.js       — tillar, progress, do‘kon, pilotlar, reklama moduli
src/init.js       — ishga tushirish va asosiy sikl
build.sh          — src/ dan index.html yig‘adi
tests/            — fizika va ИИ simulyatsiya testi
```

## Ishlab chiqish
```sh
npm install        # three (faqat test uchun)
npm run build      # index.html ni qayta yig‘ish
npm test           # ИИ 3 trassada quruq/ho‘l poyga simulyatsiyasi
```
