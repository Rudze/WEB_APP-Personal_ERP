import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Loader2, ExternalLink, X, Zap,
  GraduationCap, MapPin, Calendar, Mail, Phone, User,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

function formatDateRange(startDate, endDate, current) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : null;
  const start = fmt(startDate);
  const end = current ? "Aujourd'hui" : fmt(endDate);
  if (!start && !end) return null;
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

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

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );

  const profile = data?.profile;
  const formations = data?.formations || [];
  const categories = [...new Set(formations.map((f) => f.category).filter(Boolean))];
  const hasProfile = !!(profile?.name);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight page-header-title gradient-text-portfolio">
            Curriculum Vitae
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Profil et formations</p>
        </div>
        {isEditor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/50 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => setProfileDialog(true)}
            >
              <Pencil size={13} /> {hasProfile ? "Modifier le profil" : "Configurer le profil"}
            </Button>
            <Button size="sm" className="gap-1.5 glow-primary-sm" onClick={() => setFormationDialog({ open: true, editing: null })}>
              <Plus size={13} /> Formation
            </Button>
          </div>
        )}
      </div>

      {/* Profile card */}
      {hasProfile && (
        <div className="card-surface p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {profile.avatar ? (
              <div className="shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/25 shadow-lg"
                  style={{ boxShadow: "0 0 0 4px hsl(var(--border) / 0.4), var(--shadow-2)" }}
                />
              </div>
            ) : (
              <div className="icon-box-erp w-20 h-20 rounded-2xl shrink-0">
                <User size={30} className="text-primary" />
              </div>
            )}
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <h2 className="text-2xl font-bold gradient-text-portfolio">{profile.name}</h2>
                {profile.title && (
                  <p className="text-sm text-primary font-medium mt-0.5">{profile.title}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {profile.email && (
                  <span className="flex items-center gap-1.5"><Mail size={12} /> {profile.email}</span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1.5"><Phone size={12} /> {profile.phone}</span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {profile.location}</span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}
              {profile.links?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {profile.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={11} /> {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {profile?.skills?.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2 section-title">
            <Zap size={16} className="text-primary shrink-0" /> Compétences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.skills.map((cat) => (
              <div key={cat.category} className="card-surface p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{cat.category}</h3>
                <div className="space-y-3">
                  {cat.items.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-foreground/90">{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="skill-progress-bg">
                        <div className="skill-progress-fill" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formations */}
      <div className="space-y-5">
        <h2 className="text-lg font-bold flex items-center gap-2 section-title">
          <GraduationCap size={16} className="text-primary shrink-0" /> Formations & Certifications
        </h2>

        {formations.length === 0 ? (
          <div className="card-surface empty-state">
            <div className="icon-box-erp w-14 h-14">
              <GraduationCap size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground/90">Aucune formation</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditor ? 'Cliquez sur "Formation" pour ajouter.' : "Aucune formation disponible."}
              </p>
            </div>
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">{cat}</h3>
                <div className="timeline-erp">
                  {formations.filter((f) => f.category === cat).map((f) => (
                    <div key={f.id} className="timeline-erp-item">
                      <FormationCard
                        formation={f}
                        isEditor={isEditor}
                        onEdit={() => setFormationDialog({ open: true, editing: f })}
                        onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {formations.filter((f) => !f.category).length > 0 && (
              <div className="timeline-erp">
                {formations.filter((f) => !f.category).map((f) => (
                  <div key={f.id} className="timeline-erp-item">
                    <FormationCard
                      formation={f}
                      isEditor={isEditor}
                      onEdit={() => setFormationDialog({ open: true, editing: f })}
                      onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="timeline-erp">
            {formations.map((f) => (
              <div key={f.id} className="timeline-erp-item">
                <FormationCard
                  formation={f}
                  isEditor={isEditor}
                  onEdit={() => setFormationDialog({ open: true, editing: f })}
                  onDelete={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(f.id); }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {profileDialog && (
        <CVProfileDialog profile={profile} onClose={() => setProfileDialog(false)} />
      )}

      <FormationDialog
        open={formationDialog.open}
        editing={formationDialog.editing}
        onOpenChange={(open) => setFormationDialog({ open, editing: null })}
      />
    </div>
  );
}

function FormationCard({ formation, isEditor, onEdit, onDelete }) {
  const dateRange = formatDateRange(formation.startDate, formation.endDate, formation.current);

  return (
    <div className="card-surface p-5 group hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground/90">{formation.title}</span>
            {formation.current && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                En cours
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{formation.institution}</span>
            {formation.location && (
              <span className="flex items-center gap-1"><MapPin size={11} /> {formation.location}</span>
            )}
            {dateRange && (
              <span className="flex items-center gap-1"><Calendar size={11} /> {dateRange}</span>
            )}
          </div>
          {formation.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{formation.description}</p>
          )}
        </div>
        {isEditor && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
              onClick={onEdit}
            >
              <Pencil size={12} />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              onClick={onDelete}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FormationDialog({ open, editing, onOpenChange }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", institution: "", location: "", startDate: "",
    endDate: "", current: false, description: "", category: "", visibility: "viewer",
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
    mutationFn: (data) => editing ? cvApi.updateFormation(editing.id, data) : cvApi.createFormation(data),
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
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Ex : Master Informatique…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Établissement *</Label>
              <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required placeholder="École, université…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lieu</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Paris, France" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de début</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de fin</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="current" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked, endDate: "" })} className="w-4 h-4 rounded border-border" />
            <Label htmlFor="current" className="text-sm cursor-pointer">En cours</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Catégorie</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Diplôme, Certification…" />
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
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Options, spécialité, mention…" />
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
          <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} /></div>
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
              <div key={ci} className="border border-border/50 rounded-xl p-3 space-y-2 bg-muted/20">
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
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 size={14} className="animate-spin" />} Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
