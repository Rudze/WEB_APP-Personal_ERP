import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, ArrowLeft } from "lucide-react";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PortfolioView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isEditor } = usePermissions();
  const { toast } = useToast();
  const [entryDialog, setEntryDialog] = useState({ open: false, editing: null });
  const [filterTag, setFilterTag] = useState("");

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", slug],
    queryFn: () => portfolioApi.get(slug).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => portfolioApi.deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio", slug] });
      toast({ title: "Entrée supprimée" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!portfolio) return <div className="p-6 text-muted-foreground">Portfolio introuvable.</div>;

  const allTags = [...new Set(portfolio.entries.flatMap((e) => e.tags))];
  const filtered = filterTag ? portfolio.entries.filter((e) => e.tags.includes(filterTag)) : portfolio.entries;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
          <ArrowLeft size={14} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{portfolio.title}</h2>
          {portfolio.description && <p className="text-sm text-muted-foreground">{portfolio.description}</p>}
        </div>
        {isEditor && (
          <Button size="sm" onClick={() => setEntryDialog({ open: true, editing: null })}>
            <Plus size={14} /> Ajouter
          </Button>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag("")}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${!filterTag ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
          >
            Tous
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? "" : tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterTag === tag ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Entries grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune entrée.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <Card key={entry.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{entry.shortDesc}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    {isEditor && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEntryDialog({ open: true, editing: entry })}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(entry.id); }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                )}
                {entry.longDesc && (
                  <div className="prose prose-xs dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.longDesc.slice(0, 200)}</ReactMarkdown>
                  </div>
                )}
                {entry.links?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink size={11} /> {link.label}
                      </a>
                    ))}
                  </div>
                )}
                {entry.date && (
                  <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EntryFormDialog
        open={entryDialog.open}
        onOpenChange={(open) => setEntryDialog({ open, editing: null })}
        portfolioId={portfolio.id}
        editing={entryDialog.editing}
        portfolioSlug={slug}
      />
    </div>
  );
}

function EntryFormDialog({ open, onOpenChange, portfolioId, editing, portfolioSlug }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", shortDesc: "", longDesc: "", tags: "", images: "",
    links: "", status: "termine", date: "",
  });

  useState(() => {
    if (editing) {
      setForm({
        title: editing.title,
        shortDesc: editing.shortDesc,
        longDesc: editing.longDesc || "",
        tags: editing.tags.join(", "),
        images: editing.images.join("\n"),
        links: editing.links.map((l) => `${l.label}|${l.url}`).join("\n"),
        status: editing.status,
        date: editing.date ? editing.date.split("T")[0] : "",
      });
    }
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? portfolioApi.updateEntry(editing.id, data)
      : portfolioApi.addEntry(portfolioId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio", portfolioSlug] });
      toast({ title: editing ? "Entrée mise à jour" : "Entrée créée" });
      onOpenChange(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({
      title: form.title,
      shortDesc: form.shortDesc,
      longDesc: form.longDesc || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
      links: form.links.split("\n").filter(Boolean).map((l) => {
        const [label, ...urlParts] = l.split("|");
        return { label: label.trim(), url: urlParts.join("|").trim() };
      }),
      status: form.status,
      date: form.date || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier l'entrée" : "Nouvelle entrée"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Statut</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="archive">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description courte</Label>
            <Input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description longue (Markdown)</Label>
            <Textarea value={form.longDesc} onChange={(e) => setForm({ ...form, longDesc: e.target.value })} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (séparés par virgule)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="react, web, design" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de réalisation</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Liens (format: Label|URL, un par ligne)</Label>
            <Textarea
              value={form.links}
              onChange={(e) => setForm({ ...form, links: e.target.value })}
              rows={3}
              placeholder={"GitHub|https://github.com/...\nDémo|https://..."}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Images (URLs, une par ligne)</Label>
            <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
