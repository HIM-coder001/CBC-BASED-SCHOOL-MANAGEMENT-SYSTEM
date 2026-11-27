/**
 * Pagination middleware.
 *
 * Parses ?page=1&limit=50 from query params, validates them,
 * and attaches { skip, take, page, limit } to req.pagination.
 *
 * Usage in a route:
 *   router.get("/", protect, paginate(), getStudents)
 *
 * Usage in a controller:
 *   const { skip, take, page, limit } = req.pagination
 *
 * Optional: override the default limit per route:
 *   paginate({ defaultLimit: 100, maxLimit: 500 })
 */
export const paginate = ({ defaultLimit = 50, maxLimit = 200 } = {}) => {
  return (req, _res, next) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(req.query.limit) || defaultLimit)
    );
    const skip  = (page - 1) * limit;

    req.pagination = { page, limit, skip, take: limit };
    next();
  };
};

/**
 * Helper to build a standard paginated response body.
 *
 * Usage:
 *   return success(res, paginatedResponse(data, total, req.pagination), "msg")
 */
export const paginatedResponse = (data, total, { page, limit }) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});
