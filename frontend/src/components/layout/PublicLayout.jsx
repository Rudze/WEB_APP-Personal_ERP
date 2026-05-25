import { createContext, useContext, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
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
    publicModules.wiki      && { label: "Wiki",      icon: BookOpen,      path: "/wiki" },
    publicModules.portfolio && { label: "Portfolio",  icon: Briefcase,     path: "/portfolio" },
    publicModules.cv        && { label: "CV",         icon: GraduationCap, path: "/cv" },
  ].filter(Boolean);

  return (
    <PublicContext.Provider value={{ openLogin: () => setLoginOpen(true) }}>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "hsl(0,0%,7%)" }}>

        {/* ── Navbar — exact portfolio style ── */}
        <nav
          className="sticky top-0 z-50 shrink-0"
          style={{
            background: "hsla(240,1%,17%,0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid hsl(0,0%,22%)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <div className="max-w-6xl mx-auto h-14 flex items-center justify-between px-5">
            {/* Brand */}
            <button
              className="group flex items-center gap-2.5"
              onClick={() => navigate("/")}
            >
              {config?.logoUrl ? (
                <img src={config.logoUrl} alt={config.appName} className="h-7 object-contain max-w-[120px]" />
              ) : (
                <span
                  className="font-semibold text-sm tracking-tight gradient-text-portfolio"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {config?.appName || "Personal ERP"}
                </span>
              )}
            </button>

            {/* Desktop nav */}
            {navLinks.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map(({ label, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                    style={({ isActive }) => ({
                      color: isActive ? "hsl(var(--primary))" : "hsl(0,0%,84%)",
                      fontWeight: isActive ? 500 : 400,
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Login button — portfolio form-btn style */}
            <div className="flex items-center gap-2">
              <button
                className="relative hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: "var(--border-gradient-onyx)",
                  color: "var(--purple-color-crayola)",
                  boxShadow: "var(--shadow-2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-gradient-color-1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--border-gradient-onyx)"; }}
                onClick={() => setLoginOpen(true)}
              >
                <span
                  className="absolute inset-[1px] rounded-[10px] -z-[1] transition-all duration-200"
                  style={{ background: "var(--bg-gradient-jet)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-gradient-color-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-gradient-jet)"; }}
                />
                <LogIn size={12} />
                Se connecter
              </button>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-1.5 rounded-lg transition-colors"
                style={{ color: "hsl(0,0%,60%)" }}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div
              className="sm:hidden px-5 py-4 space-y-1"
              style={{
                borderTop: "1px solid hsl(0,0%,22%)",
                background: "hsla(240,2%,12%,0.98)",
                backdropFilter: "blur(20px)",
              }}
            >
              {navLinks.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive ? "" : "hover:bg-white/5"
                  )}
                  style={({ isActive }) => ({
                    color: isActive ? "hsl(var(--primary))" : "hsl(0,0%,84%)",
                    fontWeight: isActive ? 500 : 400,
                  })}
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
              <button
                className="relative w-full flex items-center justify-center gap-2 mt-3 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--border-gradient-onyx)",
                  color: "var(--purple-color-crayola)",
                  boxShadow: "var(--shadow-2)",
                }}
                onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
              >
                <span
                  className="absolute inset-[1px] rounded-[10px] -z-[1]"
                  style={{ background: "var(--bg-gradient-jet)" }}
                />
                <LogIn size={13} />
                Se connecter
              </button>
            </div>
          )}
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </div>

        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        <Toaster />
      </div>
    </PublicContext.Provider>
  );
}
