import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Briefcase, Settings, Users,
  PanelLeftClose, PanelLeft, LogOut, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Dashboards", icon: LayoutDashboard, path: "/dashboards", minRole: "viewer" },
  { label: "Wiki",       icon: BookOpen,        path: "/wiki",       minRole: "viewer" },
  { label: "Portfolio",  icon: Briefcase,       path: "/portfolio",  minRole: "viewer" },
  { label: "CV",         icon: GraduationCap,   path: "/cv",         minRole: "viewer" },
];

const adminItems = [
  { label: "Utilisateurs", icon: Users,    path: "/admin/users",    minRole: "admin" },
  { label: "Paramètres",   icon: Settings, path: "/admin/settings", minRole: "admin" },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { appName, logoUrl } = useSettings();

  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 ease-in-out relative",
        "border-r border-sidebar-border",
        "bg-sidebar",
        collapsed ? "w-[60px]" : "w-60"
      )}
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
    >
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.07), transparent 70%)" }}
      />

      {/* ── Brand ── */}
      <div
        className={cn(
          "relative z-10 flex items-center h-14 px-3 border-b border-sidebar-border/40 shrink-0",
          collapsed ? "justify-center" : "justify-between gap-2"
        )}
      >
        {!collapsed && (
          <div className="flex-1 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={appName || "Logo"} className="h-7 object-contain max-w-[130px]" />
            ) : (
              <span className="font-semibold text-sm tracking-tight gradient-text truncate">
                {appName || "Personal ERP"}
              </span>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5 rounded-lg"
          onClick={onToggle}
          title={collapsed ? "Développer" : "Réduire"}
        >
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </Button>
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 py-3 relative z-10">
        <nav className="px-2 space-y-0.5">
          {navItems.filter((i) => can(i.minRole)).map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Admin section */}
        {can("admin") && (
          <>
            <div className="px-3 py-3">
              <div className="h-px bg-sidebar-border/40" />
            </div>
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
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
      </ScrollArea>

      {/* ── User footer ── */}
      <div className="relative z-10 border-t border-sidebar-border/40 p-2 shrink-0">
        <div className={cn("flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl", collapsed && "justify-center")}>
          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary shrink-0 glow-primary-sm">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-sidebar-foreground">{user?.name}</p>
                <p className="text-[10px] text-sidebar-foreground/45 truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-6 w-6 text-sidebar-foreground/35 hover:text-sidebar-foreground hover:bg-white/5 rounded-lg"
                onClick={logout}
                title="Se déconnecter"
              >
                <LogOut size={13} />
              </Button>
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
      className={cn(
        "sidebar-link flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150",
        collapsed ? "justify-center" : "",
        isActive
          ? "active bg-primary/[0.1] text-primary"
          : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-white/[0.04]"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={15} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
