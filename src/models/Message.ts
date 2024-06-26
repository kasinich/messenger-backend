import mongoose, { Schema, Document } from "mongoose";

const MessageSchema = new Schema(
  {
    text: { type: String, require: Boolean },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    dialog: { type: Schema.Types.ObjectId, ref: "Dialog", require: true },
    read: { type: Boolean, default: false },
    attachments: [{ type: Schema.Types.ObjectId, ref: "UploadFile"}]
  },
  {
    timestamps: true,
    usePushEach: true
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
