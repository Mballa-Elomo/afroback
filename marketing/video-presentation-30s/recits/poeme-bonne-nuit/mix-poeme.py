"""Mixage du poème « Bonne nuit » (voix en un seul fichier, découpée aux respirations).

Usage (depuis le projet) : python recits/poeme-bonne-nuit/mix-poeme.py recits/poeme-bonne-nuit/config-audio.json
- découpe la voix aux points `cuts` (secondes de la voix brute) et place chaque morceau à brut + offset ;
- musique en fondu d'entrée, baissée fort sous la voix (sidechain), remontée douce sur la fin, fondu de sortie ;
- normalise à -14 LUFS ;
- écrit le minutage des mots (transcription whisper recalée) en TypeScript pour les sous-titres.
"""
import json, os, subprocess, sys, tempfile

cfg = json.load(open(sys.argv[1], encoding="utf8"))
D = cfg["duration"]
tmp = tempfile.mkdtemp(prefix="afroback-poeme-")
segs = cfg["segments"]  # [{"a":0,"b":11.3,"off":1.0}, ...]

inputs = []
parts = []
for k, sg in enumerate(segs):
    inputs += ["-i", cfg["voice"]]
    ms = int(round((sg["a"] + sg["off"]) * 1000))
    parts.append(f"[{k}:a]atrim={sg['a']}:{sg['b']},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo,"
                 f"afade=t=in:d=0.04,afade=t=out:st={sg['b'] - sg['a'] - 0.06}:d=0.06,adelay={ms}|{ms}[v{k}]")
n = len(segs)
mi = n
inputs += ["-ss", str(cfg.get("music_offset", 0)), "-i", cfg["music"]]
fc = ";".join(parts)
fc += ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D},highpass=f=70,equalizer=f=150:t=q:w=1:g=2,aecho=0.8:0.6:50:0.08,volume=1.9,asplit=2[sc][vo]"
mv = cfg["music_volume"]
up_at, up_to = cfg["music_up_at"], cfg["music_up_to"]
vol = f"volume='if(lt(t,{up_at}),{mv},{mv}+({up_to}-{mv})*min(1,(t-{up_at})/1.5))':eval=frame"
fc += (f";[{mi}:a]atrim=0:{D},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo,lowpass=f=9000,{vol},"
       f"afade=t=in:st=0:d={cfg['music_fade_in']},afade=t=out:st={D - cfg['music_fade_out']}:d={cfg['music_fade_out']}[mu]")
fc += ";[mu][sc]sidechaincompress=threshold=0.03:ratio=5:attack=30:release=700:makeup=1[duck]"
fc += ";[duck][vo]amix=inputs=2:normalize=0,alimiter=limit=0.9[out]"
raw = os.path.join(tmp, "mix.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc, "-map", "[out]", "-ar", "44100", "-t", str(D), raw], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", cfg["out"]], check=True)

def remap(t):
    for sg in segs:
        if sg["a"] - 0.01 <= t <= sg["b"] + 0.01:
            return round(t + sg["off"], 2)
    raise SystemExit(f"Mot hors segment : {t}")

words = json.load(open(cfg["words"], encoding="utf8"))
merged = []
for w, a, b in words:
    if merged and (w.startswith("'") or w.startswith("-")):
        merged[-1][0] += w; merged[-1][2] = b
    else:
        merged.append([w, a, b])
mapped = [[w, remap(a), remap(b)] for w, a, b in merged]
json.dump(mapped, open(cfg["timing_out"], "w", encoding="utf8"), ensure_ascii=False, indent=0)
ts = "// Généré par recits/poeme-bonne-nuit/mix-poeme.py : [mot, début (s), fin (s)] dans la vidéo.\nexport const MOTS: [string, number, number][] = " + json.dumps(mapped, ensure_ascii=False) + ";\n"
open(cfg["ts_out"], "w", encoding="utf8").write(ts)
print("OK", cfg["out"], len(mapped), "mots")
