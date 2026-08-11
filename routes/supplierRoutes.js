import { Router } from "express";
import { createSupplier, getSupplierById, getSuppliers } from "../controllers/supplierController.js";
import validateRequest from "../middleware/validateRequest.js";
import { supplierSchema } from "../utils/validators.js";

const router = Router();

router.get("/", getSuppliers);
router.get("/:id", getSupplierById);
router.post("/", validateRequest(supplierSchema), createSupplier);

export default router;
