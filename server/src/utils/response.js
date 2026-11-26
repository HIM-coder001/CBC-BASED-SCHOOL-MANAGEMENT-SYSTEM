export const success = (res, data, message = "success") => {
  return res.status(200).json({ success: true, message, data });
};

/**
 * Send an error response.
 * For 5xx statuses in production, the raw message is replaced with a generic
 * message so internal details never reach the client.
 */
export const error = (res, message = "Server error", status = 500) => {
  const isServerError = status >= 500;
  const clientMessage =
    isServerError && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message;

  return res.status(status).json({ success: false, message: clientMessage });
};
