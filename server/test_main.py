"""Run with:  ROADMAP_TOKEN=test pytest server/test_main.py"""

import os

os.environ.setdefault("ROADMAP_TOKEN", "test")
os.environ.setdefault("ROADMAP_DB", ":memory:")

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402

client = TestClient(main.app)
AUTH = {"X-Token": os.environ["ROADMAP_TOKEN"]}


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_requires_token():
    assert client.get("/progress/me").status_code == 401
    assert client.get("/progress/me", headers={"X-Token": "wrong"}).status_code == 401


def test_unknown_user_is_empty_not_404():
    r = client.get("/progress/nobody", headers=AUTH)
    assert r.status_code == 200
    assert r.json()["done"] == {}


def test_round_trip():
    client.put("/progress/me", headers=AUTH, json={"done": {"s0.0.0": 1, "s3.1.5": 1}})
    body = client.get("/progress/me", headers=AUTH).json()
    assert body["done"] == {"s0.0.0": 1, "s3.1.5": 1}
    assert body["count"] == 2
    assert body["updated_at"]


def test_rejects_junk_keys():
    client.put("/progress/me", headers=AUTH, json={"done": {"s0.0.0": 1, "../etc/passwd": 1}})
    assert client.get("/progress/me", headers=AUTH).json()["done"] == {"s0.0.0": 1}


def test_rejects_bad_user_id():
    assert client.put("/progress/../x", headers=AUTH, json={"done": {}}).status_code in (400, 404)
