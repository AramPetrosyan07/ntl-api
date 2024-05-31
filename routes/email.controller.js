import express from "express";
import {
  ChangeEmail,
  CheckCode,
  PassRecovery,
  RecoverResponse,
  RecoverSend,
  SendCodeToMail,
} from "../services/NodeMailer.service.js";
import { sendValidation } from "../Validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";

const router = express.Router();

router.post("/send", sendValidation, handleValidationErrors, SendCodeToMail);
router.post("/check", CheckCode);
router.post("/change", ChangeEmail);

export default router;
