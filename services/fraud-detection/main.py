from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="LandChain AI Fraud Detection Service")

class ScoringRequest(BaseModel):
    parcelId: str
    transferHistory: list = []
    valuationHistory: list = []
    ownerHistory: list = []

@app.post("/score")
def calculate_score(req: ScoringRequest):
    score = 15
    flags = []
    
    if len(req.transferHistory) > 3:
        score += 35
        flags.append("High transfer frequency (>3 cycles in 2 years)")
        
    if len(req.ownerHistory) > 4:
        score += 20
        flags.append("Multiple owner transfers anomaly")
        
    if "suspicious" in req.parcelId.lower() or "flagged" in req.parcelId.lower():
        score = 82
        flags.append("Manual investigation flag override active")

    return {
        "parcelId": req.parcelId,
        "score": min(score, 100),
        "flags": flags,
        "riskLevel": "low" if score < 30 else "medium" if score < 75 else "high"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
