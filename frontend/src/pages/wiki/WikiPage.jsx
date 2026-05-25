import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, Tag, Loader2, AlertCircle, ChevronRight, BookOpen } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";

export function WikiPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isEditor, isAdmin } = usePermissions();
  const { toast } = useToast();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["wiki-page", slug],
    queryFn: () => wikiApi.get(slug).then((r) => r.data),
    enabled: !!slug,
  });

  const deleteMutation = useMutation({
    mutationFn: () => wikiApi.delete(page.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wiki-pages"] });
      navigate("/wiki");
      toast({ title: "Page supprimée" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <div className="icon-box-erp w-16 h-16">
          <BookOpen size={24} className="text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground/60">Sélectionnez une page</p>
          <p className="text-sm mt-1">Utilisez le menu de navigation pour choisir une page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );

  if (error) {
    return (
      <div className="p-6 flex items-center gap-3 text-destructive">
        <AlertCircle size={18} />
        <span>{error.response?.data?.error || "Page introuvable"}</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground/95 leading-snug">
            {page.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {formatDateTime(page.updatedAt)}
            </span>
            {page.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag size={11} />
                {page.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {isEditor && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/50 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => navigate(`/wiki/${slug}/edit`)}
            >
              <Pencil size={13} /> Modifier
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm(`Supprimer définitivement "${page.title}" ?`)) deleteMutation.mutate();
              }}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Sub-pages */}
      {page.children?.length > 0 && (
        <div className="card-surface p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sous-pages</p>
          <div className="space-y-0.5">
            {page.children.map((child) => (
              <button
                key={child.id}
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors py-1 w-full text-left"
                onClick={() => navigate(`/wiki/${child.slug}`)}
              >
                <ChevronRight size={13} className="text-primary/60 shrink-0" />
                {child.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose-erp">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {page.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
