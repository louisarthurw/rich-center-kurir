import express from "express";
import { getAllCustomers, getCustomerById } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);

export default router;
