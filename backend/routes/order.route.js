import express from "express";
import { assignKurir, assignKurirManual, createOrder, deleteOrder, getAllOrders, getCustomerOrder, getOrderById, handleMidtransWebhook } from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/customer", protectRoute, getCustomerOrder)
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.post("/midtrans/webhook", handleMidtransWebhook)
router.put("/assign-courier", assignKurir)
router.put("/assign-courier-manual", assignKurirManual);
router.delete("/", deleteOrder);

export default router;