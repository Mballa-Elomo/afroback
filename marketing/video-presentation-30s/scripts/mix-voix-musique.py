"""Mixage voix off + musique (+ effets sonores) pour les vidéos « récit » AFROBACK (30 s).

Usage : python scripts/mix-voix-musique.py chemin/config.json

Config (JSON) :
{
  "voice_dir": "C:/Users/Yannico/Music/Afroback Stories Audio/Voix Ngan Medza",  # 1.mp3, 2.mp3, ...
  "lines": [{"start": 0.4, "text": "Écoute."}, ...],                             # une entrée par fichier, dans l'ordre
  "voice_ext": "mp3",            # facultatif (ex. "wav" pour des voix préparées par scripts/preparer-voix.py)
  "music": "C:/Users/Yannico/Music/Afroback Stories Audio/BG Music/Baobab Oath (1).mp3",
  "music_offset": 8.0,           # seconde du morceau où commencer (sauter une intro silencieuse)
  "music_volume": 0.30,          # avant compression latérale
  "sfx": [{"file": "C:/.../tonnerre.mp3", "at": 12.0, "gain": 0.8}],          # facultatif
  "music_dips": [{"start": 39.3, "end": 39.8, "level": 0.15}],                # facultatif : creux de musique (relance)
  "duration": 30,
  "out": "public/audio/mix-<slug>.wav",
  "timing_out": "public/audio/mix-<slug>.timing.json"
}

Ce que fait le script :
1. coupe les silences au début et à la fin de chaque réplique ;
2. vérifie que chaque réplique finit avant la suivante (sinon ARRÊT avec le détail) ;
3. place les répliques, ajoute un léger écho chaud, baisse la musique sous la voix
   (environ 10 à 12 dB) et la remonte dans les silences, fondu de fin de 1,4 s ;
4. normalise à -14 LUFS (réseaux sociaux) ;
5. écrit le minutage réel + une estimation du temps de chaque mot (pour les sous-titres karaoké).
"""
import json, os, subprocess, sys, tempfile


def dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return float(out)


def main(cfg_path):
    cfg = json.load(open(cfg_path, encoding="utf8"))
    D = cfg.get("duration", 30)
    tmp = tempfile.mkdtemp(prefix="afroback-mix-")
    lines = cfg["lines"]
    timing = []
    for i, ln in enumerate(lines, 1):
        src = os.path.join(cfg["voice_dir"], f"{i}.{cfg.get('voice_ext', 'mp3')}")
        if not os.path.exists(src):
            sys.exit(f"Fichier manquant : {src}")
        wav = os.path.join(tmp, f"v{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        "-ar", "44100", "-ac", "2", wav], check=True)
        timing.append({"n": i, "start": ln["start"], "dur": round(dur(wav), 3), "text": ln.get("text", ""), "wav": wav})

    problems = []
    for a, b in zip(timing, timing[1:]):
        if a["start"] + a["dur"] > b["start"] - 0.1:
            problems.append(f"Réplique {a['n']} finit à {a['start'] + a['dur']:.2f} s mais la {b['n']} commence à {b['start']} s")
    last = timing[-1]
    if last["start"] + last["dur"] > D - 0.4:
        problems.append(f"Réplique {last['n']} finit à {last['start'] + last['dur']:.2f} s (trop près de la fin)")
    for t in timing:
        print(f"{t['n']}: {t['start']:.2f} -> {t['start'] + t['dur']:.2f} s  {t['text']}")
    if problems:
        print("\nCHEVAUCHEMENTS :\n- " + "\n- ".join(problems))
        sys.exit(2)

    inputs = ["-ss", str(cfg.get("music_offset", 0)), "-i", cfg["music"]]
    parts = []
    for k, t in enumerate(timing, 1):
        inputs += ["-i", t["wav"]]
        ms = int(t["start"] * 1000)
        parts.append(f"[{k}:a]adelay={ms}|{ms}[d{k}]")
    n = len(timing)
    sfx = cfg.get("sfx", [])
    for j, fx in enumerate(sfx):
        inputs += ["-i", fx["file"]]
        idx = n + 1 + j
        ms = int(fx["at"] * 1000)
        parts.append(f"[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,volume={fx.get('gain', 1.0)},adelay={ms}|{ms}[s{j}]")
    duck = "sidechaincompress=threshold=0.05:ratio=3:attack=20:release=500"
    fc = ";".join(parts)
    fc += ";" + "".join(f"[d{k}]" for k in range(1, n + 1)) + f"amix=inputs={n}:normalize=0,apad=whole_dur={D},atrim=0:{D},equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.5:45:0.12,volume=1.8,asplit=2[sc][vo]"
    dips = "".join(f",volume={dp.get('level', 0.15)}:enable='between(t,{dp['start']},{dp['end']})'" for dp in cfg.get("music_dips", []))
    fc += f";[0:a]atrim=0:{D},asetpts=PTS-STARTPTS,volume={cfg.get('music_volume', 0.30)}{dips},afade=t=out:st={D - 1.4}:d=1.4[mu]"
    fc += f";[mu][sc]{duck}[duck]"
    mix_in = "[duck][vo]" + "".join(f"[s{j}]" for j in range(len(sfx)))
    fc += f";{mix_in}amix=inputs={2 + len(sfx)}:normalize=0,alimiter=limit=0.9[out]"
    raw = os.path.join(tmp, "mix.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc, "-map", "[out]", "-ar", "44100", "-t", str(D), raw], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", cfg["out"]], check=True)

    # Temps estimé de chaque mot (au prorata des caractères, ponctuation = petite pause).
    for t in timing:
        ws = t["text"].split()
        weights = [len(x) + (4 if x[-1] in ",.:;…!?" else 0) + 2 for x in ws]
        tot = sum(weights) or 1
        acc = 0
        t["words"] = []
        for x, k in zip(ws, weights):
            t["words"].append([x, round(t["start"] + t["dur"] * acc / tot, 2)])
            acc += k
        del t["wav"]
    json.dump(timing, open(cfg["timing_out"], "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"\nOK : {cfg['out']} (+ minutage {cfg['timing_out']})")


if __name__ == "__main__":
    main(sys.argv[1])
