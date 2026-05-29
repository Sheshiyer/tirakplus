#!/usr/bin/env python3
import base64
import json
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "generated" / "video-assets" / "mobile-9x16-2026-05-26"

API_BASE = "https://api.x.ai/v1"
MODEL = "grok-imagine-video"
ASPECT_RATIO = "9:16"
RESOLUTION = "720p"
POLL_INTERVAL = 5
POLL_TIMEOUT = 12 * 60


def load_xai_key() -> Optional[str]:
    key = os.getenv("XAI_API_KEY")
    if key:
        return key.strip()

    env_file = Path.home() / ".claude" / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("XAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return None


def to_data_uri(path: Path) -> str:
    suffix = path.suffix.lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }.get(suffix, "application/octet-stream")
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


@dataclass
class VideoJob:
    slug: str
    title: str
    prompt: str
    duration: int
    image_ref: Optional[Path] = None


JOBS = [
    VideoJob(
        slug="splash-intro-primary",
        title="Splash Intro Primary",
        duration=6,
        image_ref=ROOT / "public" / "assets" / "muse" / "scene" / "muse-thailand-night-backdrop.png",
        prompt=(
            "Mobile app splash intro for Tirak Plus in premium discreet hospitality style. "
            "Use warm porcelain highlights, charcoal shadows, and subtle rose-bronze accent. "
            "Gentle cinematic parallax over the Thailand night scene, calm atmosphere, no club energy, no text overlays. "
            "At the end, softly reveal the Tirak Plus icon shape with minimal glow. "
            "Elegant, restrained, trust-first motion, 9:16 composition."
        ),
    ),
    VideoJob(
        slug="logo-loop-breathing",
        title="Logo Loop Breathing",
        duration=5,
        image_ref=ROOT / "public" / "assets" / "brand" / "tirakplus-muse-app-icon.png",
        prompt=(
            "Create a seamless 5-second mobile loop for Tirak Plus logo. "
            "The icon should gently breathe and shimmer with restrained rose-bronze and porcelain lighting, "
            "on a deep night-plum background. No neon, no flashing, no text. "
            "Loop must feel calm, premium, and privacy-aware."
        ),
    ),
    VideoJob(
        slug="logo-loop-orbit",
        title="Logo Loop Orbit",
        duration=5,
        image_ref=ROOT / "public" / "assets" / "brand" / "app-icon.png",
        prompt=(
            "Generate a seamless logo animation loop for Tirak Plus. "
            "Icon remains centered while soft particles orbit in slow motion and fade. "
            "Color direction: charcoal ink, porcelain, rose-bronze accent. "
            "No text, no harsh glow, no flashy transitions, 9:16 mobile framing."
        ),
    ),
    VideoJob(
        slug="onboarding-transition",
        title="Onboarding Transition",
        duration=4,
        prompt=(
            "Minimal transition asset for Tirak Plus onboarding. "
            "Abstract linked-mark geometry forms from thin lines, then settles into a calm idle state. "
            "Premium concierge vibe, trust-first, muted palette, no text, 9:16 vertical mobile."
        ),
    ),
    VideoJob(
        slug="trust-safety-stinger",
        title="Trust & Safety Stinger",
        duration=4,
        prompt=(
            "Create a short trust-and-safety stinger for Tirak Plus. "
            "Abstract shield and linked-mark motif appears with subtle rose-bronze accent and quiet pulse. "
            "Elegant and discreet, no urgency cues, no gamified motion, no text, 9:16 vertical."
        ),
    ),
]


def request_video(key: str, job: VideoJob) -> dict:
    payload = {
        "model": MODEL,
        "prompt": job.prompt,
        "duration": job.duration,
        "aspect_ratio": ASPECT_RATIO,
        "resolution": RESOLUTION,
    }
    if job.image_ref is not None:
        payload["image"] = {"url": to_data_uri(job.image_ref)}

    r = requests.post(
        f"{API_BASE}/videos/generations",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60,
    )
    return {"status_code": r.status_code, "json": r.json()}


def poll_video(key: str, request_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT
    latest = {}
    while time.time() < deadline:
        r = requests.get(
            f"{API_BASE}/videos/{request_id}",
            headers={"Authorization": f"Bearer {key}"},
            timeout=60,
        )
        data = r.json()
        latest = {"status_code": r.status_code, "json": data}
        status = data.get("status")
        if status in {"done", "failed", "expired"}:
            return latest
        time.sleep(POLL_INTERVAL)
    return latest


def download_file(url: str, out_path: Path):
    with requests.get(url, stream=True, timeout=180) as r:
        r.raise_for_status()
        with out_path.open("wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 128):
                if chunk:
                    f.write(chunk)


def main() -> int:
    key = load_xai_key()
    if not key:
        print("ERROR: XAI_API_KEY missing", file=sys.stderr)
        return 2

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": MODEL,
        "aspectRatio": ASPECT_RATIO,
        "resolution": RESOLUTION,
        "outputs": [],
    }

    for job in JOBS:
        print(f"\n=== {job.slug} ===")
        req = request_video(key, job)
        req_path = OUT_DIR / f"{job.slug}.request.json"
        req_path.write_text(json.dumps(req, indent=2), encoding="utf-8")

        if req["status_code"] != 200:
            print(f"FAILED start: HTTP {req['status_code']}")
            manifest["outputs"].append(
                {
                    "slug": job.slug,
                    "title": job.title,
                    "ok": False,
                    "error": f"start HTTP {req['status_code']}",
                }
            )
            continue

        request_id = req["json"].get("request_id")
        if not request_id:
            print("FAILED start: no request_id")
            manifest["outputs"].append(
                {
                    "slug": job.slug,
                    "title": job.title,
                    "ok": False,
                    "error": "missing request_id",
                }
            )
            continue

        print(f"request_id={request_id}")
        polled = poll_video(key, request_id)
        poll_path = OUT_DIR / f"{job.slug}.poll.json"
        poll_path.write_text(json.dumps(polled, indent=2), encoding="utf-8")

        status = polled.get("json", {}).get("status")
        if status != "done":
            print(f"FAILED poll: status={status}")
            manifest["outputs"].append(
                {
                    "slug": job.slug,
                    "title": job.title,
                    "ok": False,
                    "requestId": request_id,
                    "error": f"poll status {status}",
                }
            )
            continue

        video_url = (polled.get("json", {}).get("video") or {}).get("url")
        if not video_url:
            print("FAILED done: no video url")
            manifest["outputs"].append(
                {
                    "slug": job.slug,
                    "title": job.title,
                    "ok": False,
                    "requestId": request_id,
                    "error": "done but missing video url",
                }
            )
            continue

        out_mp4 = OUT_DIR / f"{job.slug}.mp4"
        download_file(video_url, out_mp4)
        size = out_mp4.stat().st_size
        print(f"OK {out_mp4.name} ({size} bytes)")

        manifest["outputs"].append(
            {
                "slug": job.slug,
                "title": job.title,
                "ok": True,
                "requestId": request_id,
                "file": out_mp4.name,
                "bytes": size,
                "duration": job.duration,
                "usedImageRef": str(job.image_ref.relative_to(ROOT)) if job.image_ref else None,
            }
        )

    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWrote manifest: {manifest_path}")

    ok_count = sum(1 for x in manifest["outputs"] if x.get("ok"))
    fail_count = len(manifest["outputs"]) - ok_count
    print(f"Generated: {ok_count} ok / {fail_count} failed")
    return 0 if ok_count > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
