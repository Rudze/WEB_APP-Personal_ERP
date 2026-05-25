import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiApi, uploadApi } from "@/lib/api";
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
import { Loader2, Save, X, History, ImagePlus } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/context/ThemeContext";

export function WikiEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isNew = !slug; // route /wiki/new has no :slug param
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    visibility: "viewer",
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.image(file);
      const markdown = `![${file.name}](${data.url})`;
      const view = editorRef.current?.view;
      if (view) {
        const pos = view.state.selection.main.head;
        view.dispatch({ changes: { from: pos, insert: markdown } });
        setForm((f) => ({ ...f, content: view.state.doc.toString() }));
      } else {
        setForm((f) => ({ ...f, content: f.content + "\n" + markdown }));
      }
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 bg-background/60 backdrop-blur-sm shrink-0">
        <Input
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Titre de la page"
          className="text-base font-semibold border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 h-auto text-foreground/90"
          required
        />
        <div className="flex gap-1.5 shrink-0">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <X size={13} /> Annuler
          </Button>
          {!isNew && (
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate(`/wiki/${slug}/versions`)}>
              <History size={13} /> Historique
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
            Image
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Button type="submit" size="sm" className="gap-1.5 glow-primary-sm" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={13} className="animate-spin" />}
            <Save size={13} /> Sauvegarder
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 px-4 py-2 border-b border-border/30 text-sm shrink-0 bg-background/40">
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
              <SelectItem value="viewer">Privé (connectés uniquement)</SelectItem>
              <SelectItem value="public">Public (tout le monde)</SelectItem>
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
        <TabsList className="mx-4 mt-2 w-fit bg-muted/40 border border-border/40">
          <TabsTrigger value="editor" className="text-xs">Éditeur</TabsTrigger>
          <TabsTrigger value="split" className="text-xs">Split</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 min-h-0 mt-0">
          <CodeMirror
            ref={editorRef}
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
              ref={editorRef}
              value={form.content}
              height="100%"
              extensions={[markdown()]}
              theme={theme === "dark" ? oneDark : undefined}
              onChange={(v) => setForm({ ...form, content: v })}
              className="h-full text-sm"
            />
          </div>
          <div className="flex-1 min-w-0 overflow-auto p-5">
            <div className="prose-erp">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 min-h-0 mt-0 overflow-auto p-5">
          <div className="prose-erp max-w-3xl mx-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
