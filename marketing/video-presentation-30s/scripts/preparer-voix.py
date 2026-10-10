"""Prépare les voix ElevenLabs avant le mixage : coupe les silences de tête et de fin,
resserre les respirations internes (pause max GAP s) et applique un léger atempo
(sans changer la hauteur). Les fichiers de Yannick ne sont jamais modifiés.

Usage : python scripts/preparer-voix.py "<dossier voix source>" <dossier sortie> <pause max s> <tempo> [nb]
Exemple : python scripts/preparer-voix.py "C:/Users/Yannico/Music/Afroback Stories Audio/Voix Paul Biya" recits/paul-biya/voix-preparees 0.2 1.04 10
"""
import subprocess, re, sys, os
SRC = sys.argv[1]; OUT = sys.argv[2]; GAP = float(sys.argv[3]); TEMPO = float(sys.argv[4])
NB = int(sys.argv[5]) if len(sys.argv) > 5 else 10
os.makedirs(OUT, exist_ok=True)
tot = 0
for i in range(1, NB + 1):
    src = f"{SRC}/{i}.mp3"
    d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout)
    log = subprocess.run(["ffmpeg","-hide_banner","-nostats","-i",src,"-af","silencedetect=n=-42dB:d=0.08","-f","null","-"],capture_output=True,text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    sil = list(zip(st, en + [d]*(len(st)-len(en))))
    # speech segments
    segs = []; cur = 0.0
    for a, b in sil:
        if a > cur + 0.01: segs.append([cur, a])
        cur = b
    if cur < d - 0.01: segs.append([cur, d])
    # pad edges slightly to keep consonants
    segs = [[max(0, a-0.03), min(d, b+0.05)] for a, b in segs]
    # build: concat segments with GAP silence (or original if shorter)
    parts = []; filt = []
    for k,(a,b) in enumerate(segs):
        filt.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[s{k}]")
        if k < len(segs)-1:
            orig = segs[k+1][0]-b
            g = max(0.0, min(GAP, orig))
            filt.append(f"anullsrc=r=44100:cl=stereo,atrim=0:{g:.3f}[g{k}]")
    order = "".join(f"[s{k}]" + (f"[g{k}]" if k < len(segs)-1 else "") for k in range(len(segs)))
    nin = 2*len(segs)-1
    filt.append(f"{order}concat=n={nin}:v=0:a=1,atempo={TEMPO}[o]")
    out = f"{OUT}/{i}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",";".join(filt),"-map","[o]",out],check=True)
    nd = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out],capture_output=True,text=True).stdout)
    tot += nd
    print(i, f"{d:.2f} -> {nd:.2f}", "segs", [(round(a,2),round(b,2)) for a,b in segs])
print("total", round(tot,2))
