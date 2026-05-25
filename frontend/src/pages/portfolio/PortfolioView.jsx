import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ExternalLink, Github, Calendar, User, Tag } from "lucide-react";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PortfolioView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isEditor } = usePermissions();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", slug],
    queryFn: () => portfolioApi.get(slug).then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );
  if (!portfolio) return <div className="p-6 text-muted-foreground">Projet introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto fade-in">
      {/* Cover image */}
      {portfolio.imageUrl && (
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img src={portfolio.imageUrl} alt={portfolio.title} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 40%, hsl(var(--background)) 100%)" }}
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Back + Edit */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/portfolio")}
          >
            <ArrowLeft size={14} /> Retour
          </Button>
          {isEditor && (
            <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/5" onClick={() => navigate(`/portfolio/${slug}/edit`)}>
              Modifier
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="space-y-4">
          {portfolio.category && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{portfolio.category}</span>
          )}
          <h1 className="text-3xl font-bold tracking-tight leading-tight gradient-text-portfolio">
            {portfolio.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {portfolio.authorName && (
              <span className="flex items-center gap-1.5"><User size={13} /> {portfolio.authorName}</span>
            )}
            {portfolio.date && (
              <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(portfolio.date)}</span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[portfolio.status]}`}>
              {STATUS_LABELS[portfolio.status]}
            </span>
          </div>

          {/* Action links */}
          {(portfolio.webLink || portfolio.gitLink) && (
            <div className="flex flex-wrap gap-3 pt-1">
              {portfolio.webLink && (
                <a
                  href={portfolio.webLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors glow-primary-sm"
                >
                  <ExternalLink size={14} /> Voir le projet
                </a>
              )}
              {portfolio.gitLink && (
                <a
                  href={portfolio.gitLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github size={14} /> Code source
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {portfolio.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {portfolio.tags.map((t) => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass text-muted-foreground">
                <Tag size={10} /> {t}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {portfolio.description && (
          <div className="card-surface p-6">
            <div className="prose-erp">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{portfolio.description}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
