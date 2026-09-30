import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import ListingCard from "../components/ListingCard";
import { getListings } from "../api/listings";
import { CATEGORIES } from "../constants/categories";
import { HALLS } from "../constants/halls";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ShoppingBagIcon } from "../components/icons";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
      <div className="aspect-square w-full animate-pulse bg-zinc-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Browse</h1>
        <p className="mt-1 text-sm text-zinc-500">Find whatever your hallmates are selling right now.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search listings…"
            className="field-input pl-10"
          />
        </div>
        <div className="flex gap-2">
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

      {error && <p className="field-error">{error}</p>}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && data?.results.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <ShoppingBagIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-500">
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
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-600
                  transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium text-zinc-500">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-600
                  transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
