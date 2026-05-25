import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LayoutDashboard, BookOpen, Briefcase, GraduationCap, ArrowRight, ChevronDown, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { usePublicContext } from "@/components/layout/PublicLayout";
import { cn } from "@/lib/utils";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
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
    description: "Tableaux de bord personnalisés avec widgets dynamiques, graphiques et indicateurs en temps réel.",
    gradient: "from-blue-500/15 to-indigo-600/15",
    iconGradient: "from-blue-400 to-indigo-400",
    border: "hover:border-blue-500/30",
  },
  {
    icon: BookOpen,
    title: "Wiki",
    description: "Base de connaissances structurée avec éditeur Markdown, versioning et navigation arborescente.",
    gradient: "from-violet-500/15 to-purple-600/15",
    iconGradient: "from-violet-400 to-purple-400",
    border: "hover:border-violet-500/30",
  },
  {
    icon: Briefcase,
    title: "Portfolio",
    description: "Présentez vos projets avec un portfolio élégant, catégories, tags et liens vers vos réalisations.",
    gradient: "from-emerald-500/15 to-teal-600/15",
    iconGradient: "from-emerald-400 to-teal-400",
    border: "hover:border-emerald-500/30",
  },
  {
    icon: GraduationCap,
    title: "Curriculum Vitae",
    description: "Gérez votre profil professionnel, formations et compétences dans un espace dédié.",
    gradient: "from-orange-500/15 to-amber-600/15",
    iconGradient: "from-orange-400 to-amber-400",
    border: "hover:border-orange-500/30",
  },
];

const pillars = [
  { icon: Zap, label: "Rapide & fluide" },
  { icon: Shield, label: "Données privées" },
  { icon: Sparkles, label: "Design premium" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { openLogin } = usePublicContext();
  const { appName, landingContent = {} } = useSettings();

  useScrollReveal();

  const heroTitle = landingContent.heroTitle || appName || "Personal ERP";
  const heroSubtitle = landingContent.heroSubtitle || "Gérez. Organisez. Évoluez.";
  const heroDescription =
    landingContent.heroDescription ||
    "Votre espace personnel centralisé — dashboards, wiki, portfolio et CV réunis dans une interface élégante et sécurisée.";

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-y-auto h-full">
      {/* ── Hero ── */}
      <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(hsl(var(--primary) / 0.12), transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none animate-float"
          style={{ background: "radial-gradient(rgba(168,85,247,0.1), transparent 70%)", filter: "blur(50px)", animationDelay: "2s" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Application ERP personnelle
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 animate-fade-up">
            <span className="gradient-text">{heroTitle}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-medium text-foreground/80 mb-4" style={{ animationDelay: "0.1s" }}>
            {heroSubtitle}
          </p>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {heroDescription}
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              className="h-12 px-8 font-semibold glow-primary-sm"
              onClick={openLogin}
            >
              Se connecter
              <ArrowRight size={16} className="ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 font-medium border-border/60 hover:border-primary/40 hover:bg-primary/5"
              onClick={scrollToFeatures}
            >
              Découvrir les fonctionnalités
            </Button>
          </div>

          {/* Pillars */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {pillars.map(({ icon: Icon, label }) => (
              <div key={label} className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                <Icon size={12} className="text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors animate-float"
          aria-label="Défiler"
        >
          <ChevronDown size={24} />
        </button>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Modules</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Une suite d'outils personnels réunis dans une interface cohérente et élégante.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {modules.map((mod, i) => (
              <div
                key={mod.title}
                className={cn(
                  "reveal feature-card card-surface p-7",
                  `reveal-delay-${i + 1}`
                )}
              >
                <div className={cn("w-11 h-11 rounded-xl mb-5 flex items-center justify-center bg-gradient-to-br", mod.gradient)}>
                  <mod.icon
                    size={20}
                    className={cn("bg-gradient-to-br bg-clip-text", mod.iconGradient)}
                    style={{ color: `var(--tw-gradient-from)` }}
                  />
                </div>
                <h3 className="text-base font-semibold mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom sections (markdown from admin) ── */}
      {landingContent.sections && (
        <section className="py-16 px-6 border-t border-border/40">
          <div className="max-w-3xl mx-auto reveal">
            <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {landingContent.sections}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center reveal">
          <div className="card-surface rounded-2xl p-12 relative overflow-hidden">
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06), transparent 70%)" }}
            />
            <h2 className="text-3xl font-bold tracking-tight mb-4 relative z-10">
              Prêt à commencer ?
            </h2>
            <p className="text-muted-foreground mb-8 relative z-10">
              Connectez-vous et accédez à votre espace personnel.
            </p>
            <Button
              size="lg"
              className="h-12 px-10 font-semibold glow-primary-sm relative z-10"
              onClick={openLogin}
            >
              Accéder à l'application
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground/50">
          <span>{appName || "Personal ERP"}</span>
          <span>Version locale — usage privé</span>
        </div>
      </footer>
    </div>
  );
}
