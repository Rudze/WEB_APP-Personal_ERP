import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!portfolio) return <div className="p-6 text-muted-foreground">Projet introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Illustration */}
      {portfolio.imageUrl && (
        <div className="w-full h-64 sm:h-80 overflow-hidden bg-muted">
          <img
            src={portfolio.imageUrl}
            alt={portfolio.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Back + Edit */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
            <ArrowLeft size={14} />
          </Button>
          {isEditor && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/portfolio/${slug}/edit`)}>
              Modifier
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="space-y-3">
          {portfolio.category && (
            <span className="text-sm font-medium text-primary">{portfolio.category}</span>
          )}
          <h1 className="text-3xl font-bold leading-tight">{portfolio.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {portfolio.authorName && (
              <span className="flex items-center gap-1.5">
                <User size={14} /> {portfolio.authorName}
              </span>
            )}
            {portfolio.date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatDate(portfolio.date)}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[portfolio.status]}`}>
              {STATUS_LABELS[portfolio.status]}
            </span>
          </div>

          {/* Links */}
          {(portfolio.webLink || portfolio.gitLink) && (
            <div className="flex flex-wrap gap-4 pt-1">
              {portfolio.webLink && (
                <a
                  href={portfolio.webLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink size={15} /> Voir le projet
                </a>
              )}
              {portfolio.gitLink && (
                <a
                  href={portfolio.gitLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  <Github size={15} /> Code source
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {portfolio.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {portfolio.tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {portfolio.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none border-t border-border pt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{portfolio.description}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
