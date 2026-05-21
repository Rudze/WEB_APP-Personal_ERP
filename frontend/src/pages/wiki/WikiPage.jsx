import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Clock, Tag, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

export function WikiPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isEditor } = usePermissions();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["wiki-page", slug],
    queryFn: () => wikiApi.get(slug).then((r) => r.data),
    enabled: !!slug,
  });

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <p>Sélectionnez une page dans le menu.</p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  if (error) {
    return (
      <div className="p-6 flex items-center gap-3 text-destructive">
        <AlertCircle size={18} />
        <span>{error.response?.data?.error || "Page introuvable"}</span>
      </div>
    );
  }

  const sanitized = DOMPurify.sanitize(page.content);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{page.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {formatDateTime(page.updatedAt)}
            </span>
            {page.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={13} />
                {page.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {isEditor && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/wiki/${slug}/edit`)}
          >
            <Pencil size={14} /> Modifier
          </Button>
        )}
      </div>

      {/* Children links */}
      {page.children?.length > 0 && (
        <div className="border border-border rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Sous-pages</p>
          <div className="space-y-1">
            {page.children.map((child) => (
              <button
                key={child.id}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                onClick={() => navigate(`/wiki/${child.slug}`)}
              >
                <ChevronRight size={13} />
                {child.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {page.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
