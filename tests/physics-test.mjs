import fs from 'fs';
const sim=fs.readFileSync(new URL("../src/sim.js",import.meta.url),"utf8");
fs.writeFileSync(new URL("./run.mjs",import.meta.url),`import * as THREE from 'three';\n${sim}\n
for(let t=0;t<3;t++)for(const wet of [1,0.78]){GRIP_ENV=wet;loadTrack(TRACKS[t]);
 let kmax=0;for(let i=0;i<N;i++)kmax=Math.max(kmax,Math.abs(KAP[i]));let dz=0;for(let i=0;i<N;i++)dz+=DRSZ[i];
 const n=7;const cars=[];for(let i=0;i<n;i++){const c=new Car('c'+i,false);c.skill=0.97-i*0.012;c.skillEff=c.skill;c.aiLine=[0,1.5,-1.5,0.6,-0.8,1,-1.2][i];cars.push(c);}
 cars.forEach((car,slot)=>{const back=10+slot*9,k=Math.round(back/DS),idx=(N-k)%N,lat=slot%2?-3:3;car.reset(PX[idx]+LX[idx]*lat,PZ[idx]+LZ[idx]*lat,Math.atan2(TX[idx],TZ[idx]),idx);Object.assign(car,{prog:-k,aiOff:lat,hits:0,maxImp:0,resp:0,ld:-1,lapT:[],vmax:0,ch:0});});
 const h=1/120;let tt=0;
 for(let st=0;st<120*240;st++){tt+=h;
  for(const c of cars){updateAero(c,cars,true);aiDrive(c,cars);}
  for(const c of cars){c.step(h);const imp=collideWall(c);if(imp>2){c.hits++;c.maxImp=Math.max(c.maxImp,imp);}c.vmax=Math.max(c.vmax,c.speed);}
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){if(collideCars(cars[a],cars[b])>3)cars[a].ch++;}
  for(const c of cars){updateProgress(c);const l=Math.floor(c.prog/N);if(l>c.ld){if(c.ld>=0)c.lapT.push(tt.toFixed(0));c.ld=l;}
   if(c.speed<1.5&&tt>3){c.stuck+=h;if(c.stuck>2.5){respawn(c,c.aiLine);c.resp++;}}else c.stuck=0;}
 }
 const L=cars.map(c=>c.ld),H=cars.reduce((a,c)=>a+c.hits,0),R=cars.reduce((a,c)=>a+c.resp,0),C=cars.reduce((a,c)=>a+c.ch,0);
 console.log(TRACKS[t].name,'wet',wet,'len',TRACK_LEN.toFixed(0),'minR',(1/kmax).toFixed(0),'drs m',(dz*DS).toFixed(0),'laps',L.join(','),'lap1@',cars[0].lapT[1],'wallhits',H,'resp',R,'carHits',C,'vmax',(Math.max(...cars.map(c=>c.vmax))*3.6).toFixed(0));
}`);
