import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import * as UserController from "./controllers/UserController.js";
import * as LoadController from "./controllers/LoadController.js";
import * as TruckController from "./controllers/TruckController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import {
  registerValidation,
  loginValidation,
  changePassValidation,
  sendValidation,
} from "./Validations.js";
import checkAuth from "./utils/checkAuth.js";
import {
  ChangeEmail,
  CheckCode,
  PassRecovery,
  RecoverResponse,
  RecoverSend,
  SendCodeToMail,
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
  UserController.register
);

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  "/auth/changePass",
  changePassValidation,
  handleValidationErrors,
  UserController.changePass
);

app.post("/auth/me", checkAuth, UserController.getMe);

app.post(
  "/auth/registerSub",
  checkAuth,
  // registerValidation,
  // handleValidationErrors,
  UserController.registerSub
);

app.post("/user/updateUser", checkAuth, UserController.updateUser);
app.post("/user/UserSubs", checkAuth, UserController.getUserSubs);

//for test
//{
app.post("/user/statisticSalary", checkAuth, UserController.workersSalary);
app.post("/user/statisticUser", checkAuth, UserController.userStatistic);
app.post(
  "/user/statisticLoadCount",
  checkAuth,
  UserController.loadCountStatistic
);
app.post(
  "/user/statisticLoadPrice",
  checkAuth,
  UserController.loadPriceStatistic
);
app.post("/user/statisticLoad", checkAuth, UserController.loadStatistic);
//}
app.post("/user/statistics", checkAuth, UserController.Statistics);

// app.get("/customersInfo/CarrierSubs", checkAuth, UserController.getCarrierSubs);

app.post("/customersInfo/removeSub", checkAuth, UserController.removeSub);

app.post("/customersInfo/getDetailSub", checkAuth, UserController.getDetailSub);

app.post("/load/add", checkAuth, LoadController.addNewLoad);
app.get("/load/get", LoadController.getLoads);
app.post("/load/getUserLoads", checkAuth, LoadController.getUserLoads);
app.post("/load/getDetail", LoadController.getDetailLoad);
app.post("/load/updateLoad", checkAuth, LoadController.updateLoad);
app.post("/load/deleteLoad", checkAuth, LoadController.deleteLoad);

app.post(
  "/changePassword",
  checkAuth,
  sendValidation,
  handleValidationErrors,
  UserController.changePass
);

app.post("/recover/send", sendValidation, handleValidationErrors, RecoverSend);
app.post("/recover/response", RecoverResponse);
app.post("/recover/PassRecovery", PassRecovery);

// change Email
app.post("/email/send", sendValidation, handleValidationErrors, SendCodeToMail);
app.post("/email/check", CheckCode);
app.post("/email/change", ChangeEmail);

app.post("/truck/add", checkAuth, TruckController.addTruck);
app.get("/truck/get", TruckController.getTrucks);
app.post("/truck/getUserTrucks", checkAuth, TruckController.getUserTrucks);
app.post("/truck/updateTruck", checkAuth, TruckController.updateTruck);
app.post("/truck/deleteTruck", checkAuth, TruckController.deleteTruck);

app.get(
  "/notification/getNotification",
  checkAuth,
  UserController.getNotification
);
app.post(
  "/notification/pinNotification",
  checkAuth,
  UserController.pinNotification
);
app.post(
  "/notification/pinNotification",
  checkAuth,
  UserController.unpinNotification
);
app.post(
  "/notification/openNotification",
  checkAuth,
  UserController.openNotification
);
app.post(
  "/notification/deleteNotification",
  checkAuth,
  UserController.deleteNotification
);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
