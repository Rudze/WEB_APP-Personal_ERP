import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, X, History } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/context/ThemeContext";

export function WikiEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isNew = slug === "new";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    visibility: "admin",
    parentId: null,
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["wiki-page", slug],
    queryFn: () => wikiApi.get(slug).then((r) => r.data),
    enabled: !isNew,
  });

  const { data: allPages = [] } = useQuery({
    queryKey: ["wiki-pages"],
    queryFn: () => wikiApi.list().then((r) => r.data),
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        content: existing.content,
        tags: existing.tags.join(", "),
        visibility: existing.visibility,
        parentId: existing.parentId || null,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isNew
        ? wikiApi.create(data)
        : wikiApi.update(existing.id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["wiki-pages"] });
      qc.invalidateQueries({ queryKey: ["wiki-page"] });
      toast({ title: isNew ? "Page créée" : "Page sauvegardée" });
      navigate(`/wiki/${res.data.slug}`);
    },
    onError: (e) => toast({ title: "Erreur", description: e.response?.data?.error, variant: "destructive" }),
  });

  function handleTitleChange(title) {
    setForm((f) => ({ ...f, title, slug: isNew ? slugify(title) : f.slug }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  if (!isNew && isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Input
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Titre de la page"
          className="text-lg font-semibold border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 h-auto"
          required
        />
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>
            <X size={14} /> Annuler
          </Button>
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/wiki/${slug}/versions`)}
            >
              <History size={14} /> Historique
            </Button>
          )}
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} /> Sauvegarder
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 px-4 py-2 border-b border-border text-sm shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="h-7 text-xs w-40"
            pattern="[a-z0-9-]+"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Visibilité</Label>
          <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Lecteur</SelectItem>
              <SelectItem value="editor">Éditeur</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Parent</Label>
          <Select
            value={form.parentId || "__none__"}
            onValueChange={(v) => setForm({ ...form, parentId: v === "__none__" ? null : v })}
          >
            <SelectTrigger className="h-7 text-xs w-40"><SelectValue placeholder="Aucun" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucun</SelectItem>
              {allPages
                .filter((p) => p.id !== existing?.id)
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-xs text-muted-foreground">Tags</Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tag1, tag2"
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* Editor / Preview */}
      <Tabs defaultValue="split" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 w-fit">
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 min-h-0 mt-0">
          <CodeMirror
            value={form.content}
            height="100%"
            extensions={[markdown()]}
            theme={theme === "dark" ? oneDark : undefined}
            onChange={(v) => setForm({ ...form, content: v })}
            className="h-full text-sm"
          />
        </TabsContent>
        <TabsContent value="split" className="flex-1 min-h-0 mt-0 flex">
          <div className="flex-1 min-w-0 border-r border-border overflow-auto">
            <CodeMirror
              value={form.content}
              height="100%"
              extensions={[markdown()]}
              theme={theme === "dark" ? oneDark : undefined}
              onChange={(v) => setForm({ ...form, content: v })}
              className="h-full text-sm"
            />
          </div>
          <div className="flex-1 min-w-0 overflow-auto p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 min-h-0 mt-0 overflow-auto p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
