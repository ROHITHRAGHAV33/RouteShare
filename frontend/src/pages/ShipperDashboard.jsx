import { useEffect, useState } from "react";
import { searchApi, bookingsApi, extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Badge, Spinner, EmptyState, Modal } from "../components/UI";

export default function ShipperDashboard() {
  const { pushToast } = useToast();
  const [searchForm, setSearchForm] = useState({ pickup_location: "", destination_location: "", cargo_weight_kg: "" });
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingForm, setBookingForm] = useState({ pickup_location: "", delivery_location: "", cargo_volume_cbm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await bookingsApi.mine();
      setHistory(data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const downloadInvoice = async (bookingId, bookingRef) => {
    try {
      const response = await bookingsApi.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      pushToast(extractErrorMessage(err), 'error');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (evt) => {
    evt.preventDefault();
    setSearching(true);
    setResults(null);
    try {
      const { data } = await searchApi.search({
        pickup_location: searchForm.pickup_location,
        destination_location: searchForm.destination_location,
        cargo_weight_kg: Number(searchForm.cargo_weight_kg),
      });
      setResults(data);
      if (data.length === 0) {
        pushToast("No matching return routes found for this search.", "info");
      }
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSearching(false);
    }
  };

  const openBooking = (result) => {
    setBookingTarget(result);
    setBookingForm({
      pickup_location: searchForm.pickup_location,
      delivery_location: searchForm.destination_location,
      cargo_volume_cbm: "",
    });
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    try {
      const { data } = await bookingsApi.create({
        route_id: bookingTarget.route.id,
        pickup_location: bookingForm.pickup_location,
        delivery_location: bookingForm.delivery_location,
        cargo_weight_kg: Number(searchForm.cargo_weight_kg),
        cargo_volume_cbm: bookingForm.cargo_volume_cbm ? Number(bookingForm.cargo_volume_cbm) : null,
      });
      pushToast(`Booking confirmed — reference ${data.booking_ref}`, "success");
      setBookingTarget(null);
      handleSearch({ preventDefault: () => {} });
      loadHistory();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id, ref) => {
    try {
      await bookingsApi.cancel(id);
      pushToast(`Booking ${ref} cancelled.`, "success");
      loadHistory();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Shipper Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Search empty-return capacity along your freight corridor and reserve space.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-navy-900 mb-4">Search freight opportunities</h2>
        <form onSubmit={handleSearch} className="grid sm:grid-cols-4 gap-3 items-end">
          <Input
            label="Pickup city"
            required
            value={searchForm.pickup_location}
            onChange={(e) => setSearchForm({ ...searchForm, pickup_location: e.target.value })}
          />
          <Input
            label="Delivery city"
            required
            value={searchForm.destination_location}
            onChange={(e) => setSearchForm({ ...searchForm, destination_location: e.target.value })}
          />
          <Input
            label="Cargo weight (kg)"
            type="number"
            min="1"
            required
            value={searchForm.cargo_weight_kg}
            onChange={(e) => setSearchForm({ ...searchForm, cargo_weight_kg: e.target.value })}
          />
          <Button type="submit" variant="accent" disabled={searching}>
            {searching ? <Spinner /> : "Search"}
          </Button>
        </form>
      </Card>

      {results !== null && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-navy-900">Matching routes ({results.length})</h2>
          {results.length === 0 ? (
            <Card>
              <EmptyState
                title="No matching route available"
                description="Try a nearby city, a different pickup/delivery pair, or check back later as new return routes are registered."
              />
            </Card>
          ) : (
            results.map((r) => (
              <Card key={r.route.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-navy-500">{r.route.route_code}</span>
                    <Badge tone="active">provider: {r.provider_name}</Badge>
                    {r.route.driver && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        👤 Driver: {r.route.driver.full_name}
                      </span>
                    )}
                    {r.route.vehicle && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy-100 text-navy-800">
                        🚛 {r.route.vehicle.vehicle_number}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-navy-950">
                    {r.route.source_city} → {r.route.destination_city}
                  </h3>
                  <p className="text-sm text-navy-600">
                    {r.route.available_capacity_kg} kg available · returns {new Date(r.route.return_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display font-semibold text-lg text-navy-950">₹{r.estimated_cost_for_query}</div>
                  <Button variant="accent" className="mt-2" onClick={() => openBooking(r)}>
                    Reserve space
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-navy-900">Booking history</h2>
        {loadingHistory ? (
          <Spinner />
        ) : history.length === 0 ? (
          <Card>
            <EmptyState title="No bookings yet" description="Your reserved freight bookings will appear here." />
          </Card>
        ) : (
          <Card className="divide-y divide-navy-900/10">
            {history.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                      <Badge tone={b.status}>{b.status}</Badge>
                      {b.route?.route_code && (
                        <span className="text-xs font-mono text-navy-600 bg-navy-100 px-2 py-0.5 rounded">
                          Route: {b.route.route_code}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-navy-950">
                      {b.pickup_location} → {b.delivery_location}
                    </p>
                    <p className="text-xs text-navy-600">
                      Weight: {b.cargo_weight_kg} kg {b.cargo_volume_cbm ? `· ${b.cargo_volume_cbm} CBM` : ""} · Total Cost: ₹{b.cost}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {['confirmed', 'picked_up', 'delivered'].includes(b.status) && (
                      <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => downloadInvoice(b.id, b.booking_ref)}>
                        Invoice PDF
                      </Button>
                    )}
                    {(b.status === "confirmed" || b.status === "pending") && (
                      <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => cancelBooking(b.id, b.booking_ref)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assigned Driver Details for Shipper */}
                {b.route?.driver ? (
                  <div className="p-3 bg-navy-50 rounded-xl border border-navy-900/10 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-navy-900 flex items-center gap-1.5">
                        👤 Assigned Driver: {b.route.driver.full_name}
                      </span>
                      {b.route.driver.phone && (
                        <a
                          href={`tel:${b.route.driver.phone}`}
                          className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 flex items-center gap-1"
                        >
                          📞 {b.route.driver.phone}
                        </a>
                      )}
                      {b.route.driver.license_number && (
                        <span className="text-navy-600">DL: <span className="font-mono">{b.route.driver.license_number}</span></span>
                      )}
                      {(b.route.driver.vehicle_number || b.route.vehicle?.vehicle_number) && (
                        <span className="text-navy-600">Vehicle: <span className="font-mono">{b.route.driver.vehicle_number || b.route.vehicle?.vehicle_number}</span></span>
                      )}
                    </div>
                    {b.route.driver.phone && (
                      <a
                        href={`tel:${b.route.driver.phone}`}
                        className="px-3 py-1 rounded-lg bg-navy-900 text-white font-semibold hover:bg-navy-800 text-xs"
                      >
                        Call Driver
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-navy-500 italic bg-navy-50/50 p-2 rounded-lg border border-dashed border-navy-200">
                    ⏳ Driver assignment in progress by logistics provider
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      <Modal open={!!bookingTarget} onClose={() => setBookingTarget(null)} title="Confirm your booking">
        {bookingTarget && (
          <div className="space-y-4">
            <p className="text-sm text-navy-600">
              Reserving <strong>{searchForm.cargo_weight_kg} kg</strong> on route{" "}
              <strong>{bookingTarget.route.route_code}</strong> for an estimated{" "}
              <strong>₹{bookingTarget.estimated_cost_for_query}</strong>.
            </p>
            <Input
              label="Pickup location"
              value={bookingForm.pickup_location}
              onChange={(e) => setBookingForm({ ...bookingForm, pickup_location: e.target.value })}
            />
            <Input
              label="Delivery location"
              value={bookingForm.delivery_location}
              onChange={(e) => setBookingForm({ ...bookingForm, delivery_location: e.target.value })}
            />
            <Input
              label="Cargo volume in cbm (optional)"
              type="number"
              min="0.1"
              step="0.1"
              value={bookingForm.cargo_volume_cbm}
              onChange={(e) => setBookingForm({ ...bookingForm, cargo_volume_cbm: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setBookingTarget(null)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={confirmBooking} disabled={submitting}>
                {submitting ? <Spinner /> : "Confirm booking"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
