import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-taupe">Error 404</p>
      <h1 className="mt-4 font-serif text-3xl text-brand-blue sm:text-5xl">This page could not be found</h1>
      <p className="mt-4 max-w-md text-neutral-600">The link may be old, or the property may have been sold or removed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="inline-flex min-h-12 items-center rounded-full bg-brand-blue px-8 font-serif text-xs uppercase tracking-[0.18em] text-white transition hover:bg-brand-blue/90">Go Home</Link>
        <Link to="/listings" className="inline-flex min-h-12 items-center rounded-full border border-brand-blue px-8 font-serif text-xs uppercase tracking-[0.18em] text-brand-blue transition hover:bg-brand-blue hover:text-white">Browse Properties</Link>
      </div>
    </div>
  );
}
