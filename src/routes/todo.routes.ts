import { Router } from "express";
import { authenticationMiddleWare } from "../middleware/auth";
import {
  createTodoController,
  removeTodoController,
  updateTodoController,
} from "../controllers/todo.controller";

const router = Router();

router.route("/").post(authenticationMiddleWare, createTodoController);
router.route("/:id").patch(authenticationMiddleWare, updateTodoController);

router
  .route("/:todoId/:teamId")
  .delete(authenticationMiddleWare, removeTodoController);

export default router;
