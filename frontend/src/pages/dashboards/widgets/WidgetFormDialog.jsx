import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const WIDGET_TYPES = [
  { value: "bar", label: "Barres" },
  { value: "line", label: "Lignes" },
  { value: "pie", label: "Camembert" },
  { value: "kpi", label: "KPI / Compteur" },
  { value: "table", label: "Tableau" },
  { value: "note", label: "Note texte" },
];

const DEFAULT_CONFIGS = {
  bar: { data: [{ name: "Jan", value: 40 }, { name: "Fév", value: 60 }, { name: "Mar", value: 50 }], xKey: "name", dataKey: "value" },
  line: { data: [{ name: "Jan", value: 40 }, { name: "Fév", value: 60 }, { name: "Mar", value: 50 }], xKey: "name", dataKey: "value" },
  pie: { data: [{ name: "A", value: 40 }, { name: "B", value: 30 }, { name: "C", value: 30 }] },
  kpi: { value: "42", label: "Métriques", variation: 5 },
  table: { columns: ["Nom", "Valeur"], rows: [["Exemple", "100"]] },
  note: { content: "# Note\n\nEntrez votre texte ici." },
};

export function WidgetFormDialog({ open, onOpenChange, dashboardId, editing }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [type, setType] = useState("kpi");
  const [title, setTitle] = useState("");
  const [configRaw, setConfigRaw] = useState("");

  useEffect(() => {
    if (editing) {
      setType(editing.type);
      setTitle(editing.title);
      setConfigRaw(JSON.stringify(editing.config, null, 2));
    } else {
      setType("kpi");
      setTitle("Nouveau widget");
      setConfigRaw(JSON.stringify(DEFAULT_CONFIGS["kpi"], null, 2));
    }
  }, [editing, open]);

  function handleTypeChange(t) {
    setType(t);
    if (!editing) setConfigRaw(JSON.stringify(DEFAULT_CONFIGS[t] || {}, null, 2));
  }

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? dashboardsApi.updateWidget(editing.id, data)
      : dashboardsApi.addWidget(dashboardId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: editing ? "Widget mis à jour" : "Widget ajouté" });
      onOpenChange(false);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error || "JSON invalide", variant: "destructive" }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    let config;
    try { config = JSON.parse(configRaw); } catch { toast({ title: "JSON invalide", variant: "destructive" }); return; }
    mutation.mutate({ type, title, config });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le widget" : "Ajouter un widget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Configuration (JSON)</Label>
            <Textarea
              value={configRaw}
              onChange={(e) => setConfigRaw(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
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
