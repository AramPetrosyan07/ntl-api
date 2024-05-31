// routes/index.js
import express from "express";
import authRoutes from "./auth.controller.js";
import userRoutes from "./user.controller.js";
import statisticRoutes from "./statistic.controller.js";
import loadRoutes from "./load.controller.js";
import emailRoutes from "./email.controller.js";
import truckRoutes from "./truck.controller.js";
import notificationRoutes from "./notification.controller.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/statistic", statisticRoutes);
router.use("/load", loadRoutes);
router.use("/email", emailRoutes);
router.use("/truck", truckRoutes);
router.use("/notification", notificationRoutes);

export default router;
