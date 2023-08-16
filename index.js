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
// app.use(cors());

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

app.get("/auth/me", checkAuth, CustomerController.getMe);

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
app.post("/load/get", checkAuth, LoadController.getLoads);
app.post("/load/getDetail", checkAuth, LoadController.getDetailLoad);
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

app.post("/driver/addTrick", checkAuth, DriverController.addTrick);
app.post("/driver/getTricks", checkAuth, DriverController.getTrick);
app.post("/driver/getDriverDetail", checkAuth, DriverController.getDriver);
app.post("/driver/updateTruck", checkAuth, DriverController.updateTruck);
app.post("/driver/deleteTruck", checkAuth, DriverController.deleteTruck);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
