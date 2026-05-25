import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { formatDate, ROLE_LABELS } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const ROLE_COLORS = {
  admin:  "bg-purple-500/15 text-purple-300 border-purple-500/25",
  editor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  viewer: "bg-muted text-muted-foreground border-border/40",
};

export function UsersManagement() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer", active: true });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Utilisateur créé" });
      setOpen(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Utilisateur mis à jour" });
      setOpen(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Utilisateur supprimé" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "viewer", active: true });
    setOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, active: user.active });
    setOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight page-header-title gradient-text-portfolio">
            Utilisateurs
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {users.length} compte{users.length !== 1 ? "s" : ""} enregistré{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" className="gap-1.5 glow-primary-sm" onClick={openCreate}>
          <Plus size={14} /> Nouvel utilisateur
        </Button>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="table-erp">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-foreground/90">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{user.email}</td>
                  <td>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${user.active ? "text-green-400" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-green-400" : "bg-muted-foreground"}`} />
                      {user.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil size={13} />
                      </button>
                      {user.id !== me?.id && (
                        <button
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            if (confirm(`Supprimer ${user.name} ?`)) deleteMutation.mutate(user.id);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{editing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Lecteur</SelectItem>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="active" />
              <Label htmlFor="active">Compte actif</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
