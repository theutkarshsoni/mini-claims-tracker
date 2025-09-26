import os
from datetime import datetime
from typing import List, Optional
import boto3
from pydantic import BaseModel
from decimal import Decimal

TABLE_NAME = os.getenv("CLAIMS_TABLE", "ClaimsTable")
DDB_ENDPOINT = os.getenv("DDB_ENDPOINT")

def _ddb():
    kwargs = {
        "region_name": "us-west-2",
        "aws_access_key_id": "fakeMyKeyId",
        "aws_secret_access_key": "fakeSecretAccessKey"
    }
    if DDB_ENDPOINT:
        kwargs["endpoint_url"] = DDB_ENDPOINT
    return boto3.resource("dynamodb", **kwargs).Table(TABLE_NAME)

class ClaimRecord(BaseModel):
    claim_id: str
    user_id: str
    amount: float
    description: Optional[str] = None
    status: str
    created_at: datetime

def put_claim(rec: ClaimRecord) -> None:
    created_iso = rec.created_at.isoformat()
    _ddb().put_item(Item={
        "PK": f"CLAIM#{rec.claim_id}",
        "SK": "METADATA",
        "user_id": rec.user_id,
        "amount": Decimal(str(rec.amount)),
        "description": rec.description or "",
        "status": rec.status,
        "created_at": created_iso,
        "GSI1PK": f"USER#{rec.user_id}",
        "GSI1SK": f"CLAIM#{created_iso}",
    })

def get_claim(claim_id: str) -> Optional[dict]:
    res = _ddb().get_item(Key={"PK": f"CLAIM#{claim_id}", "SK": "METADATA"})
    return res.get("Item")

def list_claims(user_id: Optional[str] = None, status: Optional[str] = None) -> List[dict]:
    if user_id:
        res = _ddb().query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :gsi1pk",
            ExpressionAttributeValues={":gsi1pk": f"USER#{user_id}"},
            ScanIndexForward=False
        )
        items = res.get("Items", [])
    else:
        res = _ddb().scan(Limit=100)
        items = res.get("Items", [])
    if status:
        items = [i for i in items if i.get("status") == status.upper()]
    return items

def update_status(claim_id: str, new_status: str) -> dict:
    table = _ddb()
    res = table.update_item(
        Key={"PK": f"CLAIM#{claim_id}", "SK": "METADATA"},
        UpdateExpression="SET #s = :s",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": new_status.upper()},
        ReturnValues="ALL_NEW"
    )
    return res["Attributes"]
