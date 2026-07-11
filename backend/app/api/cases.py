from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.services import case_service
from app.schemas import CaseResponse
from app.schemas import CaseCreate, CaseUpdate
from app.core.dependencies import get_current_admin  # Импортируем зависимость проверки прав админа

router = APIRouter(prefix="/api/cases", tags=["cases"])

@router.get("/", response_model=List[CaseResponse])
def get_cases(
        country: Optional[str] = Query(None, description="Фильтр по стране"),
        industry: Optional[str] = Query(None, description="Фильтр по отрасли"),
        facility_type: Optional[str] = Query(None, description="Фильтр по типу объекта"),
        technology: Optional[str] = Query(None, description="Фильтр по технологии"),
        trust_level: Optional[str] = Query(None, description="Уровень достоверности A/B/C/D"),
        has_quantitative_result: Optional[bool] = Query(None, description="Есть количественный результат"),
        source_type: Optional[str] = Query(None, description="Тип источника"),
        search: Optional[str] = Query(None, description="Поиск по названию, описанию, компании"),
        status: Optional[str] = Query(None, description="Статус кейса"),
        sort_by: str = Query("created_at", description="Поле для сортировки"),
        order: str = Query("desc", description="Порядок: desc или asc"),
        skip: int = Query(0, ge=0, description="Смещение для пагинации"),
        limit: int = Query(55, ge=1, le=100, description="Количество записей на странице"),
        db: Session = Depends(get_db),
):
    return case_service.get_cases(
        db=db,
        country=country,
        industry=industry,
        facility_type=facility_type,
        technology=technology,
        trust_level=trust_level,
        has_quantitative_result=has_quantitative_result,
        source_type=source_type,
        search=search,
        status=status,
        sort_by=sort_by,
        order=order,
        skip=skip,
        limit=limit,
    )

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = case_service.get_case_by_id(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case



@router.post("/admin/cases", response_model=CaseResponse, status_code=201, tags=["admin"])
def create_case(
        case_data: CaseCreate,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_admin)  # Защита эндпоинта
):
    return case_service.create_case(db, case_data)

@router.put("/admin/cases/{case_id}", response_model=CaseResponse, tags=["admin"])
def update_case(
        case_id: int,
        case_data: CaseUpdate,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_admin)  # Защита эндпоинта
):
    case = case_service.update_case(db, case_id, case_data)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.patch("/admin/cases/{case_id}", response_model=CaseResponse, tags=["admin"])
def patch_case(
        case_id: int,
        case_data: CaseUpdate,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_admin)  # Защита эндпоинта
):
    case = case_service.update_case(db, case_id, case_data)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.delete("/admin/cases/{case_id}", status_code=204, tags=["admin"])
def delete_case(
        case_id: int,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_admin)  # Защита эндпоинта
):
    deleted = case_service.delete_case(db, case_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Case not found")
    return None