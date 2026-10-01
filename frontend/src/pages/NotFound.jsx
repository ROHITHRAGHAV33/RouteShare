import { Link } from "react-router-dom";
import { Button } from "../components/UI";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <span className="font-display font-semibold text-6xl text-navy-900">404</span>
      <p className="text-navy-600 mt-2 mb-6">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/">
        <Button variant="accent">Back to home</Button>
      </Link>
    </div>
  );
}
