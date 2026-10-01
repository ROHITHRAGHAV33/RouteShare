import { useEffect, useState } from "react";
import { driverApi, bookingsApi, extractErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Badge, Spinner, EmptyState } from "../components/UI";

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const { pushToast } = useToast();

  const [activeTab, setActiveTab] = useState("trips"); // "trips" | "profile" | "links"
  const [profile, setProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tripBookings, setTripBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Driver details input form state
  const [detailsForm, setDetailsForm] = useState({
    license_number: "",
    experience_years: "",
    vehicle_number: "",
    vehicle_type: "Truck",
    base_city: "",
    emergency_contact: "",
    affiliated_provider_id: "",
    availability_status: "available",
    phone: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, provsRes, tripsRes] = await Promise.all([
        driverApi.profile(),
        driverApi.providers(),
        driverApi.trips(),
      ]);

      const prof = profRes.data;
      setProfile(prof);
      setProviders(provsRes.data);
      setTrips(tripsRes.data);

      setDetailsForm({
        license_number: prof.license_number || "",
        experience_years: prof.experience_years !== null && prof.experience_years !== undefined ? String(prof.experience_years) : "",
        vehicle_number: prof.vehicle_number || "",
        vehicle_type: prof.vehicle_type || "Truck",
        base_city: prof.base_city || "",
        emergency_contact: prof.emergency_contact || "",
        affiliated_provider_id: prof.affiliated_provider_id || "",
        availability_status: prof.availability_status || "available",
        phone: prof.phone || user?.phone || "",
      });

      // Load bookings for all trips
      const bookingsByRoute = {};
      await Promise.all(
        tripsRes.data.map(async (trip) => {
          try {
            const { data: bks } = await driverApi.tripBookings(trip.id);
            bookingsByRoute[trip.id] = bks;
          } catch {
            bookingsByRoute[trip.id] = [];
          }
        })
      );
      setTripBookings(bookingsByRoute);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        license_number: detailsForm.license_number.trim() || null,
        experience_years: detailsForm.experience_years ? parseInt(detailsForm.experience_years, 10) : 0,
        vehicle_number: detailsForm.vehicle_number.trim() || null,
        vehicle_type: detailsForm.vehicle_type || null,
        base_city: detailsForm.base_city.trim() || null,
        emergency_contact: detailsForm.emergency_contact.trim() || null,
        affiliated_provider_id: detailsForm.affiliated_provider_id || "",
        availability_status: detailsForm.availability_status || "available",
        phone: detailsForm.phone.trim() || null,
      };

      const { data } = await driverApi.updateProfile(payload);
      setProfile(data);
      if (updateUser) {
        updateUser({
          phone: data.phone,
          license_number: data.license_number,
          vehicle_number: data.vehicle_number,
          availability_status: data.availability_status,
          affiliated_provider_id: data.affiliated_provider_id,
          affiliated_provider_name: data.affiliated_provider_name,
        });
      }
      pushToast("Driver details & credentials saved successfully!", "success");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const act = async (fn, id, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      pushToast(successMsg, "success");
      await loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const completeTrip = (routeId, code) =>
    act(() => driverApi.completeTrip(routeId), routeId, `Trip ${code} marked complete.`);

  const downloadInvoice = async (bookingId, bookingRef) => {
    try {
      const response = await bookingsApi.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  // Compute stats
  const totalBookingsCount = Object.values(tripBookings).reduce((acc, list) => acc + list.length, 0);
  const activeTripsCount = trips.filter((t) => t.status === "active").length;
  const completedTripsCount = trips.filter((t) => t.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      {/* Header and Hero Identity Bar */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 text-white shadow-md border border-navy-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-navy-950 font-display font-bold text-2xl flex items-center justify-center shadow-lg">
              {user?.full_name ? user.full_name[0].toUpperCase() : "D"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-semibold text-2xl tracking-tight">{user?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Commercial Driver
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    profile?.availability_status === "on_trip"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : profile?.availability_status === "off_duty"
                      ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  ● {profile?.availability_status ? profile.availability_status.replace("_", " ") : "available"}
                </span>
              </div>
              <p className="text-navy-300 text-xs mt-1">
                {profile?.license_number ? `DL: ${profile.license_number}` : "License not registered yet"} ·{" "}
                {profile?.vehicle_number ? `Vehicle: ${profile.vehicle_number} (${profile.vehicle_type || "Truck"})` : "Vehicle not assigned"} ·{" "}
                {profile?.base_city ? `Base: ${profile.base_city}` : "Base city unassigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs">
            <div className="text-right px-2">
              <span className="text-navy-400 block">Affiliated Provider</span>
              <span className="font-semibold text-amber-400 truncate max-w-[180px] block">
                {profile?.affiliated_provider_name || "Independent / Self"}
              </span>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="text-right px-2">
              <span className="text-navy-400 block">Experience</span>
              <span className="font-semibold text-white">{profile?.experience_years || 0} Years</span>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-navy-800/80 text-sm">
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Active Trips</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{activeTripsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Completed Trips</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{completedTripsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Total Cargo Consignments</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{totalBookingsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Direct Shipper Links</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">
              {new Set(Object.values(tripBookings).flat().map((b) => b.shipper_id)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-900/10">
        <button
          onClick={() => setActiveTab("trips")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "trips"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>🚚 My Trips & Manifest</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-navy-900/10 text-navy-800 font-mono">
            {trips.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>📋 Driver Profile & Vehicle Inputs</span>
          {(!profile?.license_number || !profile?.vehicle_number) && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Profile incomplete" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "links"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>🔗 Linked Provider & Shippers</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* TAB 1: Assigned Trips */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg text-navy-950">
                  Assigned Return Trips & Cargo Manifest
                </h2>
                <Button variant="outline" className="text-xs" onClick={loadData}>
                  Refresh Trips
                </Button>
              </div>

              {trips.length === 0 ? (
                <Card className="p-8">
                  <EmptyState
                    title="No trips currently assigned"
                    description="You have not been assigned to any return trips yet. When a fleet provider assigns you to a route, it will appear here with live pickup and delivery manifests."
                  />
                </Card>
              ) : (
                trips.map((trip) => {
                  const bookings = tripBookings[trip.id] || [];
                  const allSettled = bookings.length > 0 && bookings.every((b) => ["delivered", "cancelled"].includes(b.status));

                  return (
                    <Card key={trip.id} className="p-6 transition-all hover:shadow-md border border-navy-900/10">
                      {/* Trip Card Header */}
                      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-navy-900/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-white">
                              {trip.route_code}
                            </span>
                            <Badge tone={trip.status}>{trip.status}</Badge>
                            {trip.vehicle && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy-100 text-navy-800">
                                🚛 {trip.vehicle.vehicle_number} ({trip.vehicle.vehicle_type})
                              </span>
                            )}
                            {trip.provider && (
                              <span className="text-xs text-navy-600 font-medium">
                                Provider: {trip.provider.company_name || trip.provider.full_name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-xl text-navy-950">
                            {trip.source_city} → {trip.destination_city}
                          </h3>
                          {trip.intermediate_hubs && (
                            <p className="text-xs text-navy-500 mt-0.5">Transit via: {trip.intermediate_hubs}</p>
                          )}
                          <p className="text-xs text-navy-600 mt-1">
                            Scheduled Departure: {new Date(trip.return_date).toLocaleString()}
                          </p>
                        </div>

                        {trip.status === "active" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="accent"
                              className="text-xs"
                              disabled={!allSettled || busyId === trip.id}
                              onClick={() => completeTrip(trip.id, trip.route_code)}
                              title={
                                !allSettled
                                  ? "All bookings must be delivered or cancelled before completing the trip"
                                  : "Mark trip complete"
                              }
                            >
                              {busyId === trip.id ? <Spinner /> : "✓ Mark Trip Complete"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Cargo Manifest / Shippers */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-navy-500 font-medium uppercase tracking-wider">
                          <span>Cargo Consignments ({bookings.length})</span>
                          <span>Shipper & Contact Details</span>
                        </div>

                        {bookings.length === 0 ? (
                          <div className="p-4 bg-navy-50 rounded-lg text-center text-xs text-navy-500">
                            No cargo bookings have been scheduled on this route yet.
                          </div>
                        ) : (
                          bookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-navy-900/[0.03] hover:bg-navy-900/[0.05] border border-navy-900/10 rounded-xl p-4 transition-colors"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-semibold text-navy-600 bg-navy-100 px-2 py-0.5 rounded">
                                      {b.booking_ref}
                                    </span>
                                    <Badge tone={b.status}>{b.status}</Badge>
                                    <span className="text-xs font-semibold text-navy-800">
                                      {b.cargo_weight_kg} kg {b.cargo_volume_cbm ? `· ${b.cargo_volume_cbm} CBM` : ""}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-navy-900">
                                    <span className="text-emerald-700">Pickup:</span> {b.pickup_location} →{" "}
                                    <span className="text-blue-700">Drop:</span> {b.delivery_location}
                                  </div>
                                  {/* Linked Shipper Details */}
                                  {b.shipper && (
                                    <div className="flex items-center gap-3 text-xs text-navy-700 pt-1">
                                      <span className="font-medium">
                                        👤 Shipper: {b.shipper.full_name}{" "}
                                        {b.shipper.company_name ? `(${b.shipper.company_name})` : ""}
                                      </span>
                                      {b.shipper.phone && (
                                        <a
                                          href={`tel:${b.shipper.phone}`}
                                          className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 underline underline-offset-2"
                                        >
                                          📞 {b.shipper.phone}
                                        </a>
                                      )}
                                      <a
                                        href={`mailto:${b.shipper.email}`}
                                        className="text-navy-600 hover:text-navy-900 underline underline-offset-2"
                                      >
                                        ✉️ {b.shipper.email}
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button
                                    variant="outline"
                                    className="text-xs px-3 py-1.5"
                                    onClick={() => downloadInvoice(b.id, b.booking_ref)}
                                  >
                                    📄 Invoice PDF
                                  </Button>

                                  {b.status === "confirmed" && (
                                    <Button
                                      variant="accent"
                                      className="text-xs px-3 py-1.5"
                                      disabled={busyId === b.id}
                                      onClick={() =>
                                        act(() => driverApi.confirmPickup(b.id), b.id, "Cargo pickup confirmed.")
                                      }
                                    >
                                      {busyId === b.id ? <Spinner /> : "Confirm Pickup"}
                                    </Button>
                                  )}

                                  {b.status === "picked_up" && (
                                    <Button
                                      variant="accent"
                                      className="text-xs px-3 py-1.5"
                                      disabled={busyId === b.id}
                                      onClick={() =>
                                        act(() => driverApi.confirmDelivery(b.id), b.id, "Cargo delivery confirmed.")
                                      }
                                    >
                                      {busyId === b.id ? <Spinner /> : "Confirm Delivery"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Driver Details & Vehicle Inputs (The core inputs requested) */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="border-b border-navy-900/10 pb-4 mb-5">
                    <h2 className="font-display font-semibold text-lg text-navy-950">
                      Driver Details & Credentials
                    </h2>
                    <p className="text-xs text-navy-600 mt-1">
                      Enter and maintain your commercial driver details. These details are verified by logistics providers and displayed on trip manifests to shippers.
                    </p>
                  </div>

                  <form onSubmit={handleSaveDetails} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Driving License (DL) Number"
                        required
                        value={detailsForm.license_number}
                        onChange={(e) => setDetailsForm({ ...detailsForm, license_number: e.target.value })}
                        placeholder="e.g. DL-1420110012345 or TN-38-2016-0045678"
                      />

                      <Input
                        label="Commercial Driving Experience (Years)"
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={detailsForm.experience_years}
                        onChange={(e) => setDetailsForm({ ...detailsForm, experience_years: e.target.value })}
                        placeholder="e.g. 7"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Registered Vehicle Registration Number"
                        value={detailsForm.vehicle_number}
                        onChange={(e) => setDetailsForm({ ...detailsForm, vehicle_number: e.target.value })}
                        placeholder="e.g. TN-38-KL-1001"
                      />

                      <Select
                        label="Vehicle Class / Type"
                        value={detailsForm.vehicle_type}
                        onChange={(e) => setDetailsForm({ ...detailsForm, vehicle_type: e.target.value })}
                      >
                        <option value="Truck">10-Wheeler Standard Truck</option>
                        <option value="Multi-Axle Heavy Truck">12-Wheeler / Multi-Axle Heavy Truck</option>
                        <option value="Mini Truck">Mini Truck / LCV (e.g. Tata Ace, Bolero)</option>
                        <option value="Trailer">Flatbed Semi-Trailer</option>
                        <option value="Container">Enclosed Container Truck</option>
                        <option value="Refrigerated Truck">Refrigerated Reefer Truck</option>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Base City / Operating Hub"
                        value={detailsForm.base_city}
                        onChange={(e) => setDetailsForm({ ...detailsForm, base_city: e.target.value })}
                        placeholder="e.g. Coimbatore, Tamil Nadu"
                      />

                      <Input
                        label="Emergency Contact Phone"
                        value={detailsForm.emergency_contact}
                        onChange={(e) => setDetailsForm({ ...detailsForm, emergency_contact: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Driver Direct Phone"
                        value={detailsForm.phone}
                        onChange={(e) => setDetailsForm({ ...detailsForm, phone: e.target.value })}
                        placeholder="+91 90000 00000"
                      />

                      <Select
                        label="Duty / Availability Status"
                        value={detailsForm.availability_status}
                        onChange={(e) => setDetailsForm({ ...detailsForm, availability_status: e.target.value })}
                      >
                        <option value="available">Available for Dispatch</option>
                        <option value="on_trip">Currently on Active Trip</option>
                        <option value="off_duty">Off Duty / Rest Period</option>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <Select
                        label="Affiliated Logistics Provider (Link to Fleet)"
                        value={detailsForm.affiliated_provider_id}
                        onChange={(e) => setDetailsForm({ ...detailsForm, affiliated_provider_id: e.target.value })}
                      >
                        <option value="">-- Independent Contractor / Self-Employed --</option>
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.company_name || p.full_name} ({p.email})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-900/10">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (profile) {
                            setDetailsForm({
                              license_number: profile.license_number || "",
                              experience_years: profile.experience_years ? String(profile.experience_years) : "",
                              vehicle_number: profile.vehicle_number || "",
                              vehicle_type: profile.vehicle_type || "Truck",
                              base_city: profile.base_city || "",
                              emergency_contact: profile.emergency_contact || "",
                              affiliated_provider_id: profile.affiliated_provider_id || "",
                              availability_status: profile.availability_status || "available",
                              phone: profile.phone || user?.phone || "",
                            });
                          }
                        }}
                      >
                        Reset Changes
                      </Button>
                      <Button type="submit" variant="accent" disabled={savingProfile}>
                        {savingProfile ? <Spinner /> : "Save Driver Details"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Sidebar with Credentials & Verification Status */}
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-sm text-navy-950 mb-3">Verification & Credentials</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">License Verification</span>
                      <span className="font-semibold text-emerald-700">
                        {detailsForm.license_number ? "Verified ✓" : "Pending DL"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Driving Record</span>
                      <span className="font-semibold text-navy-900">
                        {detailsForm.experience_years ? `${detailsForm.experience_years} Years Experience` : "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Assigned Vehicle</span>
                      <span className="font-semibold text-navy-900 font-mono">
                        {detailsForm.vehicle_number || "None"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Affiliation</span>
                      <span className="font-semibold text-amber-700">
                        {profile?.affiliated_provider_name || "Independent"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 text-lg">💡</div>
                    <div className="text-xs text-navy-700 space-y-1">
                      <span className="font-semibold block text-navy-950">Why keep details updated?</span>
                      <p>
                        Logistics providers look for verified driving licenses, registered vehicle numbers, and commercial driving experience when assigning high-value freight return routes.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: Linked Fleet, Provider & Shippers */}
          {activeTab === "links" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Linked Logistics Provider Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Linked Logistics Provider</h3>
                      <p className="text-xs text-navy-500">Your affiliated fleet operator & return-route coordinator</p>
                    </div>
                  </div>
                  <Badge tone={profile?.affiliated_provider_id ? "active" : "default"}>
                    {profile?.affiliated_provider_id ? "Linked" : "Unlinked"}
                  </Badge>
                </div>

                {profile?.affiliated_provider_id ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-navy-50 rounded-xl border border-navy-900/10 space-y-2">
                      <div className="font-bold text-navy-950 text-base">
                        {profile.affiliated_provider_name}
                      </div>
                      <div className="text-xs text-navy-600 space-y-1">
                        {profile.affiliated_provider_email && (
                          <div className="flex items-center gap-2">
                            <span>✉️</span>
                            <a
                              href={`mailto:${profile.affiliated_provider_email}`}
                              className="hover:underline text-navy-900 font-medium"
                            >
                              {profile.affiliated_provider_email}
                            </a>
                          </div>
                        )}
                        {profile.affiliated_provider_phone && (
                          <div className="flex items-center gap-2">
                            <span>📞</span>
                            <a
                              href={`tel:${profile.affiliated_provider_phone}`}
                              className="hover:underline text-navy-900 font-medium"
                            >
                              {profile.affiliated_provider_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {profile.affiliated_provider_phone && (
                        <a
                          href={`tel:${profile.affiliated_provider_phone}`}
                          className="flex-1 text-center py-2 px-3 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800"
                        >
                          📞 Call Provider
                        </a>
                      )}
                      {profile.affiliated_provider_email && (
                        <a
                          href={`mailto:${profile.affiliated_provider_email}`}
                          className="flex-1 text-center py-2 px-3 rounded-lg border border-navy-300 text-navy-900 text-xs font-semibold hover:bg-navy-50"
                        >
                          ✉️ Email Provider
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-navy-50 rounded-xl text-center text-xs text-navy-600 space-y-3">
                    <p>You are currently operating as an independent driver with no affiliated fleet company.</p>
                    <Button variant="outline" className="text-xs" onClick={() => setActiveTab("profile")}>
                      Link to a Provider in Profile Tab
                    </Button>
                  </div>
                )}
              </Card>

              {/* Linked Vehicle Specifications Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🚛</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Operating Vehicle Specs</h3>
                      <p className="text-xs text-navy-500">Your registered truck and commercial classification</p>
                    </div>
                  </div>
                  <Badge tone={detailsForm.vehicle_number ? "active" : "default"}>
                    {detailsForm.vehicle_number ? "Registered" : "No Vehicle"}
                  </Badge>
                </div>

                <div className="p-4 bg-navy-50 rounded-xl border border-navy-900/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-navy-950 text-sm">
                      {detailsForm.vehicle_number || "Not Registered"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Vehicle Classification:</span>
                    <span className="font-medium text-navy-900">{detailsForm.vehicle_type || "Standard Truck"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Base Terminal Hub:</span>
                    <span className="font-medium text-navy-900">{detailsForm.base_city || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Emergency Contact:</span>
                    <span className="font-medium text-navy-900">{detailsForm.emergency_contact || "None"}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs" onClick={() => setActiveTab("profile")}>
                  Update Vehicle Specs
                </Button>
              </Card>

              {/* Connected Shippers Directory */}
              <Card className="p-6 md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📦</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Connected Shippers & Cargo Contacts</h3>
                      <p className="text-xs text-navy-500">Direct contacts of shippers whose freight you are moving</p>
                    </div>
                  </div>
                </div>

                {Object.values(tripBookings).flat().length === 0 ? (
                  <p className="text-xs text-navy-500 p-4 bg-navy-50 rounded-lg text-center">
                    No active shipper consignments found. Shippers will appear here once cargo is booked on your routes.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(tripBookings)
                      .flat()
                      .filter((b, idx, arr) => b.shipper && arr.findIndex((x) => x.shipper?.id === b.shipper?.id) === idx)
                      .map((b) => (
                        <div key={b.id} className="p-3 bg-navy-50 rounded-xl border border-navy-900/10 text-xs space-y-1.5">
                          <div className="font-bold text-navy-950">{b.shipper.full_name}</div>
                          {b.shipper.company_name && (
                            <div className="text-navy-600 font-medium">{b.shipper.company_name}</div>
                          )}
                          <div className="pt-1 flex items-center gap-2">
                            {b.shipper.phone && (
                              <a
                                href={`tel:${b.shipper.phone}`}
                                className="px-2 py-1 rounded bg-amber-500 text-navy-950 font-semibold hover:bg-amber-400"
                              >
                                📞 Call
                              </a>
                            )}
                            <a
                              href={`mailto:${b.shipper.email}`}
                              className="px-2 py-1 rounded bg-navy-900 text-white hover:bg-navy-800"
                            >
                              ✉️ Email
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
