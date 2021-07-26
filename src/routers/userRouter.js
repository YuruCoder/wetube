import express from "express";
import { logout, edit, remove, see } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/:id(\\d+)", see);
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);

export default userRouter;
