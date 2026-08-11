import { Router } from "express";
import {
  addQueryNote,
  createQuery,
  deleteQuery,
  getQueries,
  getQueryById,
  updateQuery,
  updateQueryStatus,
} from "../controllers/queryController.js";
import validateRequest from "../middleware/validateRequest.js";
import { noteSchema, querySchema, queryUpdateSchema, statusUpdateSchema } from "../utils/validators.js";

const router = Router();

router.get("/", getQueries);
router.get("/:id", getQueryById);
router.post("/", validateRequest(querySchema), createQuery);
router.patch("/:id", validateRequest(queryUpdateSchema), updateQuery);
router.delete("/:id", deleteQuery);
router.patch("/:id/status", validateRequest(statusUpdateSchema), updateQueryStatus);
router.post("/:id/notes", validateRequest(noteSchema), addQueryNote);

export default router;
