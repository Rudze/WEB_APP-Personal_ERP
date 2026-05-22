import { useState, useEffect } from "react";
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
import {
  Plus, Pencil, Trash2, Loader2, ExternalLink, ArrowLeft, X, Zap, User,
} from "lucide-react";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Main view ────────────────────────────────────────────────────────────────

export function PortfolioView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isEditor } = usePermissions();
  const { toast } = useToast();
  const [entryDialog, setEntryDialog] = useState({ open: false, editing: null });
  const [profileDialog, setProfileDialog] = useState(false);
  const [filterTag, setFilterTag] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

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

  const hasCVProfile = !!portfolio.profileName;
  const hasSkills = Array.isArray(portfolio.skills) && portfolio.skills.length > 0;
  const entries = portfolio.entries || [];

  const allTags = [...new Set(entries.flatMap((e) => e.tags))];
  const allCategories = [...new Set(entries.map((e) => e.category).filter(Boolean))];

  let filtered = entries;
  if (filterTag) filtered = filtered.filter((e) => e.tags.includes(filterTag));
  if (filterCategory) filtered = filtered.filter((e) => e.category === filterCategory);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Back + actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/portfolio")}>
          <ArrowLeft size={14} />
        </Button>
        {!hasCVProfile && (
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{portfolio.title}</h2>
            {portfolio.description && <p className="text-sm text-muted-foreground">{portfolio.description}</p>}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {isEditor && !hasCVProfile && (
            <Button variant="outline" size="sm" onClick={() => setProfileDialog(true)}>
              <User size={14} /> Configurer profil CV
            </Button>
          )}
          {isEditor && (
            <Button size="sm" onClick={() => setEntryDialog({ open: true, editing: null })}>
              <Plus size={14} /> Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* CV Profile hero */}
      {hasCVProfile && (
        <CVHero
          portfolio={portfolio}
          isEditor={isEditor}
          onEdit={() => setProfileDialog(true)}
        />
      )}

      {/* Skills */}
      {hasSkills && <SkillsSection skills={portfolio.skills} />}

      {/* Filters */}
      {(allTags.length > 0 || allCategories.length > 0) && (
        <div className="space-y-2">
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory("")}
                className={`px-3 py-1 rounded-full text-sm border transition-colors font-medium ${!filterCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
              >
                Tous
              </button>
              {allCategories.map((cat) => (
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
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? "" : tag)}
                  className={`px-2 py-0.5 rounded text-xs border transition-colors ${filterTag === tag ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune entrée.</div>
      ) : allCategories.length > 0 && !filterCategory ? (
        <div className="space-y-8">
          {allCategories.map((cat) => {
            const catEntries = filtered.filter((e) => e.category === cat);
            if (catEntries.length === 0) return null;
            return (
              <div key={cat} className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">{cat}</h2>
                <EntriesGrid
                  entries={catEntries}
                  isEditor={isEditor}
                  onEdit={(e) => setEntryDialog({ open: true, editing: e })}
                  onDelete={(id) => { if (confirm("Supprimer ?")) deleteMutation.mutate(id); }}
                />
              </div>
            );
          })}
          {filtered.filter((e) => !e.category).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2 text-muted-foreground">Autres</h2>
              <EntriesGrid
                entries={filtered.filter((e) => !e.category)}
                isEditor={isEditor}
                onEdit={(e) => setEntryDialog({ open: true, editing: e })}
                onDelete={(id) => { if (confirm("Supprimer ?")) deleteMutation.mutate(id); }}
              />
            </div>
          )}
        </div>
      ) : (
        <EntriesGrid
          entries={filtered}
          isEditor={isEditor}
          onEdit={(e) => setEntryDialog({ open: true, editing: e })}
          onDelete={(id) => { if (confirm("Supprimer ?")) deleteMutation.mutate(id); }}
        />
      )}

      <EntryFormDialog
        open={entryDialog.open}
        onOpenChange={(open) => setEntryDialog({ open, editing: null })}
        portfolioId={portfolio.id}
        editing={entryDialog.editing}
        portfolioSlug={slug}
      />

      {profileDialog && (
        <PortfolioProfileDialog
          portfolio={portfolio}
          portfolioSlug={slug}
          onClose={() => setProfileDialog(false)}
        />
      )}
    </div>
  );
}

// ─── CV Hero ──────────────────────────────────────────────────────────────────

function CVHero({ portfolio, isEditor, onEdit }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start py-4">
      {portfolio.profileAvatar && (
        <img
          src={portfolio.profileAvatar}
          alt={portfolio.profileName}
          className="w-28 h-28 rounded-full object-cover border-2 border-border shrink-0"
        />
      )}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{portfolio.profileName}</h1>
            {portfolio.profileTitle && (
              <p className="text-lg text-primary font-medium mt-0.5">{portfolio.profileTitle}</p>
            )}
          </div>
          {isEditor && (
            <Button variant="outline" size="sm" className="shrink-0" onClick={onEdit}>
              <Pencil size={14} /> Modifier le profil
            </Button>
          )}
        </div>
        {portfolio.profileBio && (
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{portfolio.profileBio}</p>
        )}
        {portfolio.profileLinks?.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {portfolio.profileLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink size={13} /> {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function SkillsSection({ skills }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Zap size={18} className="text-primary" /> Compétences
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((cat) => (
          <div key={cat.category} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {cat.category}
            </h3>
            <div className="space-y-2.5">
              {cat.items.map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground text-xs">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Entries grid ─────────────────────────────────────────────────────────────

function EntriesGrid({ entries, isEditor, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} isEditor={isEditor} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function EntryCard({ entry, isEditor, onEdit, onDelete }) {
  return (
    <Card className="group hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base leading-tight">{entry.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{entry.shortDesc}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[entry.status]}`}>
              {STATUS_LABELS[entry.status]}
            </span>
            {isEditor && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(entry)}>
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onDelete(entry.id)}
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
            {entry.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
        {entry.longDesc && (
          <div className="prose prose-xs dark:prose-invert max-w-none text-sm line-clamp-3">
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
  );
}

// ─── Entry form dialog ────────────────────────────────────────────────────────

function EntryFormDialog({ open, onOpenChange, portfolioId, editing, portfolioSlug }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", shortDesc: "", longDesc: "", category: "",
    tags: "", images: "", links: "", status: "termine", date: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        shortDesc: editing.shortDesc,
        longDesc: editing.longDesc || "",
        category: editing.category || "",
        tags: editing.tags.join(", "),
        images: editing.images.join("\n"),
        links: editing.links.map((l) => `${l.label}|${l.url}`).join("\n"),
        status: editing.status,
        date: editing.date ? editing.date.split("T")[0] : "",
      });
    } else {
      setForm({ title: "", shortDesc: "", longDesc: "", category: "", tags: "", images: "", links: "", status: "termine", date: "" });
    }
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (data) =>
      editing
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
      category: form.category || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
      links: form.links.split("\n").filter(Boolean).map((l) => {
        const [label, ...rest] = l.split("|");
        return { label: label.trim(), url: rest.join("|").trim() };
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Description courte</Label>
              <Input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Catégorie</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Web, Mobile…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description longue (Markdown)</Label>
            <Textarea value={form.longDesc} onChange={(e) => setForm({ ...form, longDesc: e.target.value })} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (virgule)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="react, web" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Liens (Label|URL, un par ligne)</Label>
            <Textarea
              value={form.links}
              onChange={(e) => setForm({ ...form, links: e.target.value })}
              rows={3}
              placeholder={"GitHub|https://github.com/...\nDémo|https://..."}
            />
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

// ─── CV Profile dialog ────────────────────────────────────────────────────────

function PortfolioProfileDialog({ portfolio, portfolioSlug, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    profileName: portfolio.profileName || "",
    profileTitle: portfolio.profileTitle || "",
    profileBio: portfolio.profileBio || "",
    profileAvatar: portfolio.profileAvatar || "",
    profileLinks: portfolio.profileLinks || [],
    skills: portfolio.skills || [],
  });

  const mutation = useMutation({
    mutationFn: (data) => portfolioApi.update(portfolio.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio", portfolioSlug] });
      toast({ title: "Profil CV mis à jour" });
      onClose();
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function addLink() {
    setForm((f) => ({ ...f, profileLinks: [...f.profileLinks, { label: "", url: "" }] }));
  }
  function updateLink(i, field, value) {
    setForm((f) => {
      const links = [...f.profileLinks];
      links[i] = { ...links[i], [field]: value };
      return { ...f, profileLinks: links };
    });
  }
  function removeLink(i) {
    setForm((f) => ({ ...f, profileLinks: f.profileLinks.filter((_, idx) => idx !== i) }));
  }

  function addCategory() {
    setForm((f) => ({ ...f, skills: [...f.skills, { category: "", items: [] }] }));
  }
  function updateCategory(i, value) {
    setForm((f) => {
      const skills = [...f.skills];
      skills[i] = { ...skills[i], category: value };
      return { ...f, skills };
    });
  }
  function removeCategory(i) {
    setForm((f) => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));
  }
  function addSkill(ci) {
    setForm((f) => {
      const skills = [...f.skills];
      skills[ci] = { ...skills[ci], items: [...skills[ci].items, { name: "", level: 80 }] };
      return { ...f, skills };
    });
  }
  function updateSkill(ci, si, field, value) {
    setForm((f) => {
      const skills = [...f.skills];
      const items = [...skills[ci].items];
      items[si] = { ...items[si], [field]: field === "level" ? Number(value) : value };
      skills[ci] = { ...skills[ci], items };
      return { ...f, skills };
    });
  }
  function removeSkill(ci, si) {
    setForm((f) => {
      const skills = [...f.skills];
      skills[ci] = { ...skills[ci], items: skills[ci].items.filter((_, i) => i !== si) };
      return { ...f, skills };
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil CV</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nom complet</Label>
              <Input
                value={form.profileName}
                onChange={(e) => setForm((f) => ({ ...f, profileName: e.target.value }))}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Titre professionnel</Label>
              <Input
                value={form.profileTitle}
                onChange={(e) => setForm((f) => ({ ...f, profileTitle: e.target.value }))}
                placeholder="Développeur Full-Stack"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>URL de l'avatar</Label>
            <Input
              value={form.profileAvatar}
              onChange={(e) => setForm((f) => ({ ...f, profileAvatar: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Bio / Présentation</Label>
            <Textarea
              value={form.profileBio}
              onChange={(e) => setForm((f) => ({ ...f, profileBio: e.target.value }))}
              rows={3}
              placeholder="Quelques lignes sur vous…"
            />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Liens / Réseaux</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus size={13} /> Ajouter
              </Button>
            </div>
            {form.profileLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="GitHub"
                  className="w-28"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}>
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Compétences</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                <Plus size={13} /> Catégorie
              </Button>
            </div>
            {form.skills.map((cat, ci) => (
              <div key={ci} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={cat.category}
                    onChange={(e) => updateCategory(ci, e.target.value)}
                    placeholder="Ex: Frontend"
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(ci)}>
                    <X size={14} />
                  </Button>
                </div>
                {cat.items.map((skill, si) => (
                  <div key={si} className="flex items-center gap-2 pl-2">
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(ci, si, "name", e.target.value)}
                      placeholder="Compétence"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={skill.level}
                      onChange={(e) => updateSkill(ci, si, "level", e.target.value)}
                      min={0}
                      max={100}
                      className="w-16 text-center"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(ci, si)}>
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-xs h-7"
                  onClick={() => addSkill(ci)}
                >
                  <Plus size={12} /> Ajouter une compétence
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
