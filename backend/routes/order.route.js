import express from "express";
import { createOrder, getAllOrders, getCustomerOrder, getOrderById } from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/customer", protectRoute, getCustomerOrder)
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;