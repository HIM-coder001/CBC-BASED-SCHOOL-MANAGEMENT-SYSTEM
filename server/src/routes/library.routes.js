import express from "express";
import { getBooks, createBook, loanBook, returnBook, getLoans } from "../controllers/library.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/books", protect, authorize("ADMIN", "TEACHER"), getBooks);
router.post("/books", protect, authorize("ADMIN"), createBook);
router.get("/loans", protect, authorize("ADMIN", "TEACHER"), getLoans);
router.post("/loans", protect, authorize("ADMIN", "TEACHER"), loanBook);
router.put("/loans/:id/return", protect, authorize("ADMIN", "TEACHER"), returnBook);

export default router;
