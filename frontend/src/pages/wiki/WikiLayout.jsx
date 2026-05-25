import { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, ChevronRight, ChevronDown, FileText, Loader2, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";

function buildTree(pages) {
  const map = {};
  const roots = [];
  pages.forEach((p) => (map[p.id] = { ...p, children: [] }));
  pages.forEach((p) => {
    if (p.parentId && map[p.parentId]) map[p.parentId].children.push(map[p.id]);
    else roots.push(map[p.id]);
  });
  return roots;
}

export function WikiLayout() {
  const navigate = useNavigate();
  const { isEditor } = usePermissions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["wiki-pages"],
    queryFn: () => wikiApi.list().then((r) => r.data),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["wiki-search", debouncedSearch],
    queryFn: () => wikiApi.search(debouncedSearch).then((r) => r.data),
    enabled: debouncedSearch.length > 1,
  });

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const tree = buildTree(pages);
  const displayItems = debouncedSearch.length > 1 ? (searchResults || []) : null;

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* ── Compact top bar ── */}
      <div className="shrink-0 h-11 flex items-center gap-2 px-4 border-b border-border/40 bg-background/60 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 shrink-0"
          onClick={() => setDrawerOpen(true)}
          title="Navigation"
        >
          <PanelLeft size={14} />
        </Button>
        <div className="h-4 w-px bg-border/60" />
        <span className="text-xs font-medium text-muted-foreground/70 hidden sm:block">Wiki</span>
        {isEditor && (
          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/wiki/new")}
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Nouvelle page</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Backdrop ── */}
      <div
        className={cn(
          "absolute inset-0 z-40 transition-all duration-300",
          drawerOpen
            ? "bg-black/50 backdrop-blur-[2px] pointer-events-auto"
            : "bg-transparent pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Slide-in drawer ── */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full z-50 w-72 flex flex-col",
          "bg-card/95 backdrop-blur-2xl border-r border-border/40 shadow-2xl",
          "transition-transform duration-300 cubic-bezier(0.16,1,0.3,1)",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="shrink-0 h-12 flex items-center justify-between px-3 border-b border-border/40">
          <span className="text-sm font-semibold text-foreground/80">Navigation</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={14} />
          </Button>
        </div>

        {/* Search */}
        <div className="shrink-0 px-3 py-2 border-b border-border/30">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Rechercher une page…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/40 border-border/30 focus:border-primary/40"
            />
          </div>
        </div>

        {/* New page */}
        {isEditor && (
          <div className="shrink-0 px-3 py-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs gap-1.5 border-border/40 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => { navigate("/wiki/new"); setDrawerOpen(false); }}
            >
              <Plus size={13} />
              Nouvelle page
            </Button>
          </div>
        )}

        {/* Tree */}
        <ScrollArea className="flex-1 px-2 py-1">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : displayItems ? (
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wider font-semibold">
                Résultats ({displayItems.length})
              </p>
              {displayItems.map((p) => (
                <WikiNavItem key={p.id} page={p} navigate={navigate} onSelect={() => setDrawerOpen(false)} />
              ))}
            </div>
          ) : (
            <TreeItems items={tree} navigate={navigate} onSelect={() => setDrawerOpen(false)} />
          )}
        </ScrollArea>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

function TreeItems({ items, navigate, onSelect, depth = 0 }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <TreeNode key={item.id} node={item} navigate={navigate} onSelect={onSelect} depth={depth} />
      ))}
    </div>
  );
}

function TreeNode({ node, navigate, onSelect, depth }) {
  const { slug } = useParams();
  const [open, setOpen] = useState(depth === 0);
  const isActive = slug === node.slug;
  const hasChildren = node.children?.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg text-sm cursor-pointer transition-all duration-100",
          "hover:bg-white/[0.04]",
          isActive ? "bg-primary/[0.1] text-primary font-medium" : "text-sidebar-foreground/70"
        )}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: "8px", paddingTop: "5px", paddingBottom: "5px" }}
      >
        {hasChildren ? (
          <button
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5"
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          >
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <FileText size={12} className="text-muted-foreground/50 shrink-0 ml-0.5" />
        )}
        <span
          className="flex-1 truncate text-xs py-0.5"
          onClick={() => { navigate(`/wiki/${node.slug}`); onSelect(); }}
        >
          {node.title}
        </span>
      </div>
      {hasChildren && open && (
        <TreeItems items={node.children} navigate={navigate} onSelect={onSelect} depth={depth + 1} />
      )}
    </div>
  );
}

function WikiNavItem({ page, navigate, onSelect }) {
  return (
    <button
      className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-white/[0.04] text-sidebar-foreground/70 hover:text-foreground transition-colors truncate"
      onClick={() => { navigate(`/wiki/${page.slug}`); onSelect(); }}
    >
      {page.title}
    </button>
  );
}
