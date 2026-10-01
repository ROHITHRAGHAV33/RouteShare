# API Documentation

Base URL (local development): `http://localhost:8000/api`

All authenticated endpoints require header: `Authorization: Bearer <access_token>`

Interactive Swagger UI is available at `/docs` and ReDoc at `/redoc` when the server is running.

---

## Authentication

### `POST /auth/register`
Register a Truck Provider, Shipper, or Driver. (Admin accounts cannot self-register.)

**Request body**
```json
{
  "full_name": "Anitha Textiles",
  "email": "shipper@example.com",
  "phone": "+91-90000-00000",
  "password": "Shipper@123",
  "role": "shipper",
  "company_name": "Anitha Textiles Pvt Ltd"
}
```
`role` is one of `truck_provider`, `shipper`, `driver`. Password requires 8+ chars with upper,
lower, and a digit.

**Response `201`**
```json
{ "id": "uuid", "full_name": "...", "email": "...", "phone": "...", "role": "shipper", "company_name": "...", "is_active": true, "created_at": "..." }
```

**Errors**: `400` email already registered · `422` validation failure

---

### `POST /auth/login`
**Request body**
```json
{ "email": "shipper@example.com", "password": "Shipper@123" }
```

**Response `200`**
```json
{ "access_token": "eyJ...", "token_type": "bearer", "user": { "...UserOut" } }
```

**Errors**: `401` incorrect credentials · `423` account locked (5+ failed attempts, 15-minute
lockout) · `403` account deactivated

---

### `GET /auth/me`
Returns the authenticated user's profile. **Errors**: `401` invalid/missing token.

---

## Truck Routes (Truck Provider)

### `POST /routes`
Register a return route. **Role**: `truck_provider`

**Request body**
```json
{
  "source_city": "Coimbatore",
  "destination_city": "Chennai",
  "intermediate_hubs": "Salem, Vellore",
  "return_date": "2026-08-01T10:00:00Z",
  "total_capacity_kg": 5000,
  "rate_per_kg": 8.5
}
```
**Response `201`**: `TruckRouteOut` object with generated `route_code` and
`available_capacity_kg` = `total_capacity_kg`.

### `GET /routes/my`
List the authenticated provider's routes. **Role**: `truck_provider`

### `GET /routes/{route_id}`
Fetch a single route. Any authenticated user.

### `PUT /routes/{route_id}`
Update a route's fields (partial update). **Role**: `truck_provider` (owner) or `admin`.
**Errors**: `400` if reducing capacity below already-booked weight, or if route is `completed`.

### `DELETE /routes/{route_id}`
Delete a route. **Errors**: `400` if the route has active bookings.

### `PATCH /routes/{route_id}/assign-driver`
```json
{ "driver_id": "uuid" }
```
Assigns a registered driver to the route.

---

## Freight Search & AI Matching (Shipper)

### `GET /search?pickup_location=...&destination_location=...&cargo_weight_kg=...`
**Role**: `shipper`. Runs the AI corridor-matching engine against all active routes and returns
only those that satisfy the pickup→destination corridor, directional order, and available
capacity, sorted by estimated cost ascending.

**Response `200`**
```json
[
  {
    "route": { "...TruckRouteOut" },
    "provider_name": "Kumar Logistics",
    "estimated_cost_for_query": 8500.0
  }
]
```
Returns `[]` (still `200`) when no route matches — the frontend surfaces a "no matching route" notice.

---

## Bookings

### `POST /bookings`
Reserve cargo space. **Role**: `shipper`

```json
{
  "route_id": "uuid",
  "pickup_location": "Coimbatore",
  "delivery_location": "Chennai",
  "cargo_weight_kg": 1000,
  "cargo_volume_cbm": 12.5
}
```
**Response `201`**: `BookingOut` with generated `booking_ref` and computed `cost`.
**Errors**: `400` insufficient capacity, or route not active · `404` route not found.

### `GET /bookings/my` — Role: `shipper`. Booking history for the shipper.
### `GET /bookings/provider` — Role: `truck_provider`. Bookings across the provider's routes.
### `GET /bookings/{booking_id}` — Owner (shipper/provider) or admin only.
### `PATCH /bookings/{booking_id}/cancel` — Restores capacity to the route. Blocked once `delivered` or already `cancelled`.

---

## Driver

### `GET /driver/trips` — Role: `driver`. Routes assigned to the authenticated driver.
### `GET /driver/trips/{route_id}/bookings` — Bookings on a given assigned trip.
### `PATCH /driver/bookings/{booking_id}/pickup` — Confirms cargo pickup (`confirmed` → `picked_up`). Rejects a second concurrent active trip.
### `PATCH /driver/bookings/{booking_id}/deliver` — Confirms delivery (`picked_up` → `delivered`).
### `PATCH /driver/trips/{route_id}/complete` — Marks the route `completed`. Requires all bookings `delivered` or `cancelled`.

---

## Administration

### `GET /admin/users?role=&search=&page=&page_size=` — List/search users.
### `PATCH /admin/users/{user_id}/deactivate` — Deactivate a user (blocks login).
### `DELETE /admin/users/{user_id}` — Permanently delete a user. Cannot delete self.
### `GET /admin/routes?status=&page=&page_size=` — All routes, optionally filtered by status.
### `GET /admin/bookings?status=&page=&page_size=` — All bookings, optionally filtered by status.
### `GET /admin/reports/summary` — Platform statistics:
```json
{
  "total_users": 12, "total_providers": 4, "total_shippers": 6, "total_drivers": 2,
  "total_routes": 8, "active_routes": 5, "completed_routes": 3,
  "total_bookings": 15, "total_revenue": 128500.0,
  "average_capacity_utilization_pct": 42.7
}
```

---

## System

### `GET /api/health` — No auth required. Returns `{ "status": "ok", ... }`.

---

## Common error shape

```json
{ "detail": "Human-readable message" }
```
Validation errors (`422`) return:
```json
{ "detail": [ { "field": "email", "message": "value is not a valid email address" } ] }
```
