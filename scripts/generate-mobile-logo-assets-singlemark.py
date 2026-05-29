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
OUT_DIR = ROOT / "generated" / "video-assets" / "mobile-9x16-2026-05-26-single-logo"
API_BASE = "https://api.x.ai/v1"
MODEL = "grok-imagine-video"
ASPECT_RATIO = "9:16"
RESOLUTION = "720p"
POLL_INTERVAL = 5
POLL_TIMEOUT = 12 * 60


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


def data_uri(path: Path) -> str:
    mime = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode("ascii"))


@dataclass
class Job:
    slug: str
    duration: int
    prompt: str


ICON = ROOT / "public" / "assets" / "brand" / "tirakplus-muse-app-icon.png"
MUSE_BG = ROOT / "public" / "assets" / "muse" / "scene" / "muse-thailand-night-backdrop.png"

LOCK_RULE = (
    "CRITICAL: Show exactly ONE logo only in the entire frame. "
    "Do NOT show a second icon, duplicate, clone, reflection copy, inset card, or mini version. "
    "No mirrored floors or water reflections that replicate the logo. "
    "Keep logo square with unchanged proportions; never stretch or squash. "
    "Logo stays centered in 9:16 composition with breathing space."
)

STYLE_RULE = (
    "Style must match Tirak Plus generated references: calm premium, privacy-aware, restrained motion, "
    "night-plum / charcoal base, porcelain highlights, subtle rose-bronze accents, no neon nightclub energy."
)

JOBS = [
    Job(
        slug="single-logo-splash-intro",
        duration=6,
        prompt=(
            "Mobile splash intro for Tirak Plus. Gentle cinematic backdrop drift, subtle depth, no text. "
            "Reveal one centered logo in final beat and settle. "
            + LOCK_RULE + " " + STYLE_RULE
        ),
    ),
    Job(
        slug="single-logo-loop-breathing",
        duration=5,
        prompt=(
            "Seamless 5-second idle loop for Tirak Plus logo. Tiny breathing light and micro float only. "
            "No spin, no bounce, no pulse spikes. "
            + LOCK_RULE + " " + STYLE_RULE
        ),
    ),
    Job(
        slug="single-logo-loop-ambient",
        duration=5,
        prompt=(
            "Seamless 5-second ambient loop. One centered logo with sparse soft particles around it, "
            "particles stay background-only and never form a second mark. "
            + LOCK_RULE + " " + STYLE_RULE
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
        "reference_images": [{"url": data_uri(ICON)}, {"url": data_uri(MUSE_BG)}],
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
        status = latest["json"].get("status")
        if status in {"done", "failed", "expired"}:
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


def main() -> int:
    key = load_key()
    if not key:
        print("ERROR: missing XAI_API_KEY")
        return 2

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": MODEL,
        "aspectRatio": ASPECT_RATIO,
        "resolution": RESOLUTION,
        "compositionRule": "exactly one square logo, no duplicates/reflections",
        "outputs": [],
    }

    for job in JOBS:
        print(f"\n=== {job.slug} ===")
        started = start_video(key, job)
        (OUT_DIR / f"{job.slug}.request.json").write_text(json.dumps(started, indent=2), encoding="utf-8")

        if started["status_code"] != 200:
            print(f"FAILED start HTTP {started['status_code']}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": f"start {started['status_code']}"})
            continue

        req_id = started["json"].get("request_id")
        if not req_id:
            print("FAILED no request_id")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "error": "missing request_id"})
            continue

        print(f"request_id={req_id}")
        polled = poll_video(key, req_id)
        (OUT_DIR / f"{job.slug}.poll.json").write_text(json.dumps(polled, indent=2), encoding="utf-8")

        status = polled.get("json", {}).get("status")
        if status != "done":
            print(f"FAILED poll status={status}")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": req_id, "error": f"poll {status}"})
            continue

        url = (polled.get("json", {}).get("video") or {}).get("url")
        if not url:
            print("FAILED missing video url")
            manifest["outputs"].append({"slug": job.slug, "ok": False, "requestId": req_id, "error": "missing video url"})
            continue

        out = OUT_DIR / f"{job.slug}.mp4"
        download(url, out)
        print(f"OK {out.name} ({out.stat().st_size} bytes)")

        manifest["outputs"].append({
            "slug": job.slug,
            "ok": True,
            "requestId": req_id,
            "file": out.name,
            "bytes": out.stat().st_size,
            "duration": job.duration,
        })

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    ok = sum(1 for x in manifest["outputs"] if x.get("ok"))
    print(f"\nGenerated {ok}/{len(manifest['outputs'])}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
