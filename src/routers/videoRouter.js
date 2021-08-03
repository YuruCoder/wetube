import express from "express";
import {
  getUpload,
  postUpload,
  watch,
  getEdit,
  postEdit,
  deleteVideo,
} from "../controllers/videoController";

const videoRouter = express.Router();

// Public Video Routers
videoRouter.route("/upload").get(getUpload).post(postUpload);

// Personal Video Routers
const HEXA = "([0-9a-f]{24})";
videoRouter.get(`/:id${HEXA}`, watch);
videoRouter.route(`/:id${HEXA}/edit`).get(getEdit).post(postEdit);
videoRouter.get(`/:id${HEXA}/delete`, deleteVideo);

export default videoRouter;
