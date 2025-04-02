import express from "express";
import { addCourier, getAllCouriers, getCourierById, updateCourier, getAvailableCouriers } from "../controllers/courier.controller.js";

const router = express.Router();

router.get("/", getAllCouriers)
router.get("/available", getAvailableCouriers)
router.get("/:id", getCourierById)
router.post("/", addCourier)
router.put("/:id", updateCourier)

export default router;
