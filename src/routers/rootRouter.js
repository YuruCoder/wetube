import express from "express";
import { getJoin, postJoin, login } from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const rootRouter = express.Router();

// Root Routers of Users
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.get("/login", login);

// Root Routers of Videos
rootRouter.get("/", home);
rootRouter.get("/search", search);

export default rootRouter;
