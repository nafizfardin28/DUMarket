import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import ListingCard from "../components/ListingCard";
import { getListings } from "../api/listings";
import { CATEGORIES } from "../constants/categories";
import { HALLS } from "../constants/halls";

export default function BrowseListingsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [hall, setHall] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce the search box so we're not firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any filter change starts back at page 1 — staying on page 3 of a
  // narrower result set would just show an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, category, hall]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getListings({
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(hall ? { hall } : {}),
      page,
    })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load listings. Try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, hall, page]);

  return (
    <AppLayout>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-stone-900">Browse listings</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-input !w-auto"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select value={hall} onChange={(e) => setHall(e.target.value)} className="field-input !w-auto">
            <option value="">All halls</option>
            {HALLS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mb-6">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search listings by title or description…"
          className="field-input pl-9"
        />
      </div>

      {loading && <p className="text-sm text-stone-500">Loading…</p>}
      {error && <p className="field-error">{error}</p>}

      {!loading && !error && data?.results.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <p className="text-sm text-stone-500">
            {search || category || hall ? "No listings match those filters yet." : "No listings yet."}
          </p>
        </div>
      )}

      {!loading && !error && data?.results.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-600
                  hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-stone-500">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-600
                  hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
