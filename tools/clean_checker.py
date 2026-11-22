"""Rasmga chizilgan shaxmat-katak fonini olib tashlaydi va eng katta obyektni qoldiradi.
Foydalanish: python3 tools/clean_checker.py kirish.png chiqish.png"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def checker_mask(a, mx, mn):
    neutral = ((mx - mn) < 20)
    light = mn.astype(np.int16)
    # katakning ikki rangi: deyarli oq va och kulrang; ikkalasi yaqin atrofda navbatlashsa — fon
    w = (light > 238) & neutral
    gr = (light > 185) & (light < 236) & neutral
    win = 13
    near_w = ndimage.maximum_filter(w.astype(np.uint8), win) > 0
    near_g = ndimage.maximum_filter(gr.astype(np.uint8), win) > 0
    frac_w = ndimage.uniform_filter(w.astype(float), win)
    checker = (w | gr) & near_w & near_g & (frac_w > 0.18) & (frac_w < 0.82)
    checker = ndimage.binary_closing(checker, iterations=2) & (w | gr)
    lab, n = ndimage.label(checker)
    if n:
        sizes = ndimage.sum(checker, lab, range(1, n + 1))
        bg = np.isin(lab, [i + 1 for i, s_ in enumerate(sizes) if s_ > 60])
    else:
        bg = checker
    return bg

def clean(path, mode='edge'):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    mx, mn = a.max(2), a.min(2)
    if mode == 'edge':
        bgcand = (mn > 175) & ((mx - mn) < 22)
        lab, n = ndimage.label(bgcand)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(edge))
    else:
        bg = checker_mask(a, mx, mn)
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=1)
    lab2, n2 = ndimage.label(fg)
    if n2:
        sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
        keep = 1 + int(np.argmax(sizes)); big = sizes.max(); sel = []
        for i, s_ in enumerate(sizes):
            i += 1
            if s_ < big * 0.03: continue
            if i != keep:
                ys, xs = np.where(lab2 == i)
                if xs.min() == 0 or xs.max() == fg.shape[1]-1 or ys.min() == 0 or ys.max() == fg.shape[0]-1: continue
            sel.append(i)
        fg = np.isin(lab2, sel)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA'); out.putalpha(alpha)
    bb = out.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox()
    return out.crop(bb) if bb else out

if __name__ == '__main__':
    clean(sys.argv[1], sys.argv[3] if len(sys.argv) > 3 else 'edge').save(sys.argv[2])
