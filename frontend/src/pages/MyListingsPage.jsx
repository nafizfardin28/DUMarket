import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ListingCard from "../components/ListingCard";
import { getMyListings } from "../api/listings";
import { ArchiveBoxIcon, PlusIcon } from "../components/icons";

export default function MyListingsPage() {
  const [listings, setListings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyListings()
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your listings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My listings</h1>
          <p className="mt-1 text-sm text-zinc-500">Everything you've listed, active or sold.</p>
        </div>
        <Link to="/listings/new" className="btn-primary flex !w-auto items-center gap-1.5 px-4 py-2.5">
          <PlusIcon className="h-4 w-4" /> New listing
        </Link>
      </div>

      {error && <p className="field-error">{error}</p>}

      {listings?.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <ArchiveBoxIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-500">You haven't listed anything yet.</p>
          <Link to="/listings/new" className="btn-link mt-3 justify-center">
            Create your first listing
          </Link>
        </div>
      )}

      {listings?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
