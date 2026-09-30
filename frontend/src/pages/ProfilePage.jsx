import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ListingCard from "../components/ListingCard";
import SellerRatings from "../components/SellerRatings";
import { useAuth } from "../context/AuthContext";
import { getMyListings, imageUrl } from "../api/listings";
import useAutoDismiss from "../hooks/useAutoDismiss";
import {
  ArchiveBoxIcon,
  CameraIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  HashtagIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "../components/icons";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const PREVIEW_COUNT = 8;

function formatJoinDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(iso));
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-3 last:border-0">
      <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="truncate text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [listings, setListings] = useState(null);

  useAutoDismiss(error, setError);

  useEffect(() => {
    if (user.role !== "seller") return;
    let cancelled = false;
    getMyListings().then((data) => {
      if (!cancelled) setListings(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user.role]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      await updateAvatar(file);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.avatar?.[0] || data?.detail?.[0] || "Couldn't update your photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  const isSeller = user.role === "seller";
  const roleStyles = isSeller ? "bg-brand-50 text-brand-700" : "bg-sky-50 text-sky-700";
  const RoleIcon = isSeller ? ArchiveBoxIcon : ShoppingBagIcon;

  const activeCount = listings?.filter((l) => l.status === "active").length ?? 0;
  const soldCount = listings?.filter((l) => l.status === "sold").length ?? 0;

  return (
    <AppLayout maxWidthClass="max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* Identity sidebar */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="card overflow-hidden">
            <div className="relative h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
            </div>

            <div className="px-6 pb-6 text-center">
              <div className="group relative -mt-14 mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-soft">
                {user.avatar ? (
                  <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-500">
                    {user.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change profile photo"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-zinc-950/0 text-[11px]
                    font-semibold text-transparent transition-colors group-hover:bg-zinc-950/45 group-hover:text-white disabled:cursor-wait"
                >
                  <CameraIcon className="h-5 w-5" />
                  {!uploading && "Change"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <h1 className="mt-3 truncate text-lg font-bold text-zinc-900">{user.full_name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className={`badge capitalize ${roleStyles}`}>
                  <RoleIcon className="h-3 w-3" /> {user.role}
                </span>
                {user.is_email_verified && (
                  <span className="badge bg-emerald-50 text-emerald-700">
                    <CheckCircleIcon className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              {error && <p className="field-error mt-3 justify-center">{error}</p>}

              {isSeller && (
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
                  <StatBlock label="Active" value={activeCount} />
                  <StatBlock label="Sold" value={soldCount} />
                  <StatBlock label="Total" value={listings?.length ?? 0} />
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Account details</h2>
            <DetailRow icon={EnvelopeIcon} label="Email" value={user.email} />
            <DetailRow icon={HashtagIcon} label="Registration No." value={user.regNo} />
            <DetailRow icon={PhoneIcon} label="Phone" value={user.phone} />
            <DetailRow icon={MapPinIcon} label="Hall" value={user.hall} />
            <DetailRow icon={CheckCircleIcon} label="Member since" value={formatJoinDate(user.date_joined)} />
          </div>
        </div>

        {/* Activity content */}
        <div className="space-y-5">
          {isSeller ? (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Items you're selling</h2>
                    <p className="mt-0.5 text-sm text-zinc-500">What buyers see when they visit your listings.</p>
                  </div>
                  {listings?.length > 0 && (
                    <Link to="/my-listings" className="btn-link shrink-0 text-sm">
                      Manage all
                    </Link>
                  )}
                </div>

                {listings === null && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
                    ))}
                  </div>
                )}

                {listings?.length === 0 && (
                  <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-14 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                      <ArchiveBoxIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">You haven't listed anything yet.</p>
                    <Link to="/listings/new" className="btn-link mt-2 justify-center">
                      <PlusIcon className="h-3.5 w-3.5" /> Create your first listing
                    </Link>
                  </div>
                )}

                {listings?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {listings.slice(0, PREVIEW_COUNT).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <SellerRatings sellerId={user.id} embedded />
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-3 text-base font-bold text-zinc-900">Nothing to show here yet</h2>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                As a buyer, your activity will show up here once you start reaching out to sellers.
                For now, see what your hallmates are selling.
              </p>
              <Link to="/listings" className="btn-primary mt-5 !w-auto px-5">
                Browse listings
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
