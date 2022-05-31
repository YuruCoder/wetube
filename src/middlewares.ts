import { NextFunction, Request, Response } from "express";
import multer from "multer";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const localsMiddleware: Middleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  res.locals.siteName = "Wetube";
  next();
};

export const protectorMiddleware: Middleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login");
};

export const publicOnlyMiddleware: Middleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  }
  return res.redirect("/");
};

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
});

export const uploadVideoMiddleware = multer({
  dest: "uploads/videos/",
  limits: {
    fieldSize: 10000000,
  },
});
