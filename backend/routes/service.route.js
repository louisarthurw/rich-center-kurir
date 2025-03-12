import express from "express";
import { createService, getAllActiveServices, getAllServices, getServiceById, updateService } from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", getAllServices)
router.get("/active", getAllActiveServices)
router.get("/:id", getServiceById)
router.post("/", createService)
router.put("/:id", updateService)

export default router;
