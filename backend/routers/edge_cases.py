from fastapi import APIRouter
from backend.ml.edge_case_tester import EdgeCaseTester

router = APIRouter(prefix="/api/edge-cases", tags=["Edge Cases"])

@router.get("")
def get_edge_case_results():
    results = EdgeCaseTester.run_all_tests()
    return {
        "total_cases": len(results),
        "passed_cases": sum(1 for r in results if r["status"] == "PASS"),
        "failed_cases": sum(1 for r in results if r["status"] == "FAIL"),
        "results": results
    }
