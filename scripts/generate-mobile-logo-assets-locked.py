#!/usr/bin/env python3
import base64
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "generated" / "video-assets" / "mobile-9x16-2026-05-26-locked-logo"
API_BASE = "https://api.x.ai/v1"
MODEL = "grok-imagine-video"
ASPECT_RATIO = "9:16"
RESOLUTION = "720p"
POLL_INTERVAL = 5
POLL_TIMEOUT = 12 * 60


def load_key() -> Optional[str]:
    k = os.getenv("XAI_API_KEY")
    if k:
        return k.strip()
    env = Path.home() / ".claude" / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("XAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return None


def data_uri(path: Path) -> str:
    mime = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode("ascii"))


@dataclass
class Job:
    slug: str
    duration: int
    prompt: str
    refs: list[Path]


ICON_REF = ROOT / "public" / "assets" / "brand" / "tirakplus-muse-app-icon.png"
MUSE_SCENE_REF = ROOT / "public" / "assets" / "muse" / "scene" / "muse-thailand-night-backdrop.png"

COMMON_LOCK_RULE = (
    "CRITICAL COMPOSITION RULE: keep the logo perfectly square with unchanged proportions at all times. "
    "Never stretch, squash, warp, or non-uniformly scale the logo. "
    "Place logo centered in a 9:16 frame with generous top/bottom breathing space. "
)

JOBS = [
    Job(
        slug="splash-intro-locked",
        duration=6,
        refs=[ICON_REF, MUSE_SCENE_REF],
        prompt=(
            "Tirak Plus mobile splash intro in calm premium concierge style inspired by existing generated boards. "
            "Deep night-plum background with subtle porcelain and rose-bronze accents; restrained cinematic parallax; no nightlife/neon energy; no text. "
            "Logo reveals softly in final 2 seconds and settles into idle state. "
            + COMMON_LOCK_RULE
        ),
    ),
    Job(
        slug="logo-loop-breathing-locked",
        duration=5,
        refs=[ICON_REF],
        prompt=(
            "Create a seamless 5-second idle loop for Tirak Plus logo inspired by calm premium app references. "
            "Very subtle breathing light and micro-float motion, almost imperceptible; no flashing; no text; no hard glow. "
            "Color mood: charcoal ink, porcelain highlights, restrained rose-bronze accent. "
            + COMMON_LOCK_RULE
        ),
    ),
    Job(
        slug="logo-loop-orbit-locked",
        duration=5,
        refs=[ICON_REF],
        prompt=(
            "Create a seamless 5-second logo loop for Tirak Plus with slow, sparse particle orbit around the centered logo. "
            "Particles remain subtle and secondary; premium privacy-aware tone; no urgency, no gamified motion, no text. "
            + COMMON_LOCK_RULE
        ),
    ),
    Job(
        slug="logo-loop-idle-float-locked",
        duration=5,
        refs=[ICON_REF],
        prompt=(
            "Generate a seamless low-amplitude idle-float logo loop inspired by the Muse animation handoff 'idle_float' behavior. "
            "Motion is restrained, calm, and elegant with tiny vertical drift and soft core warmth. "
            "No spin, no bounce, no neon pulses, no text. "
            + COMMON_LOCK_RULE
        ),
    ),
]


def start_video(api_key: str, job: Job) -> dict:
    payload = {
        "model": MODEL,
        "prompt": job.prompt,
        "duration": job.duration,
        "aspect_ratio": ASPECT_RATIO,
        "resolution": RESOLUTION,
        "reference_images": [{"url": data_uri(p)} for p in job.refs],
    }
    r = requests.post(
        f"{API_BASE}/videos/generations",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=90,
    )
    return {"status_code": r.status_code, "json": r.json(), "payload": payload}


def poll_video(api_key: str, request_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT
    latest = {}
    while time.time() < deadline:
        r = requests.get(
            f"{API_BASE}/videos/{request_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=90,
        )
        latest = {"status_code": r.status_code, "json": r.json()}
        st = latest["json"].get("status")
        if st in {"done", "failed", "expired"}:
            return latest
        time.sleep(POLL_INTERVAL)
    return latest


def download(url: str, out: Path):
    with requests.get(url, stream=True, timeout=180) as r:
        r.raise_for_status()
        with out.open("wb") as f:
            for ch in r.iter_content(chunk_size=1024 * 128):
                if ch:
                    f.write(ch)


def main() -> int:
    key = load_key()
    if not key:
        print("ERROR: XAI_API_KEY missing")
        return 2

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": MODEL,
        "aspectRatio": ASPECT_RATIO,
        "resolution": RESOLUTION,
        "rule": "Logo must remain square and unstretched in 9:16 composition.",
        "outputs": [],
    }

    for job in JOBS:
        print(f"\n=== {job.slug} ===")
        started = start_video(key, job)
        (OUT_DIR / f"{job.slug}.request.json").write_text(json.dumps(started, indent=2), encoding="utf-8")

        if started["status_code"] != 200:
            print(f"FAILED start HTTP {started['status_code']}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": f"start HTTP {started['status_code']}"})
            continue

        request_id = started["json"].get("request_id")
        if not request_id:
            print("FAILED no request_id")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": "no request_id"})
            continue

        print(f"request_id={request_id}")
        polled = poll_video(key, request_id)
        (OUT_DIR / f"{job.slug}.poll.json").write_text(json.dumps(polled, indent=2), encoding="utf-8")

        status = polled.get("json", {}).get("status")
        if status != "done":
            print(f"FAILED poll status={status}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": request_id, "error": f"poll {status}"})
            continue

        url = (polled.get("json", {}).get("video") or {}).get("url")
        if not url:
            print("FAILED done but no url")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": request_id, "error": "missing video url"})
            continue

        out = OUT_DIR / f"{job.slug}.mp4"
        download(url, out)
        print(f"OK {out.name} ({out.stat().st_size} bytes)")
        manifest["outputs"].append(
            {
                "slug": job.slug,
                "ok": True,
                "requestId": request_id,
                "file": out.name,
                "bytes": out.stat().st_size,
                "duration": job.duration,
                "refs": [str(p.relative_to(ROOT)) for p in job.refs],
            }
        )

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    ok = sum(1 for o in manifest["outputs"] if o.get("ok"))
    print(f"\nGenerated: {ok}/{len(manifest['outputs'])}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
