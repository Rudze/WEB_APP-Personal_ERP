import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Trash2, Loader2, Pencil, ExternalLink, Github } from "lucide-react";
import { slugify, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";

export function PortfolioList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isEditor, isAdmin } = usePermissions();
  const { toast } = useToast();
  const [dialog, setDialog] = useState({ open: false, editing: null });
  const [filterCategory, setFilterCategory] = useState("");

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: () => portfolioApi.list().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      dialog.editing
        ? portfolioApi.update(dialog.editing.id, data)
        : portfolioApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolios"] });
      toast({ title: dialog.editing ? "Projet mis à jour" : "Projet créé" });
      setDialog({ open: false, editing: null });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolios"] });
      toast({ title: "Projet supprimé" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  const categories = [...new Set(portfolios.map((p) => p.category).filter(Boolean))];
  const filtered = filterCategory ? portfolios.filter((p) => p.category === filterCategory) : portfolios;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        {isEditor && (
          <Button size="sm" onClick={() => setDialog({ open: true, editing: null })}>
            <Plus size={16} /> Nouveau projet
          </Button>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${!filterCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat === filterCategory ? "" : cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterCategory === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{isEditor ? 'Aucun projet. Cliquez sur "Nouveau projet" pour commencer.' : "Aucun projet disponible."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
              onClick={() => navigate(`/portfolio/${p.slug}`)}
            >
              {p.imageUrl && (
                <div className="h-40 overflow-hidden bg-muted">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    {p.category && (
                      <span className="text-xs text-primary font-medium">{p.category}</span>
                    )}
                    <CardTitle className="text-base leading-tight">{p.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                    {isEditor && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setDialog({ open: true, editing: p })}>
                          <Pencil size={12} />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => { if (confirm("Supprimer ce projet ?")) deleteMutation.mutate(p.id); }}>
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {p.authorName && <span>{p.authorName}</span>}
                  {p.date && <span>{formatDate(p.date)}</span>}
                </div>
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
                {(p.webLink || p.gitLink) && (
                  <div className="flex gap-3 pt-1">
                    {p.webLink && (
                      <a href={p.webLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={11} /> Démo
                      </a>
                    )}
                    {p.gitLink && (
                      <a href={p.gitLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                        onClick={(e) => e.stopPropagation()}>
                        <Github size={11} /> Code
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PortfolioFormDialog
        open={dialog.open}
        editing={dialog.editing}
        onOpenChange={(open) => setDialog({ open, editing: null })}
        onSave={(data) => saveMutation.mutate(data)}
        isPending={saveMutation.isPending}
      />
    </div>
  );
}

function PortfolioFormDialog({ open, editing, onOpenChange, onSave, isPending }) {
  const [form, setForm] = useState({
    title: "", slug: "", description: "", category: "", authorName: "",
    date: "", status: "termine", imageUrl: "", webLink: "", gitLink: "",
    tags: "", visibility: "viewer",
  });

  useState(() => {
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        description: editing.description || "",
        category: editing.category || "",
        authorName: editing.authorName || "",
        date: editing.date ? editing.date.split("T")[0] : "",
        status: editing.status,
        imageUrl: editing.imageUrl || "",
        webLink: editing.webLink || "",
        gitLink: editing.gitLink || "",
        tags: editing.tags?.join(", ") || "",
        visibility: editing.visibility,
      });
    } else {
      setForm({ title: "", slug: "", description: "", category: "", authorName: "", date: "", status: "termine", imageUrl: "", webLink: "", gitLink: "", tags: "", visibility: "viewer" });
    }
  }, [editing]);

  function handleTitleChange(title) {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      date: form.date || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Titre *</Label>
              <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug *</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} pattern="[a-z0-9-]+" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Catégorie</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web, Mobile, DevOps…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Auteur</Label>
              <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} placeholder="Prénom Nom" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
            <div className="space-y-1.5">
              <Label className="text-xs">Visibilité</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Privé (connectés)</SelectItem>
                  <SelectItem value="public">Public (tout le monde)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Image d'illustration (URL)</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Lien web / démo</Label>
              <Input value={form.webLink} onChange={(e) => setForm({ ...form, webLink: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lien GitHub / Git</Label>
              <Input value={form.gitLink} onChange={(e) => setForm({ ...form, gitLink: e.target.value })} placeholder="https://github.com/..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tags (séparés par virgule)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Node.js, Docker…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
