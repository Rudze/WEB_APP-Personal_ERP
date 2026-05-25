import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioApi, uploadApi } from "@/lib/api";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Pencil, ExternalLink, Github, ImagePlus, X, Eye, Briefcase } from "lucide-react";
import { slugify, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function PortfolioList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isEditor, isAdmin } = usePermissions();
  const { toast } = useToast();
  const [dialog, setDialog] = useState({ open: false, editing: null });
  const [filterCategory, setFilterCategory] = useState("");
  useScrollReveal();

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: () => portfolioApi.list().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      dialog.editing ? portfolioApi.update(dialog.editing.id, data) : portfolioApi.create(data),
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

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight page-header-title gradient-text-portfolio">
            Portfolio
          </h2>
          <p className="text-sm text-muted-foreground mt-2">{filtered.length} projet{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {isEditor && (
          <Button size="sm" className="gap-1.5 glow-primary-sm" onClick={() => setDialog({ open: true, editing: null })}>
            <Plus size={14} /> Nouveau projet
          </Button>
        )}
      </div>

      {/* Filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["", ...categories].map((cat) => (
            <button
              key={cat || "_all"}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "filter-pill",
                (!cat && !filterCategory) || filterCategory === cat
                  ? "filter-pill-active"
                  : "filter-pill-inactive"
              )}
            >
              {cat || "Tous"}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card-surface empty-state">
          <div className="icon-box-erp w-16 h-16">
            <Briefcase size={26} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground/90">Aucun projet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditor ? 'Cliquez sur "Nouveau projet" pour commencer.' : "Aucun projet disponible."}
            </p>
          </div>
          {isEditor && (
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:bg-primary/5" onClick={() => setDialog({ open: true, editing: null })}>
              <Plus size={14} /> Nouveau projet
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className={cn("project-card card-surface feature-card group cursor-pointer overflow-hidden", `reveal reveal-delay-${Math.min(i + 1, 5)}`)}
              onClick={() => navigate(`/portfolio/${p.slug}`)}
            >
              {/* Image with hover overlay */}
              {p.imageUrl ? (
                <div className="project-img-wrap relative h-44 overflow-hidden rounded-t-[13px]">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary/90 rounded-xl p-3 shadow-lg">
                      <Eye size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-28 rounded-t-[13px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border/20">
                  <Briefcase size={28} className="text-primary/40" />
                </div>
              )}

              <div className="p-5">
                {/* Category + edit actions */}
                <div className="flex items-center justify-between mb-1.5">
                  {p.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{p.category}</span>
                  )}
                  <div className="ml-auto flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                    {isEditor && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setDialog({ open: true, editing: p })}
                        >
                          <Pencil size={11} />
                        </button>
                        {isAdmin && (
                          <button
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => { if (confirm("Supprimer ce projet ?")) deleteMutation.mutate(p.id); }}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-foreground/90 group-hover:text-primary transition-colors leading-snug mb-1.5">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
                )}

                {/* Tags */}
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-muted/60 rounded-md text-[10px] text-muted-foreground font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                  {p.date ? <span>{formatDate(p.date)}</span> : <span />}
                  <div className="flex gap-3">
                    {p.webLink && (
                      <a href={p.webLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={10} /> Démo
                      </a>
                    )}
                    {p.gitLink && (
                      <a href={p.gitLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}>
                        <Github size={10} /> Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", slug: "", description: "", category: "", authorName: "",
    date: "", status: "termine", imageUrl: "", webLink: "", gitLink: "",
    tags: "", visibility: "viewer",
  });

  useEffect(() => {
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.image(file);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

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
            <Label className="text-xs">Image d'illustration</Label>
            <div className="flex gap-2">
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL ou cliquez sur Importer" className="flex-1" />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Importer
              </Button>
              {form.imageUrl && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, imageUrl: "" })}><X size={14} /></Button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Aperçu" className="mt-2 h-28 w-full object-cover rounded-lg border border-border" />
            )}
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
