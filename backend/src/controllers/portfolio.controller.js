import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound, AppError } from "../utils/errors.js";
import { z } from "zod";

const HIERARCHY = { public: -1, viewer: 0, editor: 1, admin: 2 };

const portfolioSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.string().optional(),
  authorName: z.string().optional(),
  date: z.string().nullable().optional(),
  status: z.enum(["en_cours", "termine", "archive"]).default("termine"),
  imageUrl: z.string().nullable().optional(),
  webLink: z.string().nullable().optional(),
  gitLink: z.string().nullable().optional(),
  gitLinkPrivate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(["admin", "editor", "viewer", "public"]).default("viewer"),
});

export const listPortfolios = asyncHandler(async (req, res) => {
  const all = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
  });
  const visible = all.filter(
    (p) => HIERARCHY[req.user.role] >= HIERARCHY[p.visibility]
  );
  res.json(visible);
});

export const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: req.params.slug },
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
  const portfolio = await prisma.portfolio.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : null,
    },
  });
  res.status(201).json(portfolio);
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = portfolioSchema.partial().parse(req.body);
  const exists = await prisma.portfolio.findUnique({ where: { id } });
  if (!exists) throw notFound("Portfolio");
  const updated = await prisma.portfolio.update({
    where: { id },
    data: {
      ...data,
      ...(data.date !== undefined ? { date: data.date ? new Date(data.date) : null } : {}),
    },
  });
  res.json(updated);
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.portfolio.findUnique({ where: { id } });
  if (!exists) throw notFound("Portfolio");
  await prisma.portfolio.delete({ where: { id } });
  res.json({ ok: true });
});
