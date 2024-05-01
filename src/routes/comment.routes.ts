import { Router } from "express";
import { authenticationMiddleWare } from "../middleware/auth";
import {
  createCommentController,
  getTeamCommentsController,
} from "../controllers/comment.controller";

const router = Router();

router.route("/").post(authenticationMiddleWare, createCommentController);
router
  .route("/:teamId")
  .get(authenticationMiddleWare, getTeamCommentsController);

export default router;
