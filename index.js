import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import * as CustomerController from "./controllers/CustomerController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import { registerValidation, loginValidation } from "./Validations.js";
import checkAuth from "./utils/checkAuth.js";

mongoose
  .connect(process.env.MONGO_KEY)
  .then(() => console.log("DB ok"))
  .catch(() => console.log("DB error"));

const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  // console.log(req.socket.remoteAddress);
});

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  CustomerController.register
);

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  CustomerController.login
);

app.get("/auth/me", checkAuth, CustomerController.getMe);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
