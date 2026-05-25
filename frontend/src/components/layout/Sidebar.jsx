import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Briefcase, Settings, Users,
  PanelLeftClose, PanelLeft, LogOut, GraduationCap, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/context/SettingsContext";

const NAV_ITEMS = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, path: "/dashboards", minRole: "viewer" },
  { id: "wiki",       label: "Wiki",       icon: BookOpen,        path: "/wiki",       minRole: "viewer" },
  { id: "portfolio",  label: "Portfolio",  icon: Briefcase,       path: "/portfolio",  minRole: "viewer" },
  { id: "cv",         label: "CV",         icon: GraduationCap,   path: "/cv",         minRole: "viewer" },
];

const adminItems = [
  { label: "Utilisateurs", icon: Users,    path: "/admin/users",    minRole: "admin" },
  { label: "Paramètres",   icon: Settings, path: "/admin/settings", minRole: "admin" },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { appName, logoUrl, navOrder, customNavLinks = [] } = useSettings();

  const sortedNav = [...NAV_ITEMS]
    .sort((a, b) => {
      const ai = (navOrder || []).indexOf(a.id);
      const bi = (navOrder || []).indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .filter((i) => can(i.minRole));

  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 ease-in-out relative overflow-hidden shrink-0",
        collapsed ? "w-[60px]" : "w-56"
      )}
      style={{
        background: "hsl(240,2%,12%)",
        border: "1px solid hsl(0,0%,22%)",
        borderRadius: "20px",
        boxShadow: "-4px 8px 24px hsla(0,0%,0%,0.25)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.06), transparent 70%)" }}
      />

      {/* Brand */}
      <div
        className={cn("relative flex items-center h-14 px-3 shrink-0", collapsed ? "justify-center" : "justify-between gap-2")}
        style={{ borderBottom: "1px solid hsl(0,0%,18%)" }}
      >
        {!collapsed && (
          <div className="flex-1 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={appName || "Logo"} className="h-7 object-contain max-w-[120px]" />
            ) : (
              <span className="font-semibold text-sm tracking-tight gradient-text-portfolio truncate block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {appName || "Personal ERP"}
              </span>
            )}
          </div>
        )}
        <button
          className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ color: "hsl(0,0%,55%)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,55%)"; e.currentTarget.style.background = "transparent"; }}
          onClick={onToggle}
          title={collapsed ? "Développer" : "Réduire"}
        >
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 relative">
        <nav className="px-2 space-y-0.5">
          {sortedNav.map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} />
          ))}
          {customNavLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              title={collapsed ? link.label : undefined}
              className="sidebar-link flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                color: "hsl(0,0%,60%)",
                justifyContent: collapsed ? "center" : undefined,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,60%)"; e.currentTarget.style.background = "transparent"; }}
            >
              <ExternalLink size={15} className="shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </a>
          ))}
        </nav>

        {can("admin") && (
          <>
            <div className="px-3 py-3">
              <div style={{ height: "1px", background: "hsl(0,0%,18%)" }} />
            </div>
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "hsl(0,0%,40%)" }}>
                Admin
              </p>
            )}
            <nav className="px-2 space-y-0.5">
              {adminItems.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* User footer */}
      <div className="relative shrink-0 p-2" style={{ borderTop: "1px solid hsl(0,0%,18%)" }}>
        <div className={cn("flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl", collapsed && "justify-center")}>
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}
          >
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "hsl(0,0%,84%)" }}>{user?.name}</p>
                <p className="text-[10px] truncate" style={{ color: "hsl(0,0%,45%)" }}>{user?.email}</p>
              </div>
              <button
                className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center transition-colors duration-150"
                style={{ color: "hsl(0,0%,40%)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,75%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,40%)"; e.currentTarget.style.background = "transparent"; }}
                onClick={logout}
                title="Se déconnecter"
              >
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, collapsed }) {
  const { icon: Icon, label, path } = item;
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className="sidebar-link flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        justifyContent: collapsed ? "center" : undefined,
        color: isActive ? "hsl(var(--primary))" : "hsl(0,0%,60%)",
        background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "hsl(0,0%,60%)"; e.currentTarget.style.background = "transparent"; } }}
    >
      <Icon size={15} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
