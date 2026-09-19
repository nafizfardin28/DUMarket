import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteMyRating, getMyRating, getSellerRatings, rateSeller } from "../api/ratings";
import { imageUrl } from "../api/listings";
import { StarDisplay, StarPicker } from "./StarRating";
import useAutoDismiss from "../hooks/useAutoDismiss";

function formatDate(iso) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
}

export default function SellerRatings({ sellerId }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useAutoDismiss(error, setError);

  const canRate = user && user.role === "buyer" && user.id !== sellerId;

  useEffect(() => {
    let cancelled = false;
    getSellerRatings(sellerId).then((res) => {
      if (!cancelled) setData(res);
    });
    if (canRate) {
      getMyRating(sellerId).then((res) => {
        if (cancelled) return;
        setMyRating(res);
        if (res) {
          setStars(res.stars);
          setComment(res.comment || "");
        }
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, canRate]);

  async function refreshAggregate() {
    const res = await getSellerRatings(sellerId);
    setData(res);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (stars < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const saved = await rateSeller(sellerId, stars, comment.trim());
      setMyRating(saved);
      await refreshAggregate();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.stars?.[0] || data?.detail?.[0] || "Couldn't save your rating. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    try {
      await deleteMyRating(sellerId);
      setMyRating(null);
      setStars(0);
      setComment("");
      await refreshAggregate();
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Seller ratings</p>
        {data.count > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <StarDisplay value={data.average} />
            <span className="font-semibold text-stone-700">{data.average.toFixed(1)}</span>
            <span className="text-stone-400">({data.count})</span>
          </div>
        )}
      </div>

      {data.count === 0 && <p className="mt-2 text-sm text-stone-500">No ratings yet.</p>}

      {canRate && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg bg-stone-50 p-3">
          <p className="text-xs font-semibold text-stone-500">
            {myRating ? "Update your rating" : "Rate this seller"}
          </p>
          <StarPicker value={stars} onChange={setStars} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment…"
            rows={2}
            className="field-input text-sm"
          />
          {error && <p className="field-error">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary !w-auto px-4 py-1.5 text-sm">
              {submitting ? "Saving…" : myRating ? "Update rating" : "Submit rating"}
            </button>
            {myRating && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={submitting}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        </form>
      )}

      {data.results.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.results.map((r) => (
            <li key={r.id} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 overflow-hidden rounded-full bg-stone-200">
                  {r.buyer?.avatar ? (
                    <img src={imageUrl(r.buyer.avatar)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-stone-500">
                      {r.buyer?.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-stone-900">{r.buyer?.full_name}</span>
                <StarDisplay value={r.stars} size="text-xs" />
                <span className="ml-auto text-xs text-stone-400">{formatDate(r.created_at)}</span>
              </div>
              {r.comment && <p className="mt-1 pl-8 text-sm text-stone-600">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
