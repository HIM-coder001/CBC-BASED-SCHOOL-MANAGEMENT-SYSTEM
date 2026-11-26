/**
 * Strips HTML tags and trims strings from req.body to prevent XSS.
 * Does NOT block requests — just cleans the input.
 */
export const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj) {
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  if (typeof obj === "string") {
    // Strip HTML tags and trim
    return obj.replace(/<[^>]*>/g, "").trim();
  }
  return obj;
}
