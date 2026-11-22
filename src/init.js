// ======================= ISHGA TUSHIRISH =======================
applyQuality();
loadTrackAndWorld(S.track);
buildCars();placeGrid();
for(const k in S)if(k==='livery'&&!PR.livs[S.livery]){PR.livs[S.livery]=1;saveP();}
applyLang();buildMenu();refreshUI();setShowroom(true);
if(S.tilt&&!(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'))enableTilt();
let last=performance.now(),acc=0;const STEP=1/120;
function setPR(pr){renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight);}
function loop(now){
  requestAnimationFrame(loop);
  const raw=Math.max(1e-3,(now-last)/1000),dt=Math.min(0.1,raw);last=now;
  // moslashuvchan o'lcham: kadr tezligi past bo'lsa, ekran o'lchamini kamaytiradi
  fpsEMA=fpsEMA*0.95+Math.min(120,1/raw)*0.05;adaptT+=dt;
  if(adaptT>2&&(state==='race'||state==='countdown')){adaptT=0;const maxPR=Math.min(devicePixelRatio,QUAL[S.quality].pr);if(dynPR==null)dynPR=renderer.getPixelRatio();
    if(fpsEMA<32&&dynPR>0.7){dynPR=Math.max(0.7,dynPR-0.15);setPR(dynPR);}else if(fpsEMA>54&&dynPR<maxPR-0.01){dynPR=Math.min(maxPR,dynPR+0.1);setPR(dynPR);}}
  if(state!=='paused'){
    updateCountdown(dt);
    if(state!=='menu'){acc+=dt;let n=0;while(acc>=STEP&&n<14){simStep(STEP);acc-=STEP;n++;}if(n>=14)acc=0;}
    if(state==='finished'&&finT>=0){finT+=dt;const f=$('#finish');if(finT>1.8&&f.classList.contains('hidden')){renderFinish();f.classList.remove('hidden');}
      if(!f.classList.contains('hidden')&&(finT%0.5)<dt)updateFinTable();}
    updateCars(dt,now);updateCones(dt);updateSparks(dt);updateFlash(dt);updateParticles(dt);updateRain(dt);treeU.uTime.value=now/1000;
  }else acc=0;
  showroomTick();updateCamera(dt,now);
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  sun.position.set(player.x+SUN_DIR.x*150,SUN_DIR.y*150,player.z+SUN_DIR.z*150);sun.target.position.set(player.x,0,player.z);sun.target.updateMatrixWorld();
  updateHUD(dt);drawMini();updateAudio();drawSpeedLines();
  if(QUAL[S.quality].bloom)composer.render();else renderer.render(scene,camera);
}
requestAnimationFrame(loop);
document.addEventListener('visibilitychange',()=>{last=performance.now();acc=0;if(actx){document.hidden?actx.suspend():actx.resume();}if(document.hidden&&(state==='race'||state==='countdown'))togglePause();});
addEventListener('resize',()=>{fitBg();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();applyQuality();sizeSL();});
