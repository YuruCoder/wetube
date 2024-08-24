import express from "express";
import morgan from "morgan";
import flash from "express-flash";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware, sessionMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

// template engine
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// middlewares
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use(flash());
app.use(localsMiddleware);

// static
app.use("/static", express.static("assets"));
app.use("/uploads", express.static("uploads"));

// routers
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
