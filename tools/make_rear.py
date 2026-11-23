"""Orqa ko'rinish rasmini shaffof fonli 'impostor' teksturaga aylantiradi -> assets/car_rear.webp"""
import sys,numpy as np
from PIL import Image,ImageFilter
from scipy import ndimage
im=Image.open(sys.argv[1]).convert('RGB');a=np.asarray(im).astype(np.int16);H,W,_=a.shape
mn=a.min(2);mx=a.max(2);bg=(mn>226)&((mx-mn)<18)
lab,n=ndimage.label(bg);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
m=np.isin(lab,list(edge))
for i,sl in enumerate(ndimage.find_objects(lab)):
    if sl is not None and (i+1) not in edge and (lab[sl]==i+1).sum()>1500 and sl[0].start<600: m|=(lab==i+1)
m[:158,:]=True                       # T-kamera va havo qabul qilgich (ular mashina oldida turadi)
m[870:,:]=True                       # yerdagi soya
m=ndimage.binary_dilation(m,iterations=2)
al=Image.fromarray(((~m)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
o=im.convert('RGBA');o.putalpha(al);o=o.resize((768,512),Image.LANCZOS)
o.save('assets/car_rear.webp','WEBP',quality=86,method=6)
Image.alpha_composite(Image.new('RGBA',o.size,(60,140,90,255)),o).save('/tmp/rear_chk.png');print('ok')
