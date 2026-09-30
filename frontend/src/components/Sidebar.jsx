import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../api/listings";
import ConfirmDialog from "./ConfirmDialog";
import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
  PowerIcon,
  ShoppingBagIcon,
  UserIcon,
} from "./icons";

function NavItem({ to, icon: IconComponent, children, onNavigate, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      title={collapsed ? children : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
          collapsed ? "justify-center" : ""
        } ${
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <IconComponent className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-brand-600" : "text-zinc-400 group-hover:text-zinc-600"}`} />
          {!collapsed && children}
        </>
      )}
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
    <div className="flex h-full flex-col bg-white">
      <div className={`flex items-center gap-2 px-4 py-5 ${collapsed ? "justify-center px-2" : ""}`}>
        <NavLink to="/listings" onClick={onNavigate} className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
            D
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-zinc-900">DUMarket</span>
          )}
        </NavLink>

        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        <NavItem to="/listings" icon={ShoppingBagIcon} onNavigate={onNavigate} collapsed={collapsed}>
          Browse
        </NavItem>
        {user?.role === "seller" && (
          <>
            <NavItem to="/my-listings" icon={ArchiveBoxIcon} onNavigate={onNavigate} collapsed={collapsed}>
              My Listings
            </NavItem>
            <NavItem to="/listings/new" icon={PlusIcon} onNavigate={onNavigate} collapsed={collapsed}>
              Sell an item
            </NavItem>
          </>
        )}
        {user && (
          <NavItem to="/profile" icon={UserIcon} onNavigate={onNavigate} collapsed={collapsed}>
            Profile
          </NavItem>
        )}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        {user && collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-white"
              title={user.full_name}
            >
              {user.avatar ? (
                <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => setConfirmingLogout(true)}
              aria-label="Log out"
              title="Log out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <PowerIcon className="h-4 w-4" />
            </button>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-white">
              {user.avatar ? (
                <img src={imageUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{user.full_name}</p>
              <button
                onClick={() => setConfirmingLogout(true)}
                className="text-xs font-semibold text-zinc-400 hover:text-rose-600"
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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"
            >
              <ArrowRightIcon className="h-4 w-4" />
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
              className="text-center text-sm font-semibold text-zinc-500 hover:text-zinc-900"
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
