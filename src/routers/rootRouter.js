import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const rootRouter = express.Router();

// Root Routers of Users
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);

// Root Routers of Videos
rootRouter.get("/", home);
rootRouter.get("/search", search);

export default rootRouter;
