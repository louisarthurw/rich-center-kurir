import express from "express";
import { addCourier, getAllCouriers, getCourierById, updateCourier, getAvailableCouriers, changePasswordCourier, changeAvailabilityStatus, getAllAssignmentCourier, getAssignmentCourierByDate } from "../controllers/courier.controller.js";

const router = express.Router();

router.get("/", getAllCouriers)
router.get("/available", getAvailableCouriers)
router.get("/assignments/:courier_id", getAllAssignmentCourier)
router.get("/assignment/:courier_id/:date", getAssignmentCourierByDate)
router.get("/:id", getCourierById)
router.post("/", addCourier)
router.put("/password/:id", changePasswordCourier)
router.put("/availability-status/:id", changeAvailabilityStatus)
router.put("/:id", updateCourier)

export default router;
