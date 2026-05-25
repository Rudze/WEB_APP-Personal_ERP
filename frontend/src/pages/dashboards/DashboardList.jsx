import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Trash2, Pencil, Loader2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useState } from "react";
import { DashboardFormDialog } from "./DashboardFormDialog";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function DashboardList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  useScrollReveal();

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
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 fade-in">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight page-header-title gradient-text-portfolio">
            Dashboards
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {dashboards.length} tableau{dashboards.length !== 1 ? "x" : ""} de bord
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            className="gap-1.5 glow-primary-sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus size={14} /> Nouveau dashboard
          </Button>
        )}
      </div>

      {dashboards.length === 0 ? (
        <div className="card-surface empty-state">
          <div className="icon-box-erp w-16 h-16">
            <LayoutDashboard size={26} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground/90">Aucun dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">Créez votre premier tableau de bord personnalisé.</p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => setFormOpen(true)}
            >
              <Plus size={14} /> Créer un dashboard
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((d, i) => (
            <div
              key={d.id}
              className={cn("card-surface feature-card group cursor-pointer", `reveal reveal-delay-${Math.min(i + 1, 5)}`)}
              onClick={() => navigate(`/dashboards/${d.slug}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="icon-box-erp w-10 h-10 shrink-0">
                    <LayoutDashboard size={15} className="text-primary" />
                  </div>
                  {isAdmin && (
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => { setEditing(d); setFormOpen(true); }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => { if (confirm("Supprimer ce dashboard ?")) deleteMutation.mutate(d.id); }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-foreground/90 group-hover:text-primary transition-colors mb-1 leading-snug">
                  {d.title}
                </h3>
                {d.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{d.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
                  <span>{formatDate(d.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    {d.roles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium"
                      >
                        {r}
                      </span>
                    ))}
                    <ArrowRight size={11} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DashboardFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </div>
  );
}
