import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound, AppError } from "../utils/errors.js";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "editor", "viewer"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email déjà utilisé", 409);

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = updateSchema.parse(req.body);
  const { id } = req.params;

  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw notFound("User");

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user.sub) throw new AppError("Impossible de supprimer votre propre compte", 400);

  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw notFound("User");

  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});
