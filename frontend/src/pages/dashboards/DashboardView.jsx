import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardsApi } from "@/lib/api";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { WidgetRenderer } from "./widgets/WidgetRenderer";
import { WidgetFormDialog } from "./widgets/WidgetFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2, GripHorizontal } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";

export function DashboardView() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const { isEditor } = usePermissions();
  const { toast } = useToast();
  const [widgetDialog, setWidgetDialog] = useState({ open: false, editing: null });
  const [editMode, setEditMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard", slug],
    queryFn: () => dashboardsApi.get(slug).then((r) => r.data),
  });

  const layoutMutation = useMutation({
    mutationFn: ({ id, layout }) => dashboardsApi.updateLayout(id, layout),
    onError: () => toast({ title: "Erreur sauvegarde layout", variant: "destructive" }),
  });

  const deleteWidget = useMutation({
    mutationFn: (id) => dashboardsApi.deleteWidget(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", slug] });
      toast({ title: "Widget supprimé" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!dashboard) return <div className="p-6 text-muted-foreground">Dashboard introuvable.</div>;

  const layout = dashboard.widgets.map((w) => ({
    i: w.id,
    x: w.position?.x ?? 0,
    y: w.position?.y ?? 0,
    w: w.position?.w ?? 4,
    h: w.position?.h ?? 3,
    minH: 2,
    minW: 2,
  }));

  function handleLayoutChange(newLayout) {
    if (!editMode) return;
    const positions = newLayout.map(({ i, x, y, w, h }) => ({ id: i, x, y, w, h }));
    layoutMutation.mutate({ id: dashboard.id, layout: positions });
    // also update individual widget positions
    positions.forEach(({ id, x, y, w, h }) => {
      dashboardsApi.updateWidget(id, { position: { x, y, w, h } }).catch(() => {});
    });
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{dashboard.title}</h2>
        {isEditor && (
          <div className="flex gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? "Terminer" : "Modifier"}
            </Button>
            {editMode && (
              <Button size="sm" onClick={() => setWidgetDialog({ open: true, editing: null })}>
                <Plus size={14} /> Widget
              </Button>
            )}
          </div>
        )}
      </div>

      <div
        ref={(el) => {
          if (el) setContainerWidth(el.offsetWidth);
        }}
      >
        {dashboard.widgets.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg py-20 text-center text-muted-foreground">
            <p>Aucun widget.</p>
            {isEditor && (
              <Button variant="outline" className="mt-4" onClick={() => setWidgetDialog({ open: true, editing: null })}>
                <Plus size={14} /> Ajouter un widget
              </Button>
            )}
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={80}
            width={containerWidth}
            isDraggable={editMode}
            isResizable={editMode}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
          >
            {dashboard.widgets.map((widget) => (
              <div key={widget.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
                  {editMode && <GripHorizontal size={14} className="drag-handle cursor-grab text-muted-foreground" />}
                  <span className="text-sm font-medium flex-1 truncate">{widget.title}</span>
                  {editMode && (
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded hover:bg-accent text-muted-foreground"
                        onClick={() => setWidgetDialog({ open: true, editing: widget })}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        onClick={() => { if (confirm("Supprimer ?")) deleteWidget.mutate(widget.id); }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-3 min-h-0">
                  <WidgetRenderer widget={widget} />
                </div>
              </div>
            ))}
          </GridLayout>
        )}
      </div>

      <WidgetFormDialog
        open={widgetDialog.open}
        onOpenChange={(open) => setWidgetDialog({ open, editing: null })}
        dashboardId={dashboard.id}
        editing={widgetDialog.editing}
      />
    </div>
  );
}
