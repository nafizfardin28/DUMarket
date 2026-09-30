import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const COLLAPSE_KEY = "sidebarCollapsed";

export default function AppLayout({ children, maxWidthClass = "max-w-5xl" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // Private browsing / storage disabled — collapse state just won't persist.
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-zinc-100 bg-white transition-[width] duration-200 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen">
          <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        </div>
      </aside>

      {/* Mobile drawer — always full width, collapsing doesn't make sense
          for a dismissible overlay. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="sticky top-0 z-20">
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className={`mx-auto ${maxWidthClass}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
