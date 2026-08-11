import Query from "../models/Query.js";
import Supplier from "../models/Supplier.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get aggregated dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalQueries,
    pending,
    inProgress,
    resolved,
    overdue,
    totalSuppliers,
    activeSuppliers,
    criticalOpen,
    highOpen,
    byCategory,
  ] = await Promise.all([
    Query.countDocuments({}),
    Query.countDocuments({ status: "Pending" }),
    Query.countDocuments({ status: "In Progress" }),
    Query.countDocuments({ status: "Resolved" }),
    Query.countDocuments({ status: { $ne: "Resolved" }, dueDate: { $lt: now } }),
    Supplier.countDocuments({}),
    Supplier.countDocuments({ status: "Active" }),
    Query.countDocuments({ status: { $ne: "Resolved" }, priority: "Critical" }),
    Query.countDocuments({ status: { $ne: "Resolved" }, priority: "High" }),
    Query.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalQueries,
      pending,
      inProgress,
      resolved,
      overdue,
      totalSuppliers,
      activeSuppliers,
      criticalOpen,
      highOpen,
      needsAttention: pending + overdue + criticalOpen,
      byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    },
  });
});
