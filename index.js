import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import * as CustomerController from "./controllers/CustomerController.js";
import * as LoadController from "./controllers/LoadController.js";
import * as DriverController from "./controllers/DriverController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import {
  registerValidation,
  loginValidation,
  changePassValidation,
  sendValidation,
} from "./Validations.js";
import checkAuth from "./utils/checkAuth.js";
import {
  PassRecovery,
  RecoverResponse,
  RecoverSend,
} from "./utils/NodeMailer.js";

mongoose
  .connect(process.env.MONGO_KEY)
  .then(() => console.log("DB ok"))
  .catch(() => console.log("DB error"));

const app = express();
app.use(cors());

app.use(express.json());

app.get("/test", async (req, res) => {
  try {
    res.json("working");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизаваться",
    });
  }
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

app.post(
  "/auth/changePass",
  changePassValidation,
  handleValidationErrors,
  CustomerController.changePass
);

app.post("/auth/me", checkAuth, CustomerController.getMe);

app.post(
  "/auth/registerSub",
  checkAuth,
  // registerValidation,
  // handleValidationErrors,
  CustomerController.registerSub
);

app.post(
  "/customersInfo/CustomersSubs",
  checkAuth,
  CustomerController.getCustomersSubs
);

app.post(
  "/customersInfo/getDetailSub",
  checkAuth,
  CustomerController.getDetailSub
);

app.post("/load/add", checkAuth, LoadController.addNewLoad);
app.get("/load/get", LoadController.getLoads);
app.post("/load/getUserLoads", checkAuth, LoadController.getUserLoads);
app.post("/load/getDetail", LoadController.getDetailLoad);
app.post("/load/updateLoad", checkAuth, LoadController.updateLoad);
app.post("/load/deleteLoad", checkAuth, LoadController.deleteLoad);

app.post("/recover/send", sendValidation, handleValidationErrors, RecoverSend);
app.post("/recover/response", RecoverResponse);
app.post(
  "/recover/PassRecovery",
  loginValidation,
  handleValidationErrors,
  PassRecovery
);

app.post("/truck/add", checkAuth, DriverController.addTruck);
app.get("/truck/get", DriverController.getTrucks);
app.post("/truck/getUserTrucks", checkAuth, DriverController.getUserTrucks);
app.post("/truck/updateTruck", checkAuth, DriverController.updateTruck);
app.post("/truck/deleteTruck", checkAuth, DriverController.deleteTruck);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
