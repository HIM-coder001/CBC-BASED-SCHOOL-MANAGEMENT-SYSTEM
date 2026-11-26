import express from "express";
import {
  createFeeStructure, getFeeStructures, deleteFeeStructure,
  recordPayment, getPayments, getStudentFeeStatement, getFeeOverview,
  initiateMpesaPayment, mpesaCallback, getPaymentStatus,
  generateInvoices, getInvoices, getDefaulters, exportReceipt, paybillCallback,
} from "../controllers/fee.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { verifyMpesaSignature } from "../middleware/mpesaVerify.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

// Fee structures (admin only)
router.post("/structures",        protect, authorize("ADMIN"), validate(schemas.createFeeStructure), createFeeStructure);
router.get("/structures",         protect, authorize("ADMIN", "TEACHER"), getFeeStructures);
router.delete("/structures/:id",  protect, authorize("ADMIN"), deleteFeeStructure);

// Payments
router.post("/payments",          protect, authorize("ADMIN"), validate(schemas.recordPayment), recordPayment);
router.get("/payments",           protect, authorize("ADMIN", "TEACHER"), getPayments);

// Overview (all students with balances)
router.get("/overview",           protect, authorize("ADMIN", "TEACHER"), getFeeOverview);

// Student fee statement (student can view own, parent can view child's, admin/teacher all)
router.get("/statement/:studentId", protect, getStudentFeeStatement);

// M-Pesa STK Push (parent or admin initiates)
router.post("/mpesa/pay",         protect, authorize("ADMIN", "PARENT"), validate(schemas.initiateMpesaPayment), initiateMpesaPayment);

// Poll payment status
router.get("/mpesa/status/:checkoutRequestId", protect, getPaymentStatus);

// M-Pesa callbacks — NO auth (Safaricom calls this directly), but signature is verified
router.post("/mpesa/callback", verifyMpesaSignature, mpesaCallback);
router.post("/mpesa/paybill",  verifyMpesaSignature, paybillCallback);

router.post("/invoices/generate", protect, authorize("ADMIN"), generateInvoices);
router.get("/invoices", protect, authorize("ADMIN", "TEACHER"), getInvoices);
router.get("/defaulters", protect, authorize("ADMIN", "TEACHER"), getDefaulters);
router.get("/receipt/:paymentId/pdf", protect, exportReceipt);

export default router;
