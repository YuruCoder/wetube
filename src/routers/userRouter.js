import express from "express";
import {
  logout,
  edit,
  remove,
  startGithubLogin,
  finishGithubLogin,
  see,
} from "../controllers/userController";

const userRouter = express.Router();

// Public User Routers
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);

// Personal User Routers
userRouter.get("/:id(\\d+)", see);

export default userRouter;
