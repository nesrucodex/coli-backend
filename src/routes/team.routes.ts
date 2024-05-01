import { Router } from "express";
import {
  requestMember,
  createTeam,
  getTeam,
  getTeams,
  removeMember,
  updateMemberStatus,
  updateTeam,
  deleteTeam,
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
  )
  .patch(authenticationMiddleWare);
router.route("/dnd/:teamId");

router.route("/members").post(authenticationMiddleWare, requestMember);
router
  .route("/members/:id/:memberId")
  .delete(authenticationMiddleWare, removeMember);

router
  .route("/:id")
  .get(authenticationMiddleWare, getTeam)
  .patch(
    authenticationMiddleWare,
    teamProfileUploader.single("profile"),
    updateTeam
  )
  .delete(authenticationMiddleWare, deleteTeam);

router
  .route("/members/status")
  .patch(authenticationMiddleWare, updateMemberStatus);

export default router;
