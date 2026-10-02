#!/usr/bin/env bash
# Extrait les plans retenus des rushes MonsterQuad (CFMOTO CFORCE C5, tournage du 2026-09-29)
# vers public/monsterquad/cforce-c5/ : 1080 × 1920, 30 i/s, H.264, sans son, léger étalonnage.
# Usage : bash scripts/extraire-monsterquad-c5.sh   (SEULEMENT=L bash ... pour n'extraire que les plans « L »)
# Colonnes : nom | rush | début (s) | durée source (s) | vitesse
set -e
V="/c/Users/Yannico/Videos/video"
OUT="$(dirname "$0")/../public/monsterquad/cforce-c5"
mkdir -p "$OUT"

PLANS="
01-phares-on|20260929_182814|1.5|1.8|1
02-feux-ar-led|DJI_20260929_153737_16_null_video|0.3|1.5|1
03-amortisseur|20260929_184324|3.4|6.0|2.5
04-badge-c5|20260929_184343|3.5|4.4|2
05-passage-ar|20260929_184619|1.0|4.7|2.5
06-calandre|20260929_183813|11.5|4.5|3.5
07-appel-phares|DJI_20260929_154724_31_null_video|7.7|1.5|1
08-travelling-showroom|DJI_20260929_154200_23_null_video|0.0|7.2|3.5
09-hero-facade|20260929_183753|2.0|4.5|1.2
10-led-av|20260929_183813|5.0|3.0|2
11-treuil|20260929_183813|15.0|5.0|3.5
12-attelage|20260929_184550|12.3|4.5|3
13-suspension|20260929_184823|3.3|5.0|3.5
14-ecran-lcd|DJI_20260929_154415_27_null_video|4.6|5.0|3.5
15-usb|20260929_184719|14.6|5.0|3.5
16-cliente|20260929_185258|0.0|8.5|2
17-t3b-arriere|20260929_184654|0.0|5.0|3
18-garantie-profil|20260929_184109|26.0|8.5|5
19-prix-orbite|20260929_184109|40.0|20.0|3.5
20-cta-facade|20260929_182206|0.0|7.0|1.1
21-avant-34|20260929_184853|2.2|3.0|2
# --- Version longue (1 min 48) ---
L02-feux-ar-led|DJI_20260929_153737_16_null_video|0.3|2.6|1
L05-orbite|20260929_184109|10|45|8
L06-showroom|DJI_20260929_153224_11_null_video|0|24|4.5
L07-moteur-ralenti|DJI_20260929_153825_18_null_video|0.5|5.4|0.7
L08-cylindree|DJI_20260929_153850_20_null_video|0|6|2.5
L09-puissance|20260929_184550|9.5|4.5|2
L10-couple|DJI_20260929_153801_17_null_video|9|7|3
L11-reservoir|DJI_20260929_154455_29_null_video|0.3|3.4|1.5
L12-guidon|DJI_20260929_154359_26_null_video|0|6|2.5
L13-selecteur|20260929_184450|8|4.8|2
L14-cardan|DJI_20260929_153801_17_null_video|2|6|2.5
L15-ch3|20260929_184823|0|3.6|1.5
L16-amortisseur|DJI_20260929_154108_22_null_video|9|8|2.7
L17-pneu|20260929_184823|3|6.5|2.2
L18-freins|20260929_184550|0|9|2.7
L19-ch4|DJI_20260929_154724_31_null_video|7.6|2.4|1
L20-led-av|20260929_183813|4|6.6|2
L21-led-ar|DJI_20260929_153720_15_null_video|0|6.3|2
L22-ecran|DJI_20260929_154415_27_null_video|4.6|6.5|2.2
L23-usb|20260929_184719|14.6|6.5|2.2
L24-ch5|DJI_20260929_154333_25_null_video|0|7.2|1.55
L25-racks|DJI_20260929_153636_14_null_video|2|7.5|2.6
L26-molle|DJI_20260929_153542_13_null_video|22.5|6|2
L27-treuil|20260929_183813|15|13|4.4
L28-attelage|20260929_184550|12|6|2
L29-ch6|20260929_184654|0|5.5|2.3
L30-blocage|DJI_20260929_153929_21_null_video|42|10|3.6
L31-repose-pieds|20260929_184753|0|9|3.2
L32-bouchon|20260929_184958|17.5|5|2.2
L35-profil|20260929_184109|35.5|3.5|1
L36-chien|20260929_185115|0|7|1.5
"

while IFS='|' read -r nom rush deb dur vit; do
  [ -z "$nom" ] && continue
  case "$nom" in \#*) continue;; esac
  [ -n "$SEULEMENT" ] && case "$nom" in $SEULEMENT*) ;; *) continue;; esac
  t=$(awk -v d="$dur" -v v="$vit" 'BEGIN{print d+0.6*v}')  # marge pour les transitions qui se chevauchent
  ffmpeg -nostdin -v error -y -ss "$deb" -t "$t" -i "$V/$rush.mp4" -an \
    -vf "setpts=PTS/$vit,fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.07:saturation=1.15:gamma=0.97,unsharp=5:5:0.4" \
    -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart "$OUT/$nom.mp4" &
  while [ "$(jobs -r | wc -l)" -ge 5 ]; do sleep 0.3; done
done <<< "$PLANS"
wait
for f in "$OUT"/*.mp4; do echo "$(basename "$f") $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"; done
