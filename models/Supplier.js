import mongoose from "mongoose";
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES } from "../utils/constants.js";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      maxlength: [120, "Supplier name cannot exceed 120 characters"],
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      maxlength: [120, "Contact person cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number looks too long"],
    },
    category: {
      type: String,
      required: [true, "Supplier category is required"],
      enum: {
        values: SUPPLIER_CATEGORIES,
        message: "{VALUE} is not a valid supplier category",
      },
    },
    status: {
      type: String,
      enum: {
        values: SUPPLIER_STATUSES,
        message: "{VALUE} is not a valid supplier status",
      },
      default: "Active",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

supplierSchema.index({ name: "text", contactPerson: "text", email: "text" });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
