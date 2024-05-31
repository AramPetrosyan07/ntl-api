import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import * as Notification from "./services/Notification.service.js";
import * as Statustic from "./services/Statistic.service.js";
import * as LoadController from "./services/Load.service.js";
import * as Auth from "./services/Auth.service.js";
import * as User from "./services/User.service.js";
import * as SubCustomer from "./services/SubCustomer.service.js";
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

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  Auth.register
);
app.post("/auth/login", loginValidation, handleValidationErrors, Auth.login);
app.post(
  "/auth/changePass",
  changePassValidation,
  handleValidationErrors,
  Auth.changePass
);
app.post("/auth/me", checkAuth, Auth.getMe);
app.post("/auth/registerSub", checkAuth, Auth.registerSub);

app.post("/user/updateUser", checkAuth, User.updateUser);
app.post("/user/UserSubs", checkAuth, User.getUserSubs);
app.post(
  "/user/changePassword",
  checkAuth,
  sendValidation,
  handleValidationErrors,
  User.changePass
);

app.post("/statistic/statisticSalary", checkAuth, Statustic.workersSalary);
app.post("/statistic/statisticUser", checkAuth, Statustic.userStatistic);
app.post(
  "/statistic/statisticLoadCount",
  checkAuth,
  Statustic.loadCountStatistic
);
app.post(
  "/statistic/statisticLoadPrice",
  checkAuth,
  Statustic.loadPriceStatistic
);
app.post("/statistic/statisticLoad", checkAuth, Statustic.loadStatistic);
app.post("/statistic/statistics", checkAuth, Statustic.Statistics);

app.post("/customersInfo/removeSub", checkAuth, SubCustomer.removeSub);

app.post("/customersInfo/getDetailSub", checkAuth, SubCustomer.getDetailSub);

app.post("/load/add", checkAuth, LoadController.addNewLoad);
app.get("/load/get", LoadController.getLoads);
app.post("/load/getUserLoads", checkAuth, LoadController.getUserLoads);
app.post("/load/getDetail", LoadController.getDetailLoad);
app.post("/load/updateLoad", checkAuth, LoadController.updateLoad);
app.post("/load/deleteLoad", checkAuth, LoadController.deleteLoad);

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
  Notification.getNotification
);
app.post(
  "/notification/pinNotification",
  checkAuth,
  Notification.pinNotification
);
app.post(
  "/notification/openNotification",
  checkAuth,
  Notification.openNotification
);
app.post(
  "/notification/deleteNotification",
  checkAuth,
  Notification.deleteNotification
);

app.listen(4000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started localhost 4000 port");
});
