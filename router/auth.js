import express from "express";
import * as Auth from "../services/Auth.service.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";
import {
  registerValidation,
  loginValidation,
  changePassValidation,
} from "../Validations.js";

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  Auth.register
);
router.post("/login", loginValidation, handleValidationErrors, Auth.login);
router.post(
  "/changePass",
  changePassValidation,
  handleValidationErrors,
  Auth.changePass
);
router.post("/me", checkAuth, Auth.getMe);
router.post("/registerSub", checkAuth, Auth.registerSub);

export default router;
