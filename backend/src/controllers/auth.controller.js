import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} from "../utils/jwt.js";
import { AppError, asyncHandler, unauthorized } from "../utils/errors.js";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: "/",
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) throw new AppError("Identifiants invalides", 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("Identifiants invalides", 401);

  const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw unauthorized();

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw unauthorized();
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw unauthorized();
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.active) throw unauthorized();

  await prisma.refreshToken.delete({ where: { token } });

  const newPayload = { sub: user.id, email: user.email, role: user.role, name: user.name };
  const newAccess = signAccessToken(newPayload);
  const newRefresh = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      token: newRefresh,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  setTokenCookies(res, newAccess, newRefresh);
  res.json({ accessToken: newAccess });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {});
  }
  res.clearCookie("access_token", COOKIE_OPTS);
  res.clearCookie("refresh_token", COOKIE_OPTS);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw unauthorized();
  res.json(user);
});
