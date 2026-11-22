"""ChatGPT mashina maketini (yon/yuqori/old/orqa) proyeksiya teksturasiga aylantiradi -> assets/car_bp.webp"""
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
src=sys.argv[1];R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a=np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H,W,_=a.shape
def fill(mask,rect):
    x0,y0,x1,y1=rect;sub=a[y0:y1,x0:x1];m=mask[y0:y1,x0:x1]
    if not m.any() or m.all():return
    _,(iy,ix)=ndimage.distance_transform_edt(m,return_indices=True);a[y0:y1,x0:x1]=sub[iy,ix]
mn=a.min(2);mx=a.max(2)
bg=(mn>232)&((mx-mn)<14)
# ko'rinishlar: yon, yuqori, old, orqa
views=[(0,80,1065,380),(0,430,1065,870),(1060,90,1536,390),(1060,480,1536,800)]
# "7" raqamlarini o'chirish (raqam dekal bilan qo'yiladi)
rm=np.zeros((H,W),bool)
for (x0,y0,x1,y1) in [(755,235,835,305),(175,620,228,668),(1280,238,1330,278)]:
    rm[y0:y1,x0:x1]|=(mn[y0:y1,x0:x1]>190)
rm=ndimage.binary_dilation(rm,iterations=3)
fill(rm,(0,0,W,H))
# g'ildiraklarni to'q rangga bo'yash (kuzovga tushmasin)
yy,xx=np.mgrid[0:H,0:W]
dark=np.array([24,24,27],np.float32)
for cx,cy,r in [(200,285,68),(960,285,68)]:
    a[(xx-cx)**2+(yy-cy)**2<r*r]=dark
for cx,cy in [(205,487),(205,797),(905,487),(905,797)]:
    a[(abs(xx-cx)<72)&(abs(yy-cy)<46)]=dark
bg=bg|(np.abs(a-dark).sum(2)<1)&False
bg=ndimage.binary_dilation(bg|(mn>205)&((mx-mn)<20)&ndimage.binary_dilation(bg,iterations=4),iterations=2)
for v in views:fill(bg,v)
Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(os.path.join(R,'assets','car_bp.webp'),'WEBP',quality=86,method=6)
print('ok')
