import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, ChevronRight, ChevronDown, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";

function buildTree(pages) {
  const map = {};
  const roots = [];
  pages.forEach((p) => (map[p.id] = { ...p, children: [] }));
  pages.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });
  return roots;
}

export function WikiLayout() {
  const navigate = useNavigate();
  const { isEditor } = usePermissions();
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

  const tree = buildTree(pages);
  const displayItems = debouncedSearch.length > 1 ? (searchResults || []) : null;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          {isEditor && (
            <Button size="sm" className="w-full" onClick={() => navigate("/wiki/new")}>
              <Plus size={14} /> Nouvelle page
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin" /></div>
            ) : displayItems ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground px-2 py-1">Résultats ({displayItems.length})</p>
                {displayItems.map((p) => (
                  <WikiNavItem key={p.id} page={p} depth={0} navigate={navigate} />
                ))}
              </div>
            ) : (
              <TreeItems items={tree} navigate={navigate} />
            )}
          </div>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

function TreeItems({ items, navigate, depth = 0 }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <TreeNode key={item.id} node={item} navigate={navigate} depth={depth} />
      ))}
    </div>
  );
}

function TreeNode({ node, navigate, depth }) {
  const { slug } = useParams();
  const [open, setOpen] = useState(depth === 0);
  const isActive = slug === node.slug;
  const hasChildren = node.children?.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-accent/60 transition-colors",
          isActive && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <FileText size={13} className="text-muted-foreground shrink-0" />
        )}
        <span
          className="flex-1 truncate"
          onClick={() => navigate(`/wiki/${node.slug}`)}
        >
          {node.title}
        </span>
      </div>
      {hasChildren && open && (
        <TreeItems items={node.children} navigate={navigate} depth={depth + 1} />
      )}
    </div>
  );
}

function WikiNavItem({ page, navigate }) {
  return (
    <button
      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent/60 transition-colors truncate"
      onClick={() => navigate(`/wiki/${page.slug}`)}
    >
      {page.title}
    </button>
  );
}
