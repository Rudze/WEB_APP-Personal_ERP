import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound, AppError } from "../utils/errors.js";
import { z } from "zod";

const HIERARCHY = { public: -1, viewer: 0, editor: 1, admin: 2 };

function canViewPage(page, userRole) {
  return HIERARCHY[userRole] >= HIERARCHY[page.visibility];
}

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  content: z.string().default(""),
  parentId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(["admin", "editor", "viewer", "public"]).default("viewer"),
  order: z.number().default(0),
});

export const listPages = asyncHandler(async (req, res) => {
  const pages = await prisma.wikiPage.findMany({
    select: {
      id: true, title: true, slug: true, tags: true,
      visibility: true, parentId: true, order: true, updatedAt: true,
    },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
  const visible = pages.filter((p) => canViewPage(p, req.user.role));
  res.json(visible);
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    include: {
      children: {
        select: { id: true, title: true, slug: true, order: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!page) throw notFound("WikiPage");
  if (!canViewPage(page, req.user.role)) throw new AppError("Accès refusé", 403);
  res.json(page);
});

export const createPage = asyncHandler(async (req, res) => {
  const data = pageSchema.parse(req.body);
  const exists = await prisma.wikiPage.findUnique({ where: { slug: data.slug } });
  if (exists) throw new AppError("Slug déjà utilisé", 409);

  const page = await prisma.wikiPage.create({ data });
  res.status(201).json(page);
});

export const updatePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = pageSchema.partial().parse(req.body);

  const existing = await prisma.wikiPage.findUnique({ where: { id } });
  if (!existing) throw notFound("WikiPage");

  await prisma.wikiPageVersion.create({
    data: {
      pageId: id,
      content: existing.content,
      title: existing.title,
      savedBy: req.user.email,
    },
  });

  const updated = await prisma.wikiPage.update({ where: { id }, data });
  res.json(updated);
});

export const deletePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hasChildren = await prisma.wikiPage.count({ where: { parentId: id } });
  if (hasChildren > 0) throw new AppError("Supprimez d'abord les sous-pages", 400);

  const exists = await prisma.wikiPage.findUnique({ where: { id } });
  if (!exists) throw notFound("WikiPage");

  await prisma.wikiPage.delete({ where: { id } });
  res.json({ ok: true });
});

export const getVersions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const versions = await prisma.wikiPageVersion.findMany({
    where: { pageId: id },
    orderBy: { savedAt: "desc" },
    take: 20,
    select: { id: true, title: true, savedAt: true, savedBy: true },
  });
  res.json(versions);
});

export const getVersion = asyncHandler(async (req, res) => {
  const version = await prisma.wikiPageVersion.findUnique({
    where: { id: req.params.versionId },
  });
  if (!version) throw notFound("WikiPageVersion");
  res.json(version);
});

export const searchPages = asyncHandler(async (req, res) => {
  const q = z.string().min(1).parse(req.query.q);

  const pages = await prisma.wikiPage.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
      ],
    },
    select: { id: true, title: true, slug: true, visibility: true, updatedAt: true },
    take: 20,
  });

  const visible = pages.filter((p) => canViewPage(p, req.user.role));
  res.json(visible);
});
