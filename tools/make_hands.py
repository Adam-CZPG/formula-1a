"""Kokpit uchun rulni ushlagan qo'llar (qo'lqop + kombinezon) -> assets/ck_hands.webp (1672x941 koordinatada chiziladi)."""
from PIL import Image,ImageDraw,ImageFilter
S=2;W,H=1672*S,941*S
def hand(flip):
    lay=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(lay)
    f=(lambda x:1670-x) if flip else (lambda x:x)
    q=lambda pts:[(f(x)*S,y*S) for x,y in pts]
    def box(x0,y0,x1,y1):a,b=sorted((f(x0),f(x1)));return [a*S,y0*S,b*S,y1*S]
    RED,DRED,BLK,GLV,GLV2=(176,14,20,255),(118,8,12,255),(20,20,24,255),(28,28,32,255),(40,40,46,255)
    d.polygon(q([(250,941),(565,941),(565,760),(508,698),(438,703)]),fill=RED)           # bilak (kombinezon)
    d.polygon(q([(250,941),(305,941),(446,712),(438,703)]),fill=DRED)                    # soya tomoni
    d.polygon(q([(335,941),(395,941),(502,722),(472,712)]),fill=BLK)                     # qora chiziq
    d.polygon(q([(438,703),(508,698),(565,760),(552,780),(497,724),(450,726)]),fill=(232,232,236,255))  # manjet
    d.rounded_rectangle(box(466,548,562,744),radius=34*S,fill=GLV)                       # kaft
    d.polygon(q([(472,598),(540,574),(548,690),(476,712)]),fill=(196,18,24,255))         # qizil panel
    d.polygon(q([(478,640),(544,622),(546,640),(480,660)]),fill=(238,238,240,255))       # oq chiziq
    for i,y in enumerate([564,604,644,682]):                                             # barmoqlar
        d.rounded_rectangle(box(528,y,630-i*7,y+36),radius=17*S,fill=GLV2)
        kx=f(608-i*7);d.ellipse([(kx-9)*S,(y+6)*S,(kx+9)*S,(y+17)*S],fill=(78,78,86,255))
    d.ellipse(box(582,526,662,566),fill=GLV)                                             # bosh barmoq
    return lay
L=Image.alpha_composite(hand(False),hand(True))
sh=L.split()[3].filter(ImageFilter.GaussianBlur(10*S)).point(lambda v:int(v*0.45))
shadow=Image.new('RGBA',(W,H),(0,0,0,255));shadow.putalpha(sh)
shadow=shadow.transform(shadow.size,Image.AFFINE,(1,0,-6*S,0,1,-10*S))
out=Image.alpha_composite(shadow,L).resize((1400,788),Image.LANCZOS)
out.save('assets/ck_hands.webp','WEBP',quality=82,method=6)
print('ok')
