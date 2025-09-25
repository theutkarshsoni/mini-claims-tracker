from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

app = FastAPI(title="Mini Claims Tracker API", version="0.1.0")

class ClaimInput(BaseModel):
    user_id: str = Field(..., min_length=1)
    amount: float = Field(..., ge=0)
    description: Optional[str] = None

class Claim(ClaimInput):
    claim_id: str
    status: str = "PENDING"
    created_at: datetime

CLAIMS: dict[str, Claim] = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/claims", response_model=Claim)
def create_claim(payload: ClaimInput):
    claim = Claim(
        claim_id=str(uuid.uuid4()),
        user_id=payload.user_id,
        amount=payload.amount,
        description=payload.description,
        status="PENDING",
        created_at=datetime.utcnow(),
    )
    CLAIMS[claim.claim_id] = claim
    return claim

@app.get("/claims", response_model=List[Claim])
def list_claims(user_id: Optional[str] = None, status: Optional[str] = None):
    items = list(CLAIMS.values())
    if user_id:
        items = [c for c in items if c.user_id == user_id]
    if status:
        items = [c for c in items if c.status.upper() == status.upper()]
    return sorted(items, key=lambda c: c.created_at, reverse=True)

class StatusPatch(BaseModel):
    status: str

@app.patch("/claims/{claim_id}", response_model=Claim)
def update_status(claim_id: str, patch: StatusPatch):
    if claim_id not in CLAIMS:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = CLAIMS[claim_id]
    claim.status = patch.status.upper()
    CLAIMS[claim_id] = claim
    return claim
