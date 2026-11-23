// ======================= O'YIN =======================
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(isTouch){document.body.classList.add('touch');$('#controls').style.display='block';}

// ---------- sozlamalar va saqlash ----------
const store={get(k,d){try{const v=localStorage.getItem(k);return v!=null?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const DEF={lang:'uz',track:0,mode:'race',tod:'day',weather:'dry',diff:1,opp:3,quality:isTouch?'med':'high',livery:0,color:null,num:7,
  tilt:false,tiltInv:false,autoGas:false,brakeAssist:false,line:false,vib:true,sound:true,btn:1};
const S=Object.assign({},DEF,store.get('f1a_set',{}));
const saveS=()=>store.set('f1a_set',S);

const LIVERIES=[
  {name:'Qizil chaqmoq',p:0xd50000,s:0xffffff,a:0x111111},
  {name:'Kumush o‘q',p:0xc3c9cf,s:0x00d2be,a:0x111111},
  {name:'Moviy bo‘ron',p:0x0b2a8a,s:0xffd200,a:0xe10600},
  {name:'Qora pantera',p:0x121212,s:0xd4af37,a:0xd4af37},
  {name:'Papaya',p:0xff8000,s:0x1e88e5,a:0x111111},
  {name:'Zumrad',p:0x006f62,s:0xcedc00,a:0xffffff},
  {name:'Pushti',p:0xff4fa0,s:0x101820,a:0xffffff},
  {name:'Oq sharpa',p:0xf2f2f2,s:0xe10600,a:0x0050ff},
];
const COLORS=[0xd50000,0xff8000,0xffd200,0x00a86b,0x00d2be,0x1e5bff,0x0b2a8a,0x6a1bff,0xff4fa0,0x121212,0xf2f2f2,0xc3c9cf,0x7a0019];
const AI_NAMES=['Bianco','Rossi','Moreau','Clark','Tanaka','Silva','Novak'];
const AI_NUMS=[3,16,44,1,55,4,63];
const DIFF_SK=[0.84,0.91,0.97];
const CHAMP_ORDER=[0,1,2], POINTS=[25,18,15,12,10,8,6,4];
const QUAL={low:{pr:1,sh:false,sz:512,bloom:false,trees:0.35,lines:false},med:{pr:1.5,sh:true,sz:1024,bloom:false,trees:0.7,lines:true},high:{pr:2,sh:true,sz:2048,bloom:true,trees:1,lines:true}};
const hex=c=>'#'+c.toString(16).padStart(6,'0');

// ---------- render ----------
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.outputColorSpace=THREE.SRGBColorSpace;
$('#app').appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xcfe0ee,320,2600);
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,0.1,6000);

const hemi=new THREE.HemisphereLight(0xd6ebff,0x4d6b2c,0.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,2.6);
Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:400});
sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);
const SUN_DIR=new THREE.Vector3(60,120,40).normalize();
const headlight=new THREE.SpotLight(0xfff4e0,0,160,0.55,0.6,1.3);
scene.add(headlight);scene.add(headlight.target);

const skyU={top:{value:new THREE.Color(0x2f6fd0)},bottom:{value:new THREE.Color(0xcfe0ee)},sunDir:{value:SUN_DIR},sunCol:{value:new THREE.Color(0xfff0d8)},sunAmt:{value:1}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(4000,32,16),new THREE.ShaderMaterial({uniforms:skyU,
  vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 top,bottom,sunDir,sunCol;uniform float sunAmt;varying vec3 vP;void main(){float h=max(vP.y,0.);vec3 c=mix(bottom,top,pow(h,.55));
    float s=max(dot(normalize(vP),sunDir),0.);c+=sunCol*(pow(s,700.)*3.+pow(s,10.)*.25)*sunAmt;
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,side:THREE.BackSide,depthWrite:false,fog:false}));
scene.add(sky);
const stars=(()=>{const n=1500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.283,y=0.08+Math.random()*0.92,r=Math.sqrt(1-y*y);p.set([Math.cos(a)*r*3500,y*3500,Math.sin(a)*r*3500],i*3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,fog:false,transparent:true,opacity:0.85}));s.visible=false;scene.add(s);return s;})();

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),0.25,0.45,0.85);
composer.addPass(bloom);composer.addPass(new OutputPass());

let fpsEMA=60,adaptT=0,dynPR=null;
function applyQuality(){
  const q=QUAL[S.quality];dynPR=null;
  renderer.setPixelRatio(Math.min(devicePixelRatio,q.pr));renderer.setSize(innerWidth,innerHeight);
  composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);
  bloom.resolution.set(innerWidth/2,innerHeight/2);
  const was=renderer.shadowMap.enabled;
  renderer.shadowMap.enabled=q.sh;sun.castShadow=q.sh;
  if(sun.shadow.mapSize.x!==q.sz){sun.shadow.mapSize.set(q.sz,q.sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  if(was!==q.sh)scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});
}

// ---------- teksturalar ----------
const maxAniso=renderer.capabilities.getMaxAnisotropy();
function ctex(w,h,draw,own){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;if(own)t.userData.own=true;return t;}
function noise(g,w,h,n,cols,sz){for(let i=0;i<n;i++){g.fillStyle=cols[(Math.random()*cols.length)|0];const s=sz*(0.5+Math.random());g.fillRect(Math.random()*w,Math.random()*h,s,s);}}
function textTex(text,bg,fg,w=512,h=128){return ctex(w,h,g=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;
  g.font=`italic 900 ${h*0.56}px system-ui,Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+4);},true);}
const [asphaltTex,asphaltNorm]=(function makeAsphalt(){
  const SZ=isTouch?768:1024,hc=document.createElement('canvas');hc.width=hc.height=SZ;const hg=hc.getContext('2d');
  hg.fillStyle='#808080';hg.fillRect(0,0,SZ,SZ);
  for(let i=0;i<SZ*SZ/14;i++){const v=70+Math.random()*120|0;hg.fillStyle=`rgb(${v},${v},${v})`;const s=0.8+Math.random()*2.4;hg.fillRect(Math.random()*SZ,Math.random()*SZ,s,s);}
  const src=hg.getImageData(0,0,SZ,SZ).data;
  const tex=ctex(SZ,SZ,(g,w,h)=>{const img=g.createImageData(w,h),d=img.data;
    for(let i=0;i<d.length;i+=4){const k=(src[i]-128)/128;d[i]=57+k*20;d[i+1]=60+k*20;d[i+2]=65+k*19;d[i+3]=255;}
    g.putImageData(img,0,0);
    for(let i=0;i<7;i++){g.fillStyle=`rgba(18,20,24,${0.1+Math.random()*0.12})`;g.fillRect(w*(0.08+Math.random()*0.7),Math.random()*h,w*(0.06+Math.random()*0.2),h*(0.04+Math.random()*0.14));}
    const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0.25,'rgba(0,0,0,0)');gr.addColorStop(0.45,'rgba(10,10,12,.16)');gr.addColorStop(0.55,'rgba(10,10,12,.16)');gr.addColorStop(0.75,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='#ececec';g.fillRect(w*0.03,0,w*0.022,h);g.fillRect(w*0.948,0,w*0.022,h);});
  const nc=document.createElement('canvas');nc.width=nc.height=SZ;const ng=nc.getContext('2d'),out=ng.createImageData(SZ,SZ),o=out.data;
  for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=(y*SZ+x)*4;
    const l=src[(y*SZ+(x-1+SZ)%SZ)*4],r=src[(y*SZ+(x+1)%SZ)*4],u=src[(((y-1+SZ)%SZ)*SZ+x)*4],dn=src[(((y+1)%SZ)*SZ+x)*4];
    const nx=(l-r)/255*2.2,ny=(u-dn)/255*2.2,L=Math.hypot(nx,ny,1);o[i]=(nx/L*0.5+0.5)*255;o[i+1]=(ny/L*0.5+0.5)*255;o[i+2]=(1/L*0.5+0.5)*255;o[i+3]=255;}
  ng.putImageData(out,0,0);const nt=new THREE.CanvasTexture(nc);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.anisotropy=maxAniso;
  return [tex,nt];})();
// ---------- ChatGPT teksturalari (assets/tx_*.webp) ----------
function photoTex(key,extra,rep){const cv=document.createElement('canvas');cv.width=cv.height=8;const g=cv.getContext('2d');g.fillStyle='#555';g.fillRect(0,0,8,8);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;if(rep)t.repeat.set(rep,rep);
  const im=new Image();im.onload=()=>{cv.width=im.width;cv.height=im.height;g.drawImage(im,0,0);if(extra)extra(g,im.width,im.height);t.image=cv;t.needsUpdate=true;};im.src=ASSET[key];return t;}
const roadLines=(g,w,h)=>{g.fillStyle='#ececec';g.fillRect(w*0.03,0,w*0.022,h);g.fillRect(w*0.948,0,w*0.022,h);};
const dryRoadTex=photoTex('tx_asph',roadLines),wetRoadTex=photoTex('tx_wet',(g,w,h)=>{g.globalAlpha=0.8;roadLines(g,w,h);g.globalAlpha=1;});
const grassTex_old=ctex(512,512,(g,w,h)=>{g.fillStyle='#4a7a2e';g.fillRect(0,0,w,h);noise(g,w,h,22000,['#43702a','#558536','#3e6826','#5d8f3b','#4a7a2c','#62963f'],2.2);
  for(let i=0;i<10000;i++){const x=Math.random()*w,y=Math.random()*h;g.strokeStyle=['#3b6623','#5a8e38','#6ea247','#4b7b2d'][i%4];g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Math.random()-0.5)*3,y-3-Math.random()*5);g.stroke();}});
const grassTex=photoTex('tx_grass',null,700);
const tuftTex=ctex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<46;i++){const x=12+Math.random()*104,hh=45+Math.random()*78;
  g.strokeStyle=['#3a6626','#56883a','#6c9c45','#4a7a30','#7fa852'][i%5];g.lineWidth=2+Math.random()*2.5;g.lineCap='round';g.beginPath();g.moveTo(x,h);
  g.quadraticCurveTo(x+(Math.random()-0.5)*16,h-hh*0.6,x+(Math.random()-0.5)*34,h-hh);g.stroke();}});
tuftTex.wrapS=tuftTex.wrapT=THREE.ClampToEdgeWrapping;
const fenceTex=ctex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(200,205,210,1)';g.lineWidth=2.4;
  for(let i=-h;i<w;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i+h,0);g.lineTo(i,h);g.stroke();}
  g.fillStyle='#5f656d';g.fillRect(0,0,12,h);g.fillRect(0,0,w,7);g.fillRect(0,h*0.5,w,4);g.fillRect(0,h-7,w,7);});
const paveTex=photoTex('tx_walk'),paveTex_old=ctex(256,256,(g,w,h)=>{g.fillStyle='#a7a9ab';g.fillRect(0,0,w,h);noise(g,w,h,6000,['#9da0a3','#b2b4b6','#989a9d'],2);
  g.strokeStyle='rgba(60,60,64,.45)';g.lineWidth=2;for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}
  g.fillStyle='#d7d8da';g.fillRect(0,0,22,h);});
const flashTex=ctex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.15,'rgba(255,230,160,.95)');
  gr.addColorStop(0.4,'rgba(255,140,40,.45)');gr.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,220,150,.6)';for(let i=0;i<10;i++){const a=i/10*6.283+Math.random()*0.3,r=30+Math.random()*32;g.lineWidth=1+Math.random()*2;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);g.stroke();}});
function facade(kind){
  const w=256,h=512;const map=ctex(w,h,g=>{
    if(kind===0){g.fillStyle='#22364a';g.fillRect(0,0,w,h);for(let y=0;y<32;y++)for(let x=0;x<16;x++){const b=0.6+Math.random()*0.4,gr=g.createLinearGradient(0,y*16,0,y*16+16);
      gr.addColorStop(0,`rgb(${80*b|0},${125*b|0},${165*b|0})`);gr.addColorStop(1,`rgb(${140*b|0},${180*b|0},${210*b|0})`);g.fillStyle=gr;g.fillRect(x*16+1,y*16+1,14,14);}
      g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(0,h*0.2);g.lineTo(w,0);g.lineTo(w,h*0.1);g.lineTo(0,h*0.35);g.fill();}
    else if(kind===1){g.fillStyle='#8a4a38';g.fillRect(0,0,w,h);noise(g,w,h,9000,['#7d4031','#96543f','#844634','#a05b45'],3);
      for(let y=0;y<16;y++)for(let x=0;x<8;x++){g.fillStyle='#e8e2d6';g.fillRect(x*32+6,y*32+6,20,22);g.fillStyle=Math.random()<0.5?'#2b3440':'#3c4a5a';g.fillRect(x*32+8,y*32+8,16,18);}
      g.fillStyle='rgba(40,40,44,.75)';for(let y=1;y<16;y+=2)g.fillRect(0,y*32+28,w,3);}
    else{g.fillStyle='#cdc9bf';g.fillRect(0,0,w,h);noise(g,w,h,6000,['#c3bfb5','#d6d2c8'],2);
      for(let y=0;y<16;y++){g.fillStyle='#2c4258';g.fillRect(0,y*32+8,w,17);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,y*32+8,w,3);g.fillStyle='#8f96a0';for(let x=0;x<w;x+=21)g.fillRect(x,y*32+8,2,17);}}
  },true);
  const em=ctex(w,h,g=>{g.fillStyle='#000';g.fillRect(0,0,w,h);const col=()=>Math.random()<0.75?'#ffd48a':'#d6e6ff';
    if(kind===0){for(let y=0;y<32;y++)for(let x=0;x<16;x++)if(Math.random()<0.35){g.fillStyle=col();g.fillRect(x*16+1,y*16+1,14,14);}}
    else if(kind===1){for(let y=0;y<16;y++)for(let x=0;x<8;x++)if(Math.random()<0.45){g.fillStyle=col();g.fillRect(x*32+8,y*32+8,16,18);}}
    else{for(let y=0;y<16;y++)for(let x=0;x<w;x+=42)if(Math.random()<0.5){g.fillStyle=col();g.fillRect(x,y*32+8,42,17);}}},true);
  return [map,em];
}
// yer va yo'l uchun dunyo-koordinatali o'zgaruvchanlik (takrorlanishni yo'qotadi)
function patchGround(mat,amp,stripes){
  mat.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWP;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}`)
    .replace('#include <map_fragment>',`#include <map_fragment>
{float n=vn(vWP.xz*0.011)*0.55+vn(vWP.xz*0.047)*0.3+vn(vWP.xz*0.19)*0.15;diffuseColor.rgb*=mix(${(1-amp).toFixed(3)},${(1+amp*0.6).toFixed(3)},n);
${stripes?'diffuseColor.rgb*=mod(floor(vWP.x/9.),2.)<1.?1.04:0.93;':''}}`);
  };
  mat.customProgramCacheKey=()=>'gnd'+amp+stripes;
}
const runoffTex=photoTex('tx_grass'),gravelTex=photoTex('tx_gravel'),runoffTex_old=ctex(256,256,(g,w,h)=>{g.fillStyle='#5b9238';g.fillRect(0,0,w,h);noise(g,w,h,8000,['#548a33','#64a03f','#4f8230','#6aa543'],2);});
const concTex=photoTex('tx_conc'),concTex_old=ctex(256,256,(g,w,h)=>{g.fillStyle='#8d9096';g.fillRect(0,0,w,h);noise(g,w,h,9000,['#83868c','#979aa0','#7c7f85','#a0a3a8'],2);});
const cityGroundTex=photoTex('tx_city',null,300),cityGroundTex_old=ctex(256,256,(g,w,h)=>{g.fillStyle='#5a5d62';g.fillRect(0,0,w,h);noise(g,w,h,9000,['#54575c','#62656a','#4d5055'],2.5);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=3;g.strokeRect(0,0,w,h);});

const curbTex=photoTex('tx_kerb'),curbTex_old=ctex(64,128,(g,w,h)=>{g.fillStyle='#d8261f';g.fillRect(0,0,w,h/2);g.fillStyle='#f2f2f2';g.fillRect(0,h/2,w,h/2);});
const wallTex=ctex(256,64,(g,w,h)=>{for(let i=0;i<4;i++){g.fillStyle=i%2?'#f3f3f3':'#d92b2b';g.fillRect(i*w/4,0,w/4,h);}
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,h-7,w,7);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,0,w,3);});
const cityWallTex=ctex(256,64,(g,w,h)=>{g.fillStyle='#b9bcc2';g.fillRect(0,0,w,h);noise(g,w,h,1500,['#aeb1b7','#c4c7cc'],2);
  g.fillStyle='#1e5bff';g.fillRect(0,8,w,10);g.fillStyle='#d0d3d8';g.fillRect(0,20,w,4);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,h-6,w,6);g.fillStyle='#ffd200';g.font='bold 22px Arial';g.fillText('1a',20,48);});
const checkTex=ctex(128,32,(g)=>{for(let y=0;y<4;y++)for(let x=0;x<16;x++){g.fillStyle=(x+y)%2?'#111':'#f5f5f5';g.fillRect(x*8,y*8,8,8);}});
const crowdTex=ctex(512,128,(g,w,h)=>{g.fillStyle='#262b36';g.fillRect(0,0,w,h);
  const cols=['#e74c3c','#f1c40f','#3498db','#ecf0f1','#2ecc71','#e67e22','#9b59b6','#ff6fa8','#e10600'];
  for(let y=6;y<h;y+=8)for(let x=2;x<w;x+=5){if(Math.random()<0.85){g.fillStyle=cols[(Math.random()*cols.length)|0];g.fillRect(x,y,3,3);g.fillStyle='#e0b48a';g.fillRect(x,y-3,3,2);}}});
crowdTex.repeat.set(5,1);
const carbonTex=ctex(64,64,(g,w,h)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=(x+y)%2?'#1b1d22':'#121317';g.fillRect(x*8,y*8,8,8);g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x*8,y*8,8,2);}});
carbonTex.repeat.set(3,3);
const shadowTex=ctex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const poolTex=ctex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(255,230,180,1)');gr.addColorStop(0.5,'rgba(255,210,150,.35)');gr.addColorStop(1,'rgba(255,200,140,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const winTex=ctex(128,256,(g,w,h)=>{g.fillStyle='#4a5260';g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=0;x<8;x++){g.fillStyle=Math.random()<0.5?'#7f9bb5':'#5d7590';g.fillRect(x*16+3,y*16+4,10,9);}});
const winEmTex=ctex(128,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=0;x<8;x++){if(Math.random()<0.45){g.fillStyle=Math.random()<0.7?'#ffd48a':'#cfe3ff';g.fillRect(x*16+3,y*16+4,10,9);}}});
const garageTex=ctex(512,128,(g,w,h)=>{g.fillStyle='#d9dde3';g.fillRect(0,0,w,h);for(let i=0;i<6;i++){g.fillStyle='#2a2e36';g.fillRect(8+i*84,30,70,98);g.fillStyle='rgba(255,255,255,.08)';for(let k=0;k<10;k++)g.fillRect(8+i*84,34+k*9,70,2);
  g.fillStyle=['#e10600','#1e5bff','#ff8000','#00a86b','#c3c9cf','#ff4fa0'][i];g.fillRect(8+i*84,8,70,14);}});
const numTexCache={};
const numTex2Cache={};
function numTex2(n){if(numTex2Cache[n])return numTex2Cache[n];return numTex2Cache[n]=ctex(128,128,(g)=>{g.clearRect(0,0,128,128);
  g.font='italic 900 104px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=7;g.strokeStyle='rgba(0,0,0,.55)';g.strokeText(String(n),64,70);g.fillStyle='#fff';g.fillText(String(n),64,70);});}
function liveryShader(m,liv){
  m.userData.sec=new THREE.Color(liv.s);m.userData.acc=new THREE.Color(liv.a===liv.p?0x111111:liv.a);
  m.onBeforeCompile=sh=>{sh.uniforms.uSec={value:m.userData.sec};sh.uniforms.uAcc={value:m.userData.acc};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vLP;uniform vec3 uSec,uAcc;
float bnd(float s,float a,float b){float e=0.012;return smoothstep(a-e,a+e,s)-smoothstep(b-e,b+e,s);}`)
    .replace('#include <color_fragment>',`#include <color_fragment>
{float side=smoothstep(0.18,0.42,abs(vLP.x));float s=vLP.z+mix(0.25,1.25,side)*abs(vLP.y-0.55)+1.05*abs(vLP.x);
 float wh=bnd(s,0.42,0.72)+bnd(s,-0.72,-0.46);
 float bk=bnd(s,0.72,0.94)+bnd(s,-0.46,-0.22)+bnd(s,-1.7,-1.52);
 bk=max(bk,(1.-smoothstep(0.30,0.33,vLP.y))*step(0.22,abs(vLP.x)));   // pastki qism qora
 bk=max(bk,step(2.55,vLP.z)*step(vLP.y,0.33));                          // burun osti
 wh=max(wh,bnd(vLP.z,2.82,3.06)*step(0.04,abs(vLP.x)));                 // burun uchidagi oq
 if(vLP.z<-2.3&&vLP.y>0.6){float s2=vLP.z+0.8*vLP.y;wh=bnd(s2,-2.05,-1.9);bk=bnd(s2,-1.9,-1.78)+step(vLP.y,0.7);}   // orqa qanot plitalari
 diffuseColor.rgb=mix(diffuseColor.rgb,uSec,clamp(wh,0.,1.)*(1.-clamp(bk,0.,1.)));
 diffuseColor.rgb=mix(diffuseColor.rgb,uAcc,clamp(bk,0.,1.));}`);};
  m.customProgramCacheKey=()=>'livery1';
}
// ---------- maket proyeksiyasi: kuzovni maket proporsiyasiga cho'zish + maket teksturasi ----------
const ZK=[[-2.4,-2.78],[-1.38,-2.2],[1.62,2.0],[3.1,3.12]];
function zseg(z){let i=0;while(i<ZK.length-2&&z>ZK[i+1][0])i++;return i;}
function zmap(z){const i=zseg(z),a=ZK[i],b=ZK[i+1];return a[1]+(z-a[0])*(b[1]-a[1])/(b[0]-a[0]);}
function zder(z){const i=zseg(z),a=ZK[i],b=ZK[i+1];return (b[1]-a[1])/(b[0]-a[0]);}
let bpTex=null;
function projMat(liv,ghost){
  if(!bpTex)bpTex=imgTex(ASSET.car_bp);
  const m=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0.1,roughness:0.5,clearcoat:0.3,clearcoatRoughness:0.2});m.userData.envK=0.3;
  if(ghost){m.transparent=true;m.opacity=0.3;m.depthWrite=false;}
  const pc=new THREE.Color(liv.p),hsl={};pc.getHSL(hsl);
  const swap=(hsl.s>0.3&&(hsl.h<0.03||hsl.h>0.97))?0:1;
  m.onBeforeCompile=sh=>{sh.uniforms.uBP={value:bpTex};sh.uniforms.uPrim={value:pc};sh.uniforms.uSwap={value:swap};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying vec3 vLN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;vLN=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vLP;varying vec3 vLN;uniform sampler2D uBP;uniform vec3 uPrim;uniform float uSwap;
vec3 bp(vec2 px){return texture2D(uBP,vec2(px.x/1536.,1.-px.y/1536.)).rgb;}`)
    .replace('#include <map_fragment>',`
{vec3 n=normalize(vLN);vec3 w=pow(abs(n),vec3(4.))+1e-4;
 vec3 cS=bp(vec2(200.+(2.0-vLP.z)*181.,350.-vLP.y*180.));
 vec3 cT=bp(vec2(205.+(2.0-vLP.z)*167.,642.+vLP.x*180.));
 vec3 cF=n.z>0.?bp(vec2(1300.+vLP.x*211.,372.-vLP.y*211.)):bp(vec2(384.-vLP.x*330.,1454.-vLP.y*330.));
 vec3 c=(cS*w.x+cT*w.y+cF*w.z)/(w.x+w.y+w.z);
 float red=smoothstep(0.06,0.25,c.r-max(c.g,c.b));
 c=mix(c,uPrim*clamp(c.r/0.62,0.,1.3),red*uSwap);
 diffuseColor.rgb=c;}`);};
  m.customProgramCacheKey=()=>'bp1';return m;
}
function bakeCar(g,drs,pivots,liv,ghost,mats){
  g.updateMatrixWorld(true);
  const skip=new Set();pivots.forEach(p=>p.traverse(o=>skip.add(o)));drs.traverse(o=>skip.add(o));
  const P=new THREE.MeshPhysicalMaterial({color:liv.p,metalness:0.2,roughness:0.42,clearcoat:0.5,clearcoatRoughness:0.15});P.userData.envK=0.4;
  if(ghost){P.transparent=true;P.opacity=0.3;P.depthWrite=false;}liveryShader(P,liv);mats.push(P);
  const projSrc=new Set(mats.filter(m=>m.isMeshPhysicalMaterial||m.map===carbonTex||(m.color&&!m.map&&!m.emissiveIntensity&&m.roughness<0.5&&m.metalness>=0.35&&m.metalness<0.6)));
  const bake=(m,M)=>{let geo=m.geometry.clone().applyMatrix4(M);const p=geo.attributes.position,nr=geo.attributes.normal;
    for(let i=0;i<p.count;i++){const z=p.getZ(i);if(nr){const d=zder(z);const nx=nr.getX(i),ny=nr.getY(i),nz=nr.getZ(i)/d,l=Math.hypot(nx,ny,nz)||1;nr.setXYZ(i,nx/l,ny/l,nz/l);}p.setZ(i,zmap(z));}
    m.geometry=geo;m.position.set(0,0,0);m.quaternion.identity();m.scale.set(1,1,1);m.updateMatrix();};
  const list=[];g.traverse(o=>{if(o.isMesh&&!skip.has(o))list.push(o);});
  for(const m of list){
    const keep=m.geometry.type==='TubeGeometry'||(m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop<0.02)||m.material.transparent&&m.material.map;
    bake(m,m.matrixWorld.clone());
    if(!keep&&(m.material.map===carbonTex||m.material.isMeshPhysicalMaterial&&m.material!==P&&m.material.color.getHex()===liv.p||m.material.color&&[liv.p,liv.s,liv.a].includes(m.material.color.getHex())&&!m.material.emissiveIntensity))m.material=P;
  }
  // DRS: o'z bo'laklari joyida, faqat o'qi suriladi
  drs.position.z=zmap(drs.position.z);
  for(const p of pivots)p.position.z=zmap(p.position.z);
}
// orqa ko'rinish maketi bo'yicha 3D detallar (yangi koordinatalarda): LED chiroq, egzoz, diffuzor qanotchalari
let _rlt=null;
function rainLightTex(){if(_rlt)return _rlt;return _rlt=ctex(64,96,(g)=>{g.fillStyle='#000';g.fillRect(0,0,64,96);g.fillStyle='#fff';
  for(let y=0;y<6;y++)for(let x=0;x<4;x++){g.beginPath();g.arc(10+x*14.6,10+y*15.2,5,0,7);g.fill();}});}
function rearDetails(body,M,carbon,black,metal,brakeMat,cast,eng=0){
  const add=(geo,mat,x,y,z,rx=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.x=rx;m.castShadow=cast;body.add(m);return m;};
  // markaziy blok va LED stop-chiroq
  add(new THREE.BoxGeometry(0.2,0.26,0.2),carbon,0,0.36,-2.6);
  add(new THREE.BoxGeometry(0.13,0.18,0.02),brakeMat,0,0.35,-2.705);
  // egzoz trubasi
  const ex=add(new THREE.CylinderGeometry(0.06,0.065,0.24,18,1,true),metal,0,0.55,-2.64,Math.PI/2);ex.material.side=THREE.DoubleSide;
  const exMat=M({color:0x111111,emissive:0xff6a1a,emissiveIntensity:0});
  add(new THREE.CircleGeometry(0.052,16),exMat,0,0.55,-2.6).rotation.y=Math.PI;
  // diffuzor qanotchalari (vertikal plitalar)
  for(const x of[-0.42,-0.3,-0.18,0.18,0.3,0.42])add(new THREE.BoxGeometry(0.012,0.16,0.45),carbon,x,0.17,-2.55,-0.32);
  for(const sx of[-1,1])add(new THREE.BoxGeometry(0.02,0.2,0.45),carbon,sx*0.5,0.19,-2.55,-0.32);
  // pastki "beam wing" va tirgaklar
  add(new THREE.BoxGeometry(0.95,0.035,0.16),carbon,0,0.6,-2.62,0.25);
  for(const sx of[-1,1]){const r=add(new THREE.BoxGeometry(0.03,0.5,0.04),carbon,sx*0.12,0.75,-2.6);r.rotation.z=sx*0.12;}
  return exMat;
}
// orqa ko'rinish: ChatGPT rasmi aynan o'zi (kamera orqada bo'lganda 3D ustiga chiqadi)
function rearImpostor(liv,front){
  const pc=new THREE.Color(liv.p),hsl={};pc.getHSL(hsl);const swap=(hsl.s>0.3&&(hsl.h<0.03||hsl.h>0.97))?0:1;
  const m=new THREE.MeshBasicMaterial({map:imgTex(front?ASSET.car_front:ASSET.car_rear),transparent:true,opacity:0,alphaTest:0.25,depthWrite:false,toneMapped:true});
  m.onBeforeCompile=sh=>{sh.uniforms.uPrim={value:pc};sh.uniforms.uSwap={value:swap};
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uPrim;uniform float uSwap;')
     .replace('#include <map_fragment>',`#include <map_fragment>
{vec3 c=diffuseColor.rgb;float red=smoothstep(0.06,0.25,c.r-max(c.g,c.b))*step(c.r,0.97);diffuseColor.rgb=mix(c,uPrim*clamp(c.r/0.62,0.,1.3),red*uSwap);}`);};
  m.customProgramCacheKey=()=>'rear1';
  const p=front?new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.153).translate(0,0.576,0),m):new THREE.Mesh(new THREE.PlaneGeometry(2.24,1.49).translate(0,0.745,0),m);
  const piv=new THREE.Group();piv.position.set(0,front?-0.01:-0.245,front?3.25:-2.76);piv.add(p);p.position.y=0;piv.userData.base=front?0:Math.PI;piv.rotation.y=piv.userData.base;
  piv.renderOrder=5;p.renderOrder=5;piv.visible=false;piv.material=m;return piv;
}
function numTex(n){if(numTexCache[n])return numTexCache[n];return numTexCache[n]=ctex(128,128,(g)=>{g.fillStyle='#fff';g.beginPath();g.arc(64,64,58,0,7);g.fill();
  g.fillStyle='#111';g.font='italic 900 70px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),64,70);});}
const STD=o=>new THREE.MeshStandardMaterial(o);
const steel=STD({color:0x2b2f36,metalness:0.7,roughness:0.35});

function disposeObj(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material){(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{if(m.map&&m.map.userData.own)m.map.dispose();if(m!==steel)m.dispose();});}});}

// ======================= DUNYO (TRASSA VA SAHNA) =======================
let world=null,roadMat=null,racingLine=null,startLamps=[],bulbMat=null,poolMat=null,winMat=null,cones=[],CX=0,CZ=0,minX,maxX,minZ,maxZ,standPos=null;
function ribbon(o1,o2,y,vScale,mat,filter,parent){
  const pos=new Float32Array((N+1)*6),uv=new Float32Array((N+1)*4),idx=[];
  for(let i=0;i<=N;i++){const k=i%N;pos.set([PX[k]+LX[k]*o1,y,PZ[k]+LZ[k]*o1,PX[k]+LX[k]*o2,y,PZ[k]+LZ[k]*o2],i*6);const v=i*DS/vScale;uv.set([0,v,1,v],i*4);}
  const flip=o2>o1;
  for(let i=0;i<N;i++){if(filter&&!filter(i))continue;const a=i*2,b=a+1,c=a+2,d=a+3;if(!flip)idx.push(a,b,c,b,d,c);else idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  geo.setIndex(idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat);m.receiveShadow=true;(parent||world).add(m);return m;
}
const flat=o=>Object.assign({roughness:0.95,metalness:0,envMapIntensity:0.3,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1},o);
function atIdx(i,off,y=0){return new THREE.Vector3(PX[i]+LX[i]*off,y,PZ[i]+LZ[i]*off);}
function headAt(i){return Math.atan2(TX[i],TZ[i]);}
function trackClear(x,z,r){for(let i=0;i<N;i+=2){const dx=x-PX[i],dz=z-PZ[i];if(dx*dx+dz*dz<r*r)return false;}return true;}

function buildWorld(){
  if(world){scene.remove(world);disposeObj(world);}
  world=new THREE.Group();scene.add(world);winMats=[];
  const type=TRACK_DEF.type,q=QUAL[S.quality];
  minX=1e9;maxX=-1e9;minZ=1e9;maxZ=-1e9;
  for(let i=0;i<N;i++){minX=Math.min(minX,PX[i]);maxX=Math.max(maxX,PX[i]);minZ=Math.min(minZ,PZ[i]);maxZ=Math.max(maxZ,PZ[i]);}
  CX=(minX+maxX)/2;CZ=(minZ+maxZ)/2;
  keepOut=[];
  const gm=STD({map:type==='city'?cityGroundTex:grassTex,roughness:1,envMapIntensity:0.25});patchGround(gm,type==='city'?0.18:0.3,type==='gp');
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(7000,7000).rotateX(-Math.PI/2),gm);
  ground.position.set(CX,0,CZ);ground.receiveShadow=true;world.add(ground);
  const runTex=type==='city'?concTex:type==='fast'?gravelTex:runoffTex;
  ribbon(HALF_W+CURB_W,WALL_D+0.6,0.01,12,STD(flat({map:runTex})));
  ribbon(-HALF_W-CURB_W,-WALL_D-0.6,0.01,12,STD(flat({map:runTex})));
  roadMat=STD(flat({map:dryRoadTex,normalMap:asphaltNorm,normalScale:new THREE.Vector2(0.8,0.8),roughness:0.88,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));patchGround(roadMat,0.14,false);
  ribbon(HALF_W,-HALF_W,0.02,24,roadMat);
  const curbMat=STD(flat({map:curbTex,roughness:0.6,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  const curbF=i=>Math.abs(KAP[i])>0.0045;
  ribbon(HALF_W,HALF_W+CURB_W,0.03,12,curbMat,curbF);ribbon(-HALF_W,-HALF_W-CURB_W,0.03,12,curbMat,curbF);
  // devorlar
  const wm=STD({map:type==='city'?cityWallTex:wallTex,roughness:0.6,side:THREE.DoubleSide,envMapIntensity:0.5});
  for(const off of[WALL_D+0.3,-WALL_D-0.3]){
    const pos=[],uv=[],idx=[],hgt=type==='city'?1.4:1.1;
    for(let i=0;i<=N;i++){const k=i%N,x=PX[k]+LX[k]*off,z=PZ[k]+LZ[k]*off,u=i*DS/8;pos.push(x,0,z,x,hgt,z);uv.push(u,0,u,1);}
    for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geo.setIndex(idx);geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,wm);m.castShadow=true;m.receiveShadow=true;world.add(m);
  }
  buildStart();buildGridMarks();buildPits();
  standPos=grandstand(Math.round(95/DS),-1,150);
  if(type==='fast')grandstand(Math.round(N*0.5),1,140);
  if(type==='gp')grandstand(Math.round(N*0.62),-1,110);
  billboards(type==='city'?18:14);
  if(type!=='city'){forest(Math.round((type==='fast'?1700:1500)*q.trees*(isTouch?0.75:1)));tufts(q.trees<0.5?0:Math.round(3400*q.trees*(isTouch?0.7:1)));fence();}
  else{sidewalks();buildings();streetTrees();forest(Math.round(160*q.trees));}
  rubber();
  distant(type);
  buildLamps();
  buildRacingLine();
  placeCones();
  buildMiniTrack();
}

function buildStart(){
  const g=new THREE.Group();g.position.copy(atIdx(0,0));g.rotation.y=headAt(0);world.add(g);
  const lt=checkTex.clone();lt.needsUpdate=true;
  const line=new THREE.Mesh(new THREE.PlaneGeometry(HALF_W*2,2).rotateX(-Math.PI/2),STD(flat({map:lt,polygonOffsetFactor:-4,polygonOffsetUnits:-4})));
  line.position.y=0.035;line.receiveShadow=true;g.add(line);
  for(const sx of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.7,7.6,0.7),steel);p.position.set(sx*(WALL_D+0.9),3.8,0);p.castShadow=true;g.add(p);}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(2*WALL_D+2.5,1.5,0.8),steel);beam.position.y=7.3;beam.castShadow=true;g.add(beam);
  const bm=new THREE.MeshBasicMaterial({map:textTex('FORMULA 1a','#111','#fff',1024,96)});
  for(const r of[0,1]){const b=new THREE.Mesh(new THREE.PlaneGeometry(2*WALL_D+2.3,1.3),bm);b.position.set(0,7.3,r?0.41:-0.41);b.rotation.y=r?0:Math.PI;g.add(b);}
  const box=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.7,0.35),STD({color:0x0c0c0c,roughness:0.5}));box.position.set(0,6.15,-0.3);g.add(box);
  startLamps=[];
  for(let i=0;i<5;i++){const m=STD({color:0x330606,emissive:0x000000,roughness:0.3});startLamps.push(m);
    const l=new THREE.Mesh(new THREE.SphereGeometry(0.22,16,12),m);l.position.set(-1.4+i*0.7,6.15,-0.5);g.add(l);}
}
function buildGridMarks(){
  const mat=new THREE.MeshBasicMaterial({color:0xf2f2f2,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  for(let slot=0;slot<8;slot++){const k=Math.round((10+slot*9)/DS),i=(N-k)%N,lat=slot%2?-3:3;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,0.25).rotateX(-Math.PI/2),mat);m.position.copy(atIdx(i,lat,0.036));m.rotation.y=headAt(i);
    m.translateZ(3.2);world.add(m);}
}
function buildPits(){
  const i=Math.round(N-25/DS)%N,g=new THREE.Group();g.position.copy(atIdx(i,WALL_D+9));g.rotation.y=headAt(i);world.add(g);
  const len=110,wallM=STD({color:0xe8eaee,roughness:0.7});
  const b=new THREE.Mesh(new THREE.BoxGeometry(12,7,len),wallM);b.position.y=3.5;b.castShadow=b.receiveShadow=true;g.add(b);
  const gt=garageTex.clone();gt.needsUpdate=true;gt.repeat.set(3,1);
  const front=new THREE.Mesh(new THREE.PlaneGeometry(len,5),STD({map:gt,roughness:0.6}));front.position.set(-6.02,2.5,0);front.rotation.y=-Math.PI/2;g.add(front);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(16,0.5,len+6),STD({color:0x1c1f26,roughness:0.5,metalness:0.4}));roof.position.set(-1.5,7.3,0);roof.castShadow=true;g.add(roof);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(14,2.2),new THREE.MeshBasicMaterial({map:textTex('PIT · 1a','#e10600','#fff')}));
  sign.position.set(-9.55,8.8,0);sign.rotation.y=-Math.PI/2;g.add(sign);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(10,2.2,len-6),STD({color:0x203040,metalness:0.9,roughness:0.08}));glass.position.set(0,9.0,0);g.add(glass);
  keepOut.push({x:g.position.x,z:g.position.z,r:75});
}
function grandstand(i0,side,len){
  const i=(i0+N)%N,g=new THREE.Group();g.position.copy(atIdx(i,0));g.rotation.y=headAt(i);world.add(g);
  const conc=STD({color:0x9aa0a8,roughness:0.9}),base=WALL_D+4;
  for(let r=0;r<7;r++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.65*(r+1),len),conc);b.position.set(side*(base+r*1.8+0.9),0.325*(r+1),0);b.castShadow=b.receiveShadow=true;g.add(b);}
  const slopeL=Math.hypot(7*1.8,7*0.65),ang=Math.atan2(7*0.65,7*1.8);
  const crowd=new THREE.Mesh(new THREE.PlaneGeometry(len,slopeL),STD({map:crowdTex,roughness:0.9}));
  crowd.position.set(side*(base+3.5*1.8),3.5*0.65+0.35,0);
  crowd.lookAt(crowd.position.x-side*Math.sin(ang),crowd.position.y+Math.cos(ang),0);g.add(crowd);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(15,0.4,len+4),STD({color:0xe10600,roughness:0.5,metalness:0.3}));
  roof.position.set(side*(base+6.5),10,0);roof.castShadow=true;g.add(roof);
  for(let k=0;k<6;k++){const p=new THREE.Mesh(new THREE.BoxGeometry(0.35,10,0.35),steel);p.position.set(side*(base+13),5,-len/2+k*len/5);p.castShadow=true;g.add(p);}
  const back=new THREE.Mesh(new THREE.BoxGeometry(0.4,10,len),conc);back.position.set(side*(base+13.2),5,0);back.castShadow=true;g.add(back);
  const sp=atIdx(i,side*(base+6));keepOut.push({x:sp.x,z:sp.z,r:len*0.6+15});return sp;
}
const SPONSORS=[['1a RACING','#e10600','#fff'],['TURBO','#111','#ffd23f'],['APEX','#1e5bff','#fff'],['GRIP','#00a86b','#fff'],['NITRO','#ff8a00','#111'],['PIT LANE','#f5f5f5','#e10600'],['VELOCE','#6a1bff','#fff'],['SPEED','#111','#2ee66b']];
function billboards(n){
  const mats=SP_KEYS.map((k,i)=>STD({map:boardTex(k,['#101114','#f4f4f4','#1b1f2a','#e10600','#101114','#f4f4f4'][i]),roughness:0.6,side:THREE.DoubleSide,emissive:0xffffff,emissiveIntensity:0}));
  mats.forEach(m=>{m.emissiveMap=m.map;});billMats=mats;
  for(let k=0;k<n;k++){
    const i=Math.floor((k+0.5)*N/n),side=k%2?1:-1,p=atIdx(i,side*(WALL_D+3),2.4);
    if(i<60/DS||i>N-120/DS)continue;
    const b=new THREE.Mesh(new THREE.PlaneGeometry(9,2.4),mats[k%mats.length]);
    b.position.copy(p);b.lookAt(PX[i],2.4,PZ[i]);b.castShadow=true;world.add(b);
    for(const dx of[-4,4]){const pp=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.2,0.15),steel);pp.position.set(dx,-1.6,-0.05);b.add(pp);}
  }
}
let billMats=[];
// ---------- o'simliklar: sifatli daraxtlar ----------
let keepOut=[];
const treeU={uTime:{value:0}};
function hash3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
function prep(g){g=g.index?g.toNonIndexed():g;if(g.attributes.uv)g.deleteAttribute('uv');return g;}
function colorGeo(g,c1,c2,y0,y1,jit){
  const p=g.attributes.position,n=p.count,col=new Float32Array(n*3),a=new THREE.Color(c1),b=new THREE.Color(c2),t=new THREE.Color();
  for(let i=0;i<n;i+=3){const j=1+(Math.random()-0.5)*jit;
    for(let k=0;k<3;k++){const q=clamp((p.getY(i+k)-y0)/(y1-y0),0,1);t.copy(a).lerp(b,q);col.set([t.r*j,t.g*j,t.b*j],(i+k)*3);}}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
}
const QDET=()=>(S.quality==='high'&&!isTouch)?2:1;
function blobGeo(r,sy=0.85,det=QDET()){
  let g=new THREE.IcosahedronGeometry(r,det);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g);
  const p=g.attributes.position,sd=Math.random()*10;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=hash3(x*1.3+sd,y*1.3,z*1.3)*0.6+hash3(x*3.1,y*3.1+sd,z*3.1)*0.4;const s=0.82+n*0.36;p.setXYZ(i,x*s,y*s*sy,z*s);}
  g.computeVertexNormals();return g.toNonIndexed();
}
function trunkGeo(r0,r1,h,c=0x4a3322){return colorGeo(prep(new THREE.CylinderGeometry(r0,r1,h,8).translate(0,h/2,0)),c,0x6a4a35,0,h,0.12);}
function pineGeo(){
  const parts=[trunkGeo(0.16,0.3,3.2)];
  for(let i=0;i<5;i++){const r=2.5-i*0.45,h=2.4-i*0.18,y=1.5+i*1.25;
    const c=new THREE.ConeGeometry(r,h,10,2);c.translate(0,y+h/2,0);c.rotateY(Math.random()*3);
    const g=prep(c),p=g.attributes.position;
    for(let k=0;k<p.count;k++){const yy=p.getY(k);if(yy<y+0.05){const x=p.getX(k),z=p.getZ(k);const d=0.85+hash3(x,yy,z)*0.35;p.setXYZ(k,x*d,yy-hash3(z,x,yy)*0.35,z*d);}}
    g.computeVertexNormals();
    parts.push(colorGeo(g,0x17321a,0x3f7038,y,y+h,0.22));}
  return mergeGeometries(parts);
}
function leafyGeo(){
  const parts=[trunkGeo(0.2,0.34,2.8)];
  for(const [rx,rz,len] of [[0.6,0.2,1.6],[-0.5,-0.4,1.4],[0.1,0.7,1.3]]){
    const b=prep(new THREE.CylinderGeometry(0.07,0.13,len,6).translate(0,len/2,0));b.rotateX(rx);b.rotateZ(rz);b.translate(0,2.3,0);parts.push(colorGeo(b,0x4a3322,0x5e4130,0,5,0.1));}
  for(const [x,y,z,r] of [[0,4.3,0,1.9],[1.15,3.9,0.4,1.35],[-1.05,4.0,-0.3,1.45],[0.3,5.0,-0.9,1.3],[-0.4,5.3,0.7,1.2],[0.8,3.5,-0.85,1.1],[-0.7,3.4,0.9,1.0]]){
    parts.push(colorGeo(blobGeo(r),0x2a5320,0x74a344,-r,r,0.25).translate(x,y,z));}
  return mergeGeometries(parts);
}
function poplarGeo(){
  const parts=[trunkGeo(0.14,0.24,2.4,0x5a4636)];
  parts.push(colorGeo(blobGeo(1.3,2.6),0x26501f,0x5f9a3a,-3.4,3.4,0.25).translate(0,5.4,0));
  parts.push(colorGeo(blobGeo(0.9,2.0),0x2b5a22,0x6aa543,-1.8,1.8,0.25).translate(0.35,7.6,0.2));
  return mergeGeometries(parts);
}
function bushGeo(){
  const parts=[];
  for(const [x,y,z,r] of [[0,0.7,0,0.95],[0.75,0.55,0.25,0.7],[-0.7,0.5,-0.2,0.75],[0.1,0.5,0.75,0.6]])parts.push(colorGeo(blobGeo(r,0.8,1),0x2f5a22,0x6f9e40,-r,r,0.3).translate(x,y,z));
  return mergeGeometries(parts);
}
function swayMat(){
  const m=STD({vertexColors:true,roughness:0.86,metalness:0,envMapIntensity:0.4});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=treeU.uTime;
    sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
  vec4 ip=instanceMatrix[3];
  float sw=sin(uTime*1.4+ip.x*0.07+ip.z*0.05)*0.05*max(0.,position.y-2.2)+sin(uTime*3.1+ip.z*0.3)*0.012*max(0.,position.y-2.);
  transformed.x+=sw;transformed.z+=sw*0.6;
#endif`);};
  m.customProgramCacheKey=()=>'sway';return m;
}
function okSpot(x,z,r){if(!trackClear(x,z,r))return false;for(const k of keepOut)if(Math.hypot(x-k.x,z-k.z)<k.r)return false;return true;}
function forest(total){
  if(total<=0)return;
  const type=TRACK_DEF.type,mat=swayMat();
  const defs=[{g:pineGeo(),w:type==='fast'?0.45:type==='city'?0.1:0.3,s:[0.8,1.4],r:12},{g:leafyGeo(),w:type==='city'?0.6:0.36,s:[0.75,1.3],r:12},
    {g:poplarGeo(),w:0.14,s:[0.8,1.25],r:11},{g:bushGeo(),w:0.2,s:[0.6,1.3],r:7}];
  const meshes=defs.map(d=>{const im=new THREE.InstancedMesh(d.g,mat,total);im.count=0;im.castShadow=true;im.receiveShadow=true;world.add(im);return im;});
  const wsum=defs.reduce((a,d)=>a+d.w,0);
  const clusters=[];for(let k=0;k<40&&clusters.length<26;k++){const x=minX-300+Math.random()*(maxX-minX+600),z=minZ-300+Math.random()*(maxZ-minZ+600);if(trackClear(x,z,WALL_D+20))clusters.push([x,z]);}
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),p=new THREE.Vector3(),col=new THREE.Color();
  let n=0,tries=0;
  while(n<total&&tries<total*25){tries++;
    let x,z;const r=Math.random();
    if(r<0.55){const i=(Math.random()*N)|0,side=Math.random()<0.5?1:-1,off=side*(WALL_D+9+Math.pow(Math.random(),1.8)*75);x=PX[i]+LX[i]*off;z=PZ[i]+LZ[i]*off;}
    else if(r<0.85&&clusters.length){const c=clusters[(Math.random()*clusters.length)|0];const a=Math.random()*6.283,d=Math.sqrt(-2*Math.log(Math.random()+1e-6))*35;x=c[0]+Math.cos(a)*d;z=c[1]+Math.sin(a)*d;}
    else{x=minX-350+Math.random()*(maxX-minX+700);z=minZ-350+Math.random()*(maxZ-minZ+700);}
    let pick=Math.random()*wsum,ti=0;while(pick>defs[ti].w&&ti<defs.length-1){pick-=defs[ti].w;ti++;}
    if(!okSpot(x,z,WALL_D+defs[ti].r-6))continue;
    const s=defs[ti].s[0]+Math.random()*(defs[ti].s[1]-defs[ti].s[0]);
    e.set((Math.random()-0.5)*0.08,Math.random()*6.283,(Math.random()-0.5)*0.08);q.setFromEuler(e);
    m.compose(p.set(x,0,z),q,sc.set(s,s*(0.9+Math.random()*0.2),s));
    const im=meshes[ti],k=im.count++;im.setMatrixAt(k,m);
    const v=0.82+Math.random()*0.3;col.setRGB(v*(0.92+Math.random()*0.16),v,v*(0.85+Math.random()*0.2));im.setColorAt(k,col);n++;}
  for(const im of meshes){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}
}
function tufts(count){
  if(count<=0)return;
  const a=new THREE.PlaneGeometry(1.3,0.75).translate(0,0.37,0),b=a.clone().rotateY(Math.PI/2),c=a.clone().rotateY(Math.PI/4);
  const geo=mergeGeometries([a,b,c]);
  const im=new THREE.InstancedMesh(geo,STD({map:tuftTex,alphaTest:0.45,side:THREE.DoubleSide,roughness:1,envMapIntensity:0.3}),count);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),col=new THREE.Color();let n=0,tries=0;
  while(n<count&&tries<count*4){tries++;const i=(Math.random()*N)|0,side=Math.random()<0.5?1:-1,off=side*(WALL_D+1.2+Math.pow(Math.random(),1.5)*45);
    const x=PX[i]+LX[i]*off,z=PZ[i]+LZ[i]*off;if(!okSpot(x,z,WALL_D+1))continue;
    const s=0.6+Math.random()*0.9;q.setFromAxisAngle(up,Math.random()*6.283);m.compose(p.set(x,0,z),q,sc.set(s,s*(0.7+Math.random()*0.6),s));im.setMatrixAt(n,m);
    const v=0.8+Math.random()*0.35;col.setRGB(v,v,v*0.9);im.setColorAt(n,col);n++;}
  im.count=n;im.receiveShadow=true;world.add(im);
}
function fence(){
  for(const off of[WALL_D+0.45,-WALL_D-0.45]){
    const pos=[],uv=[],idx=[],y0=1.1,y1=4.0;
    for(let i=0;i<=N;i++){const k=i%N,x=PX[k]+LX[k]*off,z=PZ[k]+LZ[k]*off,u=i*DS/4;pos.push(x,y0,z,x,y1,z);uv.push(u,0,u,1);}
    for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,STD({map:fenceTex,alphaTest:0.4,side:THREE.DoubleSide,metalness:0.6,roughness:0.45}));world.add(m);
  }
}
function sidewalks(){
  const pm=STD(flat({map:paveTex,roughness:0.85}));
  ribbon(WALL_D+0.6,WALL_D+5.2,0.12,4,pm);ribbon(-WALL_D-0.6,-WALL_D-5.2,0.12,4,pm);
}
function streetTrees(){
  const mat=swayMat(),g=leafyGeo(),cnt=Math.ceil(N*DS/28)*2,im=new THREE.InstancedMesh(g,mat,cnt);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),col=new THREE.Color();let n=0;
  const step=Math.round(28/DS);
  for(let i=0;i<N;i+=step)for(const side of[1,-1]){const p=atIdx((i+(side>0?0:step>>1))%N,side*(WALL_D+3.4));
    if(!trackClear(p.x,p.z,WALL_D+2.5))continue;let bad=false;for(const k of keepOut)if(Math.hypot(p.x-k.x,p.z-k.z)<k.r)bad=true;if(bad)continue;
    const s=0.5+Math.random()*0.15;q.setFromAxisAngle(up,Math.random()*6.28);m.compose(p,q,sc.set(s,s,s));im.setMatrixAt(n,m);
    const v=0.9+Math.random()*0.2;col.setRGB(v,v,v);im.setColorAt(n,col);n++;}
  im.count=n;im.castShadow=im.receiveShadow=true;world.add(im);
}
function buildings(){
  const MAX=120;winMats=[];
  const kinds=[0,1,2].map(k=>{const [map,em]=facade(k);
    const mat=STD({map,emissiveMap:em,emissive:0xffffff,emissiveIntensity:0,roughness:k===0?0.18:0.8,metalness:k===0?0.65:0.1,envMapIntensity:k===0?1.2:0.5});
    winMats.push(mat);const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),mat,MAX);im.count=0;im.castShadow=im.receiveShadow=true;world.add(im);return im;});
  const roofM=STD({color:0x3a3f48,roughness:0.9}),acM=STD({color:0xb0b4ba,roughness:0.5,metalness:0.6}),tankM=STD({color:0x6e5a46,roughness:0.8});
  const roofs=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),roofM,MAX*3);
  const acs=new THREE.InstancedMesh(new THREE.BoxGeometry(2.2,1.3,1.6).translate(0,0.65,0),acM,MAX*6);
  const tanks=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.2,1.2,2.6,12).translate(0,1.3+1.4,0),tankM,MAX);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),p2=new THREE.Vector3();let nr=0,na=0,nt=0;
  for(let i=0;i<N;i+=6)for(const side of[1,-1]){
    const k=Math.random()<0.3?0:Math.random()<0.55?1:2,im=kinds[k];if(im.count>=MAX)continue;
    const w=12+Math.random()*14,d=11+Math.random()*10,h=k===0?40+Math.random()*70:k===1?14+Math.random()*22:20+Math.random()*30;
    const off=side*(WALL_D+6.5+d/2+Math.random()*3),p=atIdx(i,off);
    if(!trackClear(p.x,p.z,WALL_D+5+Math.max(w,d)*0.62))continue;
    let bad=false;for(const ko of keepOut)if(Math.hypot(p.x-ko.x,p.z-ko.z)<ko.r)bad=true;if(bad)continue;
    const hd=headAt(i);q.setFromAxisAngle(up,hd);m.compose(p,q,s.set(w,h,d));im.setMatrixAt(im.count++,m);
    m.compose(p2.copy(p).setY(h),q,s.set(w*0.97,0.5,d*0.97));roofs.setMatrixAt(nr++,m);
    const fx=Math.sin(hd),fz=Math.cos(hd);
    for(let a=0;a<2+(Math.random()*3|0);a++){const lx=(Math.random()-0.5)*w*0.6,lz=(Math.random()-0.5)*d*0.6;
      m.compose(p2.set(p.x+fz*lx+fx*lz,h+0.5,p.z-fx*lx+fz*lz),q,s.set(1,1,1));acs.setMatrixAt(na++,m);}
    if(k===1&&Math.random()<0.6){m.compose(p2.set(p.x,h+0.5,p.z),q,s.set(1,1,1));tanks.setMatrixAt(nt++,m);}
  }
  roofs.count=nr;acs.count=na;tanks.count=nt;for(const x of[roofs,acs,tanks]){x.castShadow=true;world.add(x);}
}
let winMats=[];
function rubber(){
  const pos=[],idx=[];let q=0;
  for(let i=0;i<N;i++){
    if(!(VPROF[(i+8)%N]<VPROF[i]-2.5)||Math.random()>0.1)continue;
    const off=(Math.random()-0.5)*5,len=Math.round((6+Math.random()*14)/DS);
    for(const w of[-0.86,0.86]){for(let k=0;k<len;k++){const a=(i+k)%N,b=(i+k+1)%N,o=off+w+(Math.random()-0.5)*0.05;
      const ax=PX[a]+LX[a]*o,az=PZ[a]+LZ[a]*o,bx=PX[b]+LX[b]*o,bz=PZ[b]+LZ[b]*o,px=LX[a]*0.17,pz=LZ[a]*0.17;
      pos.push(ax+px,0.038,az+pz,ax-px,0.038,az-pz,bx+px,0.038,bz+pz,bx-px,0.038,bz-pz);idx.push(q,q+2,q+1,q+1,q+2,q+3);q+=4;}}
  }
  if(!q)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
  world.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0a0a0a,transparent:true,opacity:0.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5})));
}

function distant(type){
  if(type==='city'){const mat=STD({color:0x5d6b80,roughness:1});
    for(let i=0;i<40;i++){const a=i/40*6.283,r=1100+Math.random()*400,h=60+Math.random()*220,w=40+Math.random()*60;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat);b.position.set(CX+Math.cos(a)*r,h/2,CZ+Math.sin(a)*r);world.add(b);}}
  else{const mat=STD({color:0x5f7d55,roughness:1,flatShading:true});
    for(let i=0;i<18;i++){const a=i/18*6.283+Math.random()*0.2,r=1900+Math.random()*500;
      const h=new THREE.Mesh(new THREE.ConeGeometry(260+Math.random()*260,120+Math.random()*180,7),mat);
      h.position.set(CX+Math.cos(a)*r,40,CZ+Math.sin(a)*r);h.rotation.y=Math.random()*3;world.add(h);}}
}
function buildLamps(){
  const step=Math.round(65/DS),count=Math.ceil(N/step);
  const poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14,0.2,9,6).translate(0,4.5,0),steel,count);
  const arms=new THREE.InstancedMesh(new THREE.BoxGeometry(0.15,0.15,3.2).translate(0,0,1.6),steel,count);
  bulbMat=STD({color:0xfff6e0,emissive:0xfff0cc,emissiveIntensity:0});
  const bulbs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,0.12,1.0),bulbMat,count);
  poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5});
  const pools=new THREE.InstancedMesh(new THREE.PlaneGeometry(22,22).rotateX(-Math.PI/2),poolMat,count);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1),up=new THREE.Vector3(0,1,0);let n=0;
  for(let i=0;i<N;i+=step){const side=(n%2)?1:-1,pp=atIdx(i,side*(WALL_D+1.4));
    q.setFromAxisAngle(up,Math.atan2(-side*LX[i],-side*LZ[i]));
    m.compose(pp,q,one);poles.setMatrixAt(n,m);
    m.compose(pp.clone().setY(8.9),q,one);arms.setMatrixAt(n,m);
    m.compose(atIdx(i,side*(WALL_D-1.6),8.8),q,one);bulbs.setMatrixAt(n,m);
    m.compose(atIdx(i,side*Math.min(HALF_W,WALL_D-5),0.06),q,one);pools.setMatrixAt(n,m);n++;}
  for(const x of[poles,arms,bulbs,pools])x.count=n;
  poles.castShadow=true;world.add(poles);world.add(arms);world.add(bulbs);world.add(pools);
}
function buildRacingLine(){
  const pos=new Float32Array((N+1)*6),col=new Float32Array((N+1)*6),idx=[];
  for(let i=0;i<=N;i++){const k=i%N;pos.set([PX[k]+LX[k]*0.3,0.045,PZ[k]+LZ[k]*0.3,PX[k]-LX[k]*0.3,0.045,PZ[k]-LZ[k]*0.3],i*6);}
  for(let i=0;i<N;i++){const a=i*2;if(i%4<3)idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);
  racingLine=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}));
  racingLine.visible=S.line;world.add(racingLine);colorRacingLine();
}
function colorRacingLine(){
  if(!racingLine)return;const col=racingLine.geometry.attributes.color;
  for(let i=0;i<=N;i++){const k=i%N;let r,g,b;
    const brake=VPROF[(k+8)%N]<VPROF[k]-2.5;
    if(brake){r=1;g=0.15;b=0.1;}else if(VPROF[k]<70*GRIP_ENV){r=1;g=0.85;b=0.1;}else{r=0.2;g=1;b=0.4;}
    col.setXYZ(i*2,r,g,b);col.setXYZ(i*2+1,r,g,b);}
  col.needsUpdate=true;
}
function placeCones(){
  cones=[];
  const coneMat=STD({color:0xff6a00,roughness:0.5}),whiteM=STD({color:0xffffff,roughness:0.4});
  const coneG=new THREE.ConeGeometry(0.24,0.72,14).translate(0,0.36,0),bandG=new THREE.CylinderGeometry(0.135,0.165,0.1,14),baseG=new THREE.BoxGeometry(0.5,0.05,0.5);
  const peaks=[];
  for(let i=0;i<N;i++){const k=Math.abs(KAP[i]);if(k<0.012)continue;
    if(k>=Math.abs(KAP[(i+1)%N])&&k>=Math.abs(KAP[(i-1+N)%N])&&peaks.every(p=>Math.min(Math.abs(p-i),N-Math.abs(p-i))>60))peaks.push(i);}
  for(const pk of peaks.slice(0,8)){const side=Math.sign(KAP[pk]);
    for(let k=-2;k<=2;k++){const i=(pk+k*2+N)%N,off=side*(HALF_W+CURB_W+1.0);
      if(Math.abs(off)>WALL_D-1)continue;
      const grp=new THREE.Group();
      const c=new THREE.Mesh(coneG,coneMat);c.castShadow=true;grp.add(c);
      const band=new THREE.Mesh(bandG,whiteM);band.position.y=0.4;grp.add(band);
      grp.add(new THREE.Mesh(baseG,coneMat));world.add(grp);
      const p=atIdx(i,off);cones.push({grp,ox:p.x,oz:p.z,x:p.x,z:p.z,y:0,vx:0,vz:0,vy:0,rx:0,rz:0,wr:0,hit:false});}}
}
function resetCones(){for(const c of cones)Object.assign(c,{x:c.ox,z:c.oz,y:0,vx:0,vz:0,vy:0,rx:0,rz:0,wr:0,hit:false});}

// ======================= MASHINA DIZAYNI (zamonaviy F1 uslubi) =======================
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),UPV=new THREE.Vector3(0,1,0);
// silliq kuzov: superellips kesimlar bo'yicha "loft" (burundan orqaga, z kamayib boradi)
function loft(secs,{seg=28,sub=5,capS=true,capE=true}={}){
  secs=secs.map(s=>Object.assign({x:0,n:2.4},s));
  const cr=(p0,p1,p2,p3,t)=>0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
  const S=[];
  for(let i=0;i<secs.length-1;i++)for(let k=0;k<sub;k++){const t=k/sub,a=secs[Math.max(0,i-1)],b=secs[i],c=secs[i+1],d=secs[Math.min(secs.length-1,i+2)],o={};
    for(const key of['z','x','y','w','h','n'])o[key]=cr(a[key],b[key],c[key],d[key],t);o.w=Math.max(o.w,0.004);o.h=Math.max(o.h,0.004);o.n=Math.max(o.n,1.6);S.push(o);}
  S.push(secs[secs.length-1]);
  const pos=[],uv=[],idx=[],R=S.length;
  for(let i=0;i<R;i++){const s=S[i],e=2/s.n;for(let j=0;j<seg;j++){const a=j/seg*Math.PI*2,c=Math.cos(a),si=Math.sin(a);
    pos.push(s.x+s.w/2*Math.sign(c)*Math.pow(Math.abs(c),e),s.y+s.h/2*Math.sign(si)*Math.pow(Math.abs(si),e),s.z);uv.push(j/seg,i/(R-1));}}
  for(let i=0;i<R-1;i++)for(let j=0;j<seg;j++){const a=i*seg+j,b=i*seg+(j+1)%seg,c=(i+1)*seg+j,d=(i+1)*seg+(j+1)%seg;idx.push(a,c,b,b,c,d);}
  if(capS){const ci=pos.length/3,s=S[0];pos.push(s.x,s.y,s.z);uv.push(0.5,0);for(let j=0;j<seg;j++)idx.push(ci,j,(j+1)%seg);}
  if(capE){const ci=pos.length/3,s=S[R-1],o=(R-1)*seg;pos.push(s.x,s.y,s.z);uv.push(0.5,1);for(let j=0;j<seg;j++)idx.push(ci,o+(j+1)%seg,o+j);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
// aerodinamik profil (qanot elementi): oldingi qirra +z da
function foilGeo(c,t,span,cam=0.05){
  const s=new THREE.Shape();s.moveTo(c/2,0);
  s.bezierCurveTo(c/2,t*0.9,c*0.15,t*1.05+cam*c*0.5,-c/2,cam*c);
  s.bezierCurveTo(c*0.1,cam*c*0.4-t*0.15,c/2,-t*0.55,c/2,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:span,bevelEnabled:false,curveSegments:10});g.rotateY(-Math.PI/2);g.translate(span/2,0,0);g.computeVertexNormals();return g;
}
function plateGeo(pts,th){
  const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)s.quadraticCurveTo(p[0],p[1],p[2],p[3]);else s.lineTo(p[0],p[1]);}s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:0.005,bevelSize:0.005,bevelSegments:1,curveSegments:8});
  g.rotateY(-Math.PI/2);g.translate(th/2,0,0);return g;
}
function rod(parent,a,b,r,mat,cast){const d=new THREE.Vector3().subVectors(b,a),L=d.length();
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,6),mat);m.position.copy(a).addScaledVector(d,0.5);m.quaternion.setFromUnitVectors(UPV,d.normalize());m.castShadow=cast;parent.add(m);return m;}
// shina: yumaloq yelkali lathe profili
function tireGeo(R,rr,W){
  const sh=0.045,pts=[new THREE.Vector2(rr,-W/2),new THREE.Vector2(R-sh,-W/2)];
  for(let i=1;i<=6;i++){const a=-Math.PI/2+i/6*Math.PI/2;pts.push(new THREE.Vector2(R-sh+Math.cos(a)*sh,-W/2+sh+Math.sin(a)*sh));}
  for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;pts.push(new THREE.Vector2(R-sh+Math.cos(a)*sh,W/2-sh+Math.sin(a)*sh));}
  pts.push(new THREE.Vector2(rr,W/2));
  const g=new THREE.LatheGeometry(pts,44);g.rotateZ(Math.PI/2);return g;
}
// teksturalar: shina yon devori, g'ildirak qopqog'i, homiy yozuvi (o'ylab topilgan brend)
const swCache={},cvCache={},spCache={};
function sidewallTex(col){
  if(swCache[col])return swCache[col];
  return swCache[col]=ctex(512,512,(g)=>{const c=256;g.clearRect(0,0,512,512);
    g.fillStyle='#19191b';g.beginPath();g.arc(c,c,255,0,7);g.arc(c,c,256*0.64,0,7,true);g.fill('evenodd');
    g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=2;for(const f of[0.93,0.69]){g.beginPath();g.arc(c,c,256*f,0,7);g.stroke();}
    g.strokeStyle=col;g.lineWidth=10;g.beginPath();g.arc(c,c,256*0.715,0,7);g.stroke();
    const arcText=(txt,mid,r,size,color)=>{g.font=`italic 900 ${size}px Arial`;g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';
      const ws=[...txt].map(ch=>g.measureText(ch).width),tw=ws.reduce((a,b)=>a+b,0);let a=mid-tw/r/2;
      for(let i=0;i<txt.length;i++){const ca=a+ws[i]/r/2;g.save();g.translate(c+Math.cos(ca)*r,c+Math.sin(ca)*r);g.rotate(ca+Math.PI/2);g.fillText(txt[i],0,0);g.restore();a+=ws[i]/r;}};
    arcText('1a GRIP',-Math.PI/2,256*0.83,40,'#f4f4f4');arcText('1a GRIP',Math.PI/2,256*0.83,40,'#f4f4f4');
    arcText('MEDIUM',0,256*0.83,30,col);arcText('MEDIUM',Math.PI,256*0.83,30,col);});
}
function coverTex(col){
  const k=hex(col);if(cvCache[k])return cvCache[k];
  return cvCache[k]=ctex(256,256,(g)=>{const gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'#3a3e46');gr.addColorStop(0.7,'#1c1f25');gr.addColorStop(1,'#111317');
    g.fillStyle=gr;g.beginPath();g.arc(128,128,128,0,7);g.fill();
    g.strokeStyle=k;g.lineWidth=14;g.beginPath();g.arc(128,128,108,0,7);g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.beginPath();g.arc(128,128,96,0,7);g.stroke();
    g.fillStyle='#e9e9ea';g.font='italic 900 46px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('1a',128,62);
    g.fillStyle='#c9ccd1';g.beginPath();g.arc(128,128,20,0,7);g.fill();g.fillStyle='#55595f';g.beginPath();g.arc(128,128,9,0,7);g.fill();
    g.fillStyle=k;for(let i=0;i<5;i++){const a=i/5*6.283;g.beginPath();g.arc(128+Math.cos(a)*34,128+Math.sin(a)*34,5,0,7);g.fill();}});
}
const SP_KEYS=['sp_turbo','sp_apex','sp_grip','sp_nitro','sp_veloce','sp_1a'],spCache2={};
function imgTex(src,cb){const im=new Image();const t=new THREE.Texture(im);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;im.onload=()=>{if(cb)cb(t,im);else t.needsUpdate=true;};im.src=src;return t;}
function spTex(k){if(spCache2[k])return spCache2[k];return spCache2[k]=imgTex(ASSET[k]);}
function boardTex(k,bg){const cv=document.createElement('canvas');cv.width=512;cv.height=136;const g=cv.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,136);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;t.userData.own=true;
  const im=new Image();im.onload=()=>{const s=Math.min(470/im.width,116/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,(512-w)/2,(136-h)/2,w,h);t.needsUpdate=true;};im.src=ASSET[k];return t;}
function sponsorTex(txt,col){
  const k=txt+col;if(spCache[k])return spCache[k];
  return spCache[k]=ctex(512,128,(g)=>{g.clearRect(0,0,512,128);g.font='italic 900 76px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';
    g.lineWidth=7;g.strokeStyle='rgba(0,0,0,.35)';g.strokeText(txt,256,68);g.fillStyle=col;g.fillText(txt,256,68);});
}

function makeCarMesh(liv,num,ghost,opt){
  opt=opt||{tier:0,parts:{eng:0,aero:0,tyre:0,brake:0}};const TIER=[0x24272d,0xb9bec6,0xd4af37,0x15161a][opt.tier]||0x24272d,pa=opt.parts;
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const mats=[],cast=!ghost;
  const M=(o,phys)=>{const m=phys?new THREE.MeshPhysicalMaterial(o):new THREE.MeshStandardMaterial(o);if(ghost){m.transparent=true;m.opacity=0.3;m.depthWrite=false;}mats.push(m);return m;};
  const paint=M({color:liv.p,metalness:0.5,roughness:0.27,clearcoat:1,clearcoatRoughness:0.04},true);
  // ChatGPT maketi bo'yicha livreya: oldinga qaragan oq-qora chevronlar, qora pastki qism
  const livery=M({color:liv.p,metalness:0.5,roughness:0.27,clearcoat:1,clearcoatRoughness:0.04},true);
  liveryShader(livery,liv);
  const paint2=M({color:liv.s,metalness:0.4,roughness:0.3,clearcoat:1,clearcoatRoughness:0.06},true);
  const acc=M({color:liv.a,metalness:0.4,roughness:0.35});
  const carbon=M({color:0xffffff,map:carbonTex,metalness:0.5,roughness:0.33});
  const black=M({color:0x0a0a0c,roughness:0.5});
  const gloss=M({color:0x050506,roughness:0.08,metalness:0.6});
  const metal=M({color:0xc9ccd1,metalness:1,roughness:0.25});
  const mk=(geo,mat,parent=body)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=cast;parent.add(m);return m;};
  const decal=(tex,w,h,x,y,z,ry,rx=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M({map:tex,transparent:true,roughness:0.35,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.position.set(x,y,z);m.rotation.set(rx,ry,0,'YXZ');body.add(m);return m;};

  // pol va diffuzor
  const fs=new THREE.Shape();fs.moveTo(-0.6,1.25);fs.lineTo(0.6,1.25);fs.quadraticCurveTo(0.82,1.0,0.84,0.6);fs.lineTo(0.84,-0.95);fs.quadraticCurveTo(0.8,-1.2,0.58,-1.88);fs.lineTo(-0.58,-1.88);fs.quadraticCurveTo(-0.8,-1.2,-0.84,-0.95);fs.lineTo(-0.84,0.6);fs.quadraticCurveTo(-0.82,1.0,-0.6,1.25);
  const fg=new THREE.ExtrudeGeometry(fs,{depth:0.035,bevelEnabled:false,curveSegments:8});fg.rotateX(Math.PI/2);fg.translate(0,0.115,0);mk(fg,carbon);
  for(const sg of[-1,1]){const e=mk(new THREE.BoxGeometry(0.02,0.07,1.5),carbon);e.position.set(sg*0.835,0.14,-0.15);}
  const dif=mk(new THREE.BoxGeometry(1.0,0.02,0.46),carbon);dif.position.set(0,0.17,-2.04);dif.rotation.x=-0.28;
  for(const x of[-0.33,0,0.33]){const st=mk(new THREE.BoxGeometry(0.015,0.14,0.44),carbon);st.position.set(x,0.2,-2.04);st.rotation.x=-0.28;}

  // burun + monokok
  const mono=loft([{z:3.0,y:0.285,w:0.1,h:0.07,n:2},{z:2.7,y:0.31,w:0.2,h:0.13},{z:2.2,y:0.36,w:0.3,h:0.22},{z:1.6,y:0.43,w:0.44,h:0.32},
    {z:1.05,y:0.5,w:0.6,h:0.42,n:2.6},{z:0.55,y:0.52,w:0.72,h:0.46,n:3},{z:0.0,y:0.5,w:0.8,h:0.46,n:3.2},{z:-0.35,y:0.48,w:0.76,h:0.42,n:3}],{sub:6});
  mk(mono,livery);
  // kokpit
  mk(loft([{z:0.64,y:0.742,w:0.34,h:0.02},{z:0.32,y:0.752,w:0.46,h:0.03},{z:-0.04,y:0.742,w:0.42,h:0.03}],{sub:4}),black);
  for(const sg of[-1,1]){const pad=mk(new THREE.BoxGeometry(0.06,0.09,0.32),paint2);pad.position.set(sg*0.2,0.78,0.05);}
  const wheelS=mk(new THREE.BoxGeometry(0.26,0.09,0.03),black);wheelS.position.set(0,0.8,0.44);wheelS.rotation.x=-0.5;
  // haydovchi dubulg'asi + ko'zoynak
  const helm=new THREE.MeshPhysicalMaterial({color:liv.s,roughness:0.18,metalness:0.3,clearcoat:1});if(ghost){helm.transparent=true;helm.opacity=0.3;helm.depthWrite=false;}mats.push(helm);
  const hm=mk(new THREE.SphereGeometry(0.155,22,16),helm);hm.position.set(0,0.86,0.12);hm.scale.set(1,1,1.08);
  const vis=mk(new THREE.SphereGeometry(0.158,18,8,Math.PI/2-0.8,1.6,1.15,0.42),gloss);vis.position.set(0,0.86,0.12);vis.scale.set(1,1,1.08);
  const hs=mk(new THREE.TorusGeometry(0.155,0.012,6,24,Math.PI),acc);hs.position.set(0,0.86,0.12);hs.rotation.set(0,Math.PI/2,0);
  // havo qabul qilgich va dvigatel qopqog'i
  mk(loft([{z:0.2,y:0.93,w:0.26,h:0.22,n:2.2},{z:0.0,y:0.92,w:0.34,h:0.3},{z:-0.4,y:0.84,w:0.46,h:0.5,n:2.6},{z:-0.95,y:0.7,w:0.5,h:0.56,n:2.8},
    {z:-1.5,y:0.58,w:0.38,h:0.4},{z:-2.0,y:0.47,w:0.2,h:0.22},{z:-2.22,y:0.44,w:0.12,h:0.13}],{sub:6}),livery);
  const intake=mk(new THREE.CircleGeometry(1,24),black);intake.scale.set(0.1,0.08,1);intake.position.set(0,0.94,0.203);
  const tst=mk(new THREE.BoxGeometry(0.03,0.09,0.04),black);tst.position.set(0,1.11,-0.02);   // kamera ustuni
  const tcam=mk(new THREE.CylinderGeometry(0.045,0.045,0.17,14),black);tcam.rotation.x=Math.PI/2;tcam.position.set(0,1.17,-0.02);
  const tcl=mk(new THREE.CircleGeometry(0.03,12),gloss);tcl.position.set(0,1.17,0.066);
  mk(plateGeo([[-0.1,1.02],[-1.72,0.93],[-1.72,0.8],[-0.45,0.9]],0.012),paint2);
  // yon pontonlar (pastki kesik va pastga tushuvchi shakl)
  for(const sg of[-1,1]){
    mk(loft([{z:0.8,x:sg*0.6,y:0.5,w:0.3,h:0.28,n:3},{z:0.52,x:sg*0.63,y:0.47,w:0.44,h:0.38,n:3},{z:-0.1,x:sg*0.6,y:0.44,w:0.42,h:0.36,n:2.8},
      {z:-0.8,x:sg*0.5,y:0.37,w:0.3,h:0.28,n:2.5},{z:-1.5,x:sg*0.36,y:0.3,w:0.13,h:0.15,n:2.3}],{sub:6}),livery);
    const inl=mk(new THREE.CircleGeometry(1,24),black);inl.scale.set(0.125,0.115,1);inl.position.set(sg*0.6,0.5,0.803);
    decal(numTex2(num),0.24,0.32,sg*0.665,0.43,-0.71,sg*Math.PI/2);
    // oynalar
    rod(body,V3(sg*0.36,0.62,0.52),V3(sg*0.48,0.79,0.6),0.012,carbon,cast);
    const mh=mk(new THREE.SphereGeometry(1,16,10),paint);mh.scale.set(0.12,0.05,0.05);mh.position.set(sg*0.52,0.8,0.62);
    const mg=mk(new THREE.PlaneGeometry(0.2,0.075),gloss);mg.position.set(sg*0.52,0.8,0.567);mg.rotation.y=Math.PI;
  }
  decal(numTex2(num),0.2,0.19,0,0.605,1.62,0,-Math.PI/2+0.12);
  // halo
  const hc=new THREE.CatmullRomCurve3([V3(-0.3,0.74,-0.12),V3(-0.31,0.93,0.02),V3(-0.24,0.99,0.2),V3(0,1.0,0.32),V3(0.24,0.99,0.2),V3(0.31,0.93,0.02),V3(0.3,0.74,-0.12)]);
  mk(new THREE.TubeGeometry(hc,48,0.03,10,false),carbon);
  mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0,1.0,0.32),V3(0,0.92,0.48),V3(0,0.76,0.6)]),12,0.026,8,false),carbon);
  // old qanot (ajraladigan guruh): asosiy tekislik + 3 egilgan element + yon plitalar
  const fwing=new THREE.Group();body.add(fwing);
  const mp=mk(foilGeo(0.5,0.035,1.9,0.03),carbon,fwing);mp.position.set(0,0.1,2.82);mp.rotation.x=0.05;
  [[0.15,2.69,0.24,0.32,paint],[0.205,2.57,0.2,0.58,paint2],[0.26,2.47,0.17,0.85,paint]].forEach(([y,z,ch,aoa,mat])=>{
    for(const sg of[-1,1]){const e=mk(foilGeo(ch,0.02,0.8,0.05),mat,fwing);e.position.set(sg*0.55,y,z);e.rotation.set(aoa,0,-sg*0.1);}});
  for(const sg of[-1,1]){const ep=mk(plateGeo([[3.08,0.05],[2.42,0.05],[2.42,0.24],[2.52,0.34],[2.8,0.36],[3.08,0.2]],0.02),acc,fwing);ep.position.x=sg*0.965;}
  // orqa qanot + DRS + beam wing
  for(const sg of[-1,1]){const ep=mk(plateGeo([[-1.78,0.6],[-1.78,1.07],[-1.95,1.16],[-2.28,1.12],[-2.35,0.95],[-2.24,0.6]],0.022),livery);ep.position.x=sg*0.53;
    }
  const rw=mk(foilGeo(0.36+0.012*pa.aero,0.04,1.04,0.08),paint);rw.position.set(0,0.94,-2.06);rw.rotation.x=0.18+0.03*pa.aero;
  if(pa.aero>=2){const gf=mk(new THREE.BoxGeometry(1.0,0.035,0.012),acc);gf.position.set(0,1.0+0.006*pa.aero,-2.24);}
  if(opt.tier>=2)for(const sx of[-1,1]){const wl=mk(foilGeo(0.14,0.015,0.22,0.05),carbon);wl.position.set(sx*0.42,0.66,1.95);wl.rotation.set(0.4,0,sx*0.3);}
  const drs=new THREE.Group();drs.position.set(0,1.04,-1.92);body.add(drs);
  const fl=mk(foilGeo(0.25,0.03,1.02,0.05),paint,drs);fl.position.set(0,0,-0.125);drs.rotation.x=0.5;
  for(const [y,z] of[[0.43,-2.1],[0.5,-2.0]]){const bw=mk(foilGeo(0.16,0.018,0.84,0.05),carbon);bw.position.set(0,y,z);bw.rotation.x=0.3;}
  mk(plateGeo([[-1.88,0.5],[-1.97,0.95],[-2.05,0.95],[-2.03,0.5]],0.028),carbon);
  const brakeMat=M({color:0x150000,emissive:0xff1a1a,emissiveMap:rainLightTex(),emissiveIntensity:0.3});
  // osma (richaglar, pushrod/pullrod)
  for(const sg of[-1,1]){
    const F=(a,b)=>rod(g,a,b,0.015,carbon,cast);
    F(V3(sg*0.22,0.55,1.88),V3(sg*0.66,0.5,1.62));F(V3(sg*0.22,0.55,1.38),V3(sg*0.66,0.5,1.62));
    F(V3(sg*0.2,0.26,1.92),V3(sg*0.68,0.2,1.62));F(V3(sg*0.2,0.26,1.32),V3(sg*0.68,0.2,1.62));
    F(V3(sg*0.66,0.22,1.6),V3(sg*0.22,0.6,1.5));F(V3(sg*0.22,0.4,1.76),V3(sg*0.66,0.38,1.7));
    F(V3(sg*0.3,0.55,-1.12),V3(sg*0.66,0.55,-1.38));F(V3(sg*0.25,0.55,-1.62),V3(sg*0.66,0.55,-1.38));
    F(V3(sg*0.28,0.24,-1.08),V3(sg*0.68,0.2,-1.38));F(V3(sg*0.25,0.24,-1.66),V3(sg*0.68,0.2,-1.38));
    F(V3(sg*0.66,0.55,-1.4),V3(sg*0.25,0.28,-1.24));
  }
  // g'ildiraklar: 18 dyuym, past profilli shina, yon devor yozuvi, g'ildirak qopqog'i
  const tireMat=M({color:0x141416,roughness:0.7,metalness:0,side:THREE.DoubleSide});
  const swMat=M({map:sidewallTex(['#ffd23f','#ffd23f','#ff9f1a','#ff3b3b','#c34bff','#ffd700'][pa.tyre]||'#ffd23f'),transparent:true,roughness:0.55,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const cvMat=M({map:coverTex(liv.p===0x121212?liv.s:liv.p),metalness:0.6,roughness:0.32});
  const rimMat=M({color:TIER,metalness:0.9,roughness:0.28});
  const discMat=M({color:pa.brake>=3?0xb31217:0x2a2a2a,emissive:0xff4a10,emissiveIntensity:0,metalness:0.6,roughness:0.4});
  const R=0.36,RR=0.232,wheels=[];
  for(const [x,z,W,front] of [[0.86,1.62,0.305,1],[-0.86,1.62,0.305,1],[0.86,-1.38,0.405,0],[-0.86,-1.38,0.405,0]]){
    const sgn=Math.sign(x),pivot=new THREE.Group();pivot.position.set(x,R,z);g.add(pivot);
    const spin=new THREE.Group();pivot.add(spin);
    const t=new THREE.Mesh(tireGeo(R,RR,W),tireMat);t.castShadow=cast;spin.add(t);
    for(const side of[1,-1]){const sw=new THREE.Mesh(new THREE.RingGeometry(RR,R-0.012,56),swMat);sw.position.x=side*(W/2+0.002);sw.rotation.y=side*Math.PI/2;spin.add(sw);}
    const cv=new THREE.Mesh(new THREE.CircleGeometry(RR-0.004,40),cvMat);cv.position.x=sgn*(W/2-0.025);cv.rotation.y=sgn*Math.PI/2;spin.add(cv);
    const cvi=new THREE.Mesh(new THREE.CircleGeometry(RR-0.004,24),rimMat);cvi.position.x=-sgn*(W/2-0.03);cvi.rotation.y=-sgn*Math.PI/2;spin.add(cvi);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(RR,0.011,8,48),rimMat);lip.position.x=sgn*(W/2-0.006);lip.rotation.y=Math.PI/2;spin.add(lip);
    const disc=new THREE.Mesh(new THREE.TorusGeometry(RR*0.72,0.03,6,28),discMat);disc.position.x=-sgn*(W/2-0.06);disc.rotation.y=Math.PI/2;pivot.add(disc);
    if(front){const arc=[];for(let i=0;i<=10;i++){const ph=1.25+i/10*1.35;arc.push(V3(0,R*1.13*Math.sin(ph),-R*1.13*Math.cos(ph)));}
      for(const dx of[-0.09,0.09]){const d=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc),16,0.009,5,false),carbon);d.position.x=dx;pivot.add(d);}}
    wheels.push({pivot,spin,front});
  }
  if(!ghost){const blob=new THREE.Mesh(new THREE.PlaneGeometry(2.5,5.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5}));
    blob.position.y=0.045;g.add(blob);}
  bakeCar(g,drs,wheels.map(w=>w.pivot),liv,ghost,mats);
  const exMat=rearDetails(body,M,carbon,black,metal,brakeMat,cast,pa.eng);
  let rear=null,front=null;
  return {g,body,wheels,fwing,drs,brakeMat,discMat,mats,rear,front,exMat,engLv:pa.eng};
}

// ======================= EFFEKTLAR =======================
// tutun / chang / sachratqi
const PMAX=700,pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3),pSize=new Float32Array(PMAX),pAlpha=new Float32Array(PMAX),
  pVel=new Float32Array(PMAX*3),pLife=new Float32Array(PMAX),pMaxL=new Float32Array(PMAX),pGrow=new Float32Array(PMAX),pA0=new Float32Array(PMAX);
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('col',new THREE.BufferAttribute(pCol,3));
pGeo.setAttribute('size',new THREE.BufferAttribute(pSize,1));pGeo.setAttribute('alpha',new THREE.BufferAttribute(pAlpha,1));
const pMat=new THREE.ShaderMaterial({uniforms:{scale:{value:400}},transparent:true,depthWrite:false,
  vertexShader:`attribute float size;attribute float alpha;attribute vec3 col;uniform float scale;varying float vA;varying vec3 vC;
    void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(400.,size*scale/max(-mv.z,.1));vA=alpha;vC=col;}`,
  fragmentShader:`varying float vA;varying vec3 vC;void main(){vec2 d=gl_PointCoord-.5;float r=length(d)*2.;if(r>1.)discard;float n=.82+.18*sin(d.x*19.+d.y*13.)*cos(d.y*17.-d.x*7.);gl_FragColor=vec4(vC*(.9+.12*(1.-r)),pow(1.-r,1.6)*vA*n);}`});
const particles=new THREE.Points(pGeo,pMat);particles.frustumCulled=false;scene.add(particles);
let pHead=0;
function emit(x,y,z,vx,vy,vz,r,g,b,size,grow,life,a0){const i=pHead;pHead=(pHead+1)%PMAX;
  pPos.set([x,y,z],i*3);pVel.set([vx,vy,vz],i*3);pCol.set([r,g,b],i*3);pSize[i]=size;pGrow[i]=grow;pLife[i]=pMaxL[i]=life;pA0[i]=a0;pAlpha[i]=0;}
function updateParticles(dt){
  pMat.uniforms.scale.value=renderer.domElement.height*0.5/Math.tan(camera.fov*Math.PI/360);
  const damp=Math.pow(0.35,dt);
  for(let i=0;i<PMAX;i++){if(pLife[i]<=0){pAlpha[i]=0;continue;}pLife[i]-=dt;const t=1-pLife[i]/pMaxL[i],j=i*3;
    pVel[j]*=damp;pVel[j+2]*=damp;pVel[j+1]*=damp;pPos[j]+=pVel[j]*dt;pPos[j+1]+=pVel[j+1]*dt;pPos[j+2]+=pVel[j+2]*dt;
    pSize[i]+=pGrow[i]*dt;pAlpha[i]=pLife[i]<=0?0:pA0[i]*(1-t)*Math.min(1,t*8);}
  for(const k of['position','size','alpha','col'])pGeo.attributes[k].needsUpdate=true;
}
function clearParticles(){pLife.fill(0);pAlpha.fill(0);}

// shina izlari
const SKID_MAX=1400,skidPos=new Float32Array(SKID_MAX*12),skidGeo=new THREE.BufferGeometry();
skidGeo.setAttribute('position',new THREE.BufferAttribute(skidPos,3));
{const ix=new Uint16Array(SKID_MAX*6);for(let i=0;i<SKID_MAX;i++){const a=i*4;ix.set([a,a+2,a+1,a+1,a+2,a+3],i*6);}skidGeo.setIndex(new THREE.BufferAttribute(ix,1));}
const skidMesh=new THREE.Mesh(skidGeo,new THREE.MeshBasicMaterial({color:0x0a0a0a,transparent:true,opacity:0.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6,side:THREE.DoubleSide}));
skidMesh.frustumCulled=false;scene.add(skidMesh);
let skidHead=0;
function addSkid(x1,z1,x2,z2,w){const dx=x2-x1,dz=z2-z1,l=Math.hypot(dx,dz);if(l<0.05)return;const px=dz/l*w/2,pz=-dx/l*w/2,y=0.04;
  skidPos.set([x1+px,y,z1+pz,x1-px,y,z1-pz,x2+px,y,z2+pz,x2-px,y,z2-pz],skidHead*12);skidHead=(skidHead+1)%SKID_MAX;skidGeo.attributes.position.needsUpdate=true;}
function clearSkids(){skidPos.fill(0);skidGeo.attributes.position.needsUpdate=true;}

// uchqunlar: issiq metall chiziqlari (oq → sariq → to'q sariq → qizil), yerdan sakraydi
const SPK=700,spP=new Float32Array(SPK*3),spV=new Float32Array(SPK*3),spL=new Float32Array(SPK),spM=new Float32Array(SPK);
const spLinePos=new Float32Array(SPK*6),spLineCol=new Float32Array(SPK*6),spHeadPos=new Float32Array(SPK*3),spHeadCol=new Float32Array(SPK*3);
const spLineGeo=new THREE.BufferGeometry();spLineGeo.setAttribute('position',new THREE.BufferAttribute(spLinePos,3));spLineGeo.setAttribute('color',new THREE.BufferAttribute(spLineCol,3));
const spHeadGeo=new THREE.BufferGeometry();spHeadGeo.setAttribute('position',new THREE.BufferAttribute(spHeadPos,3));spHeadGeo.setAttribute('color',new THREE.BufferAttribute(spHeadCol,3));
const sparkLines=new THREE.LineSegments(spLineGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
const sparkHeads=new THREE.Points(spHeadGeo,new THREE.PointsMaterial({size:0.075,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
sparkLines.frustumCulled=sparkHeads.frustumCulled=false;scene.add(sparkLines);scene.add(sparkHeads);
let spHead=0;
function spawnSparks(x,y,z,n,bvx,bvz,nx=0,nz=0,power=1,trail=false){
  for(let k=0;k<n;k++){const i=spHead;spHead=(spHead+1)%SPK;
    const a=Math.random()*6.283,sp=(2+Math.random()*9)*power;
    let vx=bvx*(trail?1:0.55)+Math.cos(a)*sp+nx*Math.random()*7*power,vz=bvz*(trail?1:0.55)+Math.sin(a)*sp+nz*Math.random()*7*power;
    const vy=trail?0.5+Math.random()*2.2:1+Math.random()*6*power;
    spP.set([x+(Math.random()-0.5)*0.3,y,z+(Math.random()-0.5)*0.3],i*3);spV.set([vx,vy,vz],i*3);
    spL[i]=spM[i]=(trail?0.18:0.3)+Math.random()*(trail?0.3:0.75);}
}
function updateSparks(dt){
  const drag=Math.pow(0.55,dt);
  for(let i=0;i<SPK;i++){const j=i*3,j6=i*6;
    if(spL[i]<=0){spLineCol.fill(0,j6,j6+6);spHeadCol.fill(0,j,j+3);continue;}
    spL[i]-=dt;spV[j+1]-=G*dt;spV[j]*=drag;spV[j+2]*=drag;
    spP[j]+=spV[j]*dt;spP[j+1]+=spV[j+1]*dt;spP[j+2]+=spV[j+2]*dt;
    if(spP[j+1]<0.03){spP[j+1]=0.03;spV[j+1]=Math.abs(spV[j+1])*0.35;spV[j]*=0.7;spV[j+2]*=0.7;}
    const t=1-Math.max(0,spL[i])/spM[i];let r,g,b;
    if(t<0.12){r=3;g=2.7;b=2.0;}else if(t<0.45){const u=(t-0.12)/0.33;r=2.6;g=1.9-u*0.9;b=0.8-u*0.65;}else{const u=(t-0.45)/0.55;r=2.2*(1-u);g=0.9*(1-u)*(1-u);b=0.1*(1-u);}
    if(spL[i]<=0){r=g=b=0;}
    const L=0.03;spLinePos.set([spP[j],spP[j+1],spP[j+2],spP[j]-spV[j]*L,spP[j+1]-spV[j+1]*L,spP[j+2]-spV[j+2]*L],j6);
    spLineCol.set([r,g,b,r*0.25,g*0.15,b*0.1],j6);spHeadPos.set([spP[j],spP[j+1],spP[j+2]],j);spHeadCol.set([r,g,b],j);}
  spLineGeo.attributes.position.needsUpdate=spLineGeo.attributes.color.needsUpdate=true;
  spHeadGeo.attributes.position.needsUpdate=spHeadGeo.attributes.color.needsUpdate=true;
}
// urilish chaqnashi: yorug'lik + porlash
const flashLight=new THREE.PointLight(0xffb060,0,24,2);scene.add(flashLight);
const flashSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,color:0xffe0b0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,toneMapped:false}));
flashSpr.visible=false;scene.add(flashSpr);let flashT=0,flashBase=0,flashScale=1;
function flash(x,y,z,str){flashLight.position.set(x,y+0.5,z);flashBase=Math.min(160,str*9);flashT=0.16;flashSpr.position.set(x,y+0.35,z);flashScale=1.4+str*0.14;flashSpr.visible=true;flashSpr.material.rotation=Math.random()*6.28;}
function updateFlash(dt){if(flashT<=0){flashLight.intensity=0;flashSpr.visible=false;return;}
  flashT-=dt;const k=Math.max(0,flashT/0.16);flashLight.intensity=flashBase*k*k;flashSpr.material.opacity=Math.min(1,k*1.4);flashSpr.scale.setScalar(flashScale*(1.6-k*0.6));}
// uchib ketadigan kuzov bo'laklari
const shardGeo=new THREE.BoxGeometry(0.16,0.025,0.24),shardGeo2=new THREE.BoxGeometry(0.08,0.02,0.32);
function spawnShards(car,x,z,nx,nz,n){
  const mats=[car.mesh.mats[0],car.mesh.mats[3]];
  for(let k=0;k<n;k++){const o=new THREE.Mesh(Math.random()<0.5?shardGeo:shardGeo2,mats[k%2]);o.position.set(x,0.4+Math.random()*0.3,z);o.castShadow=true;scene.add(o);
    debris.push({obj:o,vx:car.vx*0.5+nx*(2+Math.random()*5)+(Math.random()-0.5)*5,vy:2+Math.random()*5,vz:car.vz*0.5+nz*(2+Math.random()*5)+(Math.random()-0.5)*5,
      wx:(Math.random()-0.5)*20,wy:(Math.random()-0.5)*20,life:6});}
}

// yomg'ir
const RN=1600,rainPos=new Float32Array(RN*6),rainGeo=new THREE.BufferGeometry();
rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainLines=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb8c4d0,transparent:true,opacity:0.45}));
rainLines.frustumCulled=false;rainLines.visible=false;scene.add(rainLines);
const rainD=new Float32Array(RN*3);for(let i=0;i<RN;i++)rainD.set([(Math.random()-0.5)*70,Math.random()*30,(Math.random()-0.5)*70],i*3);
function updateRain(dt){
  if(!rainLines.visible)return;const cx=camera.position.x,cz=camera.position.z,vx=player?player.vx:0,vz=player?player.vz:0;
  for(let i=0;i<RN;i++){const j=i*3;rainD[j+1]-=30*dt;if(rainD[j+1]<0)rainD[j+1]+=30;
    let x=rainD[j],z=rainD[j+2];
    const ax=((x-cx)%70+105)%70-35+cx,az=((z-cz)%70+105)%70-35+cz;
    rainPos.set([ax,rainD[j+1],az,ax+vx*0.02,rainD[j+1]+0.7,az+vz*0.02],i*6);}
  rainGeo.attributes.position.needsUpdate=true;
}

// uchib ketgan qismlar
let debris=[];
function clearDebris(){for(const d of debris){scene.remove(d.obj);}debris=[];}

// ======================= OVOZ =======================
let actx=null,snd={};
function noiseBuf(){const b=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
function initAudio(){
  if(actx){actx.resume();return;}
  try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  const master=actx.createGain();master.gain.value=S.sound?0.5:0;master.connect(actx.destination);
  const nb=noiseBuf();
  const loopNoise=(type,f,q,gain)=>{const s=actx.createBufferSource();s.buffer=nb;s.loop=true;const fl=actx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=actx.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start(0,Math.random()*1.5);return g;};
  // dvigatel
  const shaper=actx.createWaveShaper();const cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(2.2*x);}shaper.curve=cv;
  const ef=actx.createBiquadFilter();ef.type='lowpass';ef.Q.value=3;const eg=actx.createGain();eg.gain.value=0;
  const o1=actx.createOscillator();o1.type='sawtooth';const o2=actx.createOscillator();o2.type='square';const o3=actx.createOscillator();o3.type='sawtooth';
  const g2=actx.createGain();g2.gain.value=0.35;const g3=actx.createGain();g3.gain.value=0.15;
  o1.connect(shaper);o2.connect(g2);g2.connect(shaper);o3.connect(g3);g3.connect(shaper);shaper.connect(ef);ef.connect(eg);eg.connect(master);
  o1.start();o2.start();o3.start();
  // raqib dvigateli
  const ao=actx.createOscillator();ao.type='sawtooth';const af=actx.createBiquadFilter();af.type='lowpass';af.frequency.value=900;const ag=actx.createGain();ag.gain.value=0;
  ao.connect(af);af.connect(ag);ag.connect(master);ao.start();
  snd={master,nb,ef,eg,o1,o2,o3,ao,ag,sg:loopNoise('bandpass',1700,3),cg:loopNoise('lowpass',700,0.7),rg:loopNoise('highpass',2600,0.5)};
}
function setSound(on){S.sound=on;saveS();if(snd.master)snd.master.gain.value=on?0.5:0;$('#btnSnd2').textContent=t(on?'snd_on':'snd_off');}
function beep(f,dur=0.18,vol=0.25){if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.type='square';o.frequency.value=f;
  g.gain.setValueAtTime(vol,actx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);o.connect(g);g.connect(snd.master);o.start();o.stop(actx.currentTime+dur);}
function thump(str){if(!actx||str<=0)return;const s=actx.createBufferSource();s.buffer=snd.nb;const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.value=500+str*60;
  const g=actx.createGain();const t=actx.currentTime;g.gain.setValueAtTime(Math.min(1,str/12),t);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
  s.connect(f);f.connect(g);g.connect(snd.master);s.start(t,Math.random()*1.5,0.4);}
const GEARS=[0,27,38,47,56,64,72,81,99];
function gearInfo(v){v=Math.abs(v);let g=1;while(g<8&&v>=GEARS[g])g++;const lo=GEARS[g-1],hi=GEARS[g];return {g,rpm:clamp(0.28+0.72*(v-lo)/(hi-lo),0.28,1)};}
function vibrate(p){if(S.vib&&navigator.vibrate)try{navigator.vibrate(p);}catch(e){}}

// ======================= BOSHQARUV =======================
const keys={};let drsPressed=false;
addEventListener('keydown',e=>{
  if(!keys[e.code]){
    if(e.code==='KeyC')cycleCam();if(e.code==='KeyR')manualReset();if(e.code==='KeyM')setSound(!S.sound);
    if(e.code==='KeyE'||e.code==='ShiftLeft')drsPressed=true;if(e.code==='KeyQ')togglePit();
    if(e.code==='Escape'||e.code==='KeyP')togglePause();}
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.code]=false;});
const tbtns={left:$('#bLeft'),right:$('#bRight'),brake:$('#bBrake'),gas:$('#bGas'),drs:$('#bDrs')};
const touchIn={left:false,right:false,gas:false,brake:false,drs:false};
// --- 360° kamera: ekranni tortib aylantirish ---
let dragYaw=0,dragPitch=0,dragActive=false,dragIdle=9,dragId=null,dragLX=0,dragLY=0,menuA=0;
function dragStart(x,y,id){dragId=id;dragLX=x;dragLY=y;dragActive=true;dragIdle=0;}
function dragMove(x,y){const dx=x-dragLX,dy=y-dragLY;dragLX=x;dragLY=y;dragYaw-=dx*0.009;dragPitch=clamp(dragPitch+dy*0.005,-0.3,1.0);dragIdle=0;}
function dragEnd(){dragActive=false;dragId=null;dragIdle=0;}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dragStart(e.clientX,e.clientY,'m');});
addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&dragId==='m')dragMove(e.clientX,e.clientY);});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&dragId==='m')dragEnd();});
renderer.domElement.addEventListener('dblclick',()=>{dragYaw=0;dragPitch=0;});
function onButton(t,rects){for(const k in rects){const r=rects[k],p=6;if(!r)continue;
  if(t.clientX>=r.left-p&&t.clientX<=r.right+p&&t.clientY>=r.top-p&&t.clientY<=r.bottom+p)return k;}return null;}
function handleTouches(e){
  if(e.target&&e.target.closest&&e.target.closest('.ui'))return;
  e.preventDefault();
  const st={left:false,right:false,gas:false,brake:false,drs:false},rects={};
  for(const k in tbtns){const el=tbtns[k];rects[k]=el.offsetParent?el.getBoundingClientRect():null;}
  if(e.type==='touchstart'){for(const t of e.changedTouches)if(dragId==null&&!onButton(t,rects))dragStart(t.clientX,t.clientY,t.identifier);}
  if(e.type==='touchend'||e.type==='touchcancel'){for(const t of e.changedTouches)if(t.identifier===dragId)dragEnd();}
  for(const t of e.touches){if(t.identifier===dragId){if(e.type==='touchmove')dragMove(t.clientX,t.clientY);continue;}
    const k=onButton(t,rects);if(k)st[k]=true;}
  if(st.drs&&!touchIn.drs)drsPressed=true;
  for(const k in st){touchIn[k]=st[k];if(k!=='drs')tbtns[k].classList.toggle('on',st[k]);}
}
for(const ev of['touchstart','touchmove','touchend','touchcancel'])document.addEventListener(ev,handleTouches,{passive:false});
for(const ev of['contextmenu','selectstart','dragstart','gesturestart','dblclick'])document.addEventListener(ev,e=>e.preventDefault());
function getInput(){return{left:keys.ArrowLeft||keys.KeyA||touchIn.left,right:keys.ArrowRight||keys.KeyD||touchIn.right,
  gas:keys.ArrowUp||keys.KeyW||touchIn.gas,brake:keys.ArrowDown||keys.KeyS||keys.Space||touchIn.brake};}
// giroskop
let tiltRaw=0,tiltListening=false;
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;
  const ang=(screen.orientation&&screen.orientation.angle)!=null?screen.orientation.angle:(window.orientation||0);
  let v;if(ang===90)v=-a.y;else if(ang===-90||ang===270)v=a.y;else if(ang===180)v=-a.x;else v=a.x;
  if(!isIOS)v=-v;tiltRaw=v;}
function enableTilt(){
  if(tiltListening)return;
  const go=()=>{addEventListener('devicemotion',onMotion);tiltListening=true;};
  if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){
    DeviceMotionEvent.requestPermission().then(r=>{if(r==='granted')go();}).catch(()=>{});}
  else go();
}
function tiltSteer(){let v=tiltRaw/4.2*(S.tiltInv?-1:1);if(Math.abs(v)<0.06)v=0;return clamp(v,-1,1);}

let camMode=0;
function cycleCam(){camMode=(camMode+1)%3;}
function manualReset(){if(state!=='race'||!player)return;respawn(player,0);}
$('#btnCam').addEventListener('click',cycleCam);
$('#btnReset').addEventListener('click',manualReset);
$('#btnPause').addEventListener('click',togglePause);

// ======================= POYGA =======================
let cars=[],player=null,ghostMesh=null,ghostData=null,ghostRec=[],ghostAcc=0,ghostPtr=0;
let runRain=false,rainEventAt=0,lastPos=null,posT=0;
function isRain(){return state==='menu'?S.weather==='rain':runRain;}
function raceLaps(){return S.mode==='tt'?1e9:S.mode==='duel'?2:LAPS;}
let state='menu',prevState='race',raceTime=0,cdT=0,goDelay=1,litPrev=0,steerRamp=0,shake=0,msgT=0,finT=-1,champ=null,finAwarded=false,envScale=1;

function playerLiv(){const L=LIVERIES[S.livery];return {p:S.color!=null?S.color:L.p,s:L.s,a:L.a};}
function buildCars(){
  for(const c of cars){scene.remove(c.mesh.g);disposeObj(c.mesh.g);}
  if(ghostMesh){scene.remove(ghostMesh.g);disposeObj(ghostMesh.g);ghostMesh=null;}
  cars=[];
  const lg=leagueIdx(),L=LEAGUES[lg],dOff=[-0.04,0,0.025][S.diff]||0;
  const opp=S.mode==='tt'?0:S.mode==='duel'?1:S.opp,others=LIVERIES.map((l,i)=>i).filter(i=>i!==S.livery);
  for(let i=0;i<opp;i++){const c=new Car(AI_NAMES[i],false);c.key=AI_NAMES[i];c.liv=LIVERIES[others[i%others.length]];c.num=AI_NUMS[i];
    c.skill=clamp(L.ai+dOff+(S.mode==='duel'?0.02:0)-i*0.008+Math.random()*0.01,0.78,1);c.aiLine=[1.5,-1.5,0.6,-0.8,1,-1.2,0.2][i];
    Object.assign(c,{powMul:0.94+lg*0.035,aeroMul:0.96+lg*0.03,gripMul:0.97+lg*0.02,brkMul:0.97+lg*0.025,rainB:1,wearMul:1,tyre:isRain()?'W':'M'});cars.push(c);}
  player=new Car(t('you'),true);player.key='__me';player.liv=playerLiv();player.num=S.num;player.skill=0.92;player.aiLine=0;
  const st=playerStats();Object.assign(player,{powMul:st.pow,aeroMul:st.aero,gripMul:st.grip,brkMul:st.brk,rainB:st.rain,wearMul:st.wear,tyre:chosenTyre});cars.push(player);
  for(const c of cars){c.mesh=makeCarMesh(c.liv,c.num,false,c===player?playerOpt():null);c.skillEff=c.skill;scene.add(c.mesh.g);}
  if(S.mode==='tt'){ghostMesh=makeCarMesh(player.liv,S.num,true);ghostMesh.g.visible=false;scene.add(ghostMesh.g);}
  applyEnvMaterials();
}
function playerOpt(){return {tier:Math.max(0,CARS.findIndex(c=>c.id===PR.car)),parts:Object.assign({},PR.parts)};}
function refreshPlayerMesh(){
  if(!player)return;scene.remove(player.mesh.g);disposeObj(player.mesh.g);
  player.liv=playerLiv();player.num=S.num;player.mesh=makeCarMesh(player.liv,player.num,false,playerOpt());if(typeof showroomOn!=='undefined'&&showroomOn)showroomTick();scene.add(player.mesh.g);applyEnvMaterials();
}
function placeGrid(){
  const init=(car,idx,lat,k)=>{car.reset(PX[idx]+LX[idx]*lat,PZ[idx]+LZ[idx]*lat,headAt(idx),idx);
    Object.assign(car,{prog:-k,lapDone:-1,laps:[],finished:false,finishTime:0,lapStart:0,best:Infinity,aiOff:lat,skidL:null,skidR:null,gripF:1,dmg:0,pitReq:false,pitT:0,cleanRace:true,overtakes:0,warnW:false});};
  if(S.mode==='tt'){const k=Math.round(40/DS);init(player,(N-k)%N,0,k);return;}
  cars.forEach((car,slot)=>{const k=Math.round((10+slot*9)/DS);init(car,(N-k)%N,slot%2?-3:3,k);});
}
function loadTrackAndWorld(i){
  GRIP_ENV=isRain()?0.78:1;
  loadTrack(TRACKS[i]);buildWorld();clearSkids();clearParticles();clearDebris();applyEnv();
  if(cars.length)placeGrid();
}
function curTrackIdx(){return S.mode==='champ'&&champ&&!champ.done?CHAMP_ORDER[champ.round]:S.track;}

function startRace(){
  initAudio();if(S.tilt)enableTilt();
  if(S.mode==='champ'&&(!champ||champ.done))champ={round:0,pts:{},done:false};
  const ti=curTrackIdx();
  if(TRACK_DEF!==TRACKS[ti])loadTrackAndWorld(ti);
  buildCars();placeGrid();resetCones();clearSkids();clearParticles();clearDebris();
  runRain=S.weather==='rain';rainEventAt=(S.weather==='mix'&&raceLaps()<1e6&&Math.random()<0.65)?N*(0.35+Math.random()*(raceLaps()-0.9)):0;applyEnv();
  for(const c of cars)c.tyre=c===player?chosenTyre:(runRain?'W':'M');lastPos=null;posT=0;lastReward=null;
  raceTime=0;cdT=0;litPrev=0;goDelay=0.6+Math.random()*0.9;steerRamp=0;finT=-1;finAwarded=false;
  ghostData=S.mode==='tt'?store.get('f1a_ghost_'+ti,null):null;ghostRec=[];ghostAcc=0;ghostPtr=0;
  state='countdown';document.body.classList.remove('inmenu');setShowroom(false);
  ['#menu','#finish','#pause','#prerace'].forEach(s=>$(s).classList.add('hidden'));
  $('#lights').style.display='flex';
  $('#pDelta').classList.toggle('hidden',S.mode!=='tt');$('#pPos').classList.toggle('hidden',S.mode==='tt');
  if(runRain)setTimeout(()=>radio(t('r_wet')),600);
  else if(S.mode==='champ')setTimeout(()=>radio(t('r_champ',{a:champ.round+1,b:TRACKS[ti].name})),600);
  else if(S.mode==='tt'&&ghostData)setTimeout(()=>radio(t('r_ghost')),600);
}
// ---------- menyu: garaj studiyasi (fon rasmi) ----------
let garageBg=null,shCatch=null,showroomOn=false;
function fitBg(){if(!garageBg||!garageBg.image)return;const ia=garageBg.image.width/garageBg.image.height,ca=innerWidth/innerHeight;
  if(ca<ia){garageBg.repeat.set(ca/ia,1);garageBg.offset.set((1-ca/ia)*0.62,0);}else{garageBg.repeat.set(1,ia/ca);garageBg.offset.set(0,(1-ia/ca)*0.5);}}
function setShowroom(on){
  if(!garageBg){garageBg=new THREE.TextureLoader().load(ASSET.bg_garage,()=>fitBg());garageBg.colorSpace=THREE.SRGBColorSpace;
    shCatch=new THREE.Mesh(new THREE.PlaneGeometry(30,30).rotateX(-Math.PI/2),new THREE.ShadowMaterial({opacity:0.6}));shCatch.receiveShadow=true;scene.add(shCatch);}
  showroomOn=on;scene.background=on?garageBg:null;scene.backgroundIntensity=1.25;
  if(world)world.visible=!on;sky.visible=!on;shCatch.visible=on;if(on){stars.visible=false;rainLines.visible=false;}else applyEnv();
  for(const c of cars)c.mesh.g.visible=!on||c===player;
  if(on&&player){shCatch.position.set(player.x,0.01,player.z);}
  fitBg();
}
function showroomTick(){if(!showroomOn)return;if(world)world.visible=false;sky.visible=false;stars.visible=false;rainLines.visible=false;
  scene.background=garageBg;for(const c of cars)c.mesh.g.visible=c===player;if(player)shCatch.position.set(player.x,0.01,player.z);}
function goMenu(){
  runRain=S.weather==='rain';state='menu';document.body.classList.add('inmenu');['#finish','#pause'].forEach(s=>$(s).classList.add('hidden'));$('#menu').classList.remove('hidden');
  $('#lights').style.display='none';
  if(TRACK_DEF!==TRACKS[curTrackIdx()])loadTrackAndWorld(curTrackIdx());
  applyEnv();buildCars();placeGrid();refreshUI();setShowroom(true);
}
function togglePause(){
  if(state==='paused'){state=prevState;$('#pause').classList.add('hidden');last=performance.now();return;}
  if(state==='race'||state==='countdown'||state==='finished'){prevState=state;state='paused';$('#pause').classList.remove('hidden');}
}
$('#btnResume').addEventListener('click',togglePause);
$('#btnRestart').addEventListener('click',()=>{if(S.mode==='champ'&&champ&&finAwarded){if(champ.done)champ=null;else champ.round++;}startRace();});
$('#btnMenu').addEventListener('click',goMenu);
$('#btnFinMenu').addEventListener('click',()=>{if(S.mode==='champ'&&champ&&champ.done)champ=null;goMenu();});
$('#btnSnd2').addEventListener('click',()=>{initAudio();setSound(!S.sound);});
$('#btnNext').addEventListener('click',()=>{
  if(S.mode==='champ'&&champ){if(champ.done)champ=null;else champ.round++;}
  $('#finish').classList.add('hidden');
  if(PR.races>0&&PR.races%3===0)Ads.interstitial().then(showPrerace);else showPrerace();
});
$('#btnStart').addEventListener('click',()=>{initAudio();showPrerace();});
$('#btnGo').addEventListener('click',()=>{$('#prerace').classList.add('hidden');startRace();});
$('#btnPreBack').addEventListener('click',()=>{$('#prerace').classList.add('hidden');if(state!=='menu')goMenu();});
$('#btnCrateOk').addEventListener('click',()=>{$('#crate').classList.add('hidden');renderMeta();});
function togglePit(){if(state!=='race'||!player||player.finished||S.mode==='tt'&&false)return;if(player.pitT>0)return;
  player.pitReq=!player.pitReq;radio(t(player.pitReq?'r_pit_req':'r_pit_cancel'));vibrate(20);}

function radio(txt){$('#radioTxt').textContent=txt;const r=$('#radio');r.classList.add('show');clearTimeout(radio.t);radio.t=setTimeout(()=>r.classList.remove('show'),3200);
  if(actx){beep(1400,0.06,0.12);setTimeout(()=>beep(1000,0.08,0.12),90);}}
function showMsg(tx,dur=1.2){const m=$('#msg');m.textContent=tx;m.style.opacity=1;msgT=dur;}

function onImpact(car,imp,kind,other){
  const near=Math.hypot(car.x-player.x,car.z-player.z);
  if(car===player||other===player){shake=Math.max(shake,Math.min(1,imp/14));vibrate(Math.min(150,imp*9)|0);if(imp>5)player.cleanRace=false;}
  if(near<60)thump(imp*(1-near/60));
  if(imp>3){let sx=car.x,sz=car.z,nx=0,nz=0;
    if(kind==='wall'){const i=car.idx,sg=Math.sign(car.lat);sx+=LX[i]*sg*1.05;sz+=LZ[i]*sg*1.05;nx=-LX[i]*sg;nz=-LZ[i]*sg;}
    else if(other){sx=(car.x+other.x)/2;sz=(car.z+other.z)/2;const d=Math.hypot(car.x-other.x,car.z-other.z)||1;nx=(car.x-other.x)/d;nz=(car.z-other.z)/d;}
    const camD=camera.position.distanceTo(tmpV.set(sx,0,sz));
    if(camD<160){spawnSparks(sx,0.35,sz,Math.min(90,imp*5)|0,car.vx,car.vz,nx,nz,Math.min(1.6,0.6+imp/14));
      if(imp>6)flash(sx,0.4,sz,imp);
      for(let k=0;k<Math.min(8,imp/2);k++)emit(sx,0.4,sz,car.vx*0.2+(Math.random()-0.5)*3,0.8+Math.random(),car.vz*0.2+(Math.random()-0.5)*3,0.55,0.55,0.58,1.2,4,1.4,0.35);
      if(imp>9)spawnShards(car,sx,sz,nx,nz,Math.min(10,imp/2)|0);}}
  const victim=(other===player)?player:car;
  if(victim===player&&imp>15&&!player.dmg){player.dmg=1;player.gripF=0.84;detachWing(player);radio(t('r_wing'));}
}
function detachWing(car){
  const fw=car.mesh.fwing;fw.updateWorldMatrix(true,true);
  const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();fw.matrixWorld.decompose(p,q,s);
  car.mesh.body.remove(fw);fw.position.copy(p);fw.quaternion.copy(q);scene.add(fw);
  debris.push({obj:fw,vx:car.vx*0.5+(Math.random()-0.5)*4,vy:4,vz:car.vz*0.5+(Math.random()-0.5)*4,wx:(Math.random()-0.5)*8,wy:(Math.random()-0.5)*8});
}

function simStep(h){
  const racing=state==='race'||state==='finished';
  if(racing)raceTime+=h;
  const inp=getInput();
  const drsMode=S.mode==='tt'?'always':racing,rn=isRain();
  for(const car of cars){
    const ty=TYRES[car.tyre||'M'];
    car.tyreGrip=ty.grip*(rn?(car.tyre==='W'?1.14:0.86)*(car.rainB||1):(car.tyre==='W'?0.92:1));
    car.wearRate=S.mode==='tt'?0:ty.wear*(car.wearMul||1)*(rn&&car.tyre!=='W'?0.7:1)*(!rn&&car.tyre==='W'?2.2:1);
    if(car.pitT>0){car.pitT-=h;if(car.pitT<=0){car.limiter=0;car.wear=0;car.tyre=car.pitTyre;if(car===player){radio(t('r_pit_done',{t:t(TYRES[car.tyre].k)}));vibrate(40);}}}
    updateAero(car,cars,drsMode);
    if(!racing){car.throttle=0;car.brake=0;car.steerIn=0;continue;}
    if(car===player&&!car.finished){
      const tgt=(S.tilt&&tiltListening)?tiltSteer():(inp.left?1:0)-(inp.right?1:0);
      const rate=(Math.abs(tgt)<Math.abs(steerRamp)||Math.sign(tgt)!==Math.sign(steerRamp))?7:3.4;
      steerRamp+=clamp(tgt-steerRamp,-rate*h,rate*h);
      let thr=inp.gas?1:0,br=inp.brake?1:0;
      if(S.autoGas&&!br)thr=1;
      if(S.brakeAssist){const vt=assistTarget(car),sp=car.speed;if(sp>vt+0.5){thr=0;br=Math.max(br,clamp((sp-vt)*0.3,0.25,1));}}
      car.steerIn=steerRamp;car.throttle=thr;car.brake=br;
      if(drsPressed){if(car.drs)car.drs=false;else if(car.drsAvail&&DRSZ[car.idx])car.drs=true;}
    }else{car.skillEff=car.skill+(car===player?0:clamp((player.prog-car.prog)*DS/500,-0.06,0.05));aiDrive(car,cars);}
  }
  drsPressed=false;
  for(const car of cars){car.step(h);if(!racing){car.vx=car.vz=car.r=0;}const imp=collideWall(car);if(imp>2)onImpact(car,imp,'wall');if(imp>0.01&&car.speed>9)car.scrapeT=0.12;}
  for(let a=0;a<cars.length;a++)for(let b=a+1;b<cars.length;b++){const imp=collideCars(cars[a],cars[b]);if(imp>1.5)onImpact(cars[a],imp,'car',cars[b]);}
  for(const cn of cones){
    for(const car of cars){if(Math.abs(car.x-cn.x)>4||Math.abs(car.z-cn.z)>4)continue;
      for(const p of carCircles(car)){const dx=cn.x-p[0],dz=cn.z-p[1],d=Math.hypot(dx,dz);
        if(d<1.4&&d>1e-4&&cn.y<0.6){const sp=car.speed;cn.vx=car.vx*1.1+dx/d*(2+sp*0.15);cn.vz=car.vz*1.1+dz/d*(2+sp*0.15);
          cn.vy=2+sp*0.12;cn.wr=(Math.random()-0.5)*14;cn.hit=true;car.vx*=0.992;car.vz*=0.992;if(car===player){thump(3);vibrate(20);}}}}
  }
  const laps=raceLaps();
  if(racing&&rainEventAt>0&&Math.max(...cars.map(c=>c.prog))>rainEventAt){rainEventAt=0;runRain=true;applyEnv();radio(t('r_rain_start'));vibrate([40,40,40]);}
  if(racing&&player.wear>0.72&&!player.warnW){player.warnW=true;radio(t('r_tyre_low'));}
  if(racing&&player.lapDone>=0){posT+=h;if(posT>0.5){posT=0;const ps=standings().indexOf(player);if(lastPos!=null&&ps<lastPos)player.overtakes+=lastPos-ps;lastPos=ps;}}
  for(const car of cars){
    updateProgress(car);
    const lapNow=Math.floor(car.prog/N);
    if(lapNow>car.lapDone){
      if(car.lapDone>=0){const lt=raceTime-car.lapStart;car.laps.push(lt);
        if(car===player){const ti=curTrackIdx(),rec=store.get('f1a_best_'+ti,null);
          if(rec==null||lt<rec){store.set('f1a_best_'+ti,lt);if(car.laps.length>0)radio(t('r_record',{t:fmt(lt)}));}
          else if(lt<car.best)radio(t('r_fast',{t:fmt(lt)}));
          if(S.mode==='tt'){if(!ghostData||lt<ghostData.t){ghostData={t:lt,d:ghostRec};store.set('f1a_ghost_'+ti,ghostData);}}
          else if(lapNow<laps)showMsg(lapNow===laps-1?t('last_lap'):t('lap_n',{n:lapNow+1}),1.4);}
        car.best=Math.min(car.best,lt);}
      car.lapStart=raceTime;car.lapDone=lapNow;
      if(car!==player&&lapNow>=1&&lapNow<laps&&!car.pitT&&((rn&&car.tyre!=='W')||(!rn&&car.tyre==='W'&&Math.random()<0.7)||car.wear>0.8))car.pitReq=true;
      if(car.pitReq&&lapNow>=1&&lapNow<laps){car.pitReq=false;car.pitT=6.5;car.limiter=22;car.pitTyre=rn?'W':(car.tyre==='W'?'M':(laps-lapNow<=1?'S':'M'));if(car===player)radio(t('r_pit_in'));}
      if(car===player){ghostRec=[];ghostAcc=0;ghostPtr=0;}
      if(lapNow>=laps&&!car.finished){car.finished=true;car.finishTime=raceTime;
        if(car===player){state='finished';finT=0;car.limiter=0;showMsg(t('fin_msg'),2);vibrate([100,60,100]);}}
    }
    if(racing&&car!==player&&car.speed<1.5){car.stuck+=h;if(car.stuck>2.5)respawn(car,car.aiLine);}else car.stuck=0;
  }
  if(S.mode==='tt'&&racing&&player.lapDone>=0){ghostAcc+=h;if(ghostAcc>=0.05){ghostAcc-=0.05;
    ghostRec.push(+player.x.toFixed(2),+player.z.toFixed(2),+player.th.toFixed(3),player.prog-player.lapDone*N);}}
}

function standings(){return cars.slice().sort((a,b)=>{if(a.finished&&b.finished)return a.finishTime-b.finishTime;if(a.finished)return -1;if(b.finished)return 1;return b.prog-a.prog;});}
const fmt=t=>{if(t==null||!isFinite(t))return '—';const m=Math.floor(t/60),s=t-m*60;return `${m}:${s<10?'0':''}${s.toFixed(3)}`;};
function renderFinish(){
  const st=standings(),pos=st.indexOf(player)+1;
  if(!finAwarded){finAwarded=true;lastReward=computeRewards(pos,cars.length);
    if(S.mode==='champ'&&champ){st.forEach((c,i)=>{champ.pts[c.key]=(champ.pts[c.key]||0)+(POINTS[i]||0);});champ.last={};st.forEach((c,i)=>champ.last[c.key]=POINTS[i]||0);
      if(champ.round>=CHAMP_ORDER.length-1)champ.done=true;}}
  const nm=k=>k==='__me'?t('you'):k;
  let html=rewardsHTML(lastReward)+`<div id="finTbl">`+finTable()+`</div>`;
  let title=pos===1?t('win'):t('pos_n',{n:pos});
  if(S.mode==='champ'&&champ){
    const tab=Object.keys(champ.pts).sort((a,b)=>champ.pts[b]-champ.pts[a]);
    html+=`<div><div class="h2">${t('champ_stage',{a:champ.round+1,b:CHAMP_ORDER.length})}</div><table class="res"><tr><th>#</th><th>${t('pilot')}</th><th style="text-align:right">+</th><th style="text-align:right">${t('pts')}</th></tr>`
      +tab.map((n,i)=>`<tr class="${n==='__me'?'me':''}"><td>${i+1}</td><td>${nm(n)}</td><td class="r">+${champ.last[n]||0}</td><td class="r">${champ.pts[n]}</td></tr>`).join('')+`</table></div>`;
    if(champ.done){title=tab[0]==='__me'?t('champion'):t('champ_is',{n:nm(tab[0])});$('#btnNext').textContent=t('new_champ');}
    else $('#btnNext').textContent=t('next_race');
  }else $('#btnNext').textContent=t('again');
  $('#finTitle').innerHTML=title;$('#finBody').innerHTML=html;
  const bx=$('#bX2');if(bx){if(lastReward.x2){bx.textContent=t('x2_done');bx.classList.add('done');}
    bx.onclick=()=>{if(lastReward.x2)return;Ads.rewarded().then(()=>{lastReward.x2=true;addCoins(lastReward.coins);toast('+'+lastReward.coins+' 🪙');bx.textContent=t('x2_done');bx.classList.add('done');});};}
}
function finTable(){
  const st=standings(),nm=k=>k==='__me'?t('you'):k;
  return `<table class="res"><tr><th>#</th><th>${t('pilot')}</th><th style="text-align:right">${t('time')}</th></tr>`+st.map((c,i)=>`<tr class="${c===player?'me':''}"><td>${i+1}</td><td><span class="dot" style="background:${hex(c.liv.p)}"></span>${nm(c.key)}</td><td class="r">${c.finished?fmt(c.finishTime):t('on_track')}</td></tr>`).join('')
    +`<tr><td></td><td style="opacity:.6">${t('best_you')}</td><td class="r" style="opacity:.6">${fmt(player.best)}</td></tr></table>`;
}
function updateFinTable(){const e=$('#finTbl');if(e)e.innerHTML=finTable();}

// ======================= MUHIT: KUN VAQTI, OB-HAVO =======================
const ENVS={
  day:{top:0x2f6fd0,bot:0xcfe0ee,sun:[60,120,40],sunC:0xfff0d8,sunI:2.6,hemi:0.75,hs:0xd6ebff,hg:0x4d6b2c,exp:1.05,fogN:320,fogF:2600,lamps:0,bloom:0.18,env:1},
  sunset:{top:0x34407e,bot:0xffa860,sun:[-130,26,70],sunC:0xffa060,sunI:2.3,hemi:0.55,hs:0xffc9a0,hg:0x3a3a2a,exp:1.0,fogN:260,fogF:2200,lamps:0.4,bloom:0.35,env:0.75},
  night:{top:0x02040c,bot:0x0e1526,sun:[-40,90,-80],sunC:0xa8bcff,sunI:0.45,hemi:0.3,hs:0x7088c0,hg:0x14181f,exp:1.25,fogN:160,fogF:1400,lamps:1,bloom:0.8,env:0.35},
};
function applyEnv(){
  const e=ENVS[S.tod],rain=isRain();
  const top=new THREE.Color(e.top),bot=new THREE.Color(e.bot);
  if(rain){const gr=new THREE.Color(S.tod==='night'?0x0b0e14:0x8a929c);top.lerp(gr,0.75);bot.lerp(gr,0.6);}
  skyU.top.value.copy(top);skyU.bottom.value.copy(bot);SUN_DIR.set(...e.sun).normalize();skyU.sunCol.value.set(e.sunC);
  skyU.sunAmt.value=rain?0.04:(S.tod==='night'?0.45:1);
  scene.fog.color.copy(bot);scene.fog.near=e.fogN*(rain?0.45:1);scene.fog.far=e.fogF*(rain?0.45:1);
  sun.color.set(e.sunC);sun.intensity=e.sunI*(rain?0.35:1);
  hemi.color.set(e.hs);hemi.groundColor.set(e.hg);hemi.intensity=e.hemi*(rain?0.95:1);
  renderer.toneMappingExposure=e.exp;
  stars.visible=S.tod==='night'&&!rain;
  if(bulbMat)bulbMat.emissiveIntensity=e.lamps*3;
  if(poolMat)poolMat.opacity=e.lamps*0.5;
  winMats.forEach(m=>m.emissiveIntensity=S.tod==='night'?1.3:S.tod==='sunset'?0.35:0);
  billMats.forEach(m=>m.emissiveIntensity=S.tod==='night'?0.55:0);
  headlight.intensity=S.tod==='night'?220:S.tod==='sunset'?40:0;
  bloom.strength=e.bloom+(rain?0.1:0);
  if(roadMat){roadMat.map=rain?wetRoadTex:dryRoadTex;roadMat.needsUpdate=true;roadMat.roughness=rain?0.28:0.9;roadMat.color.setScalar(rain?0.85:1);roadMat.envMapIntensity=rain?1.2:0.3;roadMat.metalness=rain?0.15:0;}
  envScale=e.env*(rain?0.75:1);applyEnvMaterials();
  rainLines.visible=rain;
  GRIP_ENV=rain?0.78:1;if(N)computeProfile();colorRacingLine();
}
function applyEnvMaterials(){for(const c of cars)for(const m of c.mesh.mats)m.envMapIntensity=envScale*(m.userData.envK||1);if(ghostMesh)for(const m of ghostMesh.mats)m.envMapIntensity=envScale;}

// ======================= MENYU =======================
function drawTrackPreview(cv,def){
  const g=cv.getContext('2d'),w=cv.width,h=cv.height;g.clearRect(0,0,w,h);
  const c=new THREE.CatmullRomCurve3(def.pts.map(p=>new THREE.Vector3(p[0],0,p[1])),true,'centripetal').getSpacedPoints(200);
  let a=1e9,b=-1e9,cz=1e9,d=-1e9;for(const p of c){a=Math.min(a,p.x);b=Math.max(b,p.x);cz=Math.min(cz,p.z);d=Math.max(d,p.z);}
  const sc=Math.min((w-20)/(b-a),(h-20)/(d-cz)),ox=(w-(b-a)*sc)/2,oy=(h-(d-cz)*sc)/2;
  g.beginPath();c.forEach((p,i)=>{const x=(b-p.x)*sc+ox,y=(d-p.z)*sc+oy;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=4;g.lineJoin='round';g.stroke();
  const p0=c[0];g.fillStyle='#ff2d2d';g.beginPath();g.arc((b-p0.x)*sc+ox,(d-p0.z)*sc+oy,5,0,7);g.fill();
}
function buildMenu(){
  const tc=$('#trackCards');tc.innerHTML='';
  TRACKS.forEach((t,i)=>{const d=document.createElement('button');d.className='tcard ui';d.dataset.i=i;
    d.innerHTML=`<div class="tthumb" style="background-image:url(${ASSET['tr_'+i]})"><canvas width="200" height="140"></canvas></div><b>${t.name}</b><small id="tsub${i}"></small><small class="rec" id="rec${i}"></small>`;
    tc.appendChild(d);drawTrackPreview(d.querySelector('canvas'),t);
    d.addEventListener('click',()=>{S.track=i;saveS();if(S.mode==='champ'){S.mode='race';saveS();champ=null;buildCars();}loadTrackAndWorld(i);refreshUI();});});
  const lv=$('#livs');lv.innerHTML='';
  LIVERIES.forEach((l,i)=>{const d=document.createElement('button');d.className='liv ui';d.dataset.i=i;
    d.innerHTML=`<div class="sw"><i style="background:${hex(l.p)}"></i><i style="background:${hex(l.s)}"></i><i style="background:${hex(l.a)}"></i></div>${l.name}<span class="lp"></span>`;
    lv.appendChild(d);d.addEventListener('click',()=>{if(!PR.livs[i]){if(!spend(LIV_PRICE[i]))return;PR.livs[i]=1;saveP();toast(t('bought'));}S.livery=i;S.color=null;saveS();refreshPlayerMesh();buildCarsIfAIClash();refreshUI();});});
  const cl=$('#cols');cl.innerHTML='';
  COLORS.forEach(c=>{const d=document.createElement('button');d.className='col ui';d.dataset.c=c;d.style.background=hex(c);cl.appendChild(d);
    d.addEventListener('click',()=>{S.color=c;saveS();refreshPlayerMesh();refreshUI();});});
  $('#numDn').addEventListener('click',()=>{S.num=S.num<=1?99:S.num-1;saveS();refreshPlayerMesh();refreshUI();});
  $('#numUp').addEventListener('click',()=>{S.num=S.num>=99?1:S.num+1;saveS();refreshPlayerMesh();refreshUI();});
  $$('#tabs button').forEach(b=>b.addEventListener('click',()=>{$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));
    $$('.tab').forEach(t=>t.classList.toggle('on',t.id==='tab-'+b.dataset.tab));menuTab=b.dataset.tab;$('.scroll').scrollTop=0;renderMeta();}));
  $('#carPrev').addEventListener('click',()=>{const i=CARS.findIndex(c=>c.id===(garageCar||PR.car));garageCar=CARS[(i-1+CARS.length)%CARS.length].id;renderGarage();});
  $('#carNext').addEventListener('click',()=>{const i=CARS.findIndex(c=>c.id===(garageCar||PR.car));garageCar=CARS[(i+1)%CARS.length].id;renderGarage();});
  $('#carBuy').addEventListener('click',()=>{const c=carDef(garageCar);if(!PR.cars[c.id]){if(!spend(c.price))return;PR.cars[c.id]=1;toast(t('bought'));vibrate(40);}
    PR.car=c.id;saveP();renderGarage();renderLeague();if(state==='menu'){buildCars();placeGrid();showroomTick();}});
  $('#bPit').addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();togglePit();},{passive:false});
  $('#bPit').addEventListener('click',togglePit);
  $$('.seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    const k=sg.dataset.key,raw=b.dataset.v,v=isNaN(+raw)?raw:+raw;if(S[k]===v)return;S[k]=v;saveS();onSet(k);refreshUI();})));
  $$('.tog').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.key;S[k]=!S[k];saveS();onSet(k);refreshUI();}));
}
let menuTab='race';
function buildCarsIfAIClash(){if(state==='menu'){buildCars();placeGrid();}}
function onSet(k){
  if(k==='mode'){if(S.mode!=='champ')champ=null;if(TRACK_DEF!==TRACKS[curTrackIdx()])loadTrackAndWorld(curTrackIdx());buildCars();placeGrid();}
  else if(k==='opp'){buildCars();placeGrid();}
  else if(k==='tod'||k==='weather'){applyEnv();if(state==='menu')setShowroom(true);}
  else if(k==='quality'){applyQuality();loadTrackAndWorld(curTrackIdx());}
  else if(k==='btn')document.documentElement.style.setProperty('--btn',S.btn);
  else if(k==='tilt'){document.body.classList.toggle('tilt',S.tilt);if(S.tilt)enableTilt();}
  else if(k==='line'){if(racingLine)racingLine.visible=S.line;}
  else if(k==='sound'){initAudio();setSound(S.sound);}
  else if(k==='lang'){applyLang();if(player)player.name=t('you');}
}
function refreshUI(){
  $$('.tcard').forEach(d=>{const i=+d.dataset.i;d.classList.toggle('on',S.mode!=='champ'&&i===S.track);
    const r=store.get('f1a_best_'+i,null);$('#rec'+i).textContent=r?t('rec')+': '+fmt(r):'';});
  $$('.seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>{const raw=b.dataset.v,v=isNaN(+raw)?raw:+raw;b.classList.toggle('on',S[sg.dataset.key]===v);}));
  $$('.tog').forEach(b=>b.classList.toggle('on',!!S[b.dataset.key]));
  $$('.liv').forEach(d=>d.classList.toggle('on',+d.dataset.i===S.livery));
  const pc=S.color!=null?S.color:LIVERIES[S.livery].p;$$('.col').forEach(d=>d.classList.toggle('on',+d.dataset.c===pc));
  $('#numV').textContent=S.num;
  $('#champInfo').textContent=S.mode==='champ'?`${t('champ_stage',{a:champ&&!champ.done?champ.round+1:1,b:CHAMP_ORDER.length})} · ${TRACKS[curTrackIdx()].name}`:'';
  TRACKS.forEach((tr,i)=>{const e=$('#tsub'+i);if(e)e.textContent=t('tsub'+i);});renderMeta();
  document.documentElement.style.setProperty('--btn',S.btn);document.body.classList.toggle('tilt',!!S.tilt);
  $('#btnSnd2').textContent=t(S.sound?'snd_on':'snd_off');
}

// ======================= KAMERA VA VIZUAL =======================
let camYaw=0;const tmpV=new THREE.Vector3();
function updateCamera(dt,now){
  const c=player,sp=c.speed;
  if(!dragActive){dragIdle+=dt;if(state!=='menu'&&dragIdle>1.6){dragYaw=wrapA(dragYaw);const k=1-Math.exp(-dt*2.2);dragYaw-=dragYaw*k;dragPitch-=dragPitch*k;}}
  if(state==='menu'){
    if(!dragActive&&dragIdle>2.5)menuA+=dt*0.18;
    const a=menuA+dragYaw,r=(menuTab==='garage'?6.2:9)*(innerWidth<innerHeight?1.45:1);
    const el=clamp((showroomOn?0.1:(menuTab==='garage'?0.28:0.33))+dragPitch,0.03,1.3);
    camera.position.set(c.x+Math.sin(a)*r*Math.cos(el),0.55+r*Math.sin(el),c.z+Math.cos(a)*r*Math.cos(el));
    camera.lookAt(c.x,showroomOn?0.45:0.7,c.z);
    const W=innerWidth,H=innerHeight;
    if(W>H)camera.setViewOffset(W,H,-W*0.21,-H*(showroomOn?0.16:0),W,H);else camera.setViewOffset(W,H,0,H*0.24,W,H);
    camYaw=c.th;camera.fov=55;camera.updateProjectionMatrix();return;}
  if(camera.view&&camera.view.enabled)camera.clearViewOffset();
  let target=c.th;
  if(sp>3&&c.vLong>0){const vh=Math.atan2(c.vx,c.vz);target=c.th+wrapA(vh-c.th)*0.35;}
  camYaw+=wrapA(target-camYaw)*(1-Math.exp(-dt*6));
  const fx=Math.sin(camYaw),fz=Math.cos(camYaw),yaw=camYaw+dragYaw,ox=Math.sin(yaw),oz=Math.cos(yaw);
  if(camMode<2){const M=camMode===0?{d:6.6,h:1.95,l:0.95}:{d:10.5,h:3.5,l:1.15};const d=M.d+sp*0.012,R=Math.hypot(d,M.h);
    const el=clamp(Math.atan2(M.h,d)+dragPitch,0.03,1.35);
    camera.position.set(c.x-ox*R*Math.cos(el),Math.max(0.35,R*Math.sin(el)),c.z-oz*R*Math.cos(el));
    const ahead=5*Math.max(0,Math.cos(dragYaw));tmpV.set(c.x+fx*ahead,M.l,c.z+fz*ahead);}
  else{const s=Math.sin(c.th),co=Math.cos(c.th),ls=Math.sin(c.th+dragYaw),lc=Math.cos(c.th+dragYaw);
    camera.position.set(c.x-s*0.05,1.02,c.z-co*0.05);tmpV.set(camera.position.x+ls*14,-2.6-dragPitch*8,camera.position.z+lc*14);}
  if(shake>0){const k=shake*0.35;camera.position.x+=(Math.random()-0.5)*k;camera.position.y+=(Math.random()-0.5)*k;camera.position.z+=(Math.random()-0.5)*k;shake=Math.max(0,shake-dt*2.5);}
  camera.lookAt(tmpV);
  const fov=62+Math.min(26,sp*0.28);
  if(Math.abs(camera.fov-fov)>0.05){camera.fov+=(fov-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix();}
}
let emitT=0;
function updateCars(dt,now){
  emitT+=dt;const doEmit=emitT>0.03;if(doEmit)emitT=0;
  const rain=isRain(),blink=Math.floor(now/250)%2===0;
  for(const car of cars){
    const m=car.mesh;m.g.position.set(car.x,0,car.z);m.g.rotation.y=car.th;
    m.body.rotation.z=clamp(car.latA*0.0028,-0.045,0.045);m.body.rotation.x=clamp(-car.long*0.0025,-0.03,0.03);
    for(const w of m.wheels){if(w.front)w.pivot.rotation.y=car.steer;w.spin.rotation.x=car.wheelRot;}
    m.drs.rotation.x+=((car.drs?0.02:0.5)-m.drs.rotation.x)*Math.min(1,dt*10);
    m.brakeMat.emissiveIntensity=car.brake>0.05?6:(rain?(blink?5:0.6):(S.tod==='night'?1.8:1.0));
    m.discMat.emissiveIntensity=car.brakeT*3;
    if(m.exMat)m.exMat.emissiveIntensity=car.throttle>0.5?0.6+m.engLv*0.5:0.15;
    if(m.rear){const dx=camera.position.x-car.x,dz=camera.position.z-car.z,l=Math.hypot(dx,dz)||1,cam=camMode!==2&&!(ck&&ck.on);
      const fw=(dx*Math.sin(car.th)+dz*Math.cos(car.th))/l,el=camera.position.y/Math.hypot(l,camera.position.y),lit=S.tod==='night'?0.5:S.tod==='sunset'?0.8:(isRain()?0.75:1);
      const relYaw=wrapA(Math.atan2(dx,dz)-car.th);
      for(const [imp,dir] of [[m.rear,-1],[m.front,1]]){if(!imp)continue;
        const k=cam&&state!=='menu'?clamp((dir*fw-0.93)/0.02,0,1)*clamp((0.5-el)/0.12,0,1):0;
        imp.material.userData.k=k;imp.visible=k>0.01;if(!imp.visible)continue;
        const want=dir<0?wrapA(relYaw-Math.PI):relYaw;imp.rotation.y=imp.userData.base+clamp(want,-0.3,0.3);
        imp.material.opacity=1;imp.material.depthWrite=true;imp.material.color.setScalar(lit);}
      // rasm ko'rinsa 3D modelni yashiramiz — ikki mashina ustma-ust chiqmasin
      const imgOn=(m.rear&&m.rear.visible&&m.rear.material.userData.k>0.5)||(m.front&&m.front.visible&&m.front.material.userData.k>0.5);
      for(const ch of m.g.children)if(ch!==m.rear&&ch!==m.front)ch.visible=!imgOn;
      if(m.rear)m.rear.visible=m.rear.visible&&m.rear.material.userData.k>0.5;if(m.front)m.front.visible=m.front.visible&&m.front.material.userData.k>0.5;}
    // osma: ozgina balandlik va titrash (yerga yopishib qolmasin)
    {const curb=Math.abs(car.lat)>HALF_W-0.3&&Math.abs(car.lat)<HALF_W+CURB_W+0.3,sp2=Math.min(1,car.speed/50);
     m.g.position.y=0.025+Math.sin(now*0.047+car.x)*0.006*sp2+(curb&&car.speed>8?(Math.random()-0.5)*0.035:0);}
    {const sn=Math.sin(car.th),cs=Math.cos(car.th),spd=car.speed,near=Math.hypot(car.x-camera.position.x,car.z-camera.position.z)<110;
     if(car.scrapeT>0){car.scrapeT-=dt;if(near){const i=car.idx,sg=Math.sign(car.lat),px=car.x+LX[i]*sg*0.95-sn*0.8,pz=car.z+LZ[i]*sg*0.95-cs*0.8;
       spawnSparks(px,0.3,pz,3,car.vx*0.9,car.vz*0.9,-LX[i]*sg,-LZ[i]*sg,0.7);}}
     if(near&&spd>60&&!car.onGrass&&Math.random()<(spd-60)/40*dt*25){const px=car.x-sn*1.95,pz=car.z-cs*1.95;
       spawnSparks(px,0.05,pz,2+(Math.random()*3|0),car.vx*0.82,car.vz*0.82,0,0,0.35,true);}}
    const s=Math.sin(car.th),c=Math.cos(car.th),sp=car.speed;
    const skidding=!car.onGrass&&sp>4&&(Math.abs(car.slipR)>0.13||(car.spin&&sp<30)||Math.abs(car.slipF)>0.2);
    for(const side of[1,-1]){const key=side>0?'skidL':'skidR';
      const wx=car.x-s*2.2+c*0.86*side,wz=car.z-c*2.2-s*0.86*side;
      if(skidding&&!rain){const l=car[key];if(l){if(Math.hypot(wx-l[0],wz-l[1])>0.6){addSkid(l[0],l[1],wx,wz,0.36);car[key]=[wx,wz];}}else car[key]=[wx,wz];}else car[key]=null;
      if(doEmit){
        if(!rain&&!car.onGrass&&sp>3&&(Math.abs(car.slipR)>0.15||car.spin)){const k=car.spin&&sp<30?3:2,inten=clamp((Math.abs(car.slipR)-0.12)*4+(car.spin?0.5:0),0.25,1);
          for(let q=0;q<k;q++)emit(wx+(Math.random()-0.5)*0.4,0.2,wz+(Math.random()-0.5)*0.4,car.vx*0.35+(Math.random()-0.5)*1.5,0.5+Math.random()*0.7,car.vz*0.35+(Math.random()-0.5)*1.5,0.88,0.88,0.9,0.7,5.5,2.4+Math.random(),0.42*inten);}
        if(car.onGrass&&sp>6)emit(wx,0.3,wz,car.vx*0.2+(Math.random()-0.5),1+Math.random(),car.vz*0.2,0.5,0.42,0.3,1.0,3,1.0,0.45);
      }}
    if(doEmit&&rain&&sp>14){const bx=car.x-s*3.0,bz=car.z-c*3.0;emit(bx+(Math.random()-0.5)*1.4,0.4,bz,car.vx*0.55,0.9,car.vz*0.55,0.55,0.6,0.65,0.9,4.5,0.6,Math.min(car===player?0.14:0.3,sp/150));}
  }
  // arvoh
  if(ghostMesh){let vis=false;
    if(ghostData&&state==='race'&&player.lapDone>=0){const t=raceTime-player.lapStart,i=Math.floor(t/0.05),d=ghostData.d;
      if((i+1)*4<d.length){const f=t/0.05-i,a=i*4,b=a+4;
        ghostMesh.g.position.set(d[a]+(d[b]-d[a])*f,0,d[a+1]+(d[b+1]-d[a+1])*f);ghostMesh.g.rotation.y=d[a+2]+wrapA(d[b+2]-d[a+2])*f;vis=true;
        for(const w of ghostMesh.wheels)w.spin.rotation.x=player.wheelRot;}}
    ghostMesh.g.visible=vis;}
  // headlight (tunda ko'rish uchun)
  const s=Math.sin(player.th),c=Math.cos(player.th);
  headlight.position.set(player.x+s*1.8,1.2,player.z+c*1.8);headlight.target.position.set(player.x+s*30,0,player.z+c*30);headlight.target.updateMatrixWorld();
}
function updateCones(dt){
  for(const c of cones){
    if(c.hit){c.vy-=G*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;
      if(c.y<=0){c.y=0;c.vy=-c.vy*0.25;if(Math.abs(c.vy)<0.5)c.vy=0;c.vx*=Math.pow(0.05,dt);c.vz*=Math.pow(0.05,dt);c.wr*=Math.pow(0.1,dt);c.rx+=(Math.PI/2-c.rx)*Math.min(1,dt*6);}
      else c.rx+=c.wr*dt*0.5;c.rz+=c.wr*dt;}
    c.grp.position.set(c.x,c.y,c.z);c.grp.rotation.set(c.rx,c.rz,0,'YXZ');}
  for(let k=debris.length-1;k>=0;k--){const d=debris[k];if(d.life!=null){d.life-=dt;if(d.life<=0){scene.remove(d.obj);debris.splice(k,1);}}}
  for(const d of debris){const o=d.obj;if(o.position.y>0.05||d.vy>0){d.vy-=G*dt;o.position.x+=d.vx*dt;o.position.y+=d.vy*dt;o.position.z+=d.vz*dt;o.rotation.x+=d.wx*dt;o.rotation.y+=d.wy*dt;
    if(o.position.y<0.05){o.position.y=0.05;d.vy=Math.abs(d.vy)>2?-d.vy*0.3:0;d.vx*=0.6;d.vz*=0.6;d.wx*=0.5;d.wy*=0.5;}}}
}

// mini-xarita
const mini=$('#mini'),mctx=mini.getContext('2d'),MS=280;let trackCv=null,mp=null;
function buildMiniTrack(){
  const pad=20,sc=Math.min((MS-2*pad)/(maxX-minX),(MS-2*pad)/(maxZ-minZ)),ox=(MS-(maxX-minX)*sc)/2,oy=(MS-(maxZ-minZ)*sc)/2;
  mp=(x,z)=>[(maxX-x)*sc+ox,(maxZ-z)*sc+oy];
  trackCv=document.createElement('canvas');trackCv.width=trackCv.height=MS;const g=trackCv.getContext('2d');g.lineJoin='round';
  g.beginPath();for(let i=0;i<=N;i+=2){const[a,b]=mp(PX[i%N],PZ[i%N]);i?g.lineTo(a,b):g.moveTo(a,b);}g.closePath();
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=12;g.stroke();g.strokeStyle='#e8e8e8';g.lineWidth=6;g.stroke();
  g.strokeStyle='#2ee66b';g.lineWidth=3;
  for(let i=0;i<N;i++)if(DRSZ[i]&&DRSZ[(i+1)%N]){const[a,b]=mp(PX[i],PZ[i]),[c,d]=mp(PX[(i+1)%N],PZ[(i+1)%N]);g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}
  const[a,b]=mp(PX[0],PZ[0]);g.fillStyle='#ff2d2d';g.fillRect(a-7,b-2,14,4);
}
function drawMini(){
  mctx.clearRect(0,0,MS,MS);mctx.drawImage(trackCv,0,0);
  if(ghostMesh&&ghostMesh.g.visible){const[a,b]=mp(ghostMesh.g.position.x,ghostMesh.g.position.z);mctx.fillStyle='rgba(255,255,255,.45)';mctx.beginPath();mctx.arc(a,b,7,0,7);mctx.fill();}
  for(const c of cars){if(c===player)continue;const[a,b]=mp(c.x,c.z);mctx.fillStyle=hex(c.liv.p);mctx.beginPath();mctx.arc(a,b,7,0,7);mctx.fill();mctx.strokeStyle='rgba(0,0,0,.6)';mctx.lineWidth=2;mctx.stroke();}
  const[a,b]=mp(player.x,player.z);mctx.fillStyle='#fff';mctx.beginPath();mctx.arc(a,b,11,0,7);mctx.fill();
  mctx.fillStyle=hex(player.liv.p);mctx.beginPath();mctx.arc(a,b,8,0,7);mctx.fill();
}
// tezlik chiziqlari
const slc=$('#speedlines'),sctx=slc.getContext('2d');
function sizeSL(){slc.width=innerWidth/2|0;slc.height=innerHeight/2|0;}sizeSL();
let slOn=false;
function drawSpeedLines(){
  const sp=player?player.speed:0,k=state==='race'&&QUAL[S.quality].lines&&camMode!==2?clamp((sp-42)/30,0,1):0;
  if(k<=0){if(slOn){sctx.clearRect(0,0,slc.width,slc.height);slOn=false;}return;}
  slOn=true;const w=slc.width,h=slc.height,cx=w/2,cy=h*0.45,R=Math.hypot(w,h)/2;sctx.clearRect(0,0,w,h);
  sctx.strokeStyle=`rgba(255,255,255,${0.22*k})`;sctx.lineWidth=1.2;sctx.beginPath();
  for(let i=0;i<34;i++){const a=Math.random()*6.283,r1=R*(0.55+Math.random()*0.3),r2=r1+R*(0.12+Math.random()*0.25)*k;
    sctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);sctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);}
  sctx.stroke();
}

const hud={pos:$('#hPos'),lap:$('#hLap'),time:$('#hTime'),best:$('#hBest'),delta:$('#hDelta'),spd:$('#spd'),gear:$('#gear'),rpm:$('#rpmF'),warn:$('#warn'),msg:$('#msg'),
  drs:$('#bgDrs'),slip:$('#bgSlip'),dmg:$('#bgDmg'),bdrs:$('#bDrs')};
const lightEls=$$('#lights i');let hudT=0;
function ghostDelta(){
  if(!ghostData||player.lapDone<0)return null;const d=ghostData.d,p=player.prog-player.lapDone*N;
  while(ghostPtr*4+3<d.length&&d[ghostPtr*4+3]<p)ghostPtr++;
  if(ghostPtr*4+3>=d.length)return null;return (raceTime-player.lapStart)-ghostPtr*0.05;
}
// ---------- kokpit qatlami (ChatGPT kokpit rasmi) ----------
const ck={el:$('#cockpit'),wheel:$('#ckWheel'),gear:$('#ckGear'),spd:$('#ckSpd'),leds:$('#ckLeds'),on:null,lk:''};
function updateCockpit(){
  const on=camMode===2&&(state==='race'||state==='countdown'||state==='finished')&&!!player;
  if(on!==ck.on){ck.on=on;ck.el.classList.toggle('hidden',!on);if(player)player.mesh.g.visible=!on;if(on)sizeCockpit();}
  if(!on)return;
  ck.wheel.style.transform=`rotate(${(-player.steer/0.42*60).toFixed(1)}deg)`;
  const gi=gearInfo(player.vLong),sp=Math.round(player.speed*3.6);
  ck.gear.textContent=player.vLong<-0.5?'R':(player.speed<0.5&&state!=='race'?'N':gi.g);ck.spd.textContent=sp;
  const n=Math.round(clamp((gi.rpm-0.3)/0.7,0,1)*15),k=n+(gi.rpm>0.97&&Math.floor(performance.now()/90)%2?'b':'');
  if(k!==ck.lk){ck.lk=k;ck.leds.innerHTML=Array.from({length:15},(_,i)=>`<i class="${i<n?(i<5?'g':i<10?'r':'b'):''}${k.endsWith('b')&&i<n?' fl':''}"></i>`).join('');}
}
function sizeCockpit(){const w=Math.max(innerWidth,innerHeight*1.15*1672/941);ck.el.style.width=w+'px';ck.el.style.fontSize=(w/1672*100)+'px';}
addEventListener('resize',()=>{if(ck.on)sizeCockpit();});
function updateHUD(dt){
  const sp=player.speed,gi=gearInfo(player.vLong);
  hud.spd.textContent=Math.round(sp*3.6);
  hud.gear.textContent=player.vLong<-0.5?'R':(sp<0.5&&state!=='race'?'N':gi.g);
  hud.rpm.style.width=(gi.rpm*100).toFixed(1)+'%';
  const dz=DRSZ[player.idx]&&player.drsAvail;
  const dcls=player.drs?'act':(dz?'avail':'');
  if(hud.drs.dataset.c!==dcls){hud.drs.dataset.c=dcls;hud.drs.className='badge '+dcls;hud.bdrs.className='tbtn '+dcls;}
  hud.slip.classList.toggle('hidden',!(player.slip>0.15&&sp>20));hud.slip.classList.add('slip');
  hud.dmg.classList.toggle('hidden',!player.dmg);hud.dmg.classList.add('dmg');
  hudT-=dt;
  if(hudT<=0){hudT=0.1;
    hud.pos.textContent=`${standings().indexOf(player)+1}/${cars.length}`;
    hud.lap.textContent=S.mode==='tt'?`${Math.max(1,player.lapDone+1)}`:`${clamp(player.lapDone+1,1,LAPS)}/${LAPS}`;
    hud.time.textContent=fmt(S.mode==='tt'?(player.lapDone>=0&&state==='race'?raceTime-player.lapStart:0):(player.finished?player.finishTime:raceTime));
    const rec=store.get('f1a_best_'+curTrackIdx(),null);
    hud.best.textContent=fmt(isFinite(player.best)?player.best:(S.mode==='tt'?rec:null));
    if(S.mode==='tt'){const d=ghostDelta();if(d==null){hud.delta.textContent='—';hud.delta.className='';}else{hud.delta.textContent=(d>=0?'+':'−')+Math.abs(d).toFixed(2);hud.delta.className=d<0?'neg':'posv';}}
    {const ty=player.tyre||'M',w=Math.round((1-player.wear)*100);if(hud.tyK!==ty+w){hud.tyK=ty+w;$('#hTyre').innerHTML=`<img class="ico" src="${ASSET['ty_'+ty]}" alt="">${w}%`;}}
    const pitOn=player.pitReq||player.pitT>0;$('#bgPit').classList.toggle('hidden',!pitOn);$('#bgPit').classList.add('pit');$('#bPit').classList.toggle('act',pitOn);
    const i=player.idx,wrong=state==='race'&&sp>3&&(Math.sin(player.th)*TX[i]+Math.cos(player.th)*TZ[i])<-0.3;
    hud.warn.style.display=wrong?'block':'none';
  }
  if(msgT>0){msgT-=dt;if(msgT<=0)hud.msg.style.opacity=0;}
}
function updateAudio(){
  if(!actx||!snd.eg)return;const t=actx.currentTime,live=state==='race'||state==='finished'||state==='countdown';
  const sp=player.speed,gi=gearInfo(player.vLong),thr=player.throttle;
  snd.o1.frequency.setTargetAtTime(48+gi.rpm*210,t,0.04);snd.o2.frequency.setTargetAtTime(24+gi.rpm*105,t,0.04);snd.o3.frequency.setTargetAtTime(97+gi.rpm*421,t,0.04);
  snd.ef.frequency.setTargetAtTime(500+gi.rpm*2600*(0.5+thr*0.5),t,0.05);
  snd.eg.gain.setTargetAtTime(live?0.06+0.11*thr+0.04*gi.rpm:0,t,0.06);
  const scr=live&&!player.onGrass&&sp>5&&!isRain()?clamp((Math.abs(player.slipR)-0.1)*3+(Math.abs(player.slipF)-0.15)*2,0,1):0;
  snd.sg.gain.setTargetAtTime(scr*0.12,t,0.05);
  let cg=0;if(live&&standPos){const d=Math.hypot(player.x-standPos.x,player.z-standPos.z);cg=0.07*clamp(1-d/220,0,1);if(state==='finished')cg+=0.08;}
  snd.cg.gain.setTargetAtTime(cg,t,0.2);
  snd.rg.gain.setTargetAtTime(live&&isRain()?0.05:0,t,0.3);
  let nd=1e9,nc=null;for(const c of cars){if(c===player)continue;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<nd){nd=d;nc=c;}}
  if(nc&&live&&nd<70){snd.ao.frequency.setTargetAtTime(45+gearInfo(nc.vLong).rpm*200,t,0.05);snd.ag.gain.setTargetAtTime(0.07*(1-nd/70),t,0.08);}
  else snd.ag.gain.setTargetAtTime(0,t,0.1);
}
function updateCountdown(dt){
  if(state!=='countdown')return;
  cdT+=dt;const lit=Math.min(5,Math.floor(cdT/0.8));
  if(lit!==litPrev){litPrev=lit;if(lit>0){beep(440);vibrate(25);}}
  if(cdT>=4+goDelay){state='race';raceTime=0;litPrev=0;$('#lights').style.display='none';showMsg(t('go_msg'),1);beep(880,0.4,0.3);vibrate(70);}
  const on=state==='countdown'?lit:0;
  lightEls.forEach((e,i)=>e.classList.toggle('on',i<on));
  startLamps.forEach((m,i)=>{m.emissive.setHex(i<on?0xff1010:0x000000);m.emissiveIntensity=i<on?3:0;});
}

