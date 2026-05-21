import { Router } from "express";
import { listUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
