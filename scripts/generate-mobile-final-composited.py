#!/usr/bin/env python3
import json
import os
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "generated" / "video-assets" / "mobile-9x16-2026-05-26-final-composited"
API_BASE = "https://api.x.ai/v1"
MODEL = "grok-imagine-video"
ASPECT_RATIO = "9:16"
RESOLUTION = "720p"
POLL_INTERVAL = 5
POLL_TIMEOUT = 12 * 60
LOGO = ROOT / "public" / "assets" / "brand" / "tirakplus-muse-app-icon.png"


@dataclass
class BgJob:
    slug: str
    duration: int
    prompt: str


BG_JOBS = [
    BgJob(
        slug="bg-splash-intro",
        duration=6,
        prompt=(
            "Background-only vertical cinematic scene for Tirak Plus mobile splash, inspired by existing generated boards. "
            "Calm premium Thailand night ambiance, deep night-plum and charcoal tones, subtle porcelain highlights, restrained rose-bronze accents. "
            "No logos, no icons, no symbols, no text, no UI cards, no reflections of any mark."
        ),
    ),
    BgJob(
        slug="bg-logo-loop",
        duration=5,
        prompt=(
            "Background-only seamless vertical loop for premium mobile app identity. "
            "Very subtle atmospheric movement and sparse particles, calm and discreet, privacy-aware tone. "
            "No logos, no icons, no symbols, no text, no mirrored badges, no duplicate shapes."
        ),
    ),
]


def load_key() -> Optional[str]:
    key = os.getenv("XAI_API_KEY")
    if key:
        return key.strip()
    env = Path.home() / ".claude" / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("XAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return None


def start_video(key: str, job: BgJob) -> dict:
    payload = {
        "model": MODEL,
        "prompt": job.prompt,
        "duration": job.duration,
        "aspect_ratio": ASPECT_RATIO,
        "resolution": RESOLUTION,
    }
    r = requests.post(
        f"{API_BASE}/videos/generations",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json=payload,
        timeout=90,
    )
    return {"status_code": r.status_code, "json": r.json(), "payload": payload}


def poll_video(key: str, request_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT
    latest = {}
    while time.time() < deadline:
        r = requests.get(
            f"{API_BASE}/videos/{request_id}",
            headers={"Authorization": f"Bearer {key}"},
            timeout=90,
        )
        latest = {"status_code": r.status_code, "json": r.json()}
        st = latest["json"].get("status")
        if st in {"done", "failed", "expired"}:
            return latest
        time.sleep(POLL_INTERVAL)
    return latest


def download(url: str, out_path: Path):
    with requests.get(url, stream=True, timeout=180) as r:
        r.raise_for_status()
        with out_path.open("wb") as f:
            for chunk in r.iter_content(chunk_size=131072):
                if chunk:
                    f.write(chunk)


def run(cmd: list[str]):
    subprocess.run(cmd, check=True)


def compose_splash(bg_in: Path, out: Path, duration: int):
    # One centered logo, fixed aspect ratio, fade-in only (no duplicate possible)
    filt = (
        "[1:v]scale=430:-1,format=rgba,fade=t=in:st=0:d=1:alpha=1[logo];"
        "[0:v][logo]overlay=(W-w)/2:(H-h)/2:shortest=1"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(bg_in),
            "-loop",
            "1",
            "-t",
            str(duration),
            "-i",
            str(LOGO),
            "-filter_complex",
            filt,
            "-map",
            "0:a?",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            str(out),
        ]
    )


def compose_logo_loop(bg_in: Path, out: Path, duration: int):
    # One centered logo with tiny breathing scale; still single layer only.
    filt = (
        "[1:v]scale=w='430*(0.985+0.015*sin(2*PI*t/5))':h=-1:eval=frame,format=rgba[logo];"
        "[0:v][logo]overlay=(W-w)/2:(H-h)/2:shortest=1"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(bg_in),
            "-loop",
            "1",
            "-t",
            str(duration),
            "-i",
            str(LOGO),
            "-filter_complex",
            filt,
            "-map",
            "0:a?",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            str(out),
        ]
    )


def ffprobe_brief(path: Path) -> dict:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "stream=width,height,codec_name,avg_frame_rate",
        "-show_entries",
        "format=duration,size",
        "-of",
        "json",
        str(path),
    ]
    p = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return json.loads(p.stdout)


def main() -> int:
    key = load_key()
    if not key:
        print("ERROR: XAI_API_KEY missing")
        return 2

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pipeline": "background-generation + deterministic single-logo ffmpeg composite",
        "model": MODEL,
        "aspectRatio": ASPECT_RATIO,
        "resolution": RESOLUTION,
        "rule": "exactly one centered logo layer; no generated logo content",
        "outputs": [],
    }

    bg_files: dict[str, Path] = {}

    for job in BG_JOBS:
        print(f"\n=== generate {job.slug} ===")
        started = start_video(key, job)
        (OUT_DIR / f"{job.slug}.request.json").write_text(json.dumps(started, indent=2), encoding="utf-8")

        if started["status_code"] != 200:
            print(f"FAILED start HTTP {started['status_code']}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": f"start {started['status_code']}"})
            continue

        request_id = started["json"].get("request_id")
        if not request_id:
            print("FAILED no request_id")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": "missing request_id"})
            continue

        print(f"request_id={request_id}")
        polled = poll_video(key, request_id)
        (OUT_DIR / f"{job.slug}.poll.json").write_text(json.dumps(polled, indent=2), encoding="utf-8")

        status = polled.get("json", {}).get("status")
        if status != "done":
            print(f"FAILED poll status={status}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": request_id, "error": f"poll {status}"})
            continue

        video_url = (polled.get("json", {}).get("video") or {}).get("url")
        if not video_url:
            print("FAILED no video url")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": request_id, "error": "missing video url"})
            continue

        bg_out = OUT_DIR / f"{job.slug}.mp4"
        download(video_url, bg_out)
        bg_files[job.slug] = bg_out
        print(f"OK {bg_out.name}")

    if "bg-splash-intro" in bg_files:
        splash_final = OUT_DIR / "splash-intro-final.mp4"
        compose_splash(bg_files["bg-splash-intro"], splash_final, 6)
        manifest["outputs"].append(
            {
                "slug": "splash-intro-final",
                "ok": True,
                "file": splash_final.name,
                "bytes": splash_final.stat().st_size,
                "probe": ffprobe_brief(splash_final),
                "notes": "single fixed-aspect logo overlay over generated background",
            }
        )

    if "bg-logo-loop" in bg_files:
        loop_final = OUT_DIR / "logo-loop-final.mp4"
        compose_logo_loop(bg_files["bg-logo-loop"], loop_final, 5)
        manifest["outputs"].append(
            {
                "slug": "logo-loop-final",
                "ok": True,
                "file": loop_final.name,
                "bytes": loop_final.stat().st_size,
                "probe": ffprobe_brief(loop_final),
                "notes": "single fixed-aspect logo layer with tiny breathing scale",
            }
        )

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWrote {OUT_DIR / 'manifest.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
