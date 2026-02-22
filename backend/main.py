from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="DeedSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_PLANS = {"basic", "pro", "enterprise"}


def error(code: str, message: str, details=None, status: int = 400):
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message, "details": details}})


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/scan")
async def scan(file: UploadFile = File(...), plan: str = Form(...), language: str = Form("en")):
    if plan not in VALID_PLANS:
        return error("INVALID_PLAN", "Plan must be basic, pro, or enterprise", {"plan": plan})

    if not file.filename:
        return error("INVALID_FILE", "Missing uploaded file")

    report = {
        "summary": {"rank": "A-", "overall_score": 82 if plan != "basic" else 74, "confidence": 88},
        "dimensions": [
            {"name": "Market Presence", "score": 80},
            {"name": "Commitment", "score": 84},
            {"name": "Legal Signals", "score": 78},
            {"name": "Transparency", "score": 86},
            {"name": "Payment Clarity", "score": 79},
            {"name": "Delivery Confidence", "score": 81},
        ],
        "trend": [{"score": s} for s in [68, 71, 74, 79, 82]],
        "rationale": {
            "strengths": ["Developer references and milestones are present", "Payment terms include timing detail"],
            "risks": ["Guarantee wording requires legal review", "Penalty clauses need explicit remedy terms"],
            "recommendations": ["Request signed payment annex", "Verify escrow workflow and cancellation terms"],
            "next_actions": ["Collect title evidence", "Cross-check regulator records"],
        },
        "plan": plan,
        "language": language,
    }

    if plan == "enterprise":
        report["enterprise"] = {
            "integration_readiness": "placeholder",
            "audit_hooks": "placeholder",
            "custom_fields": ["portfolio_id", "approver", "legal_ticket"],
        }

    if plan == "basic":
        report["dimensions"] = report["dimensions"][:3]
        report["rationale"]["recommendations"] = report["rationale"]["recommendations"][:1]

    return {"ok": True, "report": report, "file": {"name": file.filename, "content_type": file.content_type}}
