import e from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = e();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(e.urlencoded({ extended: true }));

interface ISessionOptions {
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  store: MongoStore;
}

const sessionOptions: ISessionOptions = {
  secret: String(process.env.COOKIE_SECRET),
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL,
  }),
};

app.use(session(sessionOptions));

// Apps

app.use(localsMiddleware);
app.use("/uploads", e.static("uploads"));
app.use("/assets", e.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
