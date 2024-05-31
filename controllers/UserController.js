import NotificationModel from "../modules/Notification.js";
import LoadModel from "../modules/Load.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import CarrierModel from "../modules/Carrier.js";
import TruckModel from "../modules/Truck.js";

import {
  checkCountUsersByDate,
  checkRegisterSubOptions,
  loadPriceByDate,
} from "../utils/tools.js";
import RecoverModel from "../modules/RecoverPass.js";
import {
  generateVerificationCode,
  sendMessageToMail,
} from "../utils/NodeMailer.js";
import { isValidPassword } from "../utils/handleValidationErrors.js";
