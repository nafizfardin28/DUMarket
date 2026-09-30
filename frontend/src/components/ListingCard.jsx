import { Link } from "react-router-dom";
import { imageUrl } from "../api/listings";
import { categoryLabel } from "../constants/categories";
import { PhotoIcon } from "./icons";

export default function ListingCard({ listing }) {
  const cover = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white
        transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-card"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {cover ? (
          <img
            src={imageUrl(cover)}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <PhotoIcon className="h-9 w-9" />
          </div>
        )}
        {listing.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Sold
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900">{listing.title}</h3>
        <p className="text-base font-bold text-zinc-900">৳{listing.price}</p>
        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-500">
            {categoryLabel(listing.category)}
          </span>
          <span className="truncate">{listing.hall}</span>
        </div>
      </div>
    </Link>
  );
}
