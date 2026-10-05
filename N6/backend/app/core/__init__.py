"""
Cross-cutting helpers, none of which know about HTTP:

    config.py    settings, read from backend/.env
    security.py  bcrypt hashing and the HS256 access/refresh pair
    tiers.py     the access matrix, from backend/tiers/*.json
    period.py    YYYY-MM month arithmetic
    metrics.py   the money and roster sums, defined once

`metrics` and `period` are imported as submodules rather than re-exported
here, so the module that owns a number is obvious from the import line.
"""

from .config import Settings, get_settings, settings
from .period import current_month, month_bounds, series, shift
from .security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    create_token_pair,
    decode_token,
    hash_password,
    needs_rehash,
    verify_password,
)
from .tiers import (
    TIER_ADMIN,
    TIER_CLIENT,
    TIER_COACH,
    TIER_HEADCOACH,
    TIER_MAX,
    TIER_OWNER,
    Tier,
    available_actions,
    available_menus,
    can_access_menu,
    can_perform,
    is_owner,
    load_tiers,
    role_for_tier,
    tier_matrix_for,
)

__all__ = [
    "Settings",
    "get_settings",
    "settings",
    "current_month",
    "month_bounds",
    "series",
    "shift",
    "TokenError",
    "create_access_token",
    "create_refresh_token",
    "create_token_pair",
    "decode_token",
    "hash_password",
    "needs_rehash",
    "verify_password",
    "TIER_ADMIN",
    "TIER_CLIENT",
    "TIER_COACH",
    "TIER_HEADCOACH",
    "TIER_MAX",
    "TIER_OWNER",
    "Tier",
    "available_actions",
    "available_menus",
    "can_access_menu",
    "can_perform",
    "is_owner",
    "load_tiers",
    "role_for_tier",
    "tier_matrix_for",
]