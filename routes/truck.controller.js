import express from "express";
import * as TruckController from "../services/Truck.service.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/add", checkAuth, TruckController.addTruck);
router.get("/get", TruckController.getTrucks);
router.post("/getUserTrucks", checkAuth, TruckController.getUserTrucks);
router.post("/updateTruck", checkAuth, TruckController.updateTruck);
router.post("/deleteTruck", checkAuth, TruckController.deleteTruck);

export default router;
