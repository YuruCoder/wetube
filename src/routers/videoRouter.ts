import express from "express";
import {
  deleteVideo,
  getEdit,
  getUpload,
  postEdit,
  postUpload,
  watch,
} from "../controllers/videoController";
import { protectorMiddleware, uploadVideoMiddleware } from "../middlewares";

const videoRouter = express.Router();

// Public Video Routers
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(uploadVideoMiddleware.single("video"), postUpload);

// Personal Video Routers
const HEXA = "([0-9a-f]{24})";
videoRouter.get(`/:id${HEXA}`, watch);
videoRouter
  .route(`/:id${HEXA}/edit`)
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter.get(`/:id${HEXA}/delete`, protectorMiddleware, deleteVideo);

export default videoRouter;
