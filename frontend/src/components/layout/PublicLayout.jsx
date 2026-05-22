import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

  const navLinks = [
    publicModules.wiki && { label: "Wiki", icon: BookOpen, path: "/wiki" },
    publicModules.portfolio && { label: "Portfolio", icon: Briefcase, path: "/portfolio" },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border bg-background">
        <div className="flex items-center h-14 px-6 gap-6">
          <span
            className="font-semibold text-foreground cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            {config?.appName || "Personal ERP"}
          </span>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )
                }
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <Button size="sm" onClick={() => navigate("/login")}>
            <LogIn size={14} /> Se connecter
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
