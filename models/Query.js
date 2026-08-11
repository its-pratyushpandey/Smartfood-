import mongoose from "mongoose";
import { QUERY_CATEGORIES, QUERY_PRIORITIES, QUERY_STATUSES } from "../utils/constants.js";

const timelineItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
      default: "QA Manager",
    },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: "QA Manager",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const querySchema = new mongoose.Schema(
  {
    queryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    title: {
      type: String,
      required: [true, "Query title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Detailed question is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: QUERY_CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: {
        values: QUERY_PRIORITIES,
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
    },
    status: {
      type: String,
      enum: {
        values: QUERY_STATUSES,
        message: "{VALUE} is not a valid status",
      },
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    referenceProduct: {
      type: String,
      trim: true,
      default: "",
    },
    attachmentName: {
      type: String,
      trim: true,
      default: "",
    },
    supplierResponse: {
      type: String,
      trim: true,
      default: "",
    },
    internalNotes: {
      type: [noteSchema],
      default: [],
    },
    timeline: {
      type: [timelineItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

querySchema.index({ title: "text", description: "text" });

// Virtual: whether the query is overdue based on dueDate + status
querySchema.virtual("isOverdue").get(function () {
  return this.status !== "Resolved" && this.dueDate && this.dueDate.getTime() < Date.now();
});

querySchema.set("toJSON", { virtuals: true });
querySchema.set("toObject", { virtuals: true });

const Query = mongoose.model("Query", querySchema);

export default Query;
