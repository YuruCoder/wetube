import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";
import mongoose from "mongoose";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));

interface IUser {
  email: string;
  avatarUrl: string;
  socialOnly: boolean;
  username: string;
  password: string;
  name: string;
  location: string;
  videos: mongoose.Schema.Types.ObjectId[];
}

declare module "express-session" {
  interface SessionData {
    loggedIn: boolean;
    user: IUser;
  }
}

app.use(
  session({
    secret: JSON.stringify(process.env.COOKIE_SECRET),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);

// Apps

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
