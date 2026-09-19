import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../api/listings";
import ConfirmDialog from "./ConfirmDialog";

function NavItem({ to, icon, children, onNavigate, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      title={collapsed ? children : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
          collapsed ? "justify-center" : ""
        } ${isActive ? "bg-brand-50 text-brand-600" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`
      }
    >
      <span className="text-base leading-none">{icon}</span>
      {!collapsed && children}
    </NavLink>
  );
}

export default function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function confirmLogout() {
    setConfirmingLogout(false);
    logout();
    onNavigate?.();
    navigate("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-2 px-4 py-5 ${collapsed ? "justify-center px-2" : ""}`}>
        <NavLink to="/listings" onClick={onNavigate} className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white">
            D
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-lg font-bold tracking-tight text-stone-900">DUMarket</span>
          )}
        </NavLink>

        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            «
          </button>
        )}
      </div>

      {collapsed && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          »
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <NavItem to="/listings" icon="🛍️" onNavigate={onNavigate} collapsed={collapsed}>
          Browse
        </NavItem>
        {user?.role === "seller" && (
          <>
            <NavItem to="/my-listings" icon="📦" onNavigate={onNavigate} collapsed={collapsed}>
              My Listings
            </NavItem>
            <NavItem to="/listings/new" icon="➕" onNavigate={onNavigate} collapsed={collapsed}>
              Sell an item
            </NavItem>
          </>
        )}
        {user && (
          <NavItem to="/profile" icon="👤" onNavigate={onNavigate} collapsed={collapsed}>
            Profile
          </NavItem>
        )}
      </nav>

      <div className="border-t border-stone-200 p-3">
        {user && collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200"
              title={user.full_name}
            >
              {user.avatar ? (
                <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => setConfirmingLogout(true)}
              aria-label="Log out"
              title="Log out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-red-600"
            >
              ⏻
            </button>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200">
              {user.avatar ? (
                <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-500">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">{user.full_name}</p>
              <button
                onClick={() => setConfirmingLogout(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Log out
              </button>
            </div>
          </div>
        ) : collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/login"
              onClick={onNavigate}
              title="Log in"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white"
            >
              →
            </NavLink>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <NavLink to="/login" onClick={onNavigate} className="btn-primary text-center">
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              onClick={onNavigate}
              className="text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Create an account
            </NavLink>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out of DUMarket?"
        description="You'll need to log in again to browse, sell, or manage listings."
        confirmLabel="Log out"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
