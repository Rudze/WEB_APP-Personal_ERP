import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  LayoutDashboard, BookOpen, Briefcase, GraduationCap,
  LogIn, ArrowRight, ChevronDown,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { usePublicContext } from "@/components/layout/PublicLayout";
import { cn } from "@/lib/utils";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboards",
    description: "Tableaux de bord personnalisés avec widgets dynamiques, graphiques temps réel et mise en page flexible.",
    accent: "#6366f1",
  },
  {
    icon: BookOpen,
    title: "Wiki",
    description: "Base de connaissances structurée avec éditeur Markdown, historique de versions et navigation arborescente.",
    accent: "#8b5cf6",
  },
  {
    icon: Briefcase,
    title: "Portfolio",
    description: "Présentez vos projets avec images, catégories, tags et liens vers vos réalisations publiques ou privées.",
    accent: "hsl(var(--primary))",
  },
  {
    icon: GraduationCap,
    title: "Curriculum Vitae",
    description: "Profil professionnel complet : formations, certifications, compétences avec barres de progression.",
    accent: "hsl(var(--primary))",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { openLogin } = usePublicContext();
  const { appName, landingContent = {} } = useSettings();

  useScrollReveal();

  const heroTitle    = landingContent.heroTitle    || appName || "Personal ERP";
  const heroSubtitle = landingContent.heroSubtitle || "Gérez. Organisez. Évoluez.";
  const heroDesc     = landingContent.heroDescription ||
    "Votre espace personnel centralisé — dashboards, wiki, portfolio et CV réunis dans une interface sombre et élégante.";

  return (
    <div className="overflow-y-auto h-full bg-background" style={{ background: "hsl(0,0%,7%)" }}>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

        {/* Ambient glow — very subtle, portfolio-style */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, hsla(280,40%,50%,0.12), transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Name badge — portfolio style */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10 text-xs font-medium"
            style={{
              background: "var(--bg-gradient-onyx)",
              border: "1px solid hsl(0,0%,22%)",
              boxShadow: "var(--shadow-1)",
              color: "hsl(0,0%,84%)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--text-gradient-color)" }}
            />
            Application personnelle
          </div>

          {/* Main title */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 gradient-text-portfolio"
            style={{ lineHeight: 1.1 }}
          >
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-medium mb-5" style={{ color: "hsl(0,0%,84%)" }}>
            {heroSubtitle}
          </p>

          {/* Description */}
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-12" style={{ color: "hsl(0,0%,60%)", fontWeight: 300 }}>
            {heroDesc}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Primary — portfolio form-btn style */}
            <button
              onClick={openLogin}
              className="relative flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--border-gradient-onyx)",
                color: "var(--purple-color-crayola)",
                boxShadow: "var(--shadow-3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-gradient-color-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--border-gradient-onyx)";
              }}
            >
              <span
                className="absolute inset-[1px] rounded-[10px] transition-all duration-200"
                style={{ background: "var(--bg-gradient-jet)", zIndex: -1 }}
              />
              <LogIn size={14} />
              Se connecter
              <ArrowRight size={13} className="opacity-70" />
            </button>

            {/* Secondary */}
            <button
              onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
              style={{
                background: "transparent",
                border: "1px solid hsl(0,0%,22%)",
                color: "hsl(0,0%,84%)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple-color-crayola)"; e.currentTarget.style.color = "var(--purple-color-crayola)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(0,0%,22%)"; e.currentTarget.style.color = "hsl(0,0%,84%)"; }}
            >
              Découvrir les modules
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <button
          onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-colors"
          style={{ color: "hsl(0,0%,35%)" }}
          aria-label="Défiler"
        >
          <ChevronDown size={22} />
        </button>
      </section>

      {/* ──────────────── MODULES ──────────────── */}
      <section id="modules" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Section header — portfolio article-title style */}
          <div className="text-center mb-16 reveal">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 page-header-title mx-auto"
              style={{
                display: "inline-block",
                color: "hsl(0,0%,98%)",
                paddingBottom: "12px",
              }}
            >
              Modules
            </h2>
            <p className="text-sm mt-2" style={{ color: "hsl(0,0%,60%)", fontWeight: 300 }}>
              Une suite d'outils personnels réunis dans une interface cohérente.
            </p>
          </div>

          {/* Grid — portfolio service-item style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {modules.map((mod, i) => (
              <div
                key={mod.title}
                className={cn("reveal feature-card", `reveal-delay-${i + 1}`)}
                style={{
                  position: "relative",
                  background: "var(--border-gradient-onyx)",
                  padding: "24px",
                  borderRadius: "14px",
                  boxShadow: "var(--shadow-2)",
                  zIndex: 1,
                }}
              >
                <div
                  className="absolute inset-[1px] rounded-[13px] -z-[1]"
                  style={{ background: "var(--bg-gradient-jet)" }}
                />
                {/* Icon box — exact portfolio icon-box */}
                <div
                  className="icon-box-erp w-10 h-10 mb-4"
                  style={{ borderRadius: "10px" }}
                >
                  <mod.icon size={16} style={{ color: mod.accent }} />
                </div>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: "hsl(0,0%,98%)", fontFamily: "'Poppins', sans-serif" }}
                >
                  {mod.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "hsl(0,0%,60%)", fontWeight: 300 }}
                >
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── CUSTOM MARKDOWN ──────────────── */}
      {landingContent.sections && (
        <section className="py-16 px-6" style={{ borderTop: "1px solid hsl(0,0%,22%)" }}>
          <div className="max-w-3xl mx-auto reveal">
            <div className="prose-erp">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {landingContent.sections}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────── CTA ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center reveal">
          {/* Portfolio card-surface style card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "var(--border-gradient-onyx)",
              boxShadow: "var(--shadow-5)",
              padding: "1px",
            }}
          >
            <div
              className="rounded-[15px] px-12 py-16"
              style={{ background: "var(--bg-gradient-jet)" }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold mb-4 gradient-text-portfolio"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Prêt à commencer ?
              </h2>
              <p className="text-sm mb-10" style={{ color: "hsl(0,0%,60%)", fontWeight: 300 }}>
                Connectez-vous pour accéder à votre espace personnel.
              </p>
              <button
                onClick={openLogin}
                className="relative inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--border-gradient-onyx)",
                  color: "var(--purple-color-crayola)",
                  boxShadow: "var(--shadow-3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-gradient-color-1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--border-gradient-onyx)"; }}
              >
                <span
                  className="absolute inset-[1px] rounded-[10px] -z-[1]"
                  style={{ background: "var(--bg-gradient-jet)" }}
                />
                <LogIn size={14} />
                Accéder à l'application
                <ArrowRight size={13} className="opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer
        className="py-6 px-6 text-xs"
        style={{
          borderTop: "1px solid hsl(0,0%,22%)",
          color: "hsl(0,0%,50%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span
            className="font-semibold gradient-text-portfolio"
            style={{ fontSize: "13px" }}
          >
            {appName || "Personal ERP"}
          </span>
          <span>Version locale — usage privé</span>
        </div>
      </footer>
    </div>
  );
}
