import { Router } from "express";
import multer from "multer";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isEditor } from "../middlewares/role.middleware.js";
import { asyncHandler, AppError } from "../utils/errors.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, "../../uploads");

mkdirSync(uploadDir, { recursive: true });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Type de fichier non supporté (jpg, png, gif, webp, svg uniquement)", 400));
    }
  },
});

const router = Router();

router.post(
  "/",
  authenticate,
  isEditor,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Aucun fichier reçu", 400);
    res.json({ url: `/uploads/${req.file.filename}` });
  })
);

export default router;
