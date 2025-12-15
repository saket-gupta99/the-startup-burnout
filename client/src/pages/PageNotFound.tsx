import { Link } from "react-router";

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-lg text-slate-600">
        Oops! We couldn't find that page.
      </p>
      
      <Link
        to="/"
        className="mt-6 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
      >
        Go back home
      </Link>
    </div>
  );
}