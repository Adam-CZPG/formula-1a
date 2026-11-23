"""Kokpit rasmini qatlamlarga ajratadi: assets/ck_base.webp (oynalar shaffof) va assets/ck_wheel.webp (aylanadigan rul)."""
import sys,numpy as np
from PIL import Image,ImageDraw,ImageFilter
from scipy import ndimage
im=Image.open(sys.argv[1]).convert('RGB');W,H=im.size
a=np.asarray(im).astype(np.int16);mn=a.min(2);mx=a.max(2)
wh=(mn>228)&((mx-mn)<20)
lab,n=ndimage.label(wh)
sel=[]
for i,sl in enumerate(ndimage.find_objects(lab)):
    if sl is None:continue
    cnt=(lab[sl]==i+1).sum();cy=(sl[0].start+sl[0].stop)/2
    if cnt>4000 and (sl[0].start<5 or cy<0.42*H):sel.append(i+1)
mask=ndimage.binary_dilation(np.isin(lab,sel),iterations=2)
alpha=Image.fromarray(((~mask)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
base=im.convert('RGBA');base.putalpha(alpha)
cx,cy,rx,ry=835,617,338,176
box=(cx-rx-8,cy-ry-8,cx+rx+8,cy+ry+8)
wm=Image.new('L',(W,H),0);ImageDraw.Draw(wm).ellipse((cx-rx,cy-ry,cx+rx,cy+ry),fill=255)
wheel=im.convert('RGBA');wheel.putalpha(wm.filter(ImageFilter.GaussianBlur(1)));wheel=wheel.crop(box)
ox,oy=box[0],box[1];ImageDraw.Draw(wheel).rounded_rectangle((703-ox,497-oy,962-ox,623-oy),radius=8,fill=(5,7,10,255))
ImageDraw.Draw(base).ellipse((cx-rx+20,cy-ry+14,cx+rx-20,cy+ry-6),fill=(16,16,19,255))
base.thumbnail((1400,1400),Image.LANCZOS);base.save('assets/ck_base.webp','WEBP',quality=80,method=6)
wheel.save('assets/ck_wheel.webp','WEBP',quality=84,method=6)
Image.alpha_composite(Image.new('RGBA',base.size,(90,140,200,255)),base).convert('RGB').resize((836,470)).save('/tmp/ckb.png')
print('ok',box)
