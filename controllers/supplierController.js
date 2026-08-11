import Supplier from "../models/Supplier.js";
import Query from "../models/Query.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all suppliers (optionally with search)
// @route   GET /api/suppliers
// @access  Public
export const getSuppliers = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { contactPerson: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;
  if (status) filter.status = status;

  const suppliers = await Supplier.find(filter).sort({ name: 1 }).lean();

  const supplierIds = suppliers.map((s) => s._id);
  const queryCounts = await Query.aggregate([
    { $match: { supplierId: { $in: supplierIds } } },
    {
      $group: {
        _id: "$supplierId",
        totalQueries: { $sum: 1 },
        pendingQueries: {
          $sum: { $cond: [{ $in: ["$status", ["Pending", "In Progress"]] }, 1, 0] },
        },
      },
    },
  ]);

  const countsMap = new Map(queryCounts.map((c) => [String(c._id), c]));

  const enriched = suppliers.map((s) => ({
    ...s,
    totalQueries: countsMap.get(String(s._id))?.totalQueries || 0,
    pendingQueries: countsMap.get(String(s._id))?.pendingQueries || 0,
  }));

  res.status(200).json({ success: true, count: enriched.length, data: enriched });
});

// @desc    Get single supplier by id
// @route   GET /api/suppliers/:id
// @access  Public
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).lean();

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  const queries = await Query.find({ supplierId: supplier._id }).sort({ createdAt: -1 }).lean();

  res.status(200).json({ success: true, data: { ...supplier, queries } });
});

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Public
export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, data: supplier });
});
