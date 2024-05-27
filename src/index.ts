import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

import "./core/db";
import createRoutes from "./core/routes";
import createSocket from "./core/socket";

const app = express();
const http = createServer(app);
const io = createSocket(http);

app.use(cors({
  origin: "localhost:3000"
}))

createRoutes(app, io);

http.listen(process.env.URL, () => {
  console.log(`Server: ${process.env.URL}`);
});
