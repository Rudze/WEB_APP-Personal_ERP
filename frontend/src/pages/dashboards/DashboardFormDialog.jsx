import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const ROLES = ["viewer", "editor", "admin"];

export function DashboardFormDialog({ open, onOpenChange, editing }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", slug: "", description: "", roles: ["admin"] });

  useEffect(() => {
    if (editing) {
      setForm({ title: editing.title, slug: editing.slug, description: editing.description || "", roles: editing.roles });
    } else {
      setForm({ title: "", slug: "", description: "", roles: ["admin"] });
    }
  }, [editing, open]);

  const mutation = useMutation({
    mutationFn: (data) => editing ? dashboardsApi.update(editing.id, data) : dashboardsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboards"] });
      toast({ title: editing ? "Dashboard mis à jour" : "Dashboard créé" });
      onOpenChange(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function handleTitleChange(title) {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
  }

  function toggleRole(role) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le dashboard" : "Nouveau dashboard"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              pattern="[a-z0-9-]+"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Rôles ayant accès</Label>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.roles.includes(role)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending || form.roles.length === 0}>
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
