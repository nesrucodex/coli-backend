import { Router } from "express";
import { authenticationMiddleWare } from "../middleware/auth";
import {
  getNotificationsController,
  deleteNotificationController,
  markNotificationAsReadController,
  createNotification,
} from "../controllers/notification.controller";

const router = Router();

router.route("/").post(authenticationMiddleWare, createNotification);

router
  .route("/:userId")
  .get(authenticationMiddleWare, getNotificationsController);
router
  .route("/:notificationId")
  .patch(authenticationMiddleWare, markNotificationAsReadController)
  .delete(authenticationMiddleWare, deleteNotificationController);

export default router;
