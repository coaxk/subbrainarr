"""
Shared URL validation for SSRF prevention.

All endpoints that accept user-provided URLs and make server-side HTTP
requests MUST validate them through validate_subgen_url() first.
"""
import ipaddress
import socket
from urllib.parse import urlparse


# Allowed schemes — only HTTP(S), never file://, ftp://, etc.
_ALLOWED_SCHEMES = {"http", "https"}

# Private/internal IP ranges that should never be reached via user-supplied URLs.
# Exception: Docker-internal addresses are allowed since Subgen runs in Docker.
_BLOCKED_RANGES = [
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local / cloud metadata
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback (except we allow via hostname)
    ipaddress.ip_network("0.0.0.0/8"),         # "This" network
]

# Hostnames we explicitly allow (Docker networking)
_ALLOWED_HOSTNAMES = {
    "subgen", "localhost", "host.docker.internal",
}


def validate_subgen_url(url: str) -> tuple[bool, str]:
    """
    Validate a user-provided URL is safe to make server-side requests to.

    Returns (True, cleaned_url) on success, (False, error_message) on failure.
    """
    if not url or not url.strip():
        return False, "URL is empty"

    url = url.strip().rstrip("/")

    # Parse the URL
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Invalid URL format"

    # Check scheme
    if parsed.scheme not in _ALLOWED_SCHEMES:
        return False, f"URL scheme must be http or https, got '{parsed.scheme}'"

    # Check hostname exists
    hostname = parsed.hostname
    if not hostname:
        return False, "URL has no hostname"

    # Allow known Docker hostnames without IP resolution
    if hostname in _ALLOWED_HOSTNAMES:
        return True, url

    # Try to resolve hostname and check against blocked ranges
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or 80, proto=socket.IPPROTO_TCP)
        for family, _, _, _, sockaddr in addr_info:
            ip = ipaddress.ip_address(sockaddr[0])
            for blocked in _BLOCKED_RANGES:
                if ip in blocked:
                    return False, f"URL resolves to blocked address range"
    except socket.gaierror:
        # Can't resolve — allow it (might be a Docker hostname we don't know about)
        pass

    return True, url
