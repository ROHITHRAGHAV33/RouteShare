import { useEffect, useState } from "react";
import { adminApi, extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Badge, Spinner, EmptyState, Modal } from "../components/UI";

const TABS = ["Overview", "Users", "Routes", "Bookings"];

export default function AdminDashboard() {
  const { pushToast } = useToast();
  const [tab, setTab] = useState("Overview");
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, r, b] = await Promise.all([
        adminApi.summary(),
        adminApi.users({}),
        adminApi.routes({}),
        adminApi.bookings({}),
      ]);
      setSummary(s.data);
      setUsers(u.data);
      setRoutes(r.data);
      setBookings(b.data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const deactivate = async (user) => {
    try {
      await adminApi.deactivateUser(user.id);
      pushToast(`${user.full_name} deactivated.`, "success");
      loadAll();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const deleteUser = async () => {
    try {
      await adminApi.deleteUser(confirmDeleteUser.id);
      pushToast(`${confirmDeleteUser.full_name} deleted.`, "success");
      setConfirmDeleteUser(null);
      loadAll();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
      setConfirmDeleteUser(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Administrator Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Monitor platform activity, manage users, and review operational reports.</p>
      </div>

      <div className="flex gap-2 border-b border-navy-900/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`focus-ring px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-amber-500 text-navy-950" : "border-transparent text-navy-500 hover:text-navy-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {tab === "Overview" && summary && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total users" value={summary.total_users} />
              <StatCard label="Truck providers" value={summary.total_providers} />
              <StatCard label="Shippers" value={summary.total_shippers} />
              <StatCard label="Drivers" value={summary.total_drivers} />
              <StatCard label="Active routes" value={summary.active_routes} />
              <StatCard label="Completed routes" value={summary.completed_routes} />
              <StatCard label="Total bookings" value={summary.total_bookings} />
              <StatCard label="Revenue" value={`₹${summary.total_revenue.toLocaleString()}`} />
              <StatCard label="Avg. capacity utilization" value={`${summary.average_capacity_utilization_pct}%`} className="lg:col-span-2" />
            </div>
          )}

          {tab === "Users" && (
            <Card className="divide-y divide-navy-900/10">
              {users.length === 0 ? (
                <EmptyState title="No users found" />
              ) : (
                users.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy-950">{u.full_name}</p>
                        {u.role === "driver" && u.license_number && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-navy-100 text-navy-700">
                            DL: {u.license_number}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-navy-600">
                        {u.email} {u.phone ? `· ${u.phone}` : ""}
                      </p>
                      {u.role === "driver" && (
                        <p className="text-xs text-navy-500 mt-0.5">
                          {u.experience_years ? `${u.experience_years} yrs exp · ` : ""}
                          {u.vehicle_number ? `Vehicle: ${u.vehicle_number} · ` : ""}
                          {u.affiliated_provider_name ? `Fleet: ${u.affiliated_provider_name}` : "Independent"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="default">{u.role.replace("_", " ")}</Badge>
                      {!u.is_active && <Badge tone="cancelled">deactivated</Badge>}
                      {u.is_active && (
                        <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => deactivate(u)}>
                          Deactivate
                        </Button>
                      )}
                      <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => setConfirmDeleteUser(u)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === "Routes" && (
            <Card className="divide-y divide-navy-900/10">
              {routes.length === 0 ? (
                <EmptyState title="No routes registered" />
              ) : (
                routes.map((r) => (
                  <div key={r.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono text-xs text-navy-500">{r.route_code}</span>
                      <p className="text-navy-800 text-sm">
                        {r.source_city} → {r.destination_city} · {r.available_capacity_kg}/{r.total_capacity_kg} kg
                      </p>
                    </div>
                    <Badge tone={r.status}>{r.status}</Badge>
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === "Bookings" && (
            <Card className="divide-y divide-navy-900/10">
              {bookings.length === 0 ? (
                <EmptyState title="No bookings yet" />
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                      <p className="text-navy-800 text-sm">
                        {b.pickup_location} → {b.delivery_location} · {b.cargo_weight_kg} kg · ₹{b.cost}
                      </p>
                    </div>
                    <Badge tone={b.status}>{b.status}</Badge>
                  </div>
                ))
              )}
            </Card>
          )}
        </>
      )}

      <Modal open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)} title="Delete this user?">
        <p className="text-sm text-navy-600 mb-5">
          This will permanently remove {confirmDeleteUser?.full_name}'s account and all related data. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDeleteUser(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Delete user
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, className = "" }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="text-navy-500 text-xs font-medium uppercase tracking-wide">{label}</div>
      <div className="font-display font-semibold text-2xl text-navy-950 mt-1">{value}</div>
    </Card>
  );
}
