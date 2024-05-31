import express from "express";
import * as LoadController from "../services/Load.service.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/add", checkAuth, LoadController.addNewLoad);
router.get("/get", LoadController.getLoads);
router.post("/getUserLoads", checkAuth, LoadController.getUserLoads);
router.post("/getDetail", LoadController.getDetailLoad);
router.post("/updateLoad", checkAuth, LoadController.updateLoad);
router.post("/deleteLoad", checkAuth, LoadController.deleteLoad);

export default router;
