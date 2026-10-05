import json
import unittest

from app.access import TIERS_DIR, can_access, can_read_all, load_tiers, menus_for_tier

ALL_MENUS = {"dashboard", "produk", "bahan-baku", "resep", "produksi", "supplier",
             "customer", "penjualan", "pembelian", "online", "laporan", "keuangan"}


class TierTests(unittest.TestCase):
    def test_four_tier_files_exist(self):
        self.assertEqual(sorted(load_tiers()), [0, 1, 2, 3])

    def test_owner_can_access_everything(self):
        for menu in ALL_MENUS | {"menu-baru-nanti"}:
            self.assertTrue(can_access(0, menu))

    def test_lower_tiers_are_restricted(self):
        self.assertFalse(can_access(1, "keuangan"))
        self.assertFalse(can_access(3, "produksi"))
        self.assertTrue(can_access(3, "penjualan"))

    def test_unknown_tier_has_no_access(self):
        self.assertEqual(menus_for_tier(99), [])
        self.assertFalse(can_access(99, "dashboard"))

    def test_menu_keys_are_valid(self):
        for path in TIERS_DIR.glob("tier_*.json"):
            menus = set(json.loads(path.read_text(encoding="utf-8"))["menus"])
            self.assertTrue(menus <= ALL_MENUS | {"*"}, path.name)

    def test_read_all_for_dashboard_holders(self):
        self.assertTrue(can_read_all(3))


if __name__ == "__main__":
    unittest.main()
