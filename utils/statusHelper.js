/**
 * Computes the "effective" status of a query for display purposes.
 * The stored `status` field only ever holds Pending | In Progress | Resolved
 * (these are the values that drive the workflow actions). "Overdue" is a
 * derived, read-only state used purely for visibility/reporting: a query
 * is overdue when it has not been resolved and its due date has passed.
 */
export const getEffectiveStatus = (query) => {
  if (!query) return null;
  const status = query.status;
  const dueDate = query.dueDate ? new Date(query.dueDate) : null;

  if (status !== "Resolved" && dueDate && dueDate.getTime() < Date.now()) {
    return "Overdue";
  }

  return status;
};

/**
 * Serializes a query (mongoose doc or plain object) adding the
 * `effectiveStatus` field so the frontend never has to re-derive it.
 */
export const withEffectiveStatus = (queryDoc) => {
  const obj = typeof queryDoc.toObject === "function" ? queryDoc.toObject() : queryDoc;
  return {
    ...obj,
    effectiveStatus: getEffectiveStatus(obj),
  };
};
