"""Penjagaan akses tier. Sumber kanonis = tiers/tier-{n}.json di root proyek
(file yang sama dibaca frontend). Tier 0 = semua menu."""
import json
from functools import lru_cache
from pathlib import Path

from fastapi import Depends, Header, HTTPException

TIERS_DIR = Path(__file__).resolve().parents[3] / "tiers"


@lru_cache(maxsize=8)
def load_tier(tier: int) -> dict:
    path = TIERS_DIR / f"tier-{tier}.json"
    if not path.exists():
        raise HTTPException(status_code=403, detail=f"Tier {tier} tidak dikenal")
    return json.loads(path.read_text(encoding="utf-8"))


def current_tier(x_tier: int = Header(default=0, alias="X-Tier")) -> dict:
    if x_tier < 0 or x_tier > 3:
        raise HTTPException(status_code=403, detail="Tier tidak valid")
    return load_tier(x_tier)


def require_menu(menu: str):
    def guard(tier_def: dict = Depends(current_tier)) -> dict:
        if menu not in tier_def.get("menus", []):
            raise HTTPException(
                status_code=403,
                detail=f"Tier {tier_def.get('tier')} tidak boleh mengakses menu '{menu}'",
            )
        return tier_def

    return guard


def require_perm(perm: str):
    def guard(tier_def: dict = Depends(current_tier)) -> dict:
        if not tier_def.get("permissions", {}).get(perm, False):
            raise HTTPException(
                status_code=403,
                detail=f"Permission '{perm}' ditolak untuk tier {tier_def.get('tier')}",
            )
        return tier_def

    return guard
