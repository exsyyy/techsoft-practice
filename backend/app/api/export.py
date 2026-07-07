import csv
from io import StringIO
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Case
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin/export", tags=["admin"])

@router.get("/csv")
def export_cases_csv(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    cases = db.query(Case).all()
    
    output = StringIO()
    writer = csv.writer(output, delimiter=';')
    
    headers = [
        "id", "title", "country_id", "company", "industry",
        "facility_type", "business_problem", "problem_description",
        "solution_description", "it_systems", "implementation_stages",
        "measurable_result", "result_unit", "result_period",
        "initial_value", "final_value", "limitations", "applicability",
        "source_url", "source_type", "trust_level", "status",
        "author_id", "verifier_id", "verification_date",
        "created_at", "updated_at"
    ]
    writer.writerow(headers)
    
    for case in cases:
        writer.writerow([
            case.id, case.title, case.country_id, case.company,
            case.industry, case.facility_type, case.business_problem,
            case.problem_description, case.solution_description,
            case.it_systems, case.implementation_stages,
            case.measurable_result, case.result_unit, case.result_period,
            case.initial_value, case.final_value, case.limitations,
            case.applicability, case.source_url, case.source_type,
            case.trust_level.value, case.status.value,
            case.author_id, case.verifier_id, case.verification_date,
            case.created_at, case.updated_at
        ])
    
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cases_export.csv"}
    )
    return response