
// ======================= JOYSTIK (GAMEPAD) VA ANDROID TV =======================
// Manbalar: brauzer Gamepad API + APK ichida MainActivity yuboradigan native holat (F1aPad.native).
// Standart (Xbox) tartib: 0 A,1 B,2 X,3 Y,4 LB,5 RB,6 LT,7 RT,8 Back,9 Start,10 LS,11 RS,12-15 D-pad, 16 Home
const PAD={nb:{},nax:{lx:0,ly:0,lt:0,rt:0,hx:0,hy:0},b:new Array(17).fill(0),pb:new Array(17).fill(0),
  lx:0,ly:0,lt:0,rt:0,steer:0,active:false,lastUse:-1e9,focus:null,repT:0,repDir:null,lookBack:false,brakeBtn:false,gas:false};
const NB_IDX={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,LS:10,RS:11,UP:12,DOWN:13,LEFT:14,RIGHT:15,HOME:16};
window.F1aPad={
  native(d){if(!d)return;
    if(d.t==='axes'){for(const k in d)if(k!=='t')PAD.nax[k]=+d[k]||0;}
    else if(d.t==='key'&&NB_IDX[d.b]!=null){PAD.nb[NB_IDX[d.b]]=d.down?1:0;}
    else if(d.t==='reset'){PAD.nb={};for(const k in PAD.nax)PAD.nax[k]=0;}
  },
  back(){try{return padBack();}catch(e){return false;}}
};
const big=(a,b)=>Math.abs(b)>Math.abs(a)?b:a;
function readPad(){
  const b=PAD.b;PAD.pb.splice(0,17,...b);b.fill(0);let lx=0,ly=0;
  const gps=navigator.getGamepads?navigator.getGamepads():[];
  for(const g of gps){if(!g||!g.connected)continue;
    const n=g.mapping==='standard'?17:12;
    for(let i=0;i<Math.min(n,g.buttons.length);i++){const x=g.buttons[i];b[i]=Math.max(b[i],typeof x==='object'?(x.value||(x.pressed?1:0)):+x);}
    lx=big(lx,g.axes[0]||0);ly=big(ly,g.axes[1]||0);
    if(g.mapping!=='standard'&&g.axes.length>=10){const h=g.axes[9];if(h>-1.1&&h<1.1&&Math.abs(h)<=1){/* ba'zi pultlarda hat 9-o'qda */
      const k=Math.round((h+1)/2*7);if(h<-0.9)b[12]=1;else if(k===1)b[15]=1;else if(k===3)b[13]=1;else if(k===5)b[14]=1;}}}
  for(const i in PAD.nb)b[i]=Math.max(b[i],PAD.nb[i]);
  const N=PAD.nax;lx=big(lx,N.lx);ly=big(ly,N.ly);
  if(N.hx<-0.5)b[14]=1;if(N.hx>0.5)b[15]=1;if(N.hy<-0.5)b[12]=1;if(N.hy>0.5)b[13]=1;
  b[6]=Math.max(b[6],N.lt);b[7]=Math.max(b[7],N.rt);
  // radial o'lik zona + chiziqli qayta masshtab
  const m=Math.hypot(lx,ly),DZ=0.12;
  if(m<DZ){lx=0;ly=0;}else{const k=(Math.min(1,m)-DZ)/(1-DZ)/m;lx*=k;ly*=k;}
  PAD.lx=lx;PAD.ly=ly;
  const tz=v=>v<0.04?0:Math.min(1,(v-0.04)/0.94);PAD.lt=tz(b[6]);PAD.rt=tz(b[7]);
  let used=Math.abs(lx)>0.2||Math.abs(ly)>0.2||PAD.lt>0.1||PAD.rt>0.1;for(let i=0;i<17;i++)if(b[i]>0.5&&i!==6&&i!==7)used=true;
  if(used){PAD.lastUse=performance.now();if(!PAD.active){PAD.active=true;document.body.classList.add('padnav');}}
}
const padHit=i=>PAD.b[i]>0.5&&PAD.pb[i]<=0.5;
// ---------- menyuda yo'nalish bo'yicha harakat (spatial navigation) ----------
function navRoot(){
  for(const s of['#adov','#crate','#finish','#pause','#prerace']){const e=$(s);if(e&&!e.classList.contains('hidden'))return e;}
  return state==='menu'?$('#menu'):null;
}
function navItems(root){return [...root.querySelectorAll('button')].filter(b=>{if(b.disabled||!b.offsetParent)return false;
  const r=b.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(b).visibility!=='hidden';});}
function setFocus(el){if(PAD.focus)PAD.focus.classList.remove('padfocus');PAD.focus=el;
  if(el){el.classList.add('padfocus');try{el.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}}}
function ensureFocus(root){const it=navItems(root);if(PAD.focus&&it.includes(PAD.focus))return it;
  const pref=root.querySelector('#btnGo,#btnResume,#btnNext,#btnCrateOk,#btnStart');
  setFocus(pref&&it.includes(pref)?pref:it[0]||null);return it;}
function navMove(dx,dy){
  const root=navRoot();if(!root)return;const it=ensureFocus(root);if(!PAD.focus)return;
  const a=PAD.focus.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
  for(const el of it){if(el===PAD.focus)continue;const r=el.getBoundingClientRect();
    // eng yaqin chekka nuqtasiga masofa (keng tugmalar uchun to'g'riroq)
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const px=dx?(cx-ax)*dx:(cy-ay)*dy;if(px<=2)continue;
    const ortho=dx?Math.max(0,Math.max(r.top-a.bottom,a.top-r.bottom)):Math.max(0,Math.max(r.left-a.right,a.left-r.right));
    const s=px+ortho*3+(dx?Math.abs(cy-ay)*0.3:Math.abs(cx-ax)*0.3);if(s<bs){bs=s;best=el;}}
  if(best){setFocus(best);vibrate(8);}
}
function navActivate(){const root=navRoot();if(!root)return;ensureFocus(root);if(PAD.focus){initAudio();PAD.focus.click();vibrate(15);
  setTimeout(()=>{const r=navRoot();if(r)ensureFocus(r);},60);}}
function navTab(d){if(state!=='menu'||navRoot()!==$('#menu'))return;const bs=$$('#tabs button'),i=bs.findIndex(b=>b.classList.contains('on'));
  const n=bs[(i+d+bs.length)%bs.length];n.click();setFocus(n);}
function padBack(){
  if(state==='race'||state==='countdown'){togglePause();return true;}
  const vis=s=>{const e=$(s);return e&&!e.classList.contains('hidden');};
  if(vis('#adov'))return true;
  if(vis('#crate')){$('#btnCrateOk').click();return true;}
  if(vis('#pause')){togglePause();return true;}
  if(vis('#finish')){$('#btnFinMenu').click();return true;}
  if(vis('#prerace')){$('#btnPreBack').click();return true;}
  if(state==='finished'){goMenu();return true;}
  if(state==='menu'&&menuTab!=='race'){const b=$('#tabs button[data-tab="race"]');b.click();setFocus(b);return true;}
  return false;
}
// klaviatura / TV pult (D-pad + OK + Orqaga) menyularda
addEventListener('keydown',e=>{
  const root=navRoot();if(!root)return;
  const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.code]||({38:[0,-1],40:[0,1],37:[-1,0],39:[1,0]})[e.keyCode];
  if(d){e.preventDefault();e.stopImmediatePropagation();if(!PAD.active){PAD.active=true;document.body.classList.add('padnav');}
    if(!PAD.focus||!navItems(root).includes(PAD.focus))ensureFocus(root);else navMove(d[0],d[1]);return;}
  if(e.code==='Enter'||e.code==='NumpadEnter'||e.keyCode===13||e.keyCode===23){e.preventDefault();navActivate();return;}
  if(e.code==='Backspace'||e.code==='BrowserBack'||e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();padBack();}
},true);
addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'&&PAD.active&&performance.now()-PAD.lastUse>1500){PAD.active=false;document.body.classList.remove('padnav');setFocus(null);}},true);
let padRumbleLeft=0;
function padRumble(ms,strong=0.7){if(!PAD.active||!S.vib)return;ms=Math.min(400,ms);
  for(const g of(navigator.getGamepads?navigator.getGamepads():[])){if(!g)continue;const a=g.vibrationActuator;
    if(a&&a.playEffect)try{a.playEffect('dual-rumble',{duration:ms,strongMagnitude:strong,weakMagnitude:Math.min(1,strong+0.2)});}catch(e){}}
  try{const P=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.F1aNative;if(P)P.rumble({ms:ms|0,strong}).catch(()=>{});}catch(e){}}

function padTick(dt){
  readPad();
  if(!PAD.active)return;
  const b=PAD.b,root=navRoot(),driving=!root&&(state==='race'||state==='countdown'||state==='finished');
  if(!driving){
    PAD.lookBack=false;PAD.steer=0;
    if(!root)return;
    let dir=null;
    if(b[12]>0.5||PAD.ly<-0.6)dir=[0,-1];else if(b[13]>0.5||PAD.ly>0.6)dir=[0,1];else if(b[14]>0.5||PAD.lx<-0.6)dir=[-1,0];else if(b[15]>0.5||PAD.lx>0.6)dir=[1,0];
    const key=dir?dir.join():null;
    if(key!==PAD.repDir){PAD.repDir=key;PAD.repT=0.38;if(dir)navMove(dir[0],dir[1]);}
    else if(dir){PAD.repT-=dt;if(PAD.repT<=0){PAD.repT=0.12;navMove(dir[0],dir[1]);}}
    if(!PAD.focus||!PAD.focus.isConnected||!PAD.focus.offsetParent)ensureFocus(root);
    if(padHit(0))navActivate();
    if(padHit(1)||padHit(8))padBack();
    if(padHit(9)){const p=root.querySelector('#btnGo,#btnResume,#btnNext,#btnCrateOk,#btnStart');if(p&&p.offsetParent){initAudio();p.click();}}
    if(padHit(4))navTab(-1);if(padHit(5))navTab(1);
    return;
  }
  if(PAD.focus)setFocus(null);PAD.repDir='x';
  // poyga: F1 uslubidagi tartib
  let st=-PAD.lx;if(b[14]>0.5)st=1;else if(b[15]>0.5)st=-1;
  const sens=S.padSens||1,lin=S.padLin!=null?S.padLin:1.4;
  PAD.steer=clamp(Math.sign(st)*Math.pow(Math.abs(st),lin)*sens,-1,1);
  PAD.brakeBtn=b[2]>0.5;PAD.lookBack=b[1]>0.5;
  if(padHit(3))cycleCam();
  if(padHit(0))drsPressed=true;
  if(padHit(5))togglePit();
  if(padHit(4))manualReset();
  if(padHit(9)||padHit(8))togglePause();
}
function padRecent(){return PAD.active&&performance.now()-PAD.lastUse<4000;}
window.F1aDbg=()=>({focus:PAD.focus&&(PAD.focus.id||PAD.focus.className),state,menuTab,sp:player&&player.speed,steer:player&&player.steerIn,thr:player&&player.throttle,camErr:player?wrapA(player.th-camYaw):0});
