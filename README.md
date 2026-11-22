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

## Boshqaruv (kompyuter)
| Tugma | Vazifa |
|---|---|
| ← → / A D | Rul |
| ↑ / W | Gaz |
| ↓ / S / Probel | Tormoz / orqaga |
| E | DRS |
| C | Kamera |
| R | Trassaga qaytish |
| P / Esc | Pauza |

## Tuzilma
```
index.html        — tayyor o‘yin (build natijasi)
src/head.html     — HTML + CSS + interfeys
src/sim.js        — trassalar va fizika (brauzersiz test qilinadi)
src/game.js       — grafika, mashina, menyu, ovoz, rejimlar
build.sh          — src/ dan index.html yig‘adi
tests/            — fizika va ИИ simulyatsiya testi
```

## Ishlab chiqish
```sh
npm install        # three (faqat test uchun)
npm run build      # index.html ni qayta yig‘ish
npm test           # ИИ 3 trassada quruq/ho‘l poyga simulyatsiyasi
```
