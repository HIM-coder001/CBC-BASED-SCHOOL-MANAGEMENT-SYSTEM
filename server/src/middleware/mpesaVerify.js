import crypto from "crypto";
import logger from "../utils/logger.js";

/**
 * Verifies the X-Callback-Signature header sent by Safaricom on M-Pesa callbacks.
 *
 * Safaricom signs the raw request body with HMAC-SHA256 using the initiator password
 * (or a shared secret configured in your Daraja app). Set MPESA_CALLBACK_SECRET in .env
 * to the value you configured in the Daraja portal.
 *
 * If MPESA_CALLBACK_SECRET is not set (e.g. dev/sandbox) the check is skipped with a warning.
 */
export const verifyMpesaSignature = (req, res, next) => {
  const secret = process.env.MPESA_CALLBACK_SECRET;

  // Skip verification in dev/sandbox if secret is not configured
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      logger.error("MPESA_CALLBACK_SECRET not set in production — blocking unauthenticated callback");
      return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden" });
    }
    logger.warn("MPESA_CALLBACK_SECRET not set — skipping M-Pesa signature verification (dev mode)");
    return next();
  }

  const signature = req.headers["x-callback-signature"] ?? req.headers["x-safaricom-signature"];

  if (!signature) {
    logger.warn({ msg: "M-Pesa callback received with no signature header", ip: req.ip });
    return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden: missing signature" });
  }

  // Safaricom sends the raw JSON body — we need it as a string.
  // express.json() already parsed it, so we re-serialise.
  const rawBody = JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const sigBuffer      = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    logger.warn({ msg: "M-Pesa callback signature mismatch", ip: req.ip });
    return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden: invalid signature" });
  }

  next();
};
