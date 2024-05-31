import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import routes from "./routes/index.controller.js";
import connectDB from "./DataBase/mongoose.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", routes);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
