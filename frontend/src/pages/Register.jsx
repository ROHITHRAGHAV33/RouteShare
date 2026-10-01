import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Spinner } from "../components/UI";
import { authApi, extractErrorMessage } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "shipper",
    company_name: "",
    license_number: "",
    experience_years: "",
    vehicle_number: "",
    vehicle_type: "Truck",
    base_city: "",
    emergency_contact: "",
    affiliated_provider_id: "",
  });
  const [providers, setProviders] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.providers().then((res) => setProviders(res.data)).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.full_name.trim().length < 2) e.full_name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\+?[0-9\-\s]{7,20}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (form.password.length < 8) e.password = "At least 8 characters";
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      e.password = "Use upper, lower case letters and a number";
    }
    if (form.role === "driver") {
      if (!form.license_number.trim()) e.license_number = "Enter your Driving License (DL) number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        company_name: form.role === "truck_provider" ? form.company_name?.trim() || null : null,
      };
      if (form.role === "driver") {
        payload.license_number = form.license_number?.trim() || null;
        payload.experience_years = form.experience_years ? parseInt(form.experience_years, 10) : 0;
        payload.vehicle_number = form.vehicle_number?.trim() || null;
        payload.vehicle_type = form.vehicle_type || "Truck";
        payload.base_city = form.base_city?.trim() || null;
        payload.emergency_contact = form.emergency_contact?.trim() || null;
        payload.affiliated_provider_id = form.affiliated_provider_id || null;
      }
      await register(payload);
      pushToast("Account created successfully. You can log in now.", "success");
      navigate("/login");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-slate-50">
      <Card className="w-full max-w-lg p-7">
        <h1 className="font-display font-semibold text-2xl text-navy-950 mb-1">Create your account</h1>
        <p className="text-sm text-navy-600 mb-6">Join as a Truck Provider, Shipper, or Driver.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Select label="I am a" value={form.role} onChange={set("role")}>
            <option value="shipper">Shipper — I need freight transportation</option>
            <option value="truck_provider">Truck Provider — I have return-route capacity</option>
            <option value="driver">Driver — I operate a commercial truck</option>
          </Select>

          <Input label="Full name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} placeholder="e.g. Suresh Kumar" />
          <Input label="Email address" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" placeholder="name@domain.com" />
          <Input label="Phone number" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+91 90000 00000" />

          {form.role === "truck_provider" && (
            <Input
              label="Company name (optional)"
              value={form.company_name}
              onChange={set("company_name")}
              placeholder="e.g. Kumar Logistics Pvt Ltd"
            />
          )}

          {form.role === "driver" && (
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="font-semibold text-sm text-navy-900">Driver Credentials & Vehicle Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Driving License (DL) No."
                  required
                  value={form.license_number}
                  onChange={set("license_number")}
                  error={errors.license_number}
                  placeholder="e.g. DL-1420110012345"
                />
                <Input
                  label="Experience (Years)"
                  type="number"
                  min="0"
                  max="50"
                  value={form.experience_years}
                  onChange={set("experience_years")}
                  placeholder="e.g. 5"
                />
                <Input
                  label="Vehicle Number (Optional)"
                  value={form.vehicle_number}
                  onChange={set("vehicle_number")}
                  placeholder="e.g. TN-38-KL-1001"
                />
                <Select label="Vehicle Type" value={form.vehicle_type} onChange={set("vehicle_type")}>
                  <option value="Truck">10-Wheeler Truck</option>
                  <option value="Mini Truck">Mini Truck / LCV</option>
                  <option value="Trailer">Flatbed Trailer</option>
                  <option value="Container">Container Truck</option>
                </Select>
                <Input
                  label="Base City / Terminal"
                  value={form.base_city}
                  onChange={set("base_city")}
                  placeholder="e.g. Coimbatore"
                />
                <Input
                  label="Emergency Contact Phone"
                  value={form.emergency_contact}
                  onChange={set("emergency_contact")}
                  placeholder="+91 98765 43210"
                />
              </div>
              <Select
                label="Affiliated Logistics Provider (Optional)"
                value={form.affiliated_provider_id}
                onChange={set("affiliated_provider_id")}
              >
                <option value="">Independent / Self-Employed</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name || p.full_name} ({p.email})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />

          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-navy-600 mt-6 text-center">
          Already registered?{" "}
          <Link to="/login" className="text-navy-950 font-medium underline underline-offset-2">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
