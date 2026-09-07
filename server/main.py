"""Optional sync service for the roadmap tracker.

The tracker works as a pure static site without this. Run it only if you want
progress to follow you between a laptop and a phone.

    pip install -r requirements.txt
    ROADMAP_TOKEN=some-long-random-string uvicorn main:app --reload

Then in assets/config.js set sync.enabled = true and point baseUrl here.

Auth is a single shared token in the X-Token header. That is deliberately
minimal: it is a personal tracker, not a multi-tenant product. The token ends up
in the client bundle, so treat it as "keeps strangers from scribbling on my
checkboxes", not as real security.
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
import secrets
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(os.environ.get("ROADMAP_DB", "progress.db"))
TOKEN = os.environ.get("ROADMAP_TOKEN", "")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ROADMAP_ORIGINS", "*").split(",")
    if o.strip()
]

# Matches the ids the front end generates: s<stage>.<group>.<item>
ITEM_ID = re.compile(r"^s\d{1,2}\.\d{1,3}\.\d{1,3}$")

USER_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

MAX_ITEMS = 5000

app = FastAPI(
    title="Roadmap progress sync",
    version="1.0.0",
    description="Stores which roadmap topics you have completed.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "X-Token"],
)


# --------------------------------------------------------------------------- #
# Storage
# --------------------------------------------------------------------------- #

@contextmanager
def db() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


@app.on_event("startup")
def init_db() -> None:
    if not TOKEN:
        raise RuntimeError(
            "ROADMAP_TOKEN is not set. Generate one with:\n"
            "  python -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )
    with db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS progress (
                user_id    TEXT PRIMARY KEY,
                done       TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #

def require_token(x_token: str = Header(default="")) -> None:
    # Constant-time compare so the endpoint does not leak the token by timing.
    if not secrets.compare_digest(x_token, TOKEN):
        raise HTTPException(status_code=401, detail="Bad or missing X-Token header")


def check_user_id(user_id: str) -> str:
    if not USER_ID.match(user_id):
        raise HTTPException(status_code=400, detail="user_id must be 1-64 chars of [A-Za-z0-9_-]")
    return user_id


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #

class Progress(BaseModel):
    """`done` maps an item id to a truthy marker; absent means not completed."""

    done: dict[str, int] = Field(default_factory=dict)


class ProgressOut(Progress):
    updated_at: str | None = None
    count: int = 0


def clean(done: dict[str, int]) -> dict[str, int]:
    """Drop anything that is not a well-formed item id, and cap the size.

    The body is user input from a browser; storing arbitrary keys would let
    someone use this as a free JSON blob store.
    """
    if len(done) > MAX_ITEMS:
        raise HTTPException(status_code=413, detail=f"At most {MAX_ITEMS} items")
    return {k: 1 for k in done if ITEM_ID.match(k)}


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/progress/{user_id}", response_model=ProgressOut, dependencies=[Depends(require_token)])
def get_progress(user_id: str) -> ProgressOut:
    user_id = check_user_id(user_id)
    with db() as conn:
        row = conn.execute(
            "SELECT done, updated_at FROM progress WHERE user_id = ?", (user_id,)
        ).fetchone()

    if row is None:
        return ProgressOut(done={}, updated_at=None, count=0)

    done = json.loads(row["done"])
    return ProgressOut(done=done, updated_at=row["updated_at"], count=len(done))


@app.put("/progress/{user_id}", response_model=ProgressOut, dependencies=[Depends(require_token)])
def put_progress(user_id: str, payload: Progress) -> ProgressOut:
    user_id = check_user_id(user_id)
    done = clean(payload.done)
    now = datetime.now(timezone.utc).isoformat()

    with db() as conn:
        conn.execute(
            """
            INSERT INTO progress (user_id, done, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET done = excluded.done, updated_at = excluded.updated_at
            """,
            (user_id, json.dumps(done), now),
        )

    return ProgressOut(done=done, updated_at=now, count=len(done))
