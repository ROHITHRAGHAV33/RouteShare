from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles
from app.models import User, UserRole, TruckRoute, RouteStatus
from app.schemas import SearchResult, TruckRouteOut

router = APIRouter(prefix="/api/search", tags=["Freight Search & Matching"])


def route_corridor_matches(route: TruckRoute, pickup: str, destination: str) -> bool:
    """
    AI Route Matching Engine (simulated).

    Compares the shipper's requested pickup/destination against the truck's
    return-route corridor: source city, destination city, and any
    intermediate transit hubs. A match occurs when both the pickup and
    delivery locations fall within the route's corridor, in the correct
    directional order.
    """
    corridor = [route.source_city.strip().lower()]
    if route.intermediate_hubs:
        corridor += [h.strip().lower() for h in route.intermediate_hubs.split(",") if h.strip()]
    corridor.append(route.destination_city.strip().lower())

    pickup_l = pickup.strip().lower()
    destination_l = destination.strip().lower()

    if pickup_l not in corridor or destination_l not in corridor:
        return False

    # Directional check: pickup must occur at or before destination along the corridor.
    return corridor.index(pickup_l) <= corridor.index(destination_l)


@router.get("", response_model=List[SearchResult])
def search_freight(
    pickup_location: str = Query(..., min_length=2),
    destination_location: str = Query(..., min_length=2),
    cargo_weight_kg: float = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.shipper, UserRole.admin)),
):
    """
    FR-12, FR-13, FR-14, FR-15, FR-16: Accept a freight search request, run it
    through the AI route-matching engine against active routes, verify
    capacity, and return only routes that satisfy both route and capacity
    requirements. Returns an empty list (with 200 OK) when nothing matches,
    which the frontend surfaces as a "no matching route" notice.
    """
    now = datetime.now(timezone.utc)
    candidate_routes = (
        db.query(TruckRoute)
        .filter(
            TruckRoute.status == RouteStatus.active,
            TruckRoute.available_capacity_kg >= cargo_weight_kg,
            TruckRoute.return_date >= now,
        )
        .all()
    )

    results: List[SearchResult] = []
    for route in candidate_routes:
        if route_corridor_matches(route, pickup_location, destination_location):
            results.append(
                SearchResult(
                    route=TruckRouteOut.model_validate(route),
                    provider_name=route.provider.company_name or route.provider.full_name,
                    estimated_cost_for_query=round(cargo_weight_kg * route.rate_per_kg, 2),
                )
            )

    results.sort(key=lambda r: r.estimated_cost_for_query or 0)
    return results
