import { User } from "../../../../models/User";
import { NextFunction, Request, Response } from "express";

export interface RequestExtended extends Request {
  user?: User;
}
