"""ChatGPT qo'llar rasmi (shaffof GIF/PNG) -> assets/ck_hands.webp: chap va o'ng qo'l alohida rul dastaklariga joylanadi (1672x941)."""
import sys
from PIL import Image,ImageSequence
fr=next(ImageSequence.Iterator(Image.open(sys.argv[1]))).convert('RGBA');W,H=fr.size
sc=2.75;can=Image.new('RGBA',(1672,941),(0,0,0,0))
for (x0,x1,gx,gy,tx,ty) in [(0,W//2,105,262,515,612),(W//2,W,272,262,1157,612)]:
    part=fr.crop((x0,0,x1,H));part=part.resize((int(part.width*sc),int(part.height*sc)),Image.LANCZOS)
    big=Image.new('RGBA',(1672+3000,941+3000),(0,0,0,0));big.alpha_composite(part,(int(tx-(gx-x0)*sc)+1500,int(ty-gy*sc)+1500))
    can.alpha_composite(big.crop((1500,1500,1500+1672,1500+941)))
can.resize((1400,788),Image.LANCZOS).save('assets/ck_hands.webp','WEBP',quality=84,method=6);print('ok')
