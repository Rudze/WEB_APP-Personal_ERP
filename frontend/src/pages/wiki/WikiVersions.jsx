import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Clock, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function WikiVersions() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const { data: page } = useQuery({
    queryKey: ["wiki-page", slug],
    queryFn: () => wikiApi.get(slug).then((r) => r.data),
  });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["wiki-versions", page?.id],
    queryFn: () => wikiApi.getVersions(page.id).then((r) => r.data),
    enabled: !!page?.id,
  });

  const { data: versionContent } = useQuery({
    queryKey: ["wiki-version-content", selectedId],
    queryFn: () => wikiApi.getVersion(page.id, selectedId).then((r) => r.data),
    enabled: !!selectedId && !!page?.id,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/wiki/${slug}`)}>
          <ArrowLeft size={14} /> Retour
        </Button>
        <h2 className="text-lg font-semibold">Historique — {page?.title}</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
          ) : versions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune version sauvegardée.</p>
          ) : (
            versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedId === v.id ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                }`}
              >
                <p className="text-sm font-medium truncate">{v.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock size={11} /> {formatDateTime(v.savedAt)}
                </div>
                {v.savedBy && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User size={11} /> {v.savedBy}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="col-span-2">
          {versionContent ? (
            <Card>
              <CardContent className="p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{versionContent.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Sélectionnez une version à gauche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
