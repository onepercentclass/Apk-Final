"""Endpoint /dashboard/summary. Nilai omzet disembunyikan untuk tier tanpa hak lihat omzet."""
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db

from ..access import feature_of, require_menu
from ..models import Coach, Member, Program, Schedule, Transaction, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(require_menu("dashboard", "GET"))):
    total_member = db.query(func.count(Member.id)).scalar() or 0
    total_coach = db.query(func.count(Coach.id)).scalar() or 0
    total_kelas = db.query(func.count(Schedule.id)).scalar() or 0

    # Distribusi member per program
    dist_rows = db.query(Member.program, func.count(Member.id)).group_by(Member.program).all()
    palette = ["#fdb827", "#a855f7", "#34c98b", "#3b82f6", "#f472b6"]
    distribution = [
        {
            "name": name or "-",
            "count": count,
            "percent": round(count * 100 / total_member) if total_member else 0,
            "color": palette[i % len(palette)],
        }
        for i, (name, count) in enumerate(dist_rows)
    ]

    result = {
        "stats": {
            "totalMember": {"value": total_member, "trend": 0, "note": "total terdaftar"},
            "kelasAktif": {"value": total_kelas, "trend": 0, "note": "jadwal kelas"},
            "totalCoach": {"value": total_coach, "trend": 0, "note": "tidak berubah"},
            "kehadiran": {"value": 0, "trend": 0, "note": "dibanding bulan lalu"},
        },
        "distribution": distribution,
        "popular": [
            {"name": d["name"], "members": d["count"], "color": d["color"], "rank": d["color"]}
            for d in sorted(distribution, key=lambda x: -x["count"])[:5]
        ],
        "activities": [],
    }

    # Data keuangan hanya untuk tier yang berhak
    if feature_of(user, "lihat_omzet_laba") != "none":
        prefix = date.today().strftime("%Y-%m")
        txs = db.query(Transaction).filter(Transaction.tanggal.like(prefix + "%")).all()
        income = sum(t.jumlah for t in txs if t.tipe == "Pemasukan")
        expense = sum(t.jumlah for t in txs if t.tipe == "Pengeluaran")
        result["stats"]["pendapatan"] = {"value": income, "trend": 0, "note": "dibanding bulan lalu"}
        result["revenueTrend"] = {"labels": [], "values": []}
        result["finance"] = {
            "period": "Bulan " + date.today().strftime("%B %Y"),
            "rows": [
                {"label": "Pendapatan", "amount": income, "trend": 0, "icon": "member", "tone": "c-green"},
                {"label": "Biaya Operasional", "amount": expense, "trend": 0, "icon": "receipt", "tone": "c-orange"},
            ],
            "netProfit": income - expense,
            "netTrend": 0,
        }
    return result
