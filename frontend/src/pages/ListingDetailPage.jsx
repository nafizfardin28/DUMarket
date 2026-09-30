import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import SellerRatings from "../components/SellerRatings";
import { useAuth } from "../context/AuthContext";
import { deleteListing, getListing, imageUrl, updateListing } from "../api/listings";
import { categoryLabel } from "../constants/categories";
import { PhoneIcon, PhotoIcon, TrashIcon } from "../components/icons";

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-8 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="h-20 w-full animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

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
        <DetailSkeleton />
      </AppLayout>
    );
  }

  if (error || !listing) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm text-zinc-500">{error}</p>
          <Link to="/listings" className="btn-link mt-3 justify-center">
            Back to browsing
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-100">
            {listing.images.length > 0 ? (
              <img
                src={imageUrl(listing.images[activeImage])}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                <PhotoIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {listing.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition-colors ${
                    i === activeImage ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"
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
            <div>
              <span className="badge bg-zinc-100 text-zinc-500">{categoryLabel(listing.category)}</span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">{listing.title}</h1>
            </div>
            {listing.status === "sold" && (
              <span className="badge shrink-0 bg-zinc-900 text-white">Sold</span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900">৳{listing.price}</p>

          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700">Pickup:</span> {listing.hall}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-600">
            {listing.description}
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200/70 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Seller</p>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                {listing.seller?.avatar ? (
                  <img src={imageUrl(listing.seller.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                    {listing.seller?.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{listing.seller?.full_name}</p>
                <p className="text-sm text-zinc-500">{listing.seller?.hall}</p>
              </div>
            </div>
            {!isOwner && (
              <a
                href={`tel:${listing.seller?.phone}`}
                className="btn-primary mt-3.5 flex items-center justify-center gap-2 no-underline"
              >
                <PhoneIcon className="h-4 w-4" />
                Call {listing.seller?.phone}
              </a>
            )}
          </div>

          {isOwner && (
            <div className="mt-4 flex gap-2">
              <button onClick={handleToggleSold} disabled={busy} className="btn-primary flex-1">
                {listing.status === "sold" ? "Mark as active" : "Mark as sold"}
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold
                  text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
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
