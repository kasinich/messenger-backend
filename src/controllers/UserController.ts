import express from "express";
import socket from "socket.io";
import { UserModel } from "../models";
import { IUser } from "../models/User";
import { createJWTToken, sendMail } from "../utils";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

class UserController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  show = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    UserModel.findById(id)
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }
        return res.json(user);
      })
      .catch((err) => {
        if (err.name === "CastError") {
          return res.status(404).json({
            message: "User not found",
          });
        } else {
          return res.status(500).json({
            message: "Internal Server Error",
          });
        }
      });
  };

  getMe = (req: any, res: express.Response) => {
    const id: string = req.user._id;
    UserModel.findById(id)
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }
        return res.json(user);
      })
      .catch((err) => {
        if (err.name === "CastError") {
          return res.status(404).json({
            message: "User not found",
          });
        } else {
          return res.status(500).json({
            message: "Internal Server Error",
          });
        }
      });
  };
  findUsers = (req: any, res: express.Response) => {
    const query: string = req.query.query;
    UserModel.find()
      .or([
        { fullname: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ])
      .then((users: any) => res.json(users))
      .catch((err: any) => {
        return res.status(404).json({
          status: "error",
          message: err,
        });
      });
  };

  create = (req: express.Request, res: express.Response) => {
    const postData = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password,
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new UserModel(postData);

    user
      .save()
      .then((obj: any) => {
        res.json(obj);

        sendMail(obj.email, obj.confirm_hash);
      })
      .catch((reason) => {
        return res.status(500).json({
          status: "error",
          message: reason,
        });
      });
  };

  verify = (req: express.Request, res: express.Response) => {
    const hash = req.query.hash;

    if (!hash) {
      return res.status(422).json({ errors: "Invalide hash" });
    }

    UserModel.findOne({ confirm_hash: hash })
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "Hash not found",
          });
        }
        user.confirmed = true;

        user.save().then((user) => {
          if (!user) {
            return res.status(404).json({
              status: "error",
              message: "Hash not found",
            });
          }
          res.json({
            status: "success",
            message: "Аккаунт успешно подтвержден!",
          });
        });
      })
      .catch((err) => {
        if (err.name === "CastError") {
          return res.status(404).json({
            message: "User not found",
          });
        } else {
          return res.status(500).json({
            message: "Internal Server Error",
          });
        }
      });
  };

  login = (req: express.Request, res: express.Response) => {
    const postData = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    UserModel.findOne({ email: postData.email })
      .then((userDoc) => {
        const user = userDoc as IUser | null;
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (bcrypt.compareSync(postData.password, user.password || "")) {
          const token = createJWTToken(user);
          return res.json({
            status: "success",
            token,
          });
        } else {
          return res.json({
            status: "error",
            message: "Incorrect password or email",
          });
        }
      })
      .catch(() => {
        return res.status(500).json({
          message: "Internal Server Error",
        });
      });
  };

  delete = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    UserModel.findByIdAndDelete(id)
      .exec()
      .then((user) => {
        return (
          user &&
          res.json({
            message: `User ${user.fullname} removed`,
          })
        );
      })
      .catch(() => {
        return res.status(404).json({
          message: "User not found",
        });
      });
  };
}

export default UserController;
