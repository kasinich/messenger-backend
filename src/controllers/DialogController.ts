import express from "express";
import socket from "socket.io";

import { DialogModel, MessageModel } from "../models";

class DialogController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }
  show = (req: any, res: express.Response) => {
    const userId: any = req.user._id;
    DialogModel.find()
      .or([{ author: userId }, { partner: userId }])
      .populate(["author", "partner"])
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
        },
      })
      .exec()
      .then((dialogs) => {
        return res.json(dialogs);
      })
      .catch((err) => {
        if (err.name === "CastError") {
          return res.status(404).json({
            message: "Dialogs not found",
          });
        } else {
          return res.status(500).json({
            message: "Internal Server Error",
          });
        }
      });
  };

  create = (req: express.Request, res: express.Response) => {
    const postData = {
      author: req.user._id,
      partner: req.body.partner,
    };

    DialogModel.findOne({
      author: req.user._id,
      partner: req.body.partner,
    })
      .exec()
      .then((dialog) => {
        if (dialog) {
          return res.status(403).json({
            status: "error",
            message: "Такой диалог уже есть",
          });
        } else {
          const dialog = new DialogModel(postData);
          dialog
            .save()
            .then((dialogObj: any) => {
              const message = new MessageModel({
                text: req.body.text,
                user: req.user._id,
                dialog: dialogObj._id,
              });

              message
                .save()
                .then(() => {
                  dialogObj.lastMessage = message._id;
                  dialogObj.save().then(() => {
                    res.json(dialogObj);
                    this.io.emit("SERVER:DIALOG_CREATED", {
                      ...postData,
                      dialog: dialogObj,
                    });
                  });
                })
                .catch((reason) => {
                  res.json(reason);
                });
            })
            .catch((reason) => {
              res.json(reason);
            });
        }
      });
  };

  delete = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    DialogModel.findByIdAndDelete(id)
      .exec()
      .then((dialog) => {
        return (
          dialog &&
          res.json({
            message: "Dialog removed",
          })
        );
      })
      .catch(() => {
        return res.status(404).json({
          message: "Dialog not found",
        });
      });
  };
}

export default DialogController;
