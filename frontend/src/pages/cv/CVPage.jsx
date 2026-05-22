import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, Loader2, ExternalLink, X, Zap,
  GraduationCap, MapPin, Calendar, Mail, Phone,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";

function formatDateRange(startDate, endDate, current) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : null;
  const start = fmt(startDate);
  const end = current ? "Aujourd'hui" : fmt(endDate);
  if (!start && !end) return null;
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CVPage() {
  const qc = useQueryClient();
  const { isEditor } = usePermissions();
  const { toast } = useToast();
  const [profileDialog, setProfileDialog] = useState(false);
  const [formationDialog, setFormationDialog] = useState({ open: false, editing: null });

  const { data, isLoading } = useQuery({
    queryKey: ["cv"],
    queryFn: () => cvApi.get().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => cvApi.deleteFormation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cv"] });
      toast({ title: "Formation supprimée" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  const profile = data?.profile;
  const formations = data?.formations || [];
  const categories = [...new Set(formations.map((f) => f.category).filter(Boolean))];
  const hasProfile = !!(profile?.name);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap size={22} /> CV / Dossier technique
        </h1>
        {isEditor && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setProfileDialog(true)}>
              <Pencil size={14} /> {hasProfile ? "Modifier le profil" : "Configurer le profil"}
            </Button>
            <Button size="sm" onClick={() => setFormationDialog({ open: true, editing: null })}>
              <Plus size={14} /> Ajouter une formation
            </Button>
          </div>
        )}
      </div>

      {/* Profile */}
      {hasProfile && (
        <div className="flex flex-col sm:flex-row gap-6 items-start border border-border rounded-xl p-6">
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-border shrink-0"
            />
          )}
          <div className="flex-1 space-y-2 min-w-0">
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              {profile.title && <p className="text-lg text-primary font-medium">{profile.title}</p>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.email && (
                <span className="flex items-center gap-1"><Mail size={13} /> {profile.email}</span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1"><Phone size={13} /> {profile.phone}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>
              )}
            </div>
            {profile.bio && (
              <p className="text-muted-foreground leading-relaxed text-sm">{profile.bio}</p>
            )}
            {profile.links?.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {profile.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink size={12} /> {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile?.skills?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap size={18} className="text-primary" /> Compétences techniques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.skills.map((cat) => (
              <div key={cat.category} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat.category}
                </h3>
                {cat.items.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground text-xs">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap size={18} className="text-primary" /> Formations & Certifications
        </h2>

        {formations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            {isEditor ? (
              <p>Aucune formation. Cliquez sur "Ajouter une formation" pour commencer.</p>
            ) : (
              <p>Aucune formation disponible.</p>
            )}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                  {cat}
                </h3>
                {formations.filter((f) => f.category === cat).map((f) => (
                  <FormationCard key={f.id} formation={f} isEditor={isEditor}
                    onEdit={() => setFormationDialog({ open: true, editing: f })}
                    onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
                  />
                ))}
              </div>
            ))}
            {formations.filter((f) => !f.category).map((f) => (
              <FormationCard key={f.id} formation={f} isEditor={isEditor}
                onEdit={() => setFormationDialog({ open: true, editing: f })}
                onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {formations.map((f) => (
              <FormationCard key={f.id} formation={f} isEditor={isEditor}
                onEdit={() => setFormationDialog({ open: true, editing: f })}
                onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
              />
            ))}
          </div>
        )}
      </div>

      {profileDialog && (
        <CVProfileDialog
          profile={profile}
          onClose={() => setProfileDialog(false)}
        />
      )}

      <FormationDialog
        open={formationDialog.open}
        editing={formationDialog.editing}
        onOpenChange={(open) => setFormationDialog({ open, editing: null })}
      />
    </div>
  );
}

// ─── Formation card ───────────────────────────────────────────────────────────

function FormationCard({ formation, isEditor, onEdit, onDelete }) {
  const dateRange = formatDateRange(formation.startDate, formation.endDate, formation.current);

  return (
    <Card className="group hover:border-primary/40 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="font-semibold">{formation.title}</span>
              {formation.current && (
                <Badge variant="outline" className="text-xs text-primary border-primary">En cours</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{formation.institution}</span>
              {formation.location && (
                <span className="flex items-center gap-1"><MapPin size={12} /> {formation.location}</span>
              )}
              {dateRange && (
                <span className="flex items-center gap-1"><Calendar size={12} /> {dateRange}</span>
              )}
            </div>
            {formation.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{formation.description}</p>
            )}
          </div>
          {isEditor && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil size={12} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
                <Trash2 size={12} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Formation dialog ─────────────────────────────────────────────────────────

function FormationDialog({ open, editing, onOpenChange }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", institution: "", location: "", startDate: "",
    endDate: "", current: false, description: "", category: "",
    visibility: "viewer",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        institution: editing.institution,
        location: editing.location || "",
        startDate: editing.startDate ? editing.startDate.split("T")[0] : "",
        endDate: editing.endDate ? editing.endDate.split("T")[0] : "",
        current: editing.current,
        description: editing.description || "",
        category: editing.category || "",
        visibility: editing.visibility,
      });
    } else {
      setForm({ title: "", institution: "", location: "", startDate: "", endDate: "", current: false, description: "", category: "", visibility: "viewer" });
    }
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? cvApi.updateFormation(editing.id, data)
      : cvApi.createFormation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cv"] });
      toast({ title: editing ? "Formation mise à jour" : "Formation ajoutée" });
      onOpenChange(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.current ? undefined : (form.endDate || undefined),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier la formation" : "Ajouter une formation"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Titre / Diplôme *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                placeholder="Ex : Master Informatique, RNCP niveau 6…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Établissement *</Label>
              <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required
                placeholder="École, université…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lieu</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Paris, France" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de début</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de fin</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                disabled={form.current} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="current"
              checked={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.checked, endDate: "" })}
              className="w-4 h-4 rounded border-border"
            />
            <Label htmlFor="current" className="text-sm cursor-pointer">En cours</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Catégorie</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Diplôme, Certification…" />
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
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Options, spécialité, mention…" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CV Profile dialog ────────────────────────────────────────────────────────

function CVProfileDialog({ profile, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: profile?.name || "",
    title: profile?.title || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
    links: profile?.links || [],
    skills: profile?.skills || [],
    visibility: profile?.visibility || "viewer",
  });

  const mutation = useMutation({
    mutationFn: (data) => cvApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cv"] });
      toast({ title: "Profil mis à jour" });
      onClose();
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function addLink() { setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] })); }
  function updateLink(i, k, v) { setForm((f) => { const l = [...f.links]; l[i] = { ...l[i], [k]: v }; return { ...f, links: l }; }); }
  function removeLink(i) { setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) })); }

  function addCat() { setForm((f) => ({ ...f, skills: [...f.skills, { category: "", items: [] }] })); }
  function updateCat(i, v) { setForm((f) => { const s = [...f.skills]; s[i] = { ...s[i], category: v }; return { ...f, skills: s }; }); }
  function removeCat(i) { setForm((f) => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) })); }
  function addSkill(ci) { setForm((f) => { const s = [...f.skills]; s[ci] = { ...s[ci], items: [...s[ci].items, { name: "", level: 80 }] }; return { ...f, skills: s }; }); }
  function updateSkill(ci, si, k, v) {
    setForm((f) => {
      const s = [...f.skills]; const it = [...s[ci].items];
      it[si] = { ...it[si], [k]: k === "level" ? Number(v) : v };
      s[ci] = { ...s[ci], items: it }; return { ...f, skills: s };
    });
  }
  function removeSkill(ci, si) { setForm((f) => { const s = [...f.skills]; s[ci] = { ...s[ci], items: s[ci].items.filter((_, i) => i !== si) }; return { ...f, skills: s }; }); }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Profil CV</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Nom complet</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Titre professionnel</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Développeur Full-Stack" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Localisation</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Paris, France" /></div>
            <div className="space-y-1.5"><Label>URL avatar</Label><Input value={form.avatar} onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))} placeholder="https://..." /></div>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Visibilité</Label>
            <Select value={form.visibility} onValueChange={(v) => setForm((f) => ({ ...f, visibility: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Privé (connectés)</SelectItem>
                <SelectItem value="public">Public (tout le monde)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Liens</Label><Button type="button" variant="outline" size="sm" onClick={addLink}><Plus size={13} /> Ajouter</Button></div>
            {form.links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="GitHub" className="w-28" />
                <Input value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://..." className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><X size={14} /></Button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label>Compétences</Label><Button type="button" variant="outline" size="sm" onClick={addCat}><Plus size={13} /> Catégorie</Button></div>
            {form.skills.map((cat, ci) => (
              <div key={ci} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex gap-2"><Input value={cat.category} onChange={(e) => updateCat(ci, e.target.value)} placeholder="Ex: Frontend" className="flex-1" /><Button type="button" variant="ghost" size="icon" onClick={() => removeCat(ci)}><X size={14} /></Button></div>
                {cat.items.map((sk, si) => (
                  <div key={si} className="flex items-center gap-2 pl-2">
                    <Input value={sk.name} onChange={(e) => updateSkill(ci, si, "name", e.target.value)} placeholder="Compétence" className="flex-1" />
                    <Input type="number" value={sk.level} onChange={(e) => updateSkill(ci, si, "level", e.target.value)} min={0} max={100} className="w-16 text-center" />
                    <span className="text-xs text-muted-foreground">%</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(ci, si)}><X size={14} /></Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" className="ml-2 text-xs h-7" onClick={() => addSkill(ci)}><Plus size={12} /> Ajouter</Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 size={14} className="animate-spin" />}Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
