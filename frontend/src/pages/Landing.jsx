import { Link } from "react-router-dom";
import { Button } from "../components/UI";

export default function Landing() {
  return (
    <div className="bg-navy-950 text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-5 py-24 text-center">
        <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">Empty-return freight, matched</span>
        <h1 className="font-display font-semibold text-4xl sm:text-5xl mt-4 leading-tight">
          Turn every return trip
          <br />
          into a paying route.
        </h1>
        <p className="text-navy-300 max-w-xl mx-auto mt-5">
          RouteShare connects truck providers with unused return-journey capacity to shippers who need
          affordable freight space — matched automatically by corridor and capacity.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register">
            <Button variant="accent">Get started</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Log in
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-20 text-left">
          <FeatureCard title="Register a route" text="Truck providers publish source, hubs, destination, and available capacity." />
          <FeatureCard title="Get matched" text="Shippers search by corridor and cargo weight — the engine surfaces only routes that fit." />
          <FeatureCard title="Book with confidence" text="Capacity updates in real time, so overbooking is never possible." />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="border border-white/10 rounded-xl p-5 bg-white/[0.03]">
      <h3 className="font-display font-semibold mb-2">{title}</h3>
      <p className="text-sm text-navy-300">{text}</p>
    </div>
  );
}
