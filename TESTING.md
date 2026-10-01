# Testing Guide

## 1. Sample test data

Run `python seed_data.py` from `backend/` (after `uvicorn` has created the tables, or it will
create them itself). This creates:

| Role | Email | Password |
|---|---|---|
| Administrator | admin@freight.test | Admin@1234 |
| Truck Provider | provider@freight.test | Provider@123 |
| Shipper | shipper@freight.test | Shipper@123 |
| Driver | driver@freight.test | Driver@1234 |

...and one active route `RT-SAMPLE01`: Coimbatore → Chennai via Salem, Vellore, 5000 kg
capacity at ₹8.50/kg, assigned to the sample driver.

This project's core flow (register → login → route creation → search matching → booking →
capacity deduction → overbooking rejection) has been verified end-to-end against a running
instance of this exact backend.

---

## 2. Manual testing checklist

**Authentication**
- [ ] Register as each role (provider, shipper, driver) with valid data — succeeds
- [ ] Register with a duplicate email — rejected with `400`
- [ ] Register with a weak password (no uppercase/digit) — rejected with `422`
- [ ] Register with `role: "admin"` — rejected with `422`
- [ ] Log in with correct credentials — receives JWT
- [ ] Log in with wrong password 5 times — account locks for 15 minutes (`423`)
- [ ] Access a protected page without logging in — redirected to `/login`

**Truck Provider**
- [ ] Register a route with valid capacity/rate — appears in "Your active routes"
- [ ] Try registering a route with destination equal to source — rejected
- [ ] Delete a route with no bookings — succeeds
- [ ] Try deleting a route with an active booking — blocked
- [ ] Try reducing total capacity below already-booked weight — blocked

**Shipper**
- [ ] Search a pickup/destination pair that matches a registered corridor — route appears with an estimated cost
- [ ] Search a pair with no matching route — "No matching route available" message, no crash
- [ ] Book a route — capacity on the provider's route decreases by the booked weight
- [ ] Attempt to book more weight than available — rejected with `400`
- [ ] Cancel a confirmed booking — capacity is restored on the route

**Driver**
- [ ] View assigned trips
- [ ] Confirm pickup on a `confirmed` booking — status becomes `picked_up`
- [ ] Confirm delivery on a `picked_up` booking — status becomes `delivered`
- [ ] Try completing a trip with undelivered bookings — blocked
- [ ] Complete a trip once all bookings are delivered/cancelled — route status becomes `completed`

**Administrator**
- [ ] View platform summary stats (users, routes, bookings, revenue, utilization %)
- [ ] Deactivate a user — that user can no longer log in
- [ ] Delete a user — removed from the list
- [ ] Try deleting your own admin account — blocked

---

## 3. API testing examples (curl)

```bash
# Register a shipper
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Anitha Textiles","email":"shipper@example.com","phone":"+919000000000","password":"Shipper@123","role":"shipper"}'

# Log in and capture the token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shipper@example.com","password":"Shipper@123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# Search freight
curl -G http://localhost:8000/api/search \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "pickup_location=Coimbatore" \
  --data-urlencode "destination_location=Chennai" \
  --data-urlencode "cargo_weight_kg=1000"

# Create a booking
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"route_id":"<ROUTE_ID>","pickup_location":"Coimbatore","delivery_location":"Chennai","cargo_weight_kg":1000}'
```

---

## 4. Edge cases covered by the implementation

- Booking exactly the remaining available capacity (capacity becomes `0`, not negative)
- Concurrent bookings on the same route (row-level locking via `SELECT ... FOR UPDATE`)
- Cancelling a booking after partial capacity has already been re-booked by someone else
  (capacity is clamped to `total_capacity_kg`, never over-restored)
- Route with a return date in the past is excluded from search results automatically
- A driver with two assigned trips cannot pick up cargo on a second trip while one is still
  in progress
- Deleting a user cascades to their owned routes/bookings at the database level
  (`ON DELETE CASCADE` / `SET NULL` as appropriate — see `database/schema.sql`)
- Empty search results return `200` with `[]`, not an error, so the frontend can show a
  friendly "no matches" state instead of an error toast
