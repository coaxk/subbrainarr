"""Backend smoke tests.

CI ran `pytest tests/` against a backend that had no tests directory, so the
job exited 4 on every run and could never pass. These pin the contract the
container depends on: the app imports with every router mounted, /health
answers (the Docker healthcheck), and the SSRF guard rejects what it must.
"""

from fastapi.testclient import TestClient

from main import app
from routers.url_validation import validate_subgen_url

client = TestClient(app)

ROUTER_PREFIXES = (
    "/api/connection",
    "/api/hardware",
    "/api/logs",
    "/api/languages",
    "/api/settings",
    "/api/scanning",
    "/api/docker",
    "/api/github",
    "/api/community",
    "/api/tuning",
)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "version" in r.json()


def test_every_router_is_mounted():
    paths = [route.path for route in app.routes]
    missing = [p for p in ROUTER_PREFIXES if not any(path.startswith(p) for path in paths)]
    assert missing == []


def test_url_validation_rejects_non_http_scheme():
    ok, msg = validate_subgen_url("file:///etc/passwd")
    assert ok is False
    assert "scheme" in msg


def test_url_validation_rejects_cloud_metadata_address():
    ok, _ = validate_subgen_url("http://169.254.169.254/latest/meta-data")
    assert ok is False


def test_url_validation_rejects_empty():
    assert validate_subgen_url("   ")[0] is False


def test_url_validation_allows_docker_hostname_and_strips_slash():
    assert validate_subgen_url("http://subgen:9000/") == (True, "http://subgen:9000")
