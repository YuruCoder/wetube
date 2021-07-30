import express from "express";
import { logout, edit, remove, see } from "../controllers/userController";

const userRouter = express.Router();

// Global User Routers
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);

// Personal User Routers
userRouter.get("/:id(\\d+)", see);

export default userRouter;
