import { useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import SellerRatings from "../components/SellerRatings";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../api/listings";
import useAutoDismiss from "../hooks/useAutoDismiss";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function formatJoinDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(iso));
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 py-3 last:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-semibold text-stone-900">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useAutoDismiss(error, setError);

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

  const roleStyles =
    user.role === "seller" ? "bg-brand-50 text-brand-700" : "bg-sky-50 text-sky-700";

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-brand-500 to-brand-600" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex items-end gap-4">
              <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-stone-200 shadow-sm">
                {user.avatar ? (
                  <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-stone-500">
                    {user.full_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change profile photo"
                  className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold text-transparent
                    transition-colors group-hover:bg-black/40 group-hover:text-white disabled:cursor-wait"
                >
                  {uploading ? "…" : "📷 Change"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="truncate text-lg font-bold text-stone-900">{user.full_name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${roleStyles}`}>
                    {user.role}
                  </span>
                  {user.is_email_verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="field-error mt-3">{error}</p>}
          </div>
        </div>

        {/* Details card */}
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">Account details</h2>
          <div className="mt-2">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Registration No." value={user.regNo} />
            <DetailRow label="Phone" value={user.phone} />
            <DetailRow label="Hall" value={user.hall} />
            <DetailRow label="Member since" value={formatJoinDate(user.date_joined)} />
          </div>
        </div>

        {user.role === "seller" && <SellerRatings sellerId={user.id} />}
      </div>
    </AppLayout>
  );
}
