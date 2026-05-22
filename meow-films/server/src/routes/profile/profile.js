import { Router } from "express";
import { updateAvatar } from "../../modules/profile/profile.js";
import { upload } from "../../middlewares/upload.js";
import { auth } from "../../middlewares/auth/auth.js";

const router = Router();

router.patch("/avatar", auth, upload.single("avatar"), updateAvatar);
export default router;
