"""
N6 API - FastAPI + PostgreSQL backend for the NUMBER SIX dashboards.

The frontend lives in ../ (index.html + js/ + css/ + assets/). This package
serves the matching REST API. Both sides read the same access matrix from
``backend/tiers/*.json`` so a menu that is hidden in the browser is refused
by the server for the same reason.

The API ships disabled on the frontend: ``js/core/env.js`` has
``API_ENABLED: false`` and nothing in the app performs a request until that is
flipped. See ``backend/README.md``.
"""

__version__ = "1.0.0"