import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Settings } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data) => adminApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Paramètres sauvegardés" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  if (isLoading || !form) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={20} />
        <h2 className="text-xl font-semibold">Paramètres de l'application</h2>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Général</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de l'application</Label>
            <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>URL du logo</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.logoUrl || ""}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value || null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thème par défaut</Label>
              <Select value={form.defaultTheme} onValueChange={(v) => setForm({ ...form, defaultTheme: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="light">Clair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Couleur primaire</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-input"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Modules actifs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(form.modules || {}).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="capitalize cursor-pointer">{key}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => setForm({ ...form, modules: { ...form.modules, [key]: v } })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Accès public (visiteurs non connectés)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Activer un module ici permet aux visiteurs de le voir dans le menu sans se connecter.
            Le contenu affiché dépend de la visibilité "Public" configurée sur chaque page / portfolio.
          </p>
          {Object.entries(form.publicModules || {}).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="capitalize cursor-pointer">{key}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(v) =>
                  setForm({ ...form, publicModules: { ...form.publicModules, [key]: v } })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        <Save size={14} /> Sauvegarder
      </Button>
    </div>
  );
}
