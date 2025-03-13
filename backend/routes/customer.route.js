import express from "express";
import { changePassword, getAllCustomers, getCustomerById, updateCustomer } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/password/:id", changePassword);
router.put("/:id", updateCustomer)

export default router;
