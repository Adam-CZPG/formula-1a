// ======================= TIL (O'zbek / Русский / English) =======================
const I18N={
uz:{tab_race:'Poyga',tab_garage:'Garaj',tab_shop:'Do‘kon',tab_pilots:'Pilotlar',tab_set:'Sozlamalar',
 track:'Trassa',tod:'Kun vaqti',weather:'Ob-havo',day:'☀ Kunduz',sunset:'🌇 Kechqurun',night:'🌙 Tun',dry:'Quruq',rain:'🌧 Yomg‘ir',mix:'⛅ O‘zgaruvchan',mode:'Rejim',
 m_race:'Liga poygasi',m_race_d:'Kubok va tanga uchun',m_duel:'Duel 1v1',m_duel_d:'Raqibga qarshi 2 aylana',m_tt:'Vaqtga qarshi',m_tt_d:'Arvoh mashina bilan',m_champ:'Chempionat',m_champ_d:'3 bosqich, ochkolar',
 start:'START',trophies:'kubok',next_league:'Keyingi liga: {n} kubok',max_league:'Eng yuqori liga!',lg1:'Bronza liga',lg2:'Kumush liga',lg3:'Oltin liga',lg4:'Platina liga',lg5:'Chempionlar ligasi',team_score:'Jamoa reytingi',
 upgrades:'Kuchaytirish',livery:'Livreya',color:'Asosiy rang',number:'Raqam',car:'Mashina',p_eng:'Dvigatel',p_aero:'Aerodinamika',p_tyre:'Shina',p_brake:'Tormoz',
 st_speed:'Tezlik',st_acc:'Tezlanish',st_handling:'Boshqaruv',st_brake:'Tormoz',buy:'Sotib olish',owned:'Sizda bor',select:'Tanlash',selected:'Tanlangan',upgrade:'Kuchaytirish',cards:'kartochka',maxed:'MAKS',locked:'Yopiq',lvl:'Daraja',
 shop_daily:'Kunlik bonus',shop_daily_d:'Har kuni kiring — bonus oshib boradi',claim:'Olish',claimed:'Olindi ✓',shop_free:'Bepul sandiq',shop_free_d:'Qisqa reklama ko‘ring',watch_ad:'▶ Ko‘rish',wait:'Kuting',crates:'Sandiqlar',open:'Ochish',
 cr1:'Oddiy sandiq',cr2:'Noyob sandiq',cr_odds:'Ehtimollar: kartochka 100% · tanga 100% · yangi pilot {p}%',crate_title:'Sandiq ochildi!',pilot_new:'Yangi pilot',
 p_speed:'Tezlik',p_corner:'Burilish',p_rain:'Yomg‘ir',p_tyres:'Shina',pilot_bonus:'Bonus: tezlik +{a}% · burilish +{b}% · yomg‘ir +{c}% · eskirish −{d}%',
 lang:'Til',diff:'Qiyinlik',easy:'Oson',medium:'O‘rta',hard:'Qiyin',opp:'Raqiblar soni',quality:'Grafika sifati',low:'Past',mid:'O‘rta',high:'Yuqori',btnsize:'Tugmalar o‘lchami',small:'Kichik',normal:'O‘rta',large:'Katta',
 assists:'Boshqaruv va yordamchilar',tilt:'Telefonni egib boshqarish',tilt_d:'Giroskop (rul tugmalari yashiriladi)',tiltInv:'Egishni teskari qilish',autoGas:'Avto-gaz',autoGas_d:'Faqat rul va tormoz kerak',
 pad:'Joystik: rul sezgirligi',pad_help:'Chap stik / D-pad — rul\nRT — gaz, LT — tormoz (X ham tormoz)\nA — DRS, RB — PIT, Y — kamera\nB (ushlab turing) — orqaga qarash\nLB — trassaga qaytish, Start — pauza\nMenyuda: D-pad — tanlash, A — OK, B — orqaga, LB/RB — bo‘limlar',brakeAssist:'Tormoz yordamchisi',brakeAssist_d:'Burilishdan oldin o‘zi sekinlashtiradi',line:'Poyga chizig‘i',line_d:'Yashil — gaz, sariq — burilish, qizil — tormoz',vib:'Vibratsiya',sound:'Ovoz',
 h_pos:'O‘RIN',h_lap:'AYLANA',h_time:'VAQT',h_best:'ENG YAXSHI',h_delta:'FARQ',h_tyre:'SHINA',kmh:'KM/S',wrong:'⟲ NOTO‘G‘RI YO‘NALISH',b_brake:'TORMOZ',b_gas:'GAZ',
 pause:'PAUZA',resume:'DAVOM ETISH',restart:'Qayta boshlash',main_menu:'Bosh menyu',snd_on:'Ovoz: yoqilgan',snd_off:'Ovoz: o‘chirilgan',
 win:'G‘ALABA! 🏆',pos_n:'FINISH · {n}-O‘RIN',pilot:'PILOT',time:'VAQT',on_track:'trassada',best_you:'Eng yaxshi aylanangiz',
 rewards:'Mukofotlar',r_pos:'Natija uchun',r_clean:'Toza poyga',r_fast:'Eng tez aylana',r_over:'Quvib o‘tish ×{n}',total:'Jami',lvl_up:'YANGI DARAJA: {n}! +300 🪙',x2:'×2 tanga (reklama)',x2_done:'×2 olindi ✓',
 again:'QAYTA',next_race:'KEYINGI POYGA ▶',new_champ:'YANGI CHEMPIONAT',champion:'CHEMPION! 🏆',champ_is:'Chempion: {n}',champ_stage:'CHEMPIONAT · {a}/{b}',pts:'JAMI',
 pre_title:'Poyga oldidan',choose_tyre:'Shina tanlang',ty_s:'Yumshoq',ty_m:'O‘rta',ty_h:'Qattiq',ty_w:'Yomg‘ir',ty_s_d:'Eng tez, tez eskiradi',ty_m_d:'Muvozanatli',ty_h_d:'Sekinroq, chidamli',ty_w_d:'Ho‘l trassa uchun',go:'BOSHLASH',back:'Orqaga',laps_n:'{n} aylana',
 r_rain_start:'Yomg‘ir boshlandi! PIT qilib yomg‘ir shinasini oling.',r_wet:'Trassa ho‘l — tormozni ertaroq bosing!',r_ghost:'Arvoh mashina: eng yaxshi aylanangiz bilan poyga',r_record:'Yangi rekord! {t}',r_fast:'Eng tez aylanangiz: {t}',
 r_wing:'Old qanot uchib ketdi! Mashina sekinroq buriladi.',r_pit_req:'PIT so‘raldi — start chizig‘ida boksga kirasiz.',r_pit_in:'Boksdasiz: tezlik cheklovi…',r_pit_done:'Yangi shinalar: {t}. Olg‘a!',r_pit_cancel:'PIT bekor qilindi.',
 r_champ:'Chempionat: {a}-bosqich · {b}',r_tyre_low:'Shinalar eskirdi — PIT haqida o‘ylang.',last_lap:'OXIRGI AYLANA',lap_n:'{n}-AYLANA',go_msg:'OLG‘A!',fin_msg:'FINISH!',radio:'RADIO · MUHANDIS',
 no_coins:'Tanga yetarli emas',bought:'Sotib olindi!',upgraded:'Kuchaytirildi!',ad_test:'REKLAMA · test rejimi',ad_wait:'Mukofot {n} soniyadan keyin',ad_note:'Bu yerda haqiqiy reklama ko‘rsatiladi',daily_got:'+{n} 🪙 kunlik bonus!',need_cards:'Kartochka yetarli emas',level:'Daraja',duel_rival:'Raqib'},
ru:{tab_race:'Гонка',tab_garage:'Гараж',tab_shop:'Магазин',tab_pilots:'Пилоты',tab_set:'Настройки',
 track:'Трасса',tod:'Время суток',weather:'Погода',day:'☀ День',sunset:'🌇 Закат',night:'🌙 Ночь',dry:'Сухо',rain:'🌧 Дождь',mix:'⛅ Переменная',mode:'Режим',
 m_race:'Гонка лиги',m_race_d:'За кубки и монеты',m_duel:'Дуэль 1v1',m_duel_d:'Против соперника, 2 круга',m_tt:'На время',m_tt_d:'С машиной-призраком',m_champ:'Чемпионат',m_champ_d:'3 этапа, очки',
 start:'СТАРТ',trophies:'кубков',next_league:'Следующая лига: {n} кубков',max_league:'Высшая лига!',lg1:'Бронзовая лига',lg2:'Серебряная лига',lg3:'Золотая лига',lg4:'Платиновая лига',lg5:'Лига чемпионов',team_score:'Рейтинг команды',
 upgrades:'Улучшения',livery:'Ливрея',color:'Основной цвет',number:'Номер',car:'Машина',p_eng:'Двигатель',p_aero:'Аэродинамика',p_tyre:'Шины',p_brake:'Тормоза',
 st_speed:'Скорость',st_acc:'Разгон',st_handling:'Управление',st_brake:'Тормоза',buy:'Купить',owned:'Есть',select:'Выбрать',selected:'Выбрано',upgrade:'Улучшить',cards:'карт',maxed:'МАКС',locked:'Закрыто',lvl:'Уровень',
 shop_daily:'Ежедневный бонус',shop_daily_d:'Заходите каждый день — бонус растёт',claim:'Забрать',claimed:'Получено ✓',shop_free:'Бесплатный ящик',shop_free_d:'Посмотрите короткую рекламу',watch_ad:'▶ Смотреть',wait:'Ждите',crates:'Ящики',open:'Открыть',
 cr1:'Обычный ящик',cr2:'Редкий ящик',cr_odds:'Шансы: карты 100% · монеты 100% · новый пилот {p}%',crate_title:'Ящик открыт!',pilot_new:'Новый пилот',
 p_speed:'Скорость',p_corner:'Повороты',p_rain:'Дождь',p_tyres:'Шины',pilot_bonus:'Бонус: скорость +{a}% · повороты +{b}% · дождь +{c}% · износ −{d}%',
 lang:'Язык',diff:'Сложность',easy:'Легко',medium:'Средне',hard:'Сложно',opp:'Соперников',quality:'Графика',low:'Низко',mid:'Средне',high:'Высоко',btnsize:'Размер кнопок',small:'Мал.',normal:'Сред.',large:'Бол.',
 assists:'Управление и помощники',tilt:'Управление наклоном',tilt_d:'Гироскоп (кнопки руля скрыты)',tiltInv:'Инвертировать наклон',autoGas:'Авто-газ',autoGas_d:'Нужны только руль и тормоз',
 pad:'Геймпад: чувствительность руля',pad_help:'Левый стик / D-pad — руль\nRT — газ, LT — тормоз (X тоже тормоз)\nA — DRS, RB — PIT, Y — камера\nB (удерживать) — взгляд назад\nLB — вернуть на трассу, Start — пауза\nВ меню: D-pad — выбор, A — OK, B — назад, LB/RB — вкладки',brakeAssist:'Помощь торможения',brakeAssist_d:'Сам замедляет перед поворотом',line:'Гоночная линия',line_d:'Зелёный — газ, жёлтый — поворот, красный — тормоз',vib:'Вибрация',sound:'Звук',
 h_pos:'МЕСТО',h_lap:'КРУГ',h_time:'ВРЕМЯ',h_best:'ЛУЧШИЙ',h_delta:'РАЗНИЦА',h_tyre:'ШИНЫ',kmh:'КМ/Ч',wrong:'⟲ НЕВЕРНОЕ НАПРАВЛЕНИЕ',b_brake:'ТОРМОЗ',b_gas:'ГАЗ',
 pause:'ПАУЗА',resume:'ПРОДОЛЖИТЬ',restart:'Заново',main_menu:'Главное меню',snd_on:'Звук: вкл',snd_off:'Звук: выкл',
 win:'ПОБЕДА! 🏆',pos_n:'ФИНИШ · {n}-Е МЕСТО',pilot:'ПИЛОТ',time:'ВРЕМЯ',on_track:'на трассе',best_you:'Ваш лучший круг',
 rewards:'Награды',r_pos:'За результат',r_clean:'Чистая гонка',r_fast:'Быстрый круг',r_over:'Обгоны ×{n}',total:'Итого',lvl_up:'НОВЫЙ УРОВЕНЬ: {n}! +300 🪙',x2:'×2 монеты (реклама)',x2_done:'×2 получено ✓',
 again:'ЕЩЁ РАЗ',next_race:'СЛЕДУЮЩАЯ ГОНКА ▶',new_champ:'НОВЫЙ ЧЕМПИОНАТ',champion:'ЧЕМПИОН! 🏆',champ_is:'Чемпион: {n}',champ_stage:'ЧЕМПИОНАТ · {a}/{b}',pts:'ВСЕГО',
 pre_title:'Перед гонкой',choose_tyre:'Выберите шины',ty_s:'Мягкие',ty_m:'Средние',ty_h:'Жёсткие',ty_w:'Дождевые',ty_s_d:'Самые быстрые, быстро стираются',ty_m_d:'Баланс',ty_h_d:'Медленнее, но долговечные',ty_w_d:'Для мокрой трассы',go:'ПОЕХАЛИ',back:'Назад',laps_n:'{n} круга',
 r_rain_start:'Начался дождь! Заезжайте в PIT за дождевыми шинами.',r_wet:'Трасса мокрая — тормозите раньше!',r_ghost:'Призрак: гонка против вашего лучшего круга',r_record:'Новый рекорд! {t}',r_fast:'Ваш лучший круг: {t}',
 r_wing:'Переднее крыло оторвалось! Машина хуже поворачивает.',r_pit_req:'PIT запрошен — заедете на линии старта.',r_pit_in:'Вы в боксах: ограничитель…',r_pit_done:'Новые шины: {t}. Вперёд!',r_pit_cancel:'PIT отменён.',
 r_champ:'Чемпионат: этап {a} · {b}',r_tyre_low:'Шины изношены — подумайте о PIT.',last_lap:'ПОСЛЕДНИЙ КРУГ',lap_n:'КРУГ {n}',go_msg:'ВПЕРЁД!',fin_msg:'ФИНИШ!',radio:'РАДИО · ИНЖЕНЕР',
 no_coins:'Недостаточно монет',bought:'Куплено!',upgraded:'Улучшено!',ad_test:'РЕКЛАМА · тестовый режим',ad_wait:'Награда через {n} с',ad_note:'Здесь будет настоящая реклама',daily_got:'+{n} 🪙 ежедневный бонус!',need_cards:'Недостаточно карт',level:'Уровень',duel_rival:'Соперник'},
en:{tab_race:'Race',tab_garage:'Garage',tab_shop:'Shop',tab_pilots:'Drivers',tab_set:'Settings',
 track:'Track',tod:'Time of day',weather:'Weather',day:'☀ Day',sunset:'🌇 Sunset',night:'🌙 Night',dry:'Dry',rain:'🌧 Rain',mix:'⛅ Changing',mode:'Mode',
 m_race:'League race',m_race_d:'For trophies and coins',m_duel:'Duel 1v1',m_duel_d:'Versus a rival, 2 laps',m_tt:'Time trial',m_tt_d:'Race your ghost',m_champ:'Championship',m_champ_d:'3 rounds, points',
 start:'START',trophies:'trophies',next_league:'Next league: {n} trophies',max_league:'Top league!',lg1:'Bronze League',lg2:'Silver League',lg3:'Gold League',lg4:'Platinum League',lg5:'Champions League',team_score:'Team rating',
 upgrades:'Upgrades',livery:'Livery',color:'Main colour',number:'Number',car:'Car',p_eng:'Engine',p_aero:'Aerodynamics',p_tyre:'Tyres',p_brake:'Brakes',
 st_speed:'Top speed',st_acc:'Acceleration',st_handling:'Handling',st_brake:'Braking',buy:'Buy',owned:'Owned',select:'Select',selected:'Selected',upgrade:'Upgrade',cards:'cards',maxed:'MAX',locked:'Locked',lvl:'Level',
 shop_daily:'Daily bonus',shop_daily_d:'Come back daily — the bonus grows',claim:'Claim',claimed:'Claimed ✓',shop_free:'Free crate',shop_free_d:'Watch a short ad',watch_ad:'▶ Watch',wait:'Wait',crates:'Crates',open:'Open',
 cr1:'Common crate',cr2:'Rare crate',cr_odds:'Odds: cards 100% · coins 100% · new driver {p}%',crate_title:'Crate opened!',pilot_new:'New driver',
 p_speed:'Speed',p_corner:'Cornering',p_rain:'Wet',p_tyres:'Tyres',pilot_bonus:'Bonus: speed +{a}% · cornering +{b}% · wet +{c}% · wear −{d}%',
 lang:'Language',diff:'Difficulty',easy:'Easy',medium:'Medium',hard:'Hard',opp:'Opponents',quality:'Graphics',low:'Low',mid:'Medium',high:'High',btnsize:'Button size',small:'Small',normal:'Normal',large:'Large',
 assists:'Controls & assists',tilt:'Tilt steering',tilt_d:'Gyroscope (steer buttons hidden)',tiltInv:'Invert tilt',autoGas:'Auto throttle',autoGas_d:'Only steering and brake needed',
 pad:'Gamepad: steering sensitivity',pad_help:'Left stick / D-pad — steer\nRT — throttle, LT — brake (X also brakes)\nA — DRS, RB — PIT, Y — camera\nB (hold) — look back\nLB — reset to track, Start — pause\nIn menus: D-pad — move, A — OK, B — back, LB/RB — tabs',brakeAssist:'Brake assist',brakeAssist_d:'Slows down before corners',line:'Racing line',line_d:'Green — throttle, yellow — corner, red — brake',vib:'Vibration',sound:'Sound',
 h_pos:'POS',h_lap:'LAP',h_time:'TIME',h_best:'BEST',h_delta:'DELTA',h_tyre:'TYRE',kmh:'KM/H',wrong:'⟲ WRONG WAY',b_brake:'BRAKE',b_gas:'GAS',
 pause:'PAUSED',resume:'RESUME',restart:'Restart',main_menu:'Main menu',snd_on:'Sound: on',snd_off:'Sound: off',
 win:'VICTORY! 🏆',pos_n:'FINISH · P{n}',pilot:'DRIVER',time:'TIME',on_track:'on track',best_you:'Your best lap',
 rewards:'Rewards',r_pos:'Result',r_clean:'Clean race',r_fast:'Fastest lap',r_over:'Overtakes ×{n}',total:'Total',lvl_up:'LEVEL UP: {n}! +300 🪙',x2:'×2 coins (ad)',x2_done:'×2 claimed ✓',
 again:'AGAIN',next_race:'NEXT RACE ▶',new_champ:'NEW CHAMPIONSHIP',champion:'CHAMPION! 🏆',champ_is:'Champion: {n}',champ_stage:'CHAMPIONSHIP · {a}/{b}',pts:'TOTAL',
 pre_title:'Before the race',choose_tyre:'Choose tyres',ty_s:'Soft',ty_m:'Medium',ty_h:'Hard',ty_w:'Wet',ty_s_d:'Fastest, wears quickly',ty_m_d:'Balanced',ty_h_d:'Slower, durable',ty_w_d:'For a wet track',go:'GO',back:'Back',laps_n:'{n} laps',
 r_rain_start:'Rain is starting! Box for wet tyres.',r_wet:'Track is wet — brake earlier!',r_ghost:'Ghost car: race your best lap',r_record:'New record! {t}',r_fast:'Your fastest lap: {t}',
 r_wing:'Front wing gone! The car turns worse.',r_pit_req:'PIT requested — you will box at the start line.',r_pit_in:'In the pits: speed limiter…',r_pit_done:'New tyres: {t}. Go!',r_pit_cancel:'PIT cancelled.',
 r_champ:'Championship: round {a} · {b}',r_tyre_low:'Tyres are worn — think about a PIT stop.',last_lap:'FINAL LAP',lap_n:'LAP {n}',go_msg:'GO!',fin_msg:'FINISH!',radio:'RADIO · ENGINEER',
 no_coins:'Not enough coins',bought:'Purchased!',upgraded:'Upgraded!',ad_test:'AD · test mode',ad_wait:'Reward in {n} s',ad_note:'A real ad will be shown here',daily_got:'+{n} 🪙 daily bonus!',need_cards:'Not enough cards',level:'Level',duel_rival:'Rival'}
};
Object.assign(I18N.uz,{tsub0:'Klassik trassa · 2.9 km',tsub1:'Tor ko‘chalar, devorlar yaqin',tsub2:'Yuqori tezlik, keng burilishlar',rec:'Rekord',you:'Siz',rw_fast:'Eng tez aylana'});
Object.assign(I18N.ru,{tsub0:'Классическая трасса · 2.9 км',tsub1:'Узкие улицы, стены рядом',tsub2:'Высокая скорость, быстрые повороты',rec:'Рекорд',you:'Вы',rw_fast:'Быстрейший круг'});
Object.assign(I18N.en,{tsub0:'Classic circuit · 2.9 km',tsub1:'Narrow streets, close walls',tsub2:'High speed, sweeping corners',rec:'Record',you:'You',rw_fast:'Fastest lap'});
function t(k,v){let s=(I18N[S.lang]&&I18N[S.lang][k])||I18N.uz[k]||k;if(v)for(const x in v)s=s.split('{'+x+'}').join(v[x]);return s;}
function applyLang(){$$('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n);});document.documentElement.lang=S.lang;}

// ======================= PROGRESS VA IQTISOD =======================
const CARS=[
  {id:'c1',name:'Rookie R1',price:0,pow:0.92,aero:0.93,grip:0.96,brk:0.95},
  {id:'c2',name:'Strada S2',price:3000,pow:1.0,aero:0.98,grip:0.99,brk:1.0},
  {id:'c3',name:'Veloce V3',price:9000,pow:1.06,aero:1.03,grip:1.01,brk:1.03},
  {id:'c4',name:'Apex X4',price:22000,pow:1.12,aero:1.08,grip:1.04,brk:1.06}];
const PARTS=[{id:'eng',ic:'⚙️',k:'p_eng'},{id:'aero',ic:'🪽',k:'p_aero'},{id:'tyre',ic:'🛞',k:'p_tyre'},{id:'brake',ic:'🛑',k:'p_brake'}];
const UP_COST=[300,800,1800,4000,8000],UP_CARDS=[2,5,9,14,22],CARD_COIN=60;
function upPrice(id){const lv=PR.parts[id];if(lv>=5)return 0;const miss=Math.max(0,UP_CARDS[lv]-PR.cards[id]);return UP_COST[lv]+miss*CARD_COIN;}
const PILOTS=[
  {id:'p1',name:'Timur Rashidov',price:0,sp:2,cor:2,rain:1,tyr:1,col:'#2e8bff'},
  {id:'p2',name:'Lena Vogel',price:2500,sp:2,cor:3,rain:2,tyr:2,col:'#00c2a8'},
  {id:'p3',name:'Marco Bellini',price:5000,sp:4,cor:2,rain:2,tyr:1,col:'#ff3b3b'},
  {id:'p4',name:'Aziz Karimov',price:8000,sp:3,cor:3,rain:4,tyr:3,col:'#ffb020'},
  {id:'p5',name:'Kenji Mori',price:12000,sp:4,cor:4,rain:3,tyr:3,col:'#b06bff'},
  {id:'p6',name:'Sofia Reyes',price:18000,sp:5,cor:4,rain:4,tyr:4,col:'#ff4fa0'}];
const LEAGUES=[{k:'lg1',min:0,ai:0.86,rw:1,col:'#cd7f32',ic:'🥉'},{k:'lg2',min:150,ai:0.9,rw:1.3,col:'#c3c9cf',ic:'🥈'},{k:'lg3',min:400,ai:0.935,rw:1.6,col:'#ffd23f',ic:'🥇'},
  {k:'lg4',min:800,ai:0.962,rw:2,col:'#7fe3ff',ic:'💎'},{k:'lg5',min:1400,ai:0.985,rw:2.6,col:'#ff5ad1',ic:'👑'}];
const TYRES={S:{k:'ty_s',d:'ty_s_d',col:'#ff3b3b',grip:1.05,wear:0.045},M:{k:'ty_m',d:'ty_m_d',col:'#ffd23f',grip:1,wear:0.028},H:{k:'ty_h',d:'ty_h_d',col:'#f2f2f2',grip:0.955,wear:0.016},W:{k:'ty_w',d:'ty_w_d',col:'#2e8bff',grip:0.93,wear:0.03}};
const LIV_PRICE=[0,0,1500,2500,2000,2000,3000,4000];
const CRATES=[{k:'cr1',price:400,cards:[3,5],coins:[80,250],pilot:0,img:'ic_crate1'},{k:'cr2',price:1500,cards:[8,12],coins:[250,700],pilot:0.15,img:'ic_crate2'}];
const PDEF={coins:600,xp:0,level:1,trophies:0,car:'c1',cars:{c1:1},parts:{eng:0,aero:0,tyre:0,brake:0},cards:{eng:0,aero:0,tyre:0,brake:0},livs:{0:1,1:1},
  pilot:'p1',pilots:{p1:1},daily:'',streak:0,freeCrate:0,races:0,wins:0};
const PR=Object.assign({},PDEF,store.get('f1a_prof',{}));
for(const k of['cars','parts','cards','livs','pilots'])PR[k]=Object.assign({},PDEF[k],PR[k]||{});
const saveP=()=>store.set('f1a_prof',PR);
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function leagueIdx(){let i=0;LEAGUES.forEach((l,k)=>{if(PR.trophies>=l.min)i=k;});return i;}
function carDef(id=PR.car){return CARS.find(c=>c.id===id)||CARS[0];}
function pilotDef(id=PR.pilot){return PILOTS.find(p=>p.id===id)||PILOTS[0];}
function playerStats(){const c=carDef(),p=PR.parts,pl=pilotDef();
  return {pow:c.pow*(1+0.03*p.eng)*(1+0.005*pl.sp),aero:c.aero*(1+0.03*p.aero),grip:c.grip*(1+0.015*p.tyre)*(1+0.004*pl.cor),brk:c.brk*(1+0.03*p.brake),rain:1+0.02*pl.rain,wear:1-0.06*pl.tyr};}
function teamScore(){const s=playerStats();return Math.round((s.pow*0.35+s.aero*0.25+s.grip*0.25+s.brk*0.15)*1000);}
function fmtN(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}

// ---------- emoji o'rniga rasm ikonkalar ----------
const ICON_MAP={'🪙':'ic_coin','🏆':'ic_trophy','⭐':'ic_xp','🃏':'sh_card'},ICON_RE=/🪙|🏆|⭐|🃏/;
function iconify(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];let n;
  while(n=w.nextNode())if(ICON_RE.test(n.nodeValue))list.push(n);
  for(const node of list){const parts=node.nodeValue.split(/(🪙|🏆|⭐|🃏)/),f=document.createDocumentFragment();
    for(const p of parts){if(ICON_MAP[p]){const im=document.createElement('img');im.className='ico';im.alt='';im.src=ASSET[ICON_MAP[p]];f.appendChild(im);}else if(p)f.appendChild(document.createTextNode(p));}
    node.parentNode.replaceChild(f,node);}
}
const iconObs=new MutationObserver(ms=>{for(const mu of ms){if(mu.type==='characterData'){if(mu.target.parentNode&&ICON_RE.test(mu.target.nodeValue))iconify(mu.target.parentNode);}
  else for(const a of mu.addedNodes){if(a.nodeType===1)iconify(a);else if(a.nodeType===3&&a.parentNode&&ICON_RE.test(a.nodeValue))iconify(a.parentNode);}}});
['#menu','#finish','#crate','#prerace','#toast'].forEach(s=>{const e=$(s);iconify(e);iconObs.observe(e,{childList:true,subtree:true,characterData:true});});
$$('[data-a]').forEach(e=>e.src=ASSET[e.dataset.a]);

// ---------- bildirishnoma ----------
function toast(msg){const el=$('#toast');el.textContent=msg;iconify(el);el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800);}
function addCoins(n){PR.coins+=n;saveP();updateTopbar();}
function spend(n){if(PR.coins<n){toast(t('no_coins'));vibrate(40);return false;}PR.coins-=n;saveP();updateTopbar();return true;}
function addXP(n){PR.xp+=n;let up=false;while(PR.xp>=PR.level*250){PR.xp-=PR.level*250;PR.level++;PR.coins+=300;up=true;}saveP();updateTopbar();return up;}
function updateTopbar(){$('#coinN').textContent=fmtN(PR.coins);$('#lvlN').textContent=PR.level;$('#xpF').style.width=Math.min(100,PR.xp/(PR.level*250)*100)+'%';}

// ---------- reklama (test o'rinbosar; keyin AdMob / CrazyGames / AdSense SDK ulanadi) ----------
const Ads={
  rewarded(){return new Promise(res=>{const ov=$('#adov');ov.classList.remove('hidden');let n=5;const tick=()=>{$('#adTxt').textContent=t('ad_wait',{n});
      if(n<=0){clearInterval(iv);ov.classList.add('hidden');res(true);}n--;};const iv=setInterval(tick,1000);tick();});},
  interstitial(){return new Promise(res=>{const ov=$('#adov');ov.classList.remove('hidden');let n=3;const tick=()=>{$('#adTxt').textContent=t('ad_wait',{n});
      if(n<=0){clearInterval(iv);ov.classList.add('hidden');res();}n--;};const iv=setInterval(tick,1000);tick();});}
};

// ---------- menyu bo'limlari ----------
function renderLeague(){
  const i=leagueIdx(),L=LEAGUES[i],N2=LEAGUES[i+1];
  const prog=N2?(PR.trophies-L.min)/(N2.min-L.min):1;
  $('#leagueCard').innerHTML=`<img class="lgic" src="${ASSET['b_'+L.k]}" alt=""><div class="lgtx"><b>${t(L.k)}</b>
    <small>🏆 ${fmtN(PR.trophies)} ${t('trophies')} · ${t('team_score')}: ${teamScore()}</small>
    <div class="lgbar"><i style="width:${(prog*100).toFixed(0)}%;background:${L.col}"></i></div><small>${N2?t('next_league',{n:N2.min}):t('max_league')}</small></div>`;
}
function renderModes(){
  const M=[['race','🏁','m_race','m_race_d'],['duel','⚔️','m_duel','m_duel_d'],['tt','⏱','m_tt','m_tt_d'],['champ','🏆','m_champ','m_champ_d']];
  $('#modes').innerHTML=M.map(([id,ic,a,b])=>`<button class="mcard ui ${S.mode===id?'on':''}" data-mode="${id}"><img class="mdimg" src="${ASSET['md_'+id]}" alt=""><b>${t(a)}</b><small>${t(b)}</small></button>`).join('');
  $$('#modes .mcard').forEach(b=>b.addEventListener('click',()=>{if(S.mode===b.dataset.mode)return;S.mode=b.dataset.mode;saveS();onSet('mode');refreshUI();}));
}
let garageCar=null;
function statBars(st){
  const rows=[['st_speed',st.pow,0.85,1.45],['st_acc',st.pow*0.6+st.grip*0.4,0.85,1.35],['st_handling',st.aero*0.5+st.grip*0.5,0.85,1.3],['st_brake',st.brk,0.85,1.35]];
  return rows.map(([k,v,a,b])=>`<div class="sbar"><span>${t(k)}</span><div><i style="width:${clamp((v-a)/(b-a),0.05,1)*100}%"></i></div></div>`).join('');
}
function renderGarage(){
  if(!garageCar)garageCar=PR.car;
  const c=carDef(garageCar),own=!!PR.cars[c.id],p=PR.parts;
  $('#carName').textContent=c.name;$('#carTier').textContent=`${CARS.indexOf(c)+1}/${CARS.length}`;
  const st={pow:c.pow*(1+0.03*p.eng),aero:c.aero*(1+0.03*p.aero),grip:c.grip*(1+0.015*p.tyre),brk:c.brk*(1+0.03*p.brake)};
  $('#carStats').innerHTML=statBars(st);
  const b=$('#carBuy');
  if(!own){b.innerHTML=`${t('buy')} · 🪙 ${fmtN(c.price)}`;b.className='buy ui';}
  else if(PR.car===c.id){b.textContent=t('selected');b.className='buy ui done';}
  else{b.textContent=t('select');b.className='buy ui sel';}
  $('#parts').innerHTML=PARTS.map(pt=>{const lv=p[pt.id],mx=lv>=5,cost=UP_COST[lv],need=UP_CARDS[lv],have=PR.cards[pt.id];
    return `<div class="part"><img class="picimg" src="${ASSET['pt_'+pt.id]}" alt=""><div class="ptx"><b>${t(pt.k)}</b><div class="pips">${[0,1,2,3,4].map(i=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div>
      <small>${mx?t('maxed'):`🃏 ${have}/${need} ${t('cards')}${have<need?' · +'+(need-have)*CARD_COIN+' 🪙':''}`}</small></div>
      <button class="pbtn ui ${mx?'done':''}" data-part="${pt.id}" ${mx?'disabled':''}>${mx?t('maxed'):`⬆ 🪙 ${fmtN(upPrice(pt.id))}`}</button></div>`;}).join('');
  $$('#parts .pbtn').forEach(bt=>bt.addEventListener('click',()=>{const id=bt.dataset.part,lv=PR.parts[id];if(lv>=5)return;
    if(!spend(upPrice(id)))return;PR.cards[id]=Math.max(0,PR.cards[id]-UP_CARDS[lv]);PR.parts[id]++;saveP();toast(t('upgraded'));vibrate(30);renderGarage();renderLeague();}));
  $$('.liv').forEach(d=>{const i=+d.dataset.i,own=!!PR.livs[i];d.classList.toggle('lock',!own);d.querySelector('.lp').textContent=own?'':`🪙 ${fmtN(LIV_PRICE[i])}`;});
}
function renderShop(){
  const today=new Date().toDateString(),got=PR.daily===today,amt=150+Math.min(6,PR.streak)*50;
  const freeLeft=Math.max(0,PR.freeCrate-Date.now());
  $('#shopBox').innerHTML=`
   <div class="scard"><img class="sicimg" src="${ASSET.sh_daily}" alt=""><div class="stx"><b>${t('shop_daily')}</b><small>${t('shop_daily_d')} · +${got?amt:150+Math.min(6,PR.streak+1)*50} 🪙</small></div>
     <button class="sbtn ui ${got?'done':''}" id="bDaily">${got?t('claimed'):t('claim')}</button></div>
   <div class="scard"><img class="sicimg" src="${ASSET.sh_ad}" alt=""><div class="stx"><b>${t('shop_free')}</b><small>${t('shop_free_d')}</small></div>
     <button class="sbtn ui ${freeLeft?'done':''}" id="bFree">${freeLeft?`${t('wait')} ${Math.ceil(freeLeft/60000)}m`:t('watch_ad')}</button></div>
   <div class="lbl">${t('crates')}</div>
   ${CRATES.map((c,i)=>`<div class="scard crate"><img class="sicimg" src="${ASSET[c.img]}" alt=""><div class="stx"><b>${t(c.k)}</b><small>🃏 ${c.cards[0]}–${c.cards[1]} · 🪙 ${c.coins[0]}–${c.coins[1]}</small>
     <small class="odds">${t('cr_odds',{p:Math.round(c.pilot*100)})}</small></div><button class="sbtn ui gold" data-crate="${i}">🪙 ${fmtN(c.price)}</button></div>`).join('')}`;
  $('#bDaily').addEventListener('click',()=>{if(PR.daily===today)return;
    const y=new Date(Date.now()-864e5).toDateString();PR.streak=PR.daily===y?PR.streak+1:1;PR.daily=today;const n=150+Math.min(6,PR.streak)*50;addCoins(n);toast(t('daily_got',{n}));renderShop();});
  $('#bFree').addEventListener('click',()=>{if(PR.freeCrate>Date.now())return;Ads.rewarded().then(()=>{PR.freeCrate=Date.now()+4*3600e3;saveP();openCrate(CRATES[0],true);renderShop();});});
  $$('[data-crate]').forEach(b=>b.addEventListener('click',()=>{const c=CRATES[+b.dataset.crate];if(!spend(c.price))return;openCrate(c);}));
}
function openCrate(c){
  const n=rint(c.cards[0],c.cards[1]),coins=rint(c.coins[0],c.coins[1]),got={};
  for(let i=0;i<n;i++){const id=PARTS[rint(0,PARTS.length-1)].id;got[id]=(got[id]||0)+1;PR.cards[id]++;}
  PR.coins+=coins;let pil=null;
  if(Math.random()<c.pilot){const locked=PILOTS.filter(p=>!PR.pilots[p.id]);if(locked.length){pil=locked[rint(0,locked.length-1)];PR.pilots[pil.id]=1;}}
  saveP();updateTopbar();
  const items=[`<div class="ritem"><img class="rbig" src="${ASSET.ic_coin}"><b>+${coins}</b></div>`].concat(Object.keys(got).map(id=>{const pt=PARTS.find(p=>p.id===id);return `<div class="ritem"><img class="rbig" src="${ASSET['pt_'+pt.id]}"><b>+${got[id]}</b><small>${t(pt.k)}</small></div>`;}));
  if(pil)items.push(`<div class="ritem gold"><img class="face" src="${ASSET['pl_'+pil.id]}"><b>${pil.name}</b><small>${t('pilot_new')}</small></div>`);
  $('#crateItems').innerHTML=items.join('');$('#crateIc').innerHTML=`<img src="${ASSET[c.img]}" alt="">`;
  const ov=$('#crate');ov.classList.remove('hidden');ov.classList.remove('opened');void ov.offsetWidth;ov.classList.add('opened');
  $$('#crateItems .ritem').forEach((e,i)=>e.style.animationDelay=(0.5+i*0.18)+'s');
  vibrate([30,40,60]);if(actx){beep(660,0.1,0.15);setTimeout(()=>beep(990,0.15,0.15),150);}
}
function renderPilots(){
  const star=n=>'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i>';
  $('#pilotList').innerHTML=PILOTS.map(p=>{const own=!!PR.pilots[p.id],sel=PR.pilot===p.id;
    return `<div class="pcard ${sel?'on':''}"><img class="pav" src="${ASSET['pl_'+p.id]}" alt="">
      <div class="ptx2"><b>${p.name}</b><div class="pst"><span>${t('p_speed')}</span>${star(p.sp)}</div><div class="pst"><span>${t('p_corner')}</span>${star(p.cor)}</div>
      <div class="pst"><span>${t('p_rain')}</span>${star(p.rain)}</div><div class="pst"><span>${t('p_tyres')}</span>${star(p.tyr)}</div>
      <small>${t('pilot_bonus',{a:(p.sp*0.5).toFixed(1),b:(p.cor*0.4).toFixed(1),c:p.rain*2,d:p.tyr*6})}</small></div>
      <button class="pbtn ui ${sel?'done':own?'sel':''}" data-pilot="${p.id}">${sel?t('selected'):own?t('select'):`🪙 ${fmtN(p.price)}`}</button></div>`;}).join('');
  $$('[data-pilot]').forEach(b=>b.addEventListener('click',()=>{const p=pilotDef(b.dataset.pilot);
    if(!PR.pilots[p.id]){if(!spend(p.price))return;PR.pilots[p.id]=1;toast(t('bought'));}
    PR.pilot=p.id;saveP();renderPilots();renderLeague();}));
}
function renderMeta(){updateTopbar();renderLeague();renderModes();renderGarage();renderShop();renderPilots();}

// ---------- poyga oldidan: shina tanlash ----------
let chosenTyre='M';
function showPrerace(){
  const wet=S.weather==='rain';chosenTyre=wet?'W':(chosenTyre==='W'?'M':chosenTyre);
  const laps=raceLaps();
  $('#preInfo').textContent=`${TRACKS[curTrackIdx()].name} · ${t('m_'+S.mode)}${laps<1e6?' · '+t('laps_n',{n:laps}):''} · ${t('team_score')}: ${teamScore()}`;
  $('#tyres').innerHTML=Object.keys(TYRES).map(k=>{const ty=TYRES[k];return `<button class="tybtn ui ${k===chosenTyre?'on':''}" data-ty="${k}"><img class="tyimg" src="${ASSET['ty_'+k]}" alt="${k}"><b>${t(ty.k)}</b><small>${t(ty.d)}</small></button>`;}).join('');
  $$('.tybtn').forEach(b=>b.addEventListener('click',()=>{chosenTyre=b.dataset.ty;$$('.tybtn').forEach(x=>x.classList.toggle('on',x===b));}));
  $('#prerace').classList.remove('hidden');
}

// ---------- poyga yakuni: mukofotlar ----------
let lastReward=null;
function computeRewards(pos,n){
  const L=LEAGUES[leagueIdx()],r={items:[],coins:0,troph:0,xp:0,lvlUp:false};
  if(S.mode==='tt')return r;
  const f=[1,0.75,0.6,0.45,0.35,0.3,0.25,0.2][pos-1]||0.15,base=Math.round((S.mode==='duel'?120:180)*L.rw*f);
  r.items.push([t('r_pos'),base]);
  if(player.cleanRace)r.items.push([t('r_clean'),Math.round(50*L.rw)]);
  const fl=Math.min(...cars.map(c=>isFinite(c.best)?c.best:1e9));if(isFinite(player.best)&&player.best<=fl)r.items.push([t('rw_fast'),Math.round(50*L.rw)]);
  if(player.overtakes>0)r.items.push([t('r_over',{n:player.overtakes}),Math.round(player.overtakes*12*L.rw)]);
  r.coins=r.items.reduce((a,x)=>a+x[1],0);
  if(S.mode==='race'||S.mode==='champ')r.troph=n<=1?0:[30,20,12,5][pos-1]!=null?[30,20,12,5][pos-1]:-6;
  if(S.mode==='duel')r.troph=pos===1?25:-12;
  if(PR.trophies+r.troph<0)r.troph=-PR.trophies;
  r.xp=40+Math.max(0,(n-pos))*15;
  PR.trophies+=r.troph;PR.races++;if(pos===1)PR.wins++;PR.coins+=r.coins;saveP();
  r.lvlUp=addXP(r.xp);
  return r;
}
function rewardsHTML(r){
  if(!r||S.mode==='tt')return '';
  return `<div class="rewards"><div class="h2">${t('rewards')}</div>${r.items.map(([a,b])=>`<div class="rrow"><span>${a}</span><b>+${b} 🪙</b></div>`).join('')}
    <div class="rrow tot"><span>${t('total')}</span><b>+${r.coins} 🪙</b></div>
    <div class="rrow"><span>🏆 ${t('trophies')}</span><b class="${r.troph<0?'neg':''}">${r.troph>=0?'+':''}${r.troph}</b></div>
    <div class="rrow"><span>⭐ XP</span><b>+${r.xp}</b></div>${r.lvlUp?`<div class="lvlup">${t('lvl_up',{n:PR.level})}</div>`:''}
    <button class="sbtn ui gold wide" id="bX2">${t('x2')}</button></div>`;
}
