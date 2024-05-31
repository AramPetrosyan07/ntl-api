import express from "express";
import * as Statustic from "../services/Statistic.service.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/statisticSalary", checkAuth, Statustic.workersSalary);
router.post("/statisticUser", checkAuth, Statustic.userStatistic);
router.post("/statisticLoadCount", checkAuth, Statustic.loadCountStatistic);
router.post("/statisticLoadPrice", checkAuth, Statustic.loadPriceStatistic);
router.post("/statisticLoad", checkAuth, Statustic.loadStatistic);
router.post("/statistics", checkAuth, Statustic.Statistics);

export default router;
