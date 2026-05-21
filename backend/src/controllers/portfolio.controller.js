import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound, AppError } from "../utils/errors.js";
import { z } from "zod";

const HIERARCHY = { viewer: 0, editor: 1, admin: 2 };

const portfolioSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  visibility: z.enum(["admin", "editor", "viewer"]).default("admin"),
});

const entrySchema = z.object({
  title: z.string().min(1),
  shortDesc: z.string().min(1),
  longDesc: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  links: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .default([]),
  status: z.enum(["en_cours", "termine", "archive"]).default("termine"),
  date: z.string().datetime().nullable().optional(),
  order: z.number().default(0),
});

export const listPortfolios = asyncHandler(async (req, res) => {
  const all = await prisma.portfolio.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, slug: true, description: true, visibility: true, createdAt: true },
  });
  const visible = all.filter(
    (p) => HIERARCHY[req.user.role] >= HIERARCHY[p.visibility]
  );
  res.json(visible);
});

export const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: req.params.slug },
    include: {
      entries: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!portfolio) throw notFound("Portfolio");
  if (HIERARCHY[req.user.role] < HIERARCHY[portfolio.visibility]) {
    throw new AppError("Accès refusé", 403);
  }
  res.json(portfolio);
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const data = portfolioSchema.parse(req.body);
  const exists = await prisma.portfolio.findUnique({ where: { slug: data.slug } });
  if (exists) throw new AppError("Slug déjà utilisé", 409);
  const portfolio = await prisma.portfolio.create({ data });
  res.status(201).json(portfolio);
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = portfolioSchema.partial().parse(req.body);
  const exists = await prisma.portfolio.findUnique({ where: { id } });
  if (!exists) throw notFound("Portfolio");
  const updated = await prisma.portfolio.update({ where: { id }, data });
  res.json(updated);
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.portfolio.findUnique({ where: { id } });
  if (!exists) throw notFound("Portfolio");
  await prisma.portfolio.delete({ where: { id } });
  res.json({ ok: true });
});

export const addEntry = asyncHandler(async (req, res) => {
  const data = entrySchema.parse(req.body);
  const portfolio = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
  if (!portfolio) throw notFound("Portfolio");

  const entry = await prisma.portfolioEntry.create({
    data: { ...data, portfolioId: req.params.id },
  });
  res.status(201).json(entry);
});

export const updateEntry = asyncHandler(async (req, res) => {
  const data = entrySchema.partial().parse(req.body);
  const exists = await prisma.portfolioEntry.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("PortfolioEntry");
  const entry = await prisma.portfolioEntry.update({
    where: { id: req.params.id },
    data,
  });
  res.json(entry);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const exists = await prisma.portfolioEntry.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("PortfolioEntry");
  await prisma.portfolioEntry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
