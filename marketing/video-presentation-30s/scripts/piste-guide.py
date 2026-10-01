"""Piste rythmique GUIDE à 120 BPM (synthèse maison, sans droits) pour caler le montage.
À remplacer par la musique afrobeats sous licence commerciale (voir script §1)."""
import math, random, struct, wave

SR = 44100
DUR = 30.0
N = int(SR * DUR)
buf = [0.0] * N
random.seed(7)

def add(t0, samples, gain=1.0):
    i0 = int(t0 * SR)
    for k, v in enumerate(samples):
        i = i0 + k
        if 0 <= i < N:
            buf[i] += v * gain

def env(n, decay):
    return [math.exp(-k / (decay * SR)) for k in range(n)]

def kick():
    n = int(0.4 * SR); out = []; ph = 0.0
    for k in range(n):
        t = k / SR
        f = 45 + 110 * math.exp(-t / 0.04)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t / 0.13) * 1.0)
    return out

def talking(f0=170, f1=250, dur=0.28):
    n = int(dur * SR); out = []; ph = 0.0
    for k in range(n):
        t = k / SR
        f = f0 + (f1 - f0) * min(1, t / 0.08)
        ph += 2 * math.pi * f / SR
        out.append((math.sin(ph) + 0.3 * math.sin(2 * ph)) * math.exp(-t / 0.09) + (random.random() * 2 - 1) * 0.3 * math.exp(-t / 0.01))
    return out

def noise_hp(dur, decay, a=0.85):
    n = int(dur * SR); out = []; prev_x = 0.0; prev_y = 0.0
    for k in range(n):
        x = random.random() * 2 - 1
        y = a * (prev_y + x - prev_x); prev_x, prev_y = x, y
        out.append(y * math.exp(-k / (decay * SR)))
    return out

def tone(freqs, dur, decay, harm=(1, 0.5, 0.33, 0.25)):
    n = int(dur * SR); out = []
    for k in range(n):
        t = k / SR; v = 0.0
        for f in freqs:
            for h, a in enumerate(harm, 1):
                v += a * math.sin(2 * math.pi * f * h * t)
        out.append(v / (len(freqs) * 2) * math.exp(-t / decay))
    return out

def balafon(f, dur=0.25):
    n = int(dur * SR)
    return [(math.sin(2 * math.pi * f * k / SR) + 0.4 * math.sin(2 * math.pi * f * 4 * k / SR) * math.exp(-k / (0.02 * SR))) * math.exp(-k / (0.07 * SR)) for k in range(n)]

K = kick(); TD = talking(); TDh = talking(220, 320, 0.2); SH = noise_hp(0.06, 0.018); SN = noise_hp(0.18, 0.05, 0.6)
BOOM = [math.sin(2 * math.pi * (38 + 30 * math.exp(-k / (0.1 * SR))) * k / SR) * math.exp(-k / (0.5 * SR)) for k in range(int(1.4 * SR))]
STAB = tone([220, 261.63, 329.63, 440], 0.22, 0.08)
BASS_NOTES = [55, 55, 65.41, 49]

def muted(t):
    return (3.5 <= t < 4.0) or (25.5 <= t < 26.0) or t >= 29.5

# groove : kick, shekere, basse, stabs
beat = 0.5
t = 0.0
while t < 29.5:
    if not muted(t):
        add(t, K, 0.9)
    for q in range(4):
        tt = t + q * 0.125
        if not muted(tt):
            add(tt, SH, 0.35 if q % 2 else 0.18)
    bar = int(t // 2)
    if not muted(t):
        add(t + 0.25, tone([BASS_NOTES[bar % 4]], 0.22, 0.09, (1, 0.3)), 0.8)
        add(t, tone([BASS_NOTES[bar % 4]], 0.2, 0.08, (1, 0.3)), 0.7)
    if t >= 4.0 and not muted(t + 0.25) and int(t / 0.5) % 4 in (1, 3):
        add(t + 0.25, TD, 0.35)  # talking drum sur les contretemps
    t += beat

# stabs aux mesures + drops
for b in range(0, 30, 2):
    if not muted(b) and b >= 4:
        add(b, STAB, 0.45)
for d in (0.0, 4.0, 26.0):
    add(d, STAB, 0.7); add(d, BOOM, 0.9); add(d, TDh, 0.6)

# rafale 0-2 s : une frappe tous les 0,25 s
for i in range(8):
    add(i * 0.25, TD if i % 2 == 0 else TDh, 0.7)
# impacts titres 2,0 et 2,5
for tt in (2.0, 2.5):
    add(tt, BOOM, 0.5)
# relances : roulement de talking drum
for start in (13.5, 17.5):
    for i in range(8):
        add(start + i * 0.0625, TDh, 0.35 + i * 0.05)
# frappes des mots (lis/écoute/regarde, aime/commente/partage, mythes...)
for tt in (10.0, 10.5, 11.0, 14.0, 15.0, 18.0, 18.5, 19.0, 24.0, 24.25):
    add(tt, BOOM, 0.35); add(tt, SN, 0.4)
# balafon : motif AFROBACK
motif = [440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 392]
for base in (8.0, 26.5, 27.5):
    for i, f in enumerate(motif):
        add(base + i * 0.125, balafon(f), 0.35)
# break 3,5 s : souffle inversé
n = int(0.5 * SR)
add(3.5, [(random.random() * 2 - 1) * (k / n) ** 2 * 0.5 for k in range(n)])
# montée 22 → 25,5 s : bruit qui monte + roulement qui accélère
n = int(3.5 * SR)
add(22.0, [(random.random() * 2 - 1) * (k / n) ** 2 * 0.35 + math.sin(2 * math.pi * (200 + 900 * (k / n) ** 2) * k / SR) * 0.08 * (k / n) for k in range(n)])
tt = 22.0
while tt < 25.5:
    prog = (tt - 22.0) / 3.5
    add(tt, SN, 0.15 + 0.35 * prog)
    tt += 0.25 if prog < 0.35 else (0.125 if prog < 0.7 else 0.0625)
# ding de validation 25,0 s
add(25.0, tone([1318.5, 1975.5], 0.6, 0.18, (1, 0.2)), 0.5)
# dernière frappe 29,5 s + résonance
add(29.5, TD, 1.0); add(29.5, BOOM, 0.8); add(29.5, STAB, 0.5)

# normalisation + fondu anti-clic final
peak = max(abs(v) for v in buf) or 1
g = 0.89 / peak
fade = int(0.02 * SR)
with wave.open("public/audio/piste-guide-120bpm.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for i, v in enumerate(buf):
        if i > N - fade:
            v *= (N - i) / fade
        frames += struct.pack("<h", int(max(-1, min(1, math.tanh(v * g * 1.2))) * 32000))
    w.writeframes(bytes(frames))
print("ok")
