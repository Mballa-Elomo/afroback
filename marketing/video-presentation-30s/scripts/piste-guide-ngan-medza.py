"""Piste sonore GUIDE de la vidéo 2 (mythe Ngan Medza), synthèse maison sans droits.
Ambiance : drone grave, talking drum, kora (cordes pincées), eau, vent, feu.
À remplacer par une musique cinématique africaine sous licence commerciale (script §1)."""
import numpy as np, wave

SR = 44100
DUR = 30.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

def put(t0, sig, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    n = min(len(sig), N - i0)
    if n <= 0: return
    L[i0:i0+n] += sig[:n] * gain * (1 - max(0, pan))
    R[i0:i0+n] += sig[:n] * gain * (1 + min(0, pan))

def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

def env_ar(n, att, rel):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / rel)

def talking(f0=110, f1=160, dur=0.5, dec=0.18):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * np.minimum(1, t / 0.07)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.exp(-t / dec) + rng.uniform(-1, 1, n) * 0.25 * np.exp(-t / 0.008)

def boom(dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 32 + 40 * np.exp(-t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)

def pluck(f, dur=1.6, bright=0.5):
    # Karplus-Strong : son de kora approximatif
    n = int(dur * SR); p = int(SR / f)
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.996 + 0.003 * bright)
    return out * 0.6

def noise(dur): return rng.uniform(-1, 1, int(dur * SR))

T = np.arange(N) / SR

# Drone grave (toute la vidéo, sauf silences)
drone = 0.10 * np.sin(2 * np.pi * 55 * T) + 0.06 * np.sin(2 * np.pi * 82.4 * T + 0.5 * np.sin(2 * np.pi * 0.2 * T)) + 0.03 * np.sin(2 * np.pi * 110.3 * T)
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * T) ** 2
fade = np.clip(T / 1.5, 0, 1) * np.clip((29.8 - T) / 0.3, 0, 1)
tension = 1 + 1.2 * np.clip((T - 14.5) / 4, 0, 1) * (T < 18.5)
drone = drone * fade * tension
L += drone; R += drone

# Vent (filtré) en continu, plus fort au début
wind = lowpass(noise(DUR), 0.02) * 1.6
wind *= (0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * T + 1)) * (0.35 + 0.65 * (T < 3)) * fade
L += wind * 0.5; R += np.roll(wind, 900) * 0.5

# Feu : craquements dans la scène 1 et la traversée
for t0 in np.concatenate([rng.uniform(0.3, 3.0, 25), rng.uniform(14.5, 18.5, 20)]):
    put(t0, noise(0.02) * env_ar(int(0.02 * SR), 0.001, 0.004), 0.25, rng.uniform(-0.6, 0.6))

# Eau : grondement de 7 à 10 s, puis 19 à 23 s
water = lowpass(noise(DUR), 0.04) * 2.0
wenv = np.clip((T - 7) / 1.2, 0, 1) * (T < 10) + np.clip((T - 19) / 0.5, 0, 1) * (T < 22.5) * 0.8 + 0.25 * ((T >= 14.5) & (T < 19))
L += water * wenv * 0.6; R += np.roll(water, 1500) * wenv * 0.6

# Talking drum : battement à 90 BPM (1 temps = 0,667 s) dans les passages de marche et de traversée
beat = 60 / 90
for k in range(60):
    t0 = 3.0 + k * beat
    if t0 >= 29.5: break
    if 9.6 <= t0 < 11.5 or 18.5 <= t0 < 19 or 22.5 <= t0 < 23 or 10 <= t0 < 11.5: continue
    g = 0.35 if (3 <= t0 < 7 or 14.5 <= t0 < 18.5 or 26.5 <= t0) else 0.18
    put(t0, talking(), g)
    if k % 2: put(t0 + beat / 2, talking(150, 210, 0.3, 0.1), g * 0.5, 0.3)

# Impacts sur les mots qui percutent
for t0, g in [(0.3, 0.6), (0.4, 0.5), (4.0, 0.5), (7.3, 0.8), (11.5, 0.9), (19.47, 0.7), (20.13, 0.7), (24.0, 0.6), (24.7, 0.6), (26.7, 0.5), (28.3, 0.8)]:
    put(t0, boom(), g)
    put(t0, talking(90, 130, 0.6, 0.25), g * 0.6)

# Yeux du serpent : sifflement grave (10 à 11,5 s)
hiss = lowpass(noise(1.6), 0.3) * env_ar(int(1.6 * SR), 0.6, 0.8)
put(10.1, hiss, 0.35)

# Kora : arpèges (entrée à 11,5 s, retour apaisé à 23 s, motif final)
scale_ = [196.0, 220.0, 246.9, 293.7, 329.6, 392.0]
for i, t0 in enumerate(np.arange(11.5, 18.5, beat / 2)):
    put(t0, pluck(scale_[(i * 2) % 6] * (1 if i % 4 else 0.5), 1.2), 0.35, 0.4 * np.sin(i))
for i, t0 in enumerate(np.arange(23.0, 26.5, beat / 2)):
    put(t0, pluck(scale_[(5 - i) % 6], 1.6), 0.3, -0.3)
for i, f in enumerate([392.0, 329.6, 293.7, 246.9, 196.0, 293.7, 392.0]):
    put(26.6 + i * beat / 2, pluck(f, 1.8), 0.4)

# Blessure : cri du serpent + éclaboussure (20,5 s)
n = int(1.2 * SR); t = np.arange(n) / SR
scream = np.sin(2 * np.pi * np.cumsum(300 - 180 * t) / SR) * lowpass(noise(1.2), 0.5) * env_ar(n, 0.02, 0.4)
put(20.5, scream, 0.5)
put(20.55, lowpass(noise(1.0), 0.25) * env_ar(int(SR), 0.005, 0.35), 0.9)

# Dernière frappe
put(29.5, talking(100, 150, 0.5, 0.2), 0.8)
put(29.5, boom(0.5), 0.6)

# Silences voulus (respiration) : 18,5 à 19 s et 22,5 à 23 s
for a, b in [(18.55, 19.0), (22.45, 23.0)]:
    m = (T >= a) & (T < b)
    L[m] *= 0.05; R[m] *= 0.05

mx = max(np.abs(L).max(), np.abs(R).max())
L /= mx / 0.89; R /= mx / 0.89
data = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open("public/audio/piste-guide-ngan-medza.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(data.tobytes())
print("ok")
