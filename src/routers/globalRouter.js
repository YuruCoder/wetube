import express from "express";
import { join, login } from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const globalRouter = express.Router();

// Global Routers of Users
globalRouter.get("/join", join);
globalRouter.get("/login", login);

// Global Routers of Videos
globalRouter.get("/", home);
globalRouter.get("/search", search);

export default globalRouter;
