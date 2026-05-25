import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Briefcase, Settings, Users,
  ChevronLeft, ChevronRight, LogOut, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboards", icon: LayoutDashboard, path: "/dashboards", minRole: "viewer" },
  { label: "Wiki", icon: BookOpen, path: "/wiki", minRole: "viewer" },
  { label: "Portfolio", icon: Briefcase, path: "/portfolio", minRole: "viewer" },
  { label: "CV", icon: GraduationCap, path: "/cv", minRole: "viewer" },
];

const adminItems = [
  { label: "Utilisateurs", icon: Users, path: "/admin/users", minRole: "admin" },
  { label: "Paramètres", icon: Settings, path: "/admin/settings", minRole: "admin" },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const location = useLocation();
  const { appName, logoUrl } = useSettings();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
        {!collapsed && (
          logoUrl
            ? <img src={logoUrl} alt={appName || "Logo"} className="h-8 object-contain max-w-[140px]" />
            : <span className="font-semibold text-sidebar-foreground truncate">{appName || "Personal ERP"}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        {/* Main nav */}
        <nav className="px-2 space-y-1">
          {navItems.filter((i) => can(i.minRole)).map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Admin nav */}
        {can("admin") && (
          <>
            <div className="px-2 py-2">
              <Separator className="bg-sidebar-border" />
            </div>
            {!collapsed && (
              <p className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wider">
                Administration
              </p>
            )}
            <nav className="px-2 space-y-1">
              {adminItems.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} />
              ))}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            onClick={logout}
            title="Se déconnecter"
          >
            <LogOut size={15} />
          </Button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, collapsed }) {
  const { icon: Icon, label, path } = item;

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
          collapsed ? "justify-center" : "",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
        )
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
