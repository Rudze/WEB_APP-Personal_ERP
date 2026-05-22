import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound } from "../utils/errors.js";
import { z } from "zod";

const HIERARCHY = { public: -1, viewer: 0, editor: 1, admin: 2 };

const linkSchema = z.object({ label: z.string(), url: z.string() });
const skillItemSchema = z.object({ name: z.string(), level: z.number().min(0).max(100) });
const skillCatSchema = z.object({ category: z.string(), items: z.array(skillItemSchema) });

const profileSchema = z.object({
  name: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  links: z.array(linkSchema).optional(),
  skills: z.array(skillCatSchema).optional(),
  visibility: z.enum(["admin", "editor", "viewer", "public"]).optional(),
});

const formationSchema = z.object({
  title: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  category: z.string().optional(),
  order: z.number().default(0),
  visibility: z.enum(["admin", "editor", "viewer", "public"]).default("viewer"),
});

export const getCV = asyncHandler(async (req, res) => {
  const userRole = req.user?.role || "public";

  const [profile, formations] = await Promise.all([
    prisma.cVProfile.findUnique({ where: { id: "singleton" } }),
    prisma.cVFormation.findMany({
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    }),
  ]);

  const canSeeProfile = !profile || HIERARCHY[userRole] >= HIERARCHY[profile.visibility];

  res.json({
    profile: canSeeProfile ? profile : null,
    formations: formations.filter((f) => HIERARCHY[userRole] >= HIERARCHY[f.visibility]),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = profileSchema.parse(req.body);
  const profile = await prisma.cVProfile.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  res.json(profile);
});

export const createFormation = asyncHandler(async (req, res) => {
  const data = formationSchema.parse(req.body);
  const formation = await prisma.cVFormation.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  res.status(201).json(formation);
});

export const updateFormation = asyncHandler(async (req, res) => {
  const data = formationSchema.partial().parse(req.body);
  const exists = await prisma.cVFormation.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("CVFormation");
  const formation = await prisma.cVFormation.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.startDate !== undefined ? { startDate: data.startDate ? new Date(data.startDate) : null } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
    },
  });
  res.json(formation);
});

export const deleteFormation = asyncHandler(async (req, res) => {
  const exists = await prisma.cVFormation.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("CVFormation");
  await prisma.cVFormation.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
