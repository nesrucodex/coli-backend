import { Router } from "express";
import {
  signInController,
  signUpController,
  getUserController,
  getSearchedUsersController,
} from "../controllers/user.controller";
import { authenticationMiddleWare } from "../middleware/auth";
import { userProfileUploader } from "../middleware/multer";
const router = Router();
router.route("/").post(authenticationMiddleWare, getSearchedUsersController);
router.route("/user").get(authenticationMiddleWare, getUserController);
router.route("/sign-in").post(signInController);
router
  .route("/sign-up")
  .post(userProfileUploader.single("profile"), signUpController);
export default router;
