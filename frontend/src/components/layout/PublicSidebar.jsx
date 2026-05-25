import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Briefcase, GraduationCap, LogIn, ExternalLink } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const MODULE_META = {
  wiki:      { label: "Wiki",     icon: BookOpen,      path: "/wiki" },
  portfolio: { label: "Portfolio", icon: Briefcase,    path: "/portfolio" },
  cv:        { label: "CV",       icon: GraduationCap, path: "/cv" },
};

export function PublicSidebar({ publicModules, onLoginClick }) {
  const { appName, logoUrl, navOrder = [], customNavLinks = [] } = useSettings();
  const navigate = useNavigate();

  const order = navOrder.filter((id) => MODULE_META[id] && publicModules[id]);
  const navLinks = order.map((id) => MODULE_META[id]);

  return (
    <aside
      className="shrink-0 flex flex-col h-full w-56"
      style={{
        background: "hsl(240,2%,12%)",
        border: "1px solid hsl(0,0%,22%)",
        borderRadius: "20px",
        boxShadow: "-4px 8px 24px hsla(0,0%,0%,0.25)",
      }}
    >
      {/* Brand */}
      <div
        className="h-14 flex items-center px-4 shrink-0"
        style={{ borderBottom: "1px solid hsl(0,0%,18%)" }}
      >
        <button className="flex items-center" onClick={() => navigate("/")}>
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
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navLinks.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className="sidebar-link flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              color: isActive ? "hsl(var(--primary))" : "hsl(0,0%,60%)",
              background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
            })}
          >
            <Icon size={15} className="shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        {customNavLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="sidebar-link flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: "hsl(0,0%,60%)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0,0%,84%)"; e.currentTarget.style.background = "hsl(0,0%,18%)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0,0%,60%)"; e.currentTarget.style.background = "transparent"; }}
          >
            <ExternalLink size={15} className="shrink-0" />
            <span className="truncate">{link.label}</span>
          </a>
        ))}
      </nav>

      {/* Login */}
      <div
        className="p-3 shrink-0"
        style={{ borderTop: "1px solid hsl(0,0%,18%)" }}
      >
        <button
          onClick={onLoginClick}
          className="relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: "var(--border-gradient-onyx)",
            color: "var(--purple-color-crayola)",
            boxShadow: "var(--shadow-2)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-gradient-color-1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--border-gradient-onyx)"; }}
        >
          <span
            className="absolute inset-[1px] rounded-[10px] -z-[1]"
            style={{ background: "var(--bg-gradient-jet)" }}
          />
          <LogIn size={13} />
          Se connecter
        </button>
      </div>
    </aside>
  );
}
