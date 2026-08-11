import { customAlphabet } from "nanoid";
import Query from "../models/Query.js";
import Supplier from "../models/Supplier.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { QUERY_STATUSES } from "../utils/constants.js";
import { withEffectiveStatus } from "../utils/statusHelper.js";

const nanoid = customAlphabet("0123456789", 5);

const generateQueryId = () => `QRY-${nanoid()}`;

// @desc    Get all queries with search/filter/sort
// @route   GET /api/queries
// @access  Public
export const getQueries = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    category,
    priority,
    supplierId,
    sortBy = "updatedAt",
    order = "desc",
  } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (supplierId) filter.supplierId = supplierId;

  if (status && status !== "Overdue") {
    filter.status = status;
  }

  const sortDirection = order === "asc" ? 1 : -1;
  const allowedSortFields = ["updatedAt", "createdAt", "dueDate", "priority", "status"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "updatedAt";

  let queries = await Query.find(filter)
    .populate("supplierId", "name contactPerson email category")
    .sort({ [sortField]: sortDirection })
    .lean();

  queries = queries.map(withEffectiveStatus);

  if (status === "Overdue") {
    queries = queries.filter((q) => q.effectiveStatus === "Overdue");
  }

  // Optional supplier/query text search should also match populated supplier name
  if (search) {
    const term = search.toLowerCase();
    queries = queries.filter(
      (q) =>
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term) ||
        q.queryId.toLowerCase().includes(term) ||
        q.supplierId?.name?.toLowerCase().includes(term)
    );
  }

  res.status(200).json({ success: true, count: queries.length, data: queries });
});

// @desc    Get single query by id
// @route   GET /api/queries/:id
// @access  Public
export const getQueryById = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id).populate(
    "supplierId",
    "name contactPerson email phone category status"
  );

  if (!query) {
    throw new ApiError(404, "Query not found");
  }

  res.status(200).json({ success: true, data: withEffectiveStatus(query) });
});

// @desc    Create a new query
// @route   POST /api/queries
// @access  Public
export const createQuery = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.body.supplierId);

  if (!supplier) {
    throw new ApiError(404, "Selected supplier could not be found");
  }

  const query = await Query.create({
    ...req.body,
    queryId: generateQueryId(),
    status: "Pending",
    timeline: [
      {
        status: "Submitted",
        message: `Query raised for ${supplier.name}`,
        actor: "QA Manager",
        timestamp: new Date(),
      },
      {
        status: "Sent to Supplier",
        message: `Notification queued for ${supplier.name}`,
        actor: "System",
        timestamp: new Date(),
      },
    ],
  });

  const populated = await query.populate("supplierId", "name contactPerson email category");

  res.status(201).json({ success: true, data: withEffectiveStatus(populated) });
});

// @desc    Update query (general fields)
// @route   PATCH /api/queries/:id
// @access  Public
export const updateQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    throw new ApiError(404, "Query not found");
  }

  Object.assign(query, req.body);
  await query.save();

  const populated = await query.populate("supplierId", "name contactPerson email category");

  res.status(200).json({ success: true, data: withEffectiveStatus(populated) });
});

// @desc    Delete a query
// @route   DELETE /api/queries/:id
// @access  Public
export const deleteQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    throw new ApiError(404, "Query not found");
  }

  await query.deleteOne();

  res.status(200).json({ success: true, data: { _id: req.params.id } });
});

// @desc    Update query status (workflow transitions + supplier response)
// @route   PATCH /api/queries/:id/status
// @access  Public
export const updateQueryStatus = asyncHandler(async (req, res) => {
  const { status, message, supplierResponse } = req.body;

  if (!QUERY_STATUSES.includes(status) || status === "Overdue") {
    throw new ApiError(400, "Overdue is a derived status and cannot be set manually");
  }

  const query = await Query.findById(req.params.id);

  if (!query) {
    throw new ApiError(404, "Query not found");
  }

  query.status = status;

  if (supplierResponse) {
    query.supplierResponse = supplierResponse;
    query.timeline.push({
      status: "Supplier Response",
      message: supplierResponse,
      actor: "Supplier",
      timestamp: new Date(),
    });
  }

  query.timeline.push({
    status,
    message: message || `Status updated to ${status}`,
    actor: "QA Manager",
    timestamp: new Date(),
  });

  await query.save();

  const populated = await query.populate("supplierId", "name contactPerson email category");

  res.status(200).json({ success: true, data: withEffectiveStatus(populated) });
});

// @desc    Add an internal note to a query
// @route   POST /api/queries/:id/notes
// @access  Public
export const addQueryNote = asyncHandler(async (req, res) => {
  const { text, author } = req.body;

  const query = await Query.findById(req.params.id);

  if (!query) {
    throw new ApiError(404, "Query not found");
  }

  query.internalNotes.push({
    text,
    author: author || "QA Manager",
    createdAt: new Date(),
  });

  await query.save();

  const populated = await query.populate("supplierId", "name contactPerson email category");

  res.status(201).json({ success: true, data: withEffectiveStatus(populated) });
});
