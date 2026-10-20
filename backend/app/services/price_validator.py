import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from rapidfuzz import process, fuzz
from app.core.config import settings

BENCHMARKS_FILE = Path(__file__).resolve().parent.parent / "core" / "benchmarks.json"

class PriceValidator:
    def __init__(self):
        self.commodities = []
        self._load_benchmarks()

    def _load_benchmarks(self):
        if BENCHMARKS_FILE.exists():
            with open(BENCHMARKS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.commodities = data.get("commodities", [])

    def find_benchmark(self, item_description: str) -> Optional[Dict[str, Any]]:
        """
        Finds the closest matching commodity using token sort ratio.
        """
        if not self.commodities:
            return None

        best_match = None
        best_score = 0.0

        desc_lower = item_description.lower().strip()

        for comm in self.commodities:
            # Check canonical name
            score1 = fuzz.token_sort_ratio(desc_lower, comm["canonical_name"].lower())
            # Check aliases
            alias_scores = [fuzz.token_sort_ratio(desc_lower, a.lower()) for a in comm.get("aliases", [])]
            max_alias = max(alias_scores) if alias_scores else 0
            score = max(score1, max_alias)

            if score > best_score and score >= 60:
                best_score = score
                best_match = comm

        return best_match

    def validate_line_items(
        self,
        line_items: List[Dict[str, Any]],
        tolerance_pct: float = None
    ) -> Dict[str, Any]:
        """
        Compares billed unit prices against WFP benchmark median rates.
        Returns total market reference value, inflation flags, and overall markup %.
        """
        if tolerance_pct is None:
            tolerance_pct = settings.DEFAULT_TOLERANCE_PERCENT

        total_billed = 0.0
        total_market_ref = 0.0
        inflation_flags = []

        for item in line_items:
            desc = item.get("item_description", "")
            qty = float(item.get("quantity", 1.0))
            billed_unit = float(item.get("unit_price", 0.0))
            billed_total = float(item.get("total_price", billed_unit * qty))

            total_billed += billed_total

            bench = self.find_benchmark(desc)
            if bench:
                median_price = bench["median_price"]
                market_total = median_price * qty
                total_market_ref += market_total

                allowed_max = median_price * (1.0 + (tolerance_pct / 100.0))
                if billed_unit > allowed_max:
                    overage_pct = round(((billed_unit - median_price) / median_price) * 100.0, 1)
                    overage_dollars = round((billed_unit - median_price) * qty, 2)
                    inflation_flags.append({
                        "item": desc,
                        "sku": bench["sku"],
                        "billed_unit_price": billed_unit,
                        "market_median_price": median_price,
                        "overage_pct": overage_pct,
                        "overage_dollars": overage_dollars,
                        "source": bench["source"],
                        "flag": "PRICE_INFLATION"
                    })
            else:
                # If no direct benchmark found, treat billed as reference
                total_market_ref += billed_total

        overall_inflation_pct = 0.0
        if total_market_ref > 0 and total_billed > total_market_ref:
            overall_inflation_pct = round(((total_billed - total_market_ref) / total_market_ref) * 100.0, 1)

        return {
            "total_billed": round(total_billed, 2),
            "total_market_ref": round(total_market_ref, 2),
            "overall_inflation_pct": overall_inflation_pct,
            "has_inflation": len(inflation_flags) > 0,
            "flags": inflation_flags
        }

price_validator = PriceValidator()
