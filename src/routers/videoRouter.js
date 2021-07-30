import express from "express";
import {
  getUpload,
  postUpload,
  watch,
  getEdit,
  postEdit,
} from "../controllers/videoController";

const videoRouter = express.Router();

// Global Video Routers
videoRouter.route("/upload").get(getUpload).post(postUpload);

// Personal Video Routers
videoRouter.get("/:id(\\d+)", watch);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);

export default videoRouter;
