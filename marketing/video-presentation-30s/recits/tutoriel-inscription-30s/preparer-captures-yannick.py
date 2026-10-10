"""Prépare les captures de Yannick (PC, app en English) pour le téléphone de la vidéo :
recadrage sur l'app, mise au format 390 × 844 (×2), floutage des données personnelles.
Les fichiers originaux de Yannick ne sont jamais modifiés."""
from PIL import Image, ImageFilter, ImageDraw
import os
SRC = r"C:/Users/Yannico/Music/Afroback Stories Audio/Voix Inscription 30s/Captures Inscription/"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "img")
BG = (11, 9, 6)
W, H = 780, 1688

def bounds(im):
    px = im.load(); w, h = im.size
    outer = lambda c: max(abs(c[0]-5), abs(c[1]-3), abs(c[2]-2)) <= 2
    white = lambda c: min(c) > 150
    xs = [x for x in range(w) if sum(1 for y in range(0, h, 7) if not outer(px[x, y]) and not white(px[x, y])) > h / 7 * 0.5]
    ys = [y for y in range(h) if sum(1 for x in range(xs[0], xs[-1]) if not outer(px[x, y]) and not white(px[x, y])) > (xs[-1] - xs[0]) * 0.5]
    return xs[0], ys[0], xs[-1] + 1, ys[-1] + 1

def fit(name, out, blur=(), split=None):
    im = Image.open(SRC + name).convert("RGB")
    for (x0, y0, x1, y1, ellipse) in blur:
        reg = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(14))
        if ellipse:
            m = Image.new("L", reg.size, 0); ImageDraw.Draw(m).ellipse((0, 0) + reg.size, fill=255); im.paste(reg, (x0, y0), m)
        else:
            im.paste(reg, (x0, y0))
    b = bounds(im)
    im = im.crop(b)
    s = W / im.width
    im = im.resize((W, round(im.height * s)), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H), BG)
    if im.height >= H:
        canvas.paste(im.crop((0, 0, W, H)), (0, 0))
    else:
        # coupe sur une ligne de fond uni : le haut reste en haut, les boutons du bas restent en bas
        px = im.load()
        uni = lambda y: all(max(abs(a - b) for a, b in zip(px[x, y], BG)) <= 6 for x in range(0, W, 4))
        y0 = split if split else max(y for y in range(int(im.height * 0.45), int(im.height * 0.86)) if uni(y))
        canvas.paste(im.crop((0, 0, W, y0)), (0, 0))
        bot = im.crop((0, y0, W, im.height)); canvas.paste(bot, (0, H - bot.height))
    canvas.save(os.path.join(OUT, out))
    print(out, b, "split", split)

# Ton profil : photo de profil et pseudo réels de Yannick floutés
fit("Capture d'écran 2026-10-06 213911.png", "capture-app-insc-en-y-profile.png",
    blur=[(222, 178, 345, 302, True), (88, 640, 300, 674, False)])
fit("Capture d'écran 2026-10-06 213929.png", "capture-app-insc-en-y-usage.png")
fit("Capture d'écran 2026-10-06 214014.png", "capture-app-insc-en-y-ready.png")
fit("Capture d'écran 2026-10-06 214039.png", "capture-app-insc-en-y-protect.png")
fit("Capture d'écran 2026-10-06 214101.png", "capture-app-insc-en-y-plan.png")

# Forfait : on ne garde que la carte gratuite « Découverte · Free · Start for free » (aucun prix affiché)
im = Image.open(os.path.join(OUT, "capture-app-insc-en-y-plan.png"))
im.crop((30, 405, 750, 700)).save(os.path.join(OUT, "capture-app-insc-en-y-plan-free.png"))
