import { createContext, useContext, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { LoginModal } from "@/components/ui/LoginModal";
import { BookOpen, Briefcase, GraduationCap, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PublicContext = createContext({ openLogin: () => {} });
export const usePublicContext = () => useContext(PublicContext);

export function PublicLayout() {
  const navigate = useNavigate();
  const config = useSettings();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const publicModules = config?.publicModules || {};

  const navLinks = [
    publicModules.wiki && { label: "Wiki", icon: BookOpen, path: "/wiki" },
    publicModules.portfolio && { label: "Portfolio", icon: Briefcase, path: "/portfolio" },
    publicModules.cv && { label: "CV", icon: GraduationCap, path: "/cv" },
  ].filter(Boolean);

  return (
    <PublicContext.Provider value={{ openLogin: () => setLoginOpen(true) }}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* ── Top navbar ── */}
        <nav className="glass-nav sticky top-0 z-50 shrink-0">
          <div className="max-w-6xl mx-auto h-14 flex items-center justify-between px-5">
            {/* Brand */}
            <button
              className="flex items-center gap-2.5 group"
              onClick={() => navigate("/")}
            >
              {config?.logoUrl ? (
                <img src={config.logoUrl} alt={config.appName} className="h-7 object-contain max-w-[120px]" />
              ) : (
                <span className="font-semibold text-sm tracking-tight gradient-text">
                  {config?.appName || "Personal ERP"}
                </span>
              )}
            </button>

            {/* Desktop nav links */}
            {navLinks.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map(({ label, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Right: login button */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 px-4 text-xs font-medium gap-1.5 hidden sm:flex glow-primary-sm"
                onClick={() => setLoginOpen(true)}
              >
                <LogIn size={13} />
                Se connecter
              </Button>
              {/* Mobile menu toggle */}
              <button
                className="sm:hidden p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="sm:hidden border-t border-white/6 bg-background/95 backdrop-blur-xl px-5 py-3 space-y-1">
              {navLinks.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
              <Button
                size="sm"
                className="w-full mt-2 gap-2"
                onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
              >
                <LogIn size={13} />
                Se connecter
              </Button>
            </div>
          )}
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </div>

        {/* ── Login modal ── */}
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        <Toaster />
      </div>
    </PublicContext.Provider>
  );
}
