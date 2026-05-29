#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${TIRAK_GENERATED_ASSETS_DIR:-/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/muse-assets/gpt-image-2}"
OUT_DIR="$ROOT/generated/video-assets/mobile-9x16-2026-05-26-existing-assets-final"
mkdir -p "$OUT_DIR"

BG1="$SRC_DIR/muse-splash-mobile-still.png"
BG2="$SRC_DIR/muse-chat-landing-hero.png"
BG3="$SRC_DIR/muse-companion-assist.png"
LOGO="$SRC_DIR/tirakplus-muse-app-icon.png"

for f in "$BG1" "$BG2" "$BG3" "$LOGO"; do
  [[ -f "$f" ]] || { echo "Missing required asset: $f"; exit 2; }
done

# 1) Splash intro (6s): cinematic backdrop + one logo reveal
ffmpeg -y \
  -loop 1 -t 6 -i "$BG1" \
  -loop 1 -t 6 -i "$LOGO" \
  -filter_complex "
    [0:v]scale=1200:2592,boxblur=18:6,eq=brightness=-0.06:saturation=0.86:contrast=1.08,
         crop=1080:1920:(iw-1080)/2:(ih-1920)/2,
         drawbox=x=0:y=0:w=iw:h=ih:color=#1b1726@0.18:t=fill[vbg];
    [1:v]scale=w='470*(0.90+0.10*min((t/1.2),1))':h=-1:eval=frame,format=rgba,
         fade=t=in:st=0.18:d=0.9:alpha=1[logo];
    [vbg][logo]overlay=(W-w)/2:(H-h)/2-36:format=auto
  " \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an \
  "$OUT_DIR/splash-intro-final-v2.mp4"

# 2) Logo loop (5s seamless): one centered logo, micro-breathing only
ffmpeg -y \
  -loop 1 -t 5 -i "$BG2" \
  -loop 1 -t 5 -i "$LOGO" \
  -filter_complex "
    [0:v]scale=1200:2592,boxblur=24:8,eq=brightness=-0.09:saturation=0.82:contrast=1.06,
         crop=1080:1920:(iw-1080)/2:(ih-1920)/2,
         drawbox=x=0:y=0:w=iw:h=ih:color=#1e1930@0.25:t=fill[vbg];
    [1:v]scale=w='452*(0.988+0.012*sin(2*PI*t/5))':h=-1:eval=frame,format=rgba[logo];
    [vbg][logo]overlay=(W-w)/2:(H-h)/2-34:format=auto
  " \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an \
  "$OUT_DIR/logo-loop-final-v2.mp4"

# 3) Alternate loop (5s): one logo with subtle vertical drift
ffmpeg -y \
  -loop 1 -t 5 -i "$BG3" \
  -loop 1 -t 5 -i "$LOGO" \
  -filter_complex "
    [0:v]scale=1200:2592,boxblur=22:7,eq=brightness=-0.08:saturation=0.84:contrast=1.07,
         crop=1080:1920:(iw-1080)/2:(ih-1920)/2,
         drawbox=x=0:y=0:w=iw:h=ih:color=#221b33@0.22:t=fill[vbg];
    [1:v]scale=448:-1,format=rgba[logo];
    [vbg][logo]overlay=(W-w)/2:(H-h)/2-38+6*sin(2*PI*t/5):format=auto
  " \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an \
  "$OUT_DIR/logo-loop-final-v2-alt.mp4"

# metadata summary
python3 - <<'PY' "$OUT_DIR"
import json,subprocess,sys,glob,os
out=sys.argv[1]
rows=[]
for f in sorted(glob.glob(os.path.join(out,'*.mp4'))):
    p=subprocess.run([
        'ffprobe','-v','error','-show_entries','stream=width,height,avg_frame_rate,codec_name',
        '-show_entries','format=duration,size','-of','json',f
    ],capture_output=True,text=True,check=True)
    rows.append({'file':os.path.basename(f),'probe':json.loads(p.stdout)})
manifest={'pipeline':'existing-assets deterministic single-logo compositing','outputs':rows}
open(os.path.join(out,'manifest.json'),'w').write(json.dumps(manifest,indent=2))
print(json.dumps({'count':len(rows),'out':out},indent=2))
PY

echo "Done: $OUT_DIR"