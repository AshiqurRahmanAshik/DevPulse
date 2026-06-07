import { Router } from "express";

import { issueController } from "./issue.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, issueController.createIssue);
router.get("/", issueController.getIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", authMiddleware, issueController.updateIssue);
router.delete("/:id", authMiddleware, issueController.deleteIssue);

export const issueRoute = router;
