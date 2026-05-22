import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { BookOpen, Briefcase, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicLayout() {
  const navigate = useNavigate();

  const { data: config } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => publicApi.getConfig().then((r) => r.data),
  });

  const publicModules = config?.publicModules || {};

  const navItems = [
    publicModules.wiki && { label: "Wiki", icon: BookOpen, path: "/wiki" },
    publicModules.portfolio && { label: "Portfolio", icon: Briefcase, path: "/portfolio" },
  ].filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <span className="font-semibold truncate text-foreground">
            {config?.appName || "Personal ERP"}
          </span>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {navItems.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/60"
                  )
                }
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-border p-3">
          <Button className="w-full" size="sm" onClick={() => navigate("/login")}>
            <LogIn size={14} /> Se connecter
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
