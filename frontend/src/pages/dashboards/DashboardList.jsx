import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutDashboard, Trash2, Pencil, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useState } from "react";
import { DashboardFormDialog } from "./DashboardFormDialog";
import { useToast } from "@/hooks/useToast";

export function DashboardList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ["dashboards"],
    queryFn: () => dashboardsApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dashboardsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboards"] });
      toast({ title: "Dashboard supprimé" });
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboards</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={16} /> Nouveau dashboard
          </Button>
        )}
      </div>

      {dashboards.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <LayoutDashboard size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun dashboard.</p>
          {isAdmin && <Button variant="outline" className="mt-4" onClick={() => setFormOpen(true)}>Créer un dashboard</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((d) => (
            <Card
              key={d.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => navigate(`/dashboards/${d.slug}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{d.title}</CardTitle>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setFormOpen(true); }}>
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(d.id); }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
                {d.description && <CardDescription className="text-xs">{d.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(d.createdAt)}</span>
                  <div className="flex gap-1">
                    {d.roles.map((r) => <Badge key={r} variant="outline" className="text-xs py-0">{r}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DashboardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />
    </div>
  );
}
