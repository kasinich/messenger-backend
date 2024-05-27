import express from "express";
import { UserModel } from "../models";

export default async (
  req: express.Request,
  __: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { last_seen: new Date() } },
      { new: true }
    );
  }
  next();
};
