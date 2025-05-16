import express from "express";
import { addCourier, getAllCouriers, getCourierById, updateCourier, getAvailableCouriers, changePasswordCourier, changeAvailabilityStatus, getAllAssignmentCourier, getAssignmentCourierByDate, getAssignmentCourierByOrderId, uploadBuktiFoto } from "../controllers/courier.controller.js";
import { generateRoute } from "../controllers/route.controller.js";

const router = express.Router();

router.get("/", getAllCouriers)
router.get("/available", getAvailableCouriers)
router.get("/assignments/:courier_id", getAllAssignmentCourier)
router.get("/assignment/:courier_id/id/:order_id", getAssignmentCourierByOrderId)
router.get("/assignment/:courier_id/:date", getAssignmentCourierByDate)
router.get("/:id", getCourierById)
router.post("/", addCourier)
router.post("/get-route", generateRoute)
router.put("/password/:id", changePasswordCourier)
router.put("/availability-status/:id", changeAvailabilityStatus)
router.put("/upload-bukti-foto", uploadBuktiFoto)
router.put("/:id", updateCourier)


export default router;
