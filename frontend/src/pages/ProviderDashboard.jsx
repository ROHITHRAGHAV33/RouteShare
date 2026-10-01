import { useEffect, useState } from "react";
import { routesApi, bookingsApi, vehiclesApi } from "../services/api";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Badge, Spinner, EmptyState, Modal } from "../components/UI";

const emptyForm = {
  vehicle_id: "",
  source_city: "",
  destination_city: "",
  intermediate_hubs: "",
  return_date: "",
  total_capacity_kg: "",
  rate_per_kg: "",
};

const emptyVehicleForm = {
  vehicle_number: "",
  vehicle_type: "Truck",
  capacity_kg: "",
};

export default function ProviderDashboard() {
  const { pushToast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetRoute, setAssignTargetRoute] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assigningDriver, setAssigningDriver] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, b, v, d] = await Promise.all([
        routesApi.mine(),
        bookingsApi.providerBookings(),
        vehiclesApi.mine(),
        routesApi.availableDrivers(),
      ]);
      setRoutes(r.data);
      setBookings(b.data);
      setVehicles(v.data);
      setAvailableDrivers(d.data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoute = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      await routesApi.create({
        ...form,
        total_capacity_kg: Number(form.total_capacity_kg),
        rate_per_kg: Number(form.rate_per_kg),
        return_date: new Date(form.return_date).toISOString(),
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined,
      });
      pushToast("Return route registered successfully.", "success");
      setForm(emptyForm);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async () => {
    try {
      await routesApi.remove(confirmDelete.id);
      pushToast(`Route ${confirmDelete.route_code} deleted.`, "success");
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
      setConfirmDelete(null);
    }
  };

  const handleCreateVehicle = async (evt) => {
    evt.preventDefault();
    setVehicleSubmitting(true);
    try {
      await vehiclesApi.create({
        ...vehicleForm,
        capacity_kg: Number(vehicleForm.capacity_kg),
      });
      pushToast("Vehicle registered successfully.", "success");
      setVehicleForm(emptyVehicleForm);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await vehiclesApi.remove(id);
      pushToast("Vehicle removed successfully.", "success");
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const openAssignModal = async (route) => {
    setAssignTargetRoute(route);
    setAssignModalOpen(true);
    try {
      const { data } = await routesApi.availableDrivers();
      setAvailableDrivers(data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    setAssigningDriver(true);
    try {
      await routesApi.assignDriver(assignTargetRoute.id, selectedDriver);
      pushToast("Driver assigned successfully.", "success");
      setAssignModalOpen(false);
      setSelectedDriver("");
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setAssigningDriver(false);
    }
  };

  const bookingsForRoute = (routeId) => bookings.filter((b) => b.route_id === routeId);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Truck Provider Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Manage your vehicles, register empty-return routes, and track bookings.</p>
      </div>

      <Card className="p-6">
        <details open className="group">
          <summary className="font-display font-semibold text-navy-900 cursor-pointer outline-none list-none flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span>Fleet Management</span>
              <span className="text-xs font-normal text-navy-500 font-sans">
                ({vehicles.length} Vehicles · {availableDrivers.length} Drivers)
              </span>
            </span>
            <span className="text-navy-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5 pt-4 border-t border-navy-900/10">
            {/* Add Vehicle Form */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Add a Fleet Vehicle</h3>
              <form onSubmit={handleCreateVehicle} className="space-y-3">
                <Input label="Vehicle Number" required placeholder="e.g. TN-38-KL-1001" value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} />
                <Select label="Vehicle Type" required value={vehicleForm.vehicle_type} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}>
                  <option value="Truck">10-Wheeler Truck</option>
                  <option value="Mini Truck">Mini Truck / LCV</option>
                  <option value="Trailer">Flatbed Semi-Trailer</option>
                  <option value="Container">Container Truck</option>
                </Select>
                <Input label="Capacity (kg)" type="number" min="1" required placeholder="e.g. 8000" value={vehicleForm.capacity_kg} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_kg: e.target.value })} />
                <Button type="submit" variant="accent" className="w-full" disabled={vehicleSubmitting}>
                  {vehicleSubmitting ? <Spinner /> : "Add Vehicle"}
                </Button>
              </form>
            </div>

            {/* Registered Vehicles */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Registered Fleet ({vehicles.length})</h3>
              {vehicles.length === 0 ? (
                <p className="text-sm text-navy-500 p-4 bg-navy-50 rounded-lg text-center">No vehicles registered yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-navy-900/5 rounded-xl border border-navy-900/10 text-sm">
                      <div>
                        <div className="font-bold text-navy-950 font-mono">{v.vehicle_number}</div>
                        <div className="text-xs text-navy-600">{v.vehicle_type} · {v.capacity_kg.toLocaleString()} kg payload</div>
                      </div>
                      <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDeleteVehicle(v.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet Drivers Directory */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Fleet & Commercial Drivers ({availableDrivers.length})</h3>
              {availableDrivers.length === 0 ? (
                <p className="text-sm text-navy-500 p-4 bg-navy-50 rounded-lg text-center">No drivers currently registered.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {availableDrivers.map((d) => (
                    <div key={d.id} className="p-3 bg-navy-900/5 rounded-xl border border-navy-900/10 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950">{d.full_name}</span>
                        <Badge tone={d.availability_status === "available" ? "active" : "default"}>
                          {d.availability_status || "available"}
                        </Badge>
                      </div>
                      <div className="text-navy-600">
                        {d.phone ? <a href={`tel:${d.phone}`} className="hover:underline font-medium text-navy-900">📞 {d.phone}</a> : "No phone"} · DL: {d.license_number || "Not added"}
                      </div>
                      <div className="text-navy-500 text-[11px]">
                        {d.vehicle_number ? `Truck: ${d.vehicle_number} (${d.vehicle_type || "Truck"})` : "Vehicle: Unassigned"} · {d.experience_years || 0} yrs exp
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </details>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Register a return route</h2>
          <form onSubmit={handleCreateRoute} className="space-y-3">
            <Select label="Vehicle (Optional)" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">-- Select a Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicle_number} ({v.capacity_kg} kg)</option>
              ))}
            </Select>
            <Input label="Source city" required value={form.source_city} onChange={(e) => setForm({ ...form, source_city: e.target.value })} />
            <Input label="Destination city" required value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} />
            <Input
              label="Intermediate hubs (comma-separated)"
              placeholder="e.g. Salem, Vellore"
              value={form.intermediate_hubs}
              onChange={(e) => setForm({ ...form, intermediate_hubs: e.target.value })}
            />
            <Input
              label="Return date"
              type="datetime-local"
              required
              value={form.return_date}
              onChange={(e) => setForm({ ...form, return_date: e.target.value })}
            />
            <Input
              label="Available capacity (kg)"
              type="number"
              min="1"
              required
              value={form.total_capacity_kg}
              onChange={(e) => setForm({ ...form, total_capacity_kg: e.target.value })}
            />
            <Input
              label="Rate per kg (₹)"
              type="number"
              min="0.1"
              step="0.1"
              required
              value={form.rate_per_kg}
              onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
            />
            <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
              {submitting ? <Spinner /> : "Register route"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-semibold text-navy-900">Your active routes</h2>
          {loading ? (
            <Spinner />
          ) : routes.length === 0 ? (
            <Card>
              <EmptyState title="No routes yet" description="Register your first return route using the form on the left." />
            </Card>
          ) : (
            routes.map((route) => (
              <Card key={route.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-navy-500">{route.route_code}</span>
                      <Badge tone={route.status}>{route.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-navy-950">
                      {route.source_city} → {route.destination_city}
                    </h3>
                    {route.intermediate_hubs && (
                      <p className="text-xs text-navy-500">via {route.intermediate_hubs}</p>
                    )}
                    <p className="text-sm text-navy-600 mt-1">
                      Returns {new Date(route.return_date).toLocaleString()}
                    </p>
                    {route.vehicle && (
                      <p className="text-sm font-medium mt-1">Vehicle: {route.vehicle.vehicle_number}</p>
                    )}
                    {route.driver ? (
                      <div className="mt-2 p-2.5 bg-navy-50 rounded-lg border border-navy-900/10 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-950 flex items-center gap-1.5">
                            👤 Driver: {route.driver.full_name || route.driver.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => openAssignModal(route)}
                            className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2 ml-2"
                          >
                            Reassign
                          </button>
                        </div>
                        <div className="text-navy-600 flex items-center gap-2 flex-wrap">
                          {route.driver.phone && (
                            <a href={`tel:${route.driver.phone}`} className="hover:underline text-navy-800 font-medium">
                              📞 {route.driver.phone}
                            </a>
                          )}
                          {route.driver.license_number && (
                            <span>· DL: {route.driver.license_number}</span>
                          )}
                          {route.driver.vehicle_number && (
                            <span>· Vehicle: {route.driver.vehicle_number}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => openAssignModal(route)}>
                          Assign Driver
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    className="text-xs px-3 py-1.5"
                    onClick={() => setConfirmDelete(route)}
                    disabled={route.available_capacity_kg < route.total_capacity_kg}
                    title={
                      route.available_capacity_kg < route.total_capacity_kg
                        ? "Cannot delete a route with active bookings"
                        : "Delete route"
                    }
                  >
                    Delete
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Capacity</div>
                    <div className="font-semibold text-navy-950">
                      {route.available_capacity_kg} / {route.total_capacity_kg} kg
                    </div>
                  </div>
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Rate</div>
                    <div className="font-semibold text-navy-950">₹{route.rate_per_kg}/kg</div>
                  </div>
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Bookings</div>
                    <div className="font-semibold text-navy-950">{bookingsForRoute(route.id).length}</div>
                  </div>
                </div>

                {bookingsForRoute(route.id).length > 0 && (
                  <div className="mt-4 border-t border-navy-900/10 pt-3 space-y-2">
                    {bookingsForRoute(route.id).map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                        <span className="text-navy-700">{b.cargo_weight_kg} kg</span>
                        <Badge tone={b.status}>{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this route?">
        <p className="text-sm text-navy-600 mb-5">
          This will permanently remove route {confirmDelete?.route_code}. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoute}>
            Delete route
          </Button>
        </div>
      </Modal>

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Driver to Route">
        <div className="space-y-4">
          <p className="text-sm text-navy-600">
            Assign an available commercial driver to return route <strong>{assignTargetRoute?.route_code}</strong> ({assignTargetRoute?.source_city} → {assignTargetRoute?.destination_city}).
          </p>
          <Select label="Select Commercial Driver" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
            <option value="">-- Select Driver --</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name || d.name} (DL: {d.license_number || "Pending"} · {d.experience_years || 0} yrs exp)
              </option>
            ))}
          </Select>

          {selectedDriver && (() => {
            const d = availableDrivers.find((x) => x.id === selectedDriver);
            if (!d) return null;
            return (
              <div className="p-3.5 bg-navy-50 rounded-xl text-xs space-y-1.5 border border-navy-900/10">
                <div className="font-bold text-navy-950 text-sm">{d.full_name}</div>
                <div className="text-navy-700">📞 Phone: {d.phone || "N/A"} · ✉️ {d.email}</div>
                <div className="text-navy-700">🪪 License (DL): <span className="font-mono font-medium">{d.license_number || "Not added"}</span></div>
                <div className="text-navy-700">⭐ Driving Experience: <span className="font-medium">{d.experience_years || 0} Years</span></div>
                <div className="text-navy-700">🚛 Registered Vehicle: <span className="font-mono font-medium">{d.vehicle_number || "None"}</span> ({d.vehicle_type || "Truck"})</div>
                <div className="text-navy-700">📍 Base Terminal: <span className="font-medium">{d.base_city || "Unassigned"}</span></div>
                <div className="text-navy-700 font-medium">Duty Status: <Badge tone={d.availability_status === "available" ? "active" : "default"}>{d.availability_status || "available"}</Badge></div>
              </div>
            );
          })()}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={handleAssignDriver} disabled={!selectedDriver || assigningDriver}>
              {assigningDriver ? <Spinner /> : "Confirm Driver Assignment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
