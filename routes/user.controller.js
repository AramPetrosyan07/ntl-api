import express from "express";
import * as User from "../services/User.service.js";
import checkAuth from "../utils/checkAuth.js";
import { sendValidation } from "../Validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";

const router = express.Router();

router.post("/updateUser", checkAuth, User.updateUser);
router.post("/UserSubs", checkAuth, User.getUserSubs);
router.post(
  "/changePassword",
  checkAuth,
  sendValidation,
  handleValidationErrors,
  User.changePass
);

export default router;
