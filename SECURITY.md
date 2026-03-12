# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.6.x   | :white_check_mark: |
| < 1.6   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via [GitHub Security Advisories](https://github.com/coaxk/subbrainarr/security/advisories/new).

You should receive an initial response within 48 hours. We will work with you to understand the issue and coordinate a fix and disclosure timeline.

## Security Measures

SubBrainArr implements the following security measures:

- **SSRF Prevention**: All outbound HTTP requests are validated through `url_validation.py`, which blocks requests to private/internal network ranges, localhost, and link-local addresses.
- **Locked CORS**: Cross-Origin Resource Sharing is restricted to prevent unauthorized cross-origin requests.
- **Pinned Dependencies**: All Python and npm dependencies are version-pinned to prevent supply chain attacks.
- **Input Validation**: User-supplied URLs and configuration values are validated before use.
- **No Shell Execution**: The application does not use `shell=True` in subprocess calls or `eval()`/`exec()` on user input.

## Dependency Security

- Dependabot is enabled for automatic security update PRs.
- Trivy scans the Docker image weekly for container vulnerabilities.
- Bandit runs on every push for Python security linting.
- CodeQL analysis runs on every push for both Python and JavaScript.
