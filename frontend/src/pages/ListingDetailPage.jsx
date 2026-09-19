import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import SellerRatings from "../components/SellerRatings";
import { useAuth } from "../context/AuthContext";
import { deleteListing, getListing, imageUrl, updateListing } from "../api/listings";
import { categoryLabel } from "../constants/categories";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getListing(id)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch(() => {
        if (!cancelled) setError("This listing doesn't exist or was removed.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isOwner = listing && user && listing.seller?.id === user.id;

  async function handleToggleSold() {
    setBusy(true);
    try {
      const updated = await updateListing(id, { status: listing.status === "sold" ? "active" : "sold" });
      setListing(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    setBusy(true);
    try {
      await deleteListing(id);
      navigate("/my-listings");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-sm text-stone-500">Loading…</p>
      </AppLayout>
    );
  }

  if (error || !listing) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <p className="text-sm text-stone-500">{error}</p>
          <Link to="/listings" className="btn-link mt-3">
            Back to browsing
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            {listing.images.length > 0 ? (
              <img
                src={imageUrl(listing.images[activeImage])}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-stone-300">📦</div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {listing.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-brand-500" : "border-transparent"
                  }`}
                >
                  <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-stone-900">{listing.title}</h1>
            {listing.status === "sold" && (
              <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-bold uppercase text-stone-600">
                Sold
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-brand-600">৳{listing.price}</p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-stone-200 py-2">
              <dt className="text-stone-500">Category</dt>
              <dd className="font-medium text-stone-900">{categoryLabel(listing.category)}</dd>
            </div>
            <div className="flex justify-between border-b border-stone-200 py-2">
              <dt className="text-stone-500">Pickup hall</dt>
              <dd className="font-medium text-stone-900">{listing.hall}</dd>
            </div>
          </dl>

          <p className="mt-4 whitespace-pre-wrap text-sm text-stone-600">{listing.description}</p>

          <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Seller</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-200">
                {listing.seller?.avatar ? (
                  <img src={imageUrl(listing.seller.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">
                    {listing.seller?.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-stone-900">{listing.seller?.full_name}</p>
                <p className="text-sm text-stone-500">{listing.seller?.hall}</p>
              </div>
            </div>
            {!isOwner && (
              <a
                href={`tel:${listing.seller?.phone}`}
                className="btn-primary mt-3 inline-block text-center no-underline"
              >
                Call {listing.seller?.phone}
              </a>
            )}
          </div>

          {isOwner && (
            <div className="mt-6 flex gap-2">
              <button onClick={handleToggleSold} disabled={busy} className="btn-primary flex-1">
                {listing.status === "sold" ? "Mark as active" : "Mark as sold"}
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          )}

          {listing.seller?.id && <SellerRatings sellerId={listing.seller.id} />}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this listing?"
        description={`"${listing.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </AppLayout>
  );
}
