import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ListingCard from "../components/ListingCard";
import { getMyListings } from "../api/listings";

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
        <h1 className="text-xl font-bold text-stone-900">My listings</h1>
        <Link to="/listings/new" className="btn-primary !w-auto px-4 py-2">
          + New listing
        </Link>
      </div>

      {error && <p className="field-error">{error}</p>}

      {listings?.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <p className="text-sm text-stone-500">You haven't listed anything yet.</p>
          <Link to="/listings/new" className="btn-link mt-3">
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
