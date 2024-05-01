import express from "express";
import morgan from "morgan";
import notFound from "./middleware/not-found";
import routerErrorHandler from "./middleware/routerErrorHandler";
import cors from "cors";
import path from "path";

import userRoutes from "./routes/user.routes";
import teamRoutes from "./routes/team.routes";
import todoRouter from "./routes/todo.routes";
import commentRouter from "./routes/comment.routes";
import notificationRouter from "./routes/notification.routes";

const app = express();
// middlewares

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
const staticPaths = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(staticPaths));

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/todos", todoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/notifications", notificationRouter);

// error handler
app.use(notFound);
app.use(routerErrorHandler);

export default app;
