import express from "express";
import {
  createParent, getAllParents, getParentDetails, getParentByUserId,
  getChildrenGrades, getChildrenReportCards, getChildrenAttendance,
  getChildrenAssignments, sendMessageToTeacher, getMessages,
  markMessageAsRead, updateParent, deleteParent,
} from "../controllers/parent.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",  protect, authorize("ADMIN"),             validate(schemas.createParent), createParent);
router.get("/",   protect, authorize("ADMIN"),             getAllParents);
router.get("/me", protect, authorize("PARENT", "ADMIN"),   getParentByUserId);

router.get("/:id",                  protect,                               getParentDetails);
router.get("/:parentId/grades",     protect, authorize("PARENT", "ADMIN"), getChildrenGrades);
router.get("/:parentId/report-cards",protect, authorize("PARENT", "ADMIN"),getChildrenReportCards);
router.get("/:parentId/attendance", protect, authorize("PARENT", "ADMIN"), getChildrenAttendance);
router.get("/:parentId/assignments",protect, authorize("PARENT", "ADMIN"), getChildrenAssignments);
router.get("/:parentId/messages",   protect, authorize("PARENT", "ADMIN", "TEACHER"), getMessages);

router.post("/:parentId/messages",  protect, authorize("PARENT"),          validate(schemas.sendParentMessage), sendMessageToTeacher);
router.put("/messages/:id/read",    protect,                               markMessageAsRead);
router.put("/:id",                  protect,                               validate(schemas.updateParent),      updateParent);
router.delete("/:id",               protect, authorize("ADMIN"),           deleteParent);

export default router;
