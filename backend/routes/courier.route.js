import express from "express";
import { addCourier, getAllCouriers, getCourierById, updateCourier, getAvailableCouriers, changePasswordCourier, changeAvailabilityStatus } from "../controllers/courier.controller.js";

const router = express.Router();

router.get("/", getAllCouriers)
router.get("/available", getAvailableCouriers)
router.get("/:id", getCourierById)
router.post("/", addCourier)
router.put("/password/:id", changePasswordCourier)
router.put("/availability-status/:id", changeAvailabilityStatus)
router.put("/:id", updateCourier)

export default router;
