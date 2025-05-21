import express from "express";
import {
  getProfile,
  login,
  logout,
  signup,
  verifyEmail,
  refreshToken,
  loginKurir,
  deleteFCMToken
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail)
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/login-kurir", loginKurir)
router.post("/logout-kurir", deleteFCMToken);
router.get("/profile", protectRoute, getProfile);


export default router;
