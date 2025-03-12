import express from "express";
import { getAllCustomers, getCustomerById, updateCustomer } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer)

export default router;
