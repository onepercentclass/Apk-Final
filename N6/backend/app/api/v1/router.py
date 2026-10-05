"""
The v1 API, in one place.

Mount order is not cosmetic. Two rules apply:

1. Literal paths come before parameterised ones. `/commissions/summary` must be
   matched before `/commissions/{coach_id}`, or "summary" is read as a coach
   id and the month-end page 422s on a path that exists. The same applies to
   `/tickets/{id}/reply`, `/monitoring/summary` and `/reports/preview`.

2. Money routes are mounted even though only owner can reach them. A 403 from
   the tier rule is a better answer than a 404 from a missing route: it tells
   the caller which rule refused, and the OpenAPI document keeps the surface
   visible so a future admin tier is a JSON edit rather than a code change.
"""

from __future__ import annotations

from fastapi import APIRouter

from .endpoints import (
    accounts,
    athletes,
    attendance,
    auth,
    clients,
    commissions,
    corrections,
    finance,
    messages,
    monitoring,
    portal,
    pricing,
    programs,
    reports,
    schedules,
    tickets,
)

api_router = APIRouter()

# ------------------------------------------------------------------ identity
api_router.include_router(auth.router)
api_router.include_router(accounts.router)

# ------------------------------------------------------------------- clients
api_router.include_router(clients.router)
api_router.include_router(schedules.router)

# ------------------------------------------------- catalogue and scheduling
api_router.include_router(pricing.router)
api_router.include_router(programs.router)

# --------------------------------------------------------------------- money
api_router.include_router(commissions.router)
api_router.include_router(finance.router)

# ------------------------------------------------------------------- support
api_router.include_router(tickets.router)
api_router.include_router(messages.router)
api_router.include_router(attendance.router)

# -------------------------------------------------------------- head coach
api_router.include_router(monitoring.router)
api_router.include_router(corrections.router)
api_router.include_router(athletes.router)

# ------------------------------------------------------------------ reports
api_router.include_router(reports.router)

# ------------------------------------------------------------------- portal
# Last, and with no require() dependency: /portal is self-scoped from the
# token, so gating it by menu would only add a second, weaker copy of the rule.
api_router.include_router(portal.router)

__all__ = ["api_router"]