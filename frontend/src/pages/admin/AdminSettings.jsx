import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Loader2, Save, Settings, X, Globe, Layout } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─── General settings tab ─────────────────────────────────── */
function GeneralTab({ settings }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const { appName, logoUrl, defaultTheme, primaryColor, language, modules, publicModules } = data;
      return adminApi.updateSettings({ appName, logoUrl, defaultTheme, primaryColor, language, modules, publicModules });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["public-config"] });
      toast({ title: "Paramètres sauvegardés" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.image(file);
      setForm((f) => ({ ...f, logoUrl: data.url }));
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!form) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Général */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Général</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nom de l'application</Label>
            <Input value={form.appName || ""} onChange={(e) => setForm({ ...form, appName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Langue</Label>
            <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Thème par défaut</Label>
            <Select value={form.defaultTheme} onValueChange={(v) => setForm({ ...form, defaultTheme: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="light">Clair</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Couleur primaire</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.primaryColor || "#6366f1"}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent"
              />
              <Input
                value={form.primaryColor || ""}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Logo</Label>
          <div className="flex gap-2 flex-wrap">
            <Input
              value={form.logoUrl || ""}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value || null })}
              placeholder="URL ou cliquez sur Importer"
              className="flex-1 min-w-0"
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              Importer
            </Button>
            {form.logoUrl && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, logoUrl: null })}>
                <X size={14} />
              </Button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          {form.logoUrl && (
            <img src={form.logoUrl} alt="Aperçu logo" className="mt-1 h-14 object-contain rounded-lg border border-border bg-muted/30 p-2" />
          )}
        </div>
      </section>

      {/* Modules actifs */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Modules actifs</h3>
        <div className="space-y-3">
          {Object.entries(form.modules || {}).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <Label className="capitalize text-sm">{key}</Label>
              <Switch checked={enabled} onCheckedChange={(v) => setForm({ ...form, modules: { ...form.modules, [key]: v } })} />
            </div>
          ))}
        </div>
      </section>

      {/* Accès public */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Accès public</h3>
          <p className="text-xs text-muted-foreground mt-1">Modules visibles pour les visiteurs non connectés.</p>
        </div>
        <div className="space-y-3">
          {Object.entries(form.publicModules || {}).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <Label className="capitalize text-sm">{key}</Label>
              <Switch checked={enabled} onCheckedChange={(v) => setForm({ ...form, publicModules: { ...form.publicModules, [key]: v } })} />
            </div>
          ))}
        </div>
      </section>

      <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        <Save size={14} />
        Sauvegarder
      </Button>
    </div>
  );
}

/* ─── Landing page tab ──────────────────────────────────────── */
function LandingTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({ heroTitle: "", heroSubtitle: "", heroDescription: "", sections: "" });

  const { data: landing, isLoading } = useQuery({
    queryKey: ["admin-landing"],
    queryFn: () => adminApi.getLanding().then((r) => r.data),
  });

  useEffect(() => { if (landing) setForm({ heroTitle: "", heroSubtitle: "", heroDescription: "", sections: "", ...landing }); }, [landing]);

  const mutation = useMutation({
    mutationFn: (data) => adminApi.updateLanding(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-landing"] });
      qc.invalidateQueries({ queryKey: ["public-config"] });
      toast({ title: "Page d'accueil sauvegardée" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Hero config */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Section Hero</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Titre principal</Label>
            <Input
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              placeholder="Personal ERP"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sous-titre</Label>
            <Input
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              placeholder="Gérez. Organisez. Évoluez."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input
              value={form.heroDescription}
              onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
              placeholder="Votre espace personnel centralisé..."
            />
          </div>
        </div>
      </section>

      {/* Sections Markdown */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Sections personnalisées</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Contenu Markdown affiché après les fonctionnalités.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => setPreview((v) => !v)}>
            {preview ? "Éditeur" : "Aperçu"}
          </Button>
        </div>

        {preview ? (
          <div className="rounded-xl border border-border/40 bg-muted/20 p-6 min-h-[300px] overflow-auto">
            {form.sections ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.sections}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Aucun contenu à afficher.</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <CodeMirror
              value={form.sections}
              height="300px"
              extensions={[markdown()]}
              theme={oneDark}
              onChange={(v) => setForm({ ...form, sections: v })}
            />
          </div>
        )}
      </section>

      <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        <Save size={14} />
        Sauvegarder la page d'accueil
      </Button>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export function AdminSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Settings size={18} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">Paramètres</h2>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 bg-muted/40 border border-border/40">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Settings size={13} />
            Général
          </TabsTrigger>
          <TabsTrigger value="landing" className="gap-1.5 text-xs">
            <Globe size={13} />
            Page d'accueil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab settings={settings} />
        </TabsContent>

        <TabsContent value="landing">
          <LandingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
