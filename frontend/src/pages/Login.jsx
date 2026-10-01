import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Spinner } from "../components/UI";
import { extractErrorMessage } from "../services/api";

const ROLE_HOME = {
  truck_provider: "/provider",
  shipper: "/shipper",
  driver: "/driver",
  admin: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      pushToast(`Welcome back, ${user.full_name.split(" ")[0]}`, "success");
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50">
      <Card className="w-full max-w-sm p-7">
        <h1 className="font-display font-semibold text-2xl text-navy-950 mb-1">Log in</h1>
        <p className="text-sm text-navy-600 mb-6">Access your RouteShare dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-navy-600 mt-6 text-center">
          New to RouteShare?{" "}
          <Link to="/register" className="text-navy-950 font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
