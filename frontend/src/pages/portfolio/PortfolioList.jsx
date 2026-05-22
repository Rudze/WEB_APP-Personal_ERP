import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Trash2, Loader2, Pencil } from "lucide-react";
import { slugify, formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";

export function PortfolioList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", visibility: "admin" });

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: () => portfolioApi.list().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => editing ? portfolioApi.update(editing.id, data) : portfolioApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolios"] });
      toast({ title: editing ? "Portfolio mis à jour" : "Portfolio créé" });
      setOpen(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolios"] });
      toast({ title: "Portfolio supprimé" });
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: "", slug: "", description: "", visibility: "admin" });
    setOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, description: p.description || "", visibility: p.visibility });
    setOpen(true);
  }

  function handleTitleChange(title) {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Portfolios</h2>
        {isAdmin && (
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} /> Nouveau portfolio
          </Button>
        )}
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => navigate(`/portfolio/${p.slug}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  {isAdmin && (
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(p.id); }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
                {p.description && <CardDescription className="text-xs">{p.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le portfolio" : "Nouveau portfolio"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} pattern="[a-z0-9-]+" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (visiteurs)</SelectItem>
                  <SelectItem value="viewer">Connectés</SelectItem>
                  <SelectItem value="editor">Éditeurs</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
