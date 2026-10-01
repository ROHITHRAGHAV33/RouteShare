import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  truck_provider: "/provider",
  shipper: "/shipper",
  driver: "/driver",
  admin: "/admin",
};

const ROLE_LABEL = {
  truck_provider: "Truck Provider",
  shipper: "Shipper",
  driver: "Driver",
  admin: "Administrator",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-navy-950 text-white sticky top-0 z-40 border-b border-navy-700/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to={user ? ROLE_HOME[user.role] : "/"} className="flex items-center gap-2 focus-ring rounded">
          <span className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center font-display font-bold text-navy-950">
            R
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">RouteShare</span>
        </NavLink>

        {user && (
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user.full_name}</span>
              <span className="text-xs text-amber-400 font-mono uppercase tracking-wide">
                {ROLE_LABEL[user.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="focus-ring text-sm font-medium px-3 py-1.5 rounded-md border border-navy-600 hover:bg-navy-800 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
