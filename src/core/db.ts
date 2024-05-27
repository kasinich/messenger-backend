import mongoose from "mongoose";
//mongodb+srv://kasinak:kartoshka.medved.phone12@messenger.ydvon1k.mongodb.net/messenger?retryWrites=true&w=majority&appName=messenger
//mongodb://127.0.0.1:27017/messenger
mongoose
  .connect(
    "mongodb+srv://kasinak:kartoshka.medved.phone12@messenger.ydvon1k.mongodb.net/messenger?retryWrites=true&w=majority&appName=messenger"
  )
  .then(() => {
    console.log("connect");
  })
  .catch(() => {
    console.log("error");
  });
