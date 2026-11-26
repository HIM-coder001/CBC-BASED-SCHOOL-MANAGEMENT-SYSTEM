import express from "express";
import {
  exportGradesToJSONController,
  exportGradesToCSVController,
  exportGradesToExcelController,
  exportReportCardToPDFController,
  exportCompetencyReportController,
  exportAllReportCardsController,
} from "../controllers/export.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Export grades to JSON
router.get(
  "/grades/json",
  protect,
  authorize("ADMIN", "TEACHER", "PARENT"),
  exportGradesToJSONController
);

// Export grades to CSV
router.get(
  "/grades/csv",
  protect,
  authorize("ADMIN", "TEACHER", "PARENT"),
  exportGradesToCSVController
);

// Export grades to Excel
router.get(
  "/grades/excel",
  protect,
  authorize("ADMIN", "TEACHER", "PARENT"),
  exportGradesToExcelController
);

// Export report card to PDF
router.get(
  "/report-card/:reportCardId/pdf",
  protect,
  exportReportCardToPDFController
);

// Export competency report to Excel
router.get(
  "/competency-report/excel",
  protect,
  authorize("ADMIN", "TEACHER", "PARENT"),
  exportCompetencyReportController
);

// Export all report cards to Excel
router.get(
  "/report-cards/excel",
  protect,
  authorize("ADMIN", "TEACHER"),
  exportAllReportCardsController
);

export default router;
