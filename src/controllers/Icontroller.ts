import { Request, Response } from "express";

declare module "express-session" {
  interface SessionData {
    loggedIn: boolean;
    user: any;
  }
}

interface MyRequest extends Request {
  file?: any;
}

export type Controller = (req: MyRequest, res: Response) => void;
