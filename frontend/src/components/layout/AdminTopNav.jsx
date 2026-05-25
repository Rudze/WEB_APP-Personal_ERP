import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Briefcase, Settings, Users,
  LogOut, GraduationCap, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";

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

export function AdminTopNav() {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { appName, logoUrl } = useSettings();
  const { theme, toggleTheme } = useTheme();

  const allNav = [
    ...navItems.filter((i) => can(i.minRole)),
    ...(can("admin") ? adminItems : []),
  ];

  return (
    <nav
      className="shrink-0 flex items-center h-14 px-4 gap-4"
      style={{
        background: "hsl(240,2%,12%)",
        border: "1px solid hsl(0,0%,22%)",
        borderRadius: "20px",
        boxShadow: "-4px 8px 24px hsla(0,0%,0%,0.25)",
      }}
    >
      {/* Brand */}
      <div className="shrink-0 flex items-center min-w-[120px]">
        {logoUrl ? (
          <img src={logoUrl} alt={appName || "Logo"} className="h-7 object-contain max-w-[120px]" />
        ) : (
          <span
            className="font-semibold text-sm tracking-tight gradient-text-portfolio"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {appName || "Personal ERP"}
          </span>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto">
        {allNav.map((item) => (
          <TopNavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Right side: theme + user */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ color: "hsl(0,0%,55%)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,55%)"; e.currentTarget.style.background = "transparent"; }}
          onClick={toggleTheme}
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        <div
          className="h-7 w-px"
          style={{ background: "hsl(0,0%,20%)" }}
        />

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{
            background: "hsl(var(--primary) / 0.15)",
            border: "1px solid hsl(var(--primary) / 0.3)",
            color: "hsl(var(--primary))",
          }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>

        <span className="text-xs hidden sm:block" style={{ color: "hsl(0,0%,60%)" }}>
          {user?.name}
        </span>

        <button
          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ color: "hsl(0,0%,45%)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,45%)"; e.currentTarget.style.background = "transparent"; }}
          onClick={logout}
          title="Se déconnecter"
        >
          <LogOut size={13} />
        </button>
      </div>
    </nav>
  );
}

function TopNavItem({ item }) {
  const { icon: Icon, label, path } = item;
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      className="sidebar-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        color: isActive ? "hsl(var(--primary))" : "hsl(0,0%,60%)",
        background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "hsl(0,0%,60%)"; e.currentTarget.style.background = "transparent"; } }}
    >
      <Icon size={14} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}
