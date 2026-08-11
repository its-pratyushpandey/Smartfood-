import { z } from "zod";
import {
  QUERY_CATEGORIES,
  QUERY_PRIORITIES,
  QUERY_STATUSES,
  SUPPLIER_CATEGORIES,
  SUPPLIER_STATUSES,
} from "./constants.js";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  contactPerson: z.string().trim().min(2, "Contact person must be at least 2 characters").max(120),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number looks too short")
    .max(20, "Phone number looks too long"),
  category: z.enum(SUPPLIER_CATEGORIES, {
    error: "Please select a valid supplier category",
  }),
  status: z.enum(SUPPLIER_STATUSES).optional(),
  location: z.string().trim().max(150).optional().or(z.literal("")),
});

export const querySchema = z.object({
  supplierId: objectId,
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(150),
  description: z
    .string()
    .trim()
    .min(20, "Please provide a more detailed question (min 20 characters)")
    .max(2000),
  category: z.enum(QUERY_CATEGORIES, {
    error: "Please select a valid category",
  }),
  priority: z.enum(QUERY_PRIORITIES, {
    error: "Please select a valid priority",
  }),
  dueDate: z.coerce.date({ error: "Please provide a valid due date" }),
  referenceProduct: z.string().trim().max(150).optional().or(z.literal("")),
  attachmentName: z.string().trim().max(200).optional().or(z.literal("")),
});

export const queryUpdateSchema = querySchema.partial();

export const statusUpdateSchema = z.object({
  status: z.enum(QUERY_STATUSES, {
    error: "Please provide a valid status",
  }),
  message: z.string().trim().max(500).optional(),
  supplierResponse: z.string().trim().max(2000).optional(),
});

export const noteSchema = z.object({
  text: z.string().trim().min(1, "Note cannot be empty").max(1000),
  author: z.string().trim().max(120).optional(),
});
