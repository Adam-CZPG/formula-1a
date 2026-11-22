//#SIM-BEGIN
// ======================= TRASSALAR VA FIZIKA =======================
const G=9.81, CURB_W=1.6;
const PHYS={m:760,I:1150,a:1.6,b:1.4,h:0.32,mu:1.7,kdf:2.0,kdrag:0.62,power:540000,fmax:14000,crr:0.015};
const WB=PHYS.a+PHYS.b;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function wrapA(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}

const TRACKS=[
  {name:'Grand Prix',sub:'Klassik trassa · 2.9 km',type:'gp',halfW:7,wallD:13.5,
   pts:[[0,0],[0,250],[30,380],[120,440],[240,430],[300,360],[290,260],[230,200],[220,120],[300,60],[420,80],[500,160],[560,300],[640,360],[740,330],[770,220],[720,100],[640,-20],[560,-120],[420,-170],[260,-160],[130,-200],[40,-160],[0,-80]]},
  {name:'Shahar',sub:'Tor ko‘chalar, devorlar yaqin',type:'city',halfW:6.2,wallD:9.5,
   pts:[[0,0],[0,260],[15,320],[60,345],[250,350],[305,330],[320,280],[310,215],[330,175],[380,160],[490,165],[540,140],[555,90],[550,-50],[525,-100],[470,-115],[320,-112],[270,-135],[240,-185],[190,-210],[70,-210],[20,-185],[0,-130]]},
  {name:'Tezkor',sub:'Yuqori tezlik, keng burilishlar',type:'fast',halfW:7.5,wallD:15,
   pts:[[0,0],[0,520],[70,720],[230,810],[430,790],[570,670],[610,460],[570,220],[610,20],[710,-150],[650,-340],[470,-430],[250,-410],[90,-310],[15,-170]]},
];
const LAPS=3;

let HALF_W,WALL_D,TRACK_LEN,N,DS,PX,PZ,TX,TZ,LX,LZ,KAP,VPROF,DRSZ,TRACK_DEF;
let GRIP_ENV=1;   // ob-havo (yomg'ir = 0.78)

function loadTrack(def){
  TRACK_DEF=def;HALF_W=def.halfW;WALL_D=def.wallD;
  const curve=new THREE.CatmullRomCurve3(def.pts.map(p=>new THREE.Vector3(p[0],0,p[1])),true,'centripetal');
  TRACK_LEN=curve.getLength();N=Math.floor(TRACK_LEN/2);DS=TRACK_LEN/N;
  PX=new Float32Array(N);PZ=new Float32Array(N);TX=new Float32Array(N);TZ=new Float32Array(N);
  LX=new Float32Array(N);LZ=new Float32Array(N);KAP=new Float32Array(N);VPROF=new Float32Array(N);DRSZ=new Uint8Array(N);
  const pts=curve.getSpacedPoints(N);
  for(let i=0;i<N;i++){PX[i]=pts[i].x;PZ[i]=pts[i].z;}
  for(let i=0;i<N;i++){const a=(i-1+N)%N,b=(i+1)%N;const dx=PX[b]-PX[a],dz=PZ[b]-PZ[a];const l=Math.hypot(dx,dz)||1;
    TX[i]=dx/l;TZ[i]=dz/l;LX[i]=TZ[i];LZ[i]=-TX[i];}
  const H=new Float32Array(N);for(let i=0;i<N;i++)H[i]=Math.atan2(TX[i],TZ[i]);
  const kr=new Float32Array(N);for(let i=0;i<N;i++)kr[i]=wrapA(H[(i+3)%N]-H[(i-3+N)%N])/(6*DS);
  for(let i=0;i<N;i++){let s=0;for(let k=-6;k<=6;k++)s+=kr[(i+k+N)%N];KAP[i]=s/13;}
  computeProfile();
  // DRS zonalari: uzun to'g'ri yo'llar
  const straight=i=>Math.abs(KAP[i])<0.0022;
  let start=-1;for(let i=0;i<N;i++)if(!straight(i)){start=i;break;}
  if(start<0)start=0;
  let run=0,runStart=0;
  for(let k=1;k<=N;k++){const i=(start+k)%N;
    if(straight(i)){if(run===0)runStart=i;run++;}
    else{ if(run*DS>220){const s0=Math.round(50/DS),e0=Math.round(60/DS);for(let q=s0;q<run-e0;q++)DRSZ[(runStart+q)%N]=1;} run=0; }}
}
function computeProfile(){
  const mu=PHYS.mu*0.74*GRIP_ENV, ab=15*GRIP_ENV;
  for(let i=0;i<N;i++){const k=Math.abs(KAP[i]);const den=k-mu*PHYS.kdf/PHYS.m;VPROF[i]=den<=1e-5?92:Math.min(92,Math.sqrt(mu*G/den));}
  for(let p=0;p<3;p++)for(let i=N-1;i>=0;i--){const j=(i+1)%N;VPROF[i]=Math.min(VPROF[i],Math.sqrt(VPROF[j]*VPROF[j]+2*ab*DS));}
}

function nearestIdx(x,z,hint,win){
  let best=0,bd=1e18;
  if(hint<0){for(let i=0;i<N;i++){const dx=x-PX[i],dz=z-PZ[i],d=dx*dx+dz*dz;if(d<bd){bd=d;best=i;}}return best;}
  for(let k=-win;k<=win;k++){const i=(hint+k+N)%N;const dx=x-PX[i],dz=z-PZ[i],d=dx*dx+dz*dz;if(d<bd){bd=d;best=i;}}
  return best;
}

const tire=a=>Math.sin(1.45*Math.atan(9*a));

class Car{
  constructor(name,isPlayer){this.name=name;this.isPlayer=isPlayer;this.reset(0,0,0,0);}
  reset(x,z,th,idx){
    this.x=x;this.z=z;this.th=th;this.vx=0;this.vz=0;this.r=0;this.steer=0;this.steerIn=0;
    this.throttle=0;this.brake=0;this.long=0;this.latA=0;this.idx=idx;this.pidx=idx;this.lat=0;this.vLong=0;
    this.onGrass=false;this.slipF=0;this.slipR=0;this.spin=false;this.wheelRot=0;this.stuck=0;
    this.dragMul=1;this.dfMul=1;this.gripF=1;this.drs=false;this.drsAvail=false;this.slip=0;this.dmg=0;this.brakeT=0;
    this.wear=0;this.limiter=0;if(this.powMul==null){this.powMul=1;this.aeroMul=1;this.gripMul=1;this.brkMul=1;this.tyreGrip=1;this.wearRate=0;}
  }
  get speed(){return Math.hypot(this.vx,this.vz);}
  step(dt){
    const P=PHYS,s=Math.sin(this.th),c=Math.cos(this.th);
    const vL=this.vx*s+this.vz*c, vT=this.vx*c-this.vz*s;
    const sp=Math.hypot(this.vx,this.vz);
    const maxSt=0.42/(1+sp*0.045);
    this.steer+=(this.steerIn*maxSt-this.steer)*Math.min(1,dt*12);
    const d=this.steer,cd=Math.cos(d),sd=Math.sin(d);
    const surf=this.onGrass?0.55:1, mu=P.mu*surf*GRIP_ENV*this.gripMul*this.tyreGrip*(1-0.13*Math.pow(this.wear,1.5));
    const df=P.kdf*sp*sp*this.dfMul*this.aeroMul;
    const wt=P.m*this.long*P.h/WB;
    const Nf=Math.max(300,P.m*G*P.b/WB+df*0.45-wt), Nr=Math.max(300,P.m*G*P.a/WB+df*0.55+wt);
    const vxa=Math.max(Math.abs(vL),3), dir=vL>=0?1:-1;
    const af=Math.atan2(vT+this.r*P.a,vxa)-d*dir, ar=Math.atan2(vT-this.r*P.b,vxa);
    let Fdrive=0,Fbrk=0;
    if(this.throttle>0&&vL>-1)Fdrive=this.throttle*Math.min(P.fmax,P.power*this.powMul/Math.max(sp,1));
    if(this.limiter>0&&sp>this.limiter){Fdrive=0;this.brake=Math.max(this.brake,clamp((sp-this.limiter)*0.15,0,0.6));}
    if(this.brake>0){ if(vL>1)Fbrk=this.brake*mu*(Nf+Nr)*Math.min(1.02,0.9*this.brkMul); else if(vL>-11)Fdrive-=this.brake*4000; }
    if(this.throttle>0&&vL<-1)Fbrk=this.throttle*mu*(Nf+Nr)*0.5;
    const cap=mu*Nr; this.spin=Math.abs(Fdrive)>cap*0.9;
    const tc=cap*0.97*clamp(1-Math.abs(ar)/0.34,0.4,1);
    const muF=mu*this.gripF;
    const Fxr=clamp(Fdrive,-tc,tc)-Math.min(0.35*Fbrk,0.8*cap)*dir, Fxf=-Math.min(0.65*Fbrk,0.92*muF*Nf)*dir;
    const low=Math.min(1,sp/2.5);
    const FyfM=Math.sqrt(Math.max(0,(muF*Nf)**2-Fxf*Fxf)), FyrM=Math.sqrt(Math.max(0,(mu*Nr*1.12)**2-Fxr*Fxr));
    const Fyf=-FyfM*tire(af)*low, Fyr=-FyrM*tire(ar)*low;
    const FL=Fxr+Fxf*cd-Fyf*sd, FT=Fyf*cd+Fxf*sd+Fyr;
    let tq=P.a*(Fyf*cd+Fxf*sd)-P.b*Fyr;
    const esc=clamp((Math.abs(ar)-0.09)/0.12,0,1);
    if(esc>0&&vL>3)tq-=(this.r-vL*Math.tan(d)/WB)*P.I*3.5*esc;
    const res=P.kdrag*this.dragMul*(1-(this.aeroMul-1)*0.3)*sp*sp+P.crr*P.m*G*Math.min(1,sp)+(this.onGrass?1100*Math.min(1,sp/4):0);
    const rx=sp>1e-3?-res*this.vx/sp:0, rz=sp>1e-3?-res*this.vz/sp:0;
    this.vx+=(FL*s+FT*c+rx)/P.m*dt; this.vz+=(FL*c-FT*s+rz)/P.m*dt;
    this.r+=tq/P.I*dt;
    const vL2=this.vx*s+this.vz*c;
    if(Fbrk>0&&vL*vL2<0){this.vx-=vL2*s;this.vz-=vL2*c;}
    if(sp<3){
      const k=(1-sp/3)*Math.min(1,dt*10);
      this.r+=(vL*Math.tan(d)/WB-this.r)*k;
      const vT2=this.vx*c-this.vz*s; this.vx-=vT2*c*k; this.vz+=vT2*s*k;
    }
    this.th+=this.r*dt; this.x+=this.vx*dt; this.z+=this.vz*dt;
    this.long+=((FL+rx*s+rz*c)/P.m-this.long)*Math.min(1,dt*8);
    this.latA+=(FT/P.m-this.latA)*Math.min(1,dt*8);
    this.slipF=af;this.slipR=ar;this.vLong=vL;this.wheelRot+=vL/0.36*dt;
    if(this.wearRate>0)this.wear=Math.min(1,this.wear+this.wearRate*sp*dt/1000*(1+Math.min(2,(Math.abs(ar)+Math.abs(af))*4)));
    // tormoz disk harorati (vizual)
    this.brakeT+=((Fbrk>4000&&sp>15?1:0)-this.brakeT)*Math.min(1,dt*(Fbrk>4000?1.5:0.6));
  }
}

function collideWall(car){
  car.idx=nearestIdx(car.x,car.z,car.idx,30);
  const i=car.idx,dx=car.x-PX[i],dz=car.z-PZ[i];
  const lat=dx*LX[i]+dz*LZ[i]; car.lat=lat;
  car.onGrass=Math.abs(lat)>HALF_W+CURB_W+0.4;
  const s=Math.sin(car.th),c=Math.cos(car.th);
  const rel=Math.abs(s*LX[i]+c*LZ[i]);
  const lim=WALL_D-1.0-rel*2.1;
  if(Math.abs(lat)<=lim)return 0;
  const sg=Math.sign(lat),nx=-sg*LX[i],nz=-sg*LZ[i];
  const pen=Math.abs(lat)-lim; car.x+=nx*pen; car.z+=nz*pen;
  const vn=car.vx*nx+car.vz*nz;
  if(vn>=0)return 0;
  const tx=car.vx-vn*nx,tz=car.vz-vn*nz,tf=Math.max(0.55,1+0.035*vn),e=0.3;
  car.vx=tx*tf-e*vn*nx; car.vz=tz*tf-e*vn*nz;
  car.r*=0.5;
  return -vn;
}

function carCircles(c){const s=Math.sin(c.th),co=Math.cos(c.th);return [[c.x+s*1.95,c.z+co*1.95],[c.x-s*1.8,c.z-co*1.8]];}
function collideCars(A,B){
  const dx0=A.x-B.x,dz0=A.z-B.z; if(dx0*dx0+dz0*dz0>49)return 0;
  const R=1.1,ca=carCircles(A),cb=carCircles(B); let imp=0;
  for(const pa of ca)for(const pb of cb){
    const dx=pa[0]-pb[0],dz=pa[1]-pb[1],d2=dx*dx+dz*dz;
    if(d2>=4*R*R||d2<1e-6)continue;
    const d=Math.sqrt(d2),nx=dx/d,nz=dz/d,pen=2*R-d;
    A.x+=nx*pen/2;A.z+=nz*pen/2;B.x-=nx*pen/2;B.z-=nz*pen/2;
    const oax=pa[0]-A.x,oaz=pa[1]-A.z,obx=pb[0]-B.x,obz=pb[1]-B.z;
    const vax=A.vx+A.r*oaz,vaz=A.vz-A.r*oax,vbx=B.vx+B.r*obz,vbz=B.vz-B.r*obx;
    const vrel=(vax-vbx)*nx+(vaz-vbz)*nz;
    if(vrel>=0)continue;
    const j=-(1+0.25)*vrel/2;
    A.vx+=j*nx;A.vz+=j*nz;B.vx-=j*nx;B.vz-=j*nz;
    const k=PHYS.m/PHYS.I*0.35;
    A.r+=(oaz*nx-oax*nz)*j*k; B.r-=(obz*nx-obx*nz)*j*k;
    imp=Math.max(imp,-vrel);
  }
  return imp;
}

// oldindagi mashina (DRS, slipstream, ИИ uchun)
function aheadInfo(car,cars){
  let best=null,bd=1e9;
  for(const o of cars){if(o===car)continue;let dp=o.prog-car.prog;if(dp<=0||dp*DS>120)continue;if(dp<bd){bd=dp;best=o;}}
  return best?{car:best,dist:bd*DS}:null;
}
function updateAero(car,cars,allowDRS){
  const a=aheadInfo(car,cars);
  car.slip=0;
  if(a&&a.dist<32&&Math.abs(a.car.lat-car.lat)<2.4)car.slip=1-a.dist/32;
  const inZone=DRSZ[car.idx]===1;
  if(!inZone)car.drsAvail=allowDRS==='always'||(!!allowDRS&&!!a&&a.dist/Math.max(car.speed,10)<1.0); // zonaga kirishda aniqlanadi
  if(car.drs&&(!inZone||car.brake>0.1))car.drs=false;
  car.dragMul=(car.drs?0.74:1)*(1-0.3*car.slip)*(1+0.12*car.dmg);
  car.dfMul=car.drs?0.82:1;
}

function aiDrive(car,cars){
  const sp=car.speed,s=Math.sin(car.th),c=Math.cos(car.th);
  let want=car.aiLine;
  for(const o of cars){ if(o===car)continue; const dp=o.prog-car.prog;
    if(dp>0&&dp*DS<22&&Math.abs(o.lat-car.lat)<3.2) want=o.lat>0?o.lat-4.4:o.lat+4.4; }
  const lim=HALF_W-1.6;
  want=clamp(want,-lim,lim);
  car.aiOff+=(want-car.aiOff)*0.012;
  const la=7+sp*0.5,j=(car.idx+Math.round(la/DS))%N;
  const tx=PX[j]+LX[j]*car.aiOff-car.x,tz=PZ[j]+LZ[j]*car.aiOff-car.z;
  const lf=tx*s+tz*c,ll=tx*c-tz*s;
  const alpha=Math.atan2(ll,lf),ld=Math.max(4,Math.hypot(tx,tz));
  const delta=Math.atan(2*WB*Math.sin(alpha)/ld);
  const maxSt=0.42/(1+sp*0.045);
  car.steerIn=clamp(delta/maxSt,-1,1);
  let vt=99; for(let q=0;q<4;q++)vt=Math.min(vt,VPROF[(car.idx+q)%N]);
  vt*=car.skillEff;
  if(Math.abs(alpha)>1.3)vt=Math.min(vt,8);
  const diff=vt-sp;
  car.throttle=diff>0?clamp(diff*0.35+0.15,0,1):0;
  car.brake=diff<-0.8?clamp(-diff*0.3,0,1):0;
  if(car.onGrass)car.throttle*=0.75;
  if(DRSZ[car.idx]&&car.drsAvail&&!car.drs&&car.brake===0)car.drs=true;
}
function assistTarget(car){let vt=99;for(let q=0;q<14;q++)vt=Math.min(vt,VPROF[(car.idx+q)%N]);return vt*1.1;}

function respawn(car,latOff=0){
  const i=car.idx;
  car.x=PX[i]+LX[i]*latOff; car.z=PZ[i]+LZ[i]*latOff; car.th=Math.atan2(TX[i],TZ[i]);
  car.vx=car.vz=car.r=car.steer=0; car.stuck=0; car.drs=false;
}
function updateProgress(car){
  let d=car.idx-car.pidx; if(d<-N/2)d+=N; if(d>N/2)d-=N;
  car.prog+=d; car.pidx=car.idx;
}
//#SIM-END
