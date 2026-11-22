"""ChatGPT assetlarini o'yin uchun tayyorlaydi: qirqish, o'lcham, WebP, src/assets.js (base64)."""
import base64,io,os,sys
from PIL import Image
U=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/uploads'
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A=os.path.join(R,'assets');os.makedirs(A,exist_ok=True)
def src(n):return Image.open(os.path.join(U,n+'-image.png'))
def trim(im,pad=6):
    im=im.convert('RGBA');a=im.getchannel('A').point(lambda v:255 if v>20 else 0);b=a.getbbox()
    im=im.crop(b);w,h=im.size;c=Image.new('RGBA',(w+2*pad,h+2*pad),(0,0,0,0));c.paste(im,(pad,pad));return c
def fit(im,maxw,maxh):im=im.copy();im.thumbnail((maxw,maxh),Image.LANCZOS);return im
def save(im,name,q=82):
    p=os.path.join(A,name+'.webp');im.save(p,'WEBP',quality=q,method=6);return p
out={}
# 1) ikonkalar: alpha bo'yicha alohida bo'laklar
sheet=src('21bfcd00').convert('RGBA');W,H=sheet.size
boxes={'coin':(0,0,500,470),'crate1':(500,0,1020,470),'crate2':(1020,0,1536,470),'trophy':(200,460,760,1024),'xp':(780,460,1400,1024)}
for k,b in boxes.items():out['ic_'+k]=save(fit(trim(sheet.crop(b)),160,160),'ic_'+k)
# 2) liga nishonlari
for k,n in [('lg1','d4a0230b'),('lg2','539f6b66'),('lg3','d0ed8779'),('lg4','9389ec4d'),('lg5','eabcb4fc')]:
    out['b_'+k]=save(fit(trim(src(n)),220,220),'b_'+k)
# 3) logotip
out['logo']=save(fit(trim(src('8690d9f9'),2),640,220),'logo',85)
# 4) pilotlar
g=src('20270642').convert('RGB');s=1254
cells={'p2':(0,0,418,627),'p3':(418,0,836,627),'p4':(836,0,1254,627),'p5':(0,627,627,1254),'p6':(627,627,1254,1254)}
def face(im):
    w,h=im.size;side=min(w,h);x=(w-side)//2;return im.crop((x,0,x+side,side)).resize((200,200),Image.LANCZOS)
for k,b in cells.items():out['pl_'+k]=save(face(g.crop(b)),'pl_'+k,80)
out['pl_p1']=save(src('bcb8982d').convert('RGB').crop((190,10,1064,884)).resize((200,200),Image.LANCZOS),'pl_p1',80)
# 5) garaj foni
bg=src('4bdcd115').convert('RGB').resize((1280,720),Image.LANCZOS);out['bg_garage']=save(bg,'bg_garage',72)
# src/assets.js
lines=['// Avtomatik yaratilgan: tools/make_assets.py (assets/*.webp)','const ASSET={']
tot=0
for k in sorted(out):
    b=open(out[k],'rb').read();tot+=len(b);lines.append(f"  {k}:'data:image/webp;base64,{base64.b64encode(b).decode()}',")
lines.append('};');open(os.path.join(R,'src','assets.js'),'w').write('\n'.join(lines)+'\n')
print(len(out),'asset, jami',round(tot/1024),'KB')
