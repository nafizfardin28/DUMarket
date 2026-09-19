import { Link } from "react-router-dom";
import { imageUrl } from "../api/listings";
import { categoryLabel } from "../constants/categories";

export default function ListingCard({ listing }) {
  const cover = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-100">
        {cover ? (
          <img
            src={imageUrl(cover)}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-stone-300">📦</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-stone-900">{listing.title}</h3>
          {listing.status === "sold" && (
            <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">
              Sold
            </span>
          )}
        </div>
        <p className="text-base font-bold text-brand-600">৳{listing.price}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-stone-500">
          <span>{categoryLabel(listing.category)}</span>
          <span className="truncate">{listing.hall}</span>
        </div>
      </div>
    </Link>
  );
}
