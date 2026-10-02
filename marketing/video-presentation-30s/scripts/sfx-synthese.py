"""Bruitages de motion design synthétisés (libres de droits, aucun échantillon externe).

Usage : python scripts/sfx-synthese.py public/monsterquad/sfx
Produit : whoosh.wav, whoosh-court.wav, impact.wav, sub-drop.wav, riser.wav, tampon.wav, tic.wav, glitch.wav
(48 kHz, stéréo, 16 bits).
"""
import os, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def lowpass(x, cut):
    """Passe-bas à un pôle, fréquence de coupure variable (tableau ou scalaire)."""
    cut = np.broadcast_to(np.asarray(cut, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cut):
    return x - lowpass(x, cut)


def ecrire(chemin, gauche, droite=None):
    if droite is None:
        droite = gauche
    st = np.stack([gauche, droite], axis=1)
    pic = np.max(np.abs(st)) or 1
    st = st / pic * 0.89
    with wave.open(chemin, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def t_(d):
    return np.arange(int(d * SR)) / SR


def whoosh(d=0.5, pic=0.55):
    t = t_(d)
    p = t / d
    env = np.where(p < pic, (p / pic) ** 2.2, ((1 - p) / (1 - pic)) ** 1.6)
    coupe = 300 + 5200 * np.sin(np.pi * np.clip(p / (pic * 2), 0, 1)) ** 2
    bruit = rng.standard_normal(len(t))
    son = highpass(lowpass(bruit, coupe), 180) * env
    pan = np.clip(p * 1.2, 0, 1)
    return son * (1 - pan * 0.7), son * (0.3 + pan * 0.7)


def impact(d=1.1):
    t = t_(d)
    f = 38 + 70 * np.exp(-t * 14)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.2)
    claque = lowpass(rng.standard_normal(len(t)), 2600) * np.exp(-t * 38) * 1.4
    corps = lowpass(rng.standard_normal(len(t)), 700) * np.exp(-t * 9) * 0.6
    s = np.tanh((sub * 1.3 + claque + corps) * 1.6)
    return s, s


def sub_drop(d=1.6):
    t = t_(d)
    f = 30 + 70 * np.exp(-t * 2.6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6) * np.minimum(1, t * 200)
    s = np.tanh(s * 1.8)
    return s, s


def riser(d=2.0):
    t = t_(d)
    p = t / d
    bruit = highpass(lowpass(rng.standard_normal(len(t)), 800 + 9000 * p**2), 300 + 2500 * p)
    f = 180 * (12 ** p)
    ton = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    env = p**2.4
    s = (bruit * 0.8 + ton) * env
    s[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    g = s * (1 - 0.4 * np.sin(2 * np.pi * 3 * t))
    dr = s * (1 - 0.4 * np.cos(2 * np.pi * 3 * t))
    return g, dr


def tampon(d=0.7):
    t = t_(d)
    g, _ = impact(d)
    mid = lowpass(highpass(rng.standard_normal(len(t)), 900), 3800) * np.exp(-t * 26) * 1.2
    s = np.tanh(g * 0.8 + mid)
    return s, s


def tic(d=0.06):
    t = t_(d)
    s = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90)
    return s, s


def glitch(d=0.35):
    t = t_(d)
    n = len(t)
    s = np.zeros(n)
    pos = 0
    while pos < n:
        long = int(rng.uniform(0.01, 0.04) * SR)
        f = rng.uniform(200, 3000)
        seg = np.sign(np.sin(2 * np.pi * f * t[: min(long, n - pos)])) * rng.uniform(0.3, 1)
        s[pos : pos + len(seg)] = seg
        pos += long + int(rng.uniform(0, 0.015) * SR)
    s = lowpass(s, 6000) * np.exp(-t * 4)
    return s, np.roll(s, 90)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "public/monsterquad/sfx"
    os.makedirs(out, exist_ok=True)
    for nom, (g, d) in {
        "whoosh": whoosh(0.5),
        "whoosh-court": whoosh(0.28, 0.6),
        "impact": impact(),
        "sub-drop": sub_drop(),
        "riser": riser(2.0),
        "tampon": tampon(),
        "tic": tic(),
        "glitch": glitch(),
    }.items():
        ecrire(os.path.join(out, nom + ".wav"), g, d)
        print("ok", nom)
