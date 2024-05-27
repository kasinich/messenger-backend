import express from "express";
import socket from "socket.io";

import { MessageModel, UserModel, DialogModel } from "../models";

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  updateReadStatus = (
    res: express.Response,
    userId: string,
    dialogId: string
  ) => {
    MessageModel.updateMany(
      { dialog: dialogId, user: { $ne: userId } },
      { $set: { read: true } }
    )
      .exec()
      .then((dialog) => {
        this.io.emit("SERVER:MESSAGES_READED", {
          userId,
          dialogId,
        });
      });
  };

  show = (req: express.Request, res: express.Response) => {
    const dialogId: any = req.query.dialog;
    const userId = req.user._id;

    this.updateReadStatus(res, userId, dialogId);

    MessageModel.find({ dialog: dialogId })
      .populate(["dialog", "user", "attachments"])
      .exec()
      .then((messages) => {
        return res.json(messages);
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

  create = (req: any, res: express.Response) => {
    const userId = req.user._id;

    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      user: userId,
    };

    const message = new MessageModel(postData);

    message
      .save()
      .then((obj: any) => {
        return MessageModel.findById(obj._id)
          .populate(["dialog", "user", "attachments"])
          .exec();
      })
      .then((populatedMessage: any) => {
        const dialogId = postData.dialog;
        const messageId = populatedMessage._id;

        DialogModel.findOneAndUpdate(
          { _id: dialogId },
          { lastMessage: messageId },
          { upsert: true }
        ).exec();

        res.json(populatedMessage);
        this.io.emit("SERVER:NEW_MESSAGE", populatedMessage);
      })
      .catch((error) => {
        res.status(500).json({
          status: "error",
          message: error.message,
        });
      });
  };

  delete = (req: express.Request, res: express.Response) => {
    const id = req.query.id;
    const userId: string = req.user._id;

    MessageModel.findById(id)
      .then((message: any) => {
        if (!message) {
          return res.status(404).json({
            status: "error",
            message: "Message not found",
          });
        }
        if (message.user.toString() === userId) {
          const dialogId = message.dialog;

          MessageModel.findByIdAndDelete(id)
            .then(() => {
              res.json({
                status: "success",
                message: "Message removed",
              });
            })
            .catch((err) => {
              res.status(500).json({
                status: "error",
                message: err.message || "Internal Server Error",
              });
            });
          MessageModel.findOne({ dialog: dialogId })
            .sort({ createdAt: -1 })
            .lean()
            .exec()
            .then((lastMessage) => {
              DialogModel.findById(dialogId).then((dialog: any) => {
                dialog.lastMessage = lastMessage;
                dialog.save();
              });
            });
        } else {
          return res.status(403).json({
            status: "error",
            message: "Not have permission",
          });
        }
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: "error",
          message: err.message || "Internal Server Error",
        });
      });
  };
}

export default MessageController;
