import express from "express";
import * as Notification from "../services/Notification.service.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.get("/getNotification", checkAuth, Notification.getNotification);
router.post("/pinNotification", checkAuth, Notification.pinNotification);
router.post("/openNotification", checkAuth, Notification.openNotification);
router.post("/deleteNotification", checkAuth, Notification.deleteNotification);

export default router;
