import express from "express";
import {
  getProfile,
  login,
  logout,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail)
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protectRoute, getProfile);
// router.post("/refresh-token", refreshToken);

export default router;
