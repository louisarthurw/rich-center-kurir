import express from "express";
import { createOrder, getAllOrders, getCustomerOrder, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.get("/customer/:id", getCustomerOrder)
router.post("/", createOrder);


export default router;