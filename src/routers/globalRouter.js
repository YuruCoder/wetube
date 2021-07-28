import express from "express";
import { join, login } from "../controllers/userController";
import { trending } from "../controllers/videoController";

const globalRouter = express.Router();

// User
globalRouter.get("/join", join);
globalRouter.get("/login", login);

// Video
globalRouter.get("/", trending);

export default globalRouter;
