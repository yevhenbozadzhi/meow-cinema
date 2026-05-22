import { Router } from "express";
import { registerController } from "../../controllers/auth/auth.js";
import { loginController } from "../../controllers/auth/auth.js";
import { meController } from "../../controllers/auth/auth.js";
import { logoutController } from "../../controllers/auth/auth.js";
import { refreshController } from "../../controllers/auth/auth.js";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", meController);
router.post("/logout", logoutController);
router.post("/refresh", refreshController);
export default router;
