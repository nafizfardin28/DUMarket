import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../api/listings";
import ConfirmDialog from "./ConfirmDialog";

const TITLES = [
  { test: (p) => p === "/listings", title: "Browse listings" },
  { test: (p) => p === "/listings/new", title: "Sell an item" },
  { test: (p) => p === "/my-listings", title: "My Listings" },
  { test: (p) => p === "/profile", title: "Profile" },
  { test: (p) => /^\/listings\/\d+$/.test(p), title: "Listing details" },
];

function pageTitle(pathname) {
  return TITLES.find((t) => t.test(pathname))?.title ?? "DUMarket";
}

export default function Topbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function confirmLogout() {
    setConfirmingLogout(false);
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="rounded-md p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
        >
          ☰
        </button>
        <h1 className="truncate text-base font-bold text-stone-900 sm:text-lg">{pageTitle(location.pathname)}</h1>
      </div>

      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-stone-100"
            aria-label="Account menu"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-stone-200">
              {user.avatar ? (
                <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-stone-500">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              <div className="border-b border-stone-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-stone-900">{user.full_name}</p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmingLogout(true);
                }}
                className="block w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-semibold text-stone-600 hover:text-stone-900">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary !w-auto px-3 py-1.5 text-sm">
            Sign up
          </Link>
        </div>
      )}

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out of DUMarket?"
        description="You'll need to log in again to browse, sell, or manage listings."
        confirmLabel="Log out"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </header>
  );
}
