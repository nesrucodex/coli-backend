import { Router } from "express";
import {
  addMember,
  createTeam,
  getTeam,
  getTeams,
  removeMember,
  updateTodosOrderingController,
} from "../controllers/team.controller";
import { authenticationMiddleWare } from "../middleware/auth";
import { teamProfileUploader } from "../middleware/multer";

const router = Router();

router
  .route("/")
  .get(authenticationMiddleWare, getTeams)
  .post(
    authenticationMiddleWare,
    teamProfileUploader.single("profile"),
    createTeam
  );
router
  .route("/todos/:teamId")
  .patch(authenticationMiddleWare, updateTodosOrderingController);

router.route("/members").post(addMember);
router
  .route("/members/:id/:memberId")
  .delete(authenticationMiddleWare, removeMember);

router.route("/:id").get(authenticationMiddleWare, getTeam);

export default router;
