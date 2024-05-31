import LoadModel from "../models/Load.js";

import CustomersModel from "../models/Customer.js";
import SubCustomersModel from "../models/SubCustomer.js";
import SubCarrierModel from "../models/SubCarrier.js";
import CarrierModel from "../models/Carrier.js";
import TruckModel from "../models/Truck.js";

import { checkCountUsersByDate, loadPriceByDate } from "../utils/tools.js";

export const workersSalary = async (req, res) => {
  try {
    let userId = req.userId;
    let userType = req.body.userType;

    let user;
    if (userType === "customer") {
      user = await CustomersModel.findById(userId)
        .populate("subCustomers")
        .exec();
    } else if (userType === "carrier") {
      user = await CarrierModel.findById(userId)
        .populate("subCarrier trucks")
        .exec();
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subEntities =
      userType === "customer" ? user.subCustomers : user.subCarrier;
    const subEntityResults = [];

    for (const subEntity of subEntities) {
      const loads = await LoadModel.find({
        subContactInfo: subEntity._id,
      }).exec();
      const totalPrice = loads.reduce((acc, load) => acc + (load.rate || 0), 0);
      const monthlyAmounts = {};

      for (const load of loads) {
        const month = new Date(load.date).getMonth() + 1;
        if (!monthlyAmounts[month]) {
          monthlyAmounts[month] = 0;
        }
        monthlyAmounts[month] += load.rate || 0;
      }

      const amountPerMonth = Object.values(monthlyAmounts).reduce(
        (acc, amount) => acc + amount,
        0
      );

      const subEntityResult = {
        username: subEntity.firstName + " " + subEntity.lastName,
        email: subEntity.email,
        amount: totalPrice,
        amountPerMonth: amountPerMonth,
      };

      subEntityResults.push(subEntityResult);
    }

    return subEntityResults;
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userStatistic = async (req, res) => {
  //count
  try {
    let subCustomers = null;
    if (req.body.userType === "customer") {
      subCustomers = await SubCustomersModel.find(
        { parent: req.userId },
        { createdAt: 1 }
      );
    } else if (req.body.userType === "carrier") {
      subCustomers = await SubCustomersModel.find(
        { _id: req.userId },
        { createdAt: 1 }
      );
    }

    const output = checkCountUsersByDate(subCustomers, "users");

    // res.json(output);
    return output;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "An error occurred while processing the request. Please try again later.",
    });
  }
};

export const loadCountStatistic = async (req, res) => {
  try {
    let subCustomerLoads = null;
    if (req.body.userType === "customer") {
      subCustomerLoads = await LoadModel.find(
        {
          contactInfo: { $in: req.userId },
          status: "paid",
        },
        { createdAt: 1 }
      );
    } else if (req.body.userType === "carrier") {
      subCustomerLoads = await TruckModel.find(
        {
          contactInfo: { $in: req.userId },
          status: "paid",
        },
        { createdAt: 1 }
      );
    } else if (req.body.userType === "subCustomer") {
      subCustomerLoads = await LoadModel.find(
        {
          subContactInfo: { $in: req.userId },
          status: "paid",
        },
        { createdAt: 1 }
      );
    } else if (req.body.userType === "subCarrier") {
      subCustomerLoads = await TruckModel.find(
        {
          subContactInfo: { $in: req.userId },
          status: "paid",
        },
        { createdAt: 1 }
      );
    }
    // const subCustomerLoads = await LoadModel.find(
    //   {
    //     subContactInfo: { $in: subCustomerIds },
    //     status: "paid",
    //   },
    //   { createdAt: 1 }
    // );

    const output = checkCountUsersByDate(subCustomerLoads, "loadCount");

    // res.json(output);
    return output;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const loadPriceStatistic = async (req, res) => {
  try {
    const userId = req.userId;

    let load = null;

    if (req.body.userType === "customer") {
      load = await LoadModel.find({
        contactInfo: userId,
        status: "paid",
      }).select("rate createdAt");
    } else if (req.body.userType === "carrier") {
      load = await TruckModel.find({
        contactInfo: userId,
        status: "paid",
      }).select("rate createdAt");
    } else if (req.body.userType === "subCustomer") {
      load = await LoadModel.find({
        subContactInfo: userId,
        status: "paid",
      }).select("rate createdAt");
    } else if (req.body.userType === "subCarrier") {
      load = await TruckModel.find({
        subContactInfo: userId,
        status: "paid",
      }).select("rate createdAt");
    }

    let output = loadPriceByDate(load, "rate");

    // res.json(output);
    return output;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        "An error occurred while processing the request. Please try again later.",
    });
  }
};

export const loadStatistic = async (req, res) => {
  try {
    const userId = req.userId;

    let mainUserItems = null;
    let subUserItems = null;

    if (req.body.userType === "customer") {
      mainUserItems = await LoadModel.find({
        contactInfo: userId,
      }).select("status");

      const subCustomers = await SubCustomersModel.find({ parent: userId });
      const subCustomerIds = subCustomers.map((subCustomer) => subCustomer._id);

      subUserItems = await LoadModel.find({
        subContactInfo: { $in: subCustomerIds },
      }).select("status");
    } else if (req.body.userType === "carrier") {
      mainUserItems = await TruckModel.find({
        contactInfo: userId,
      }).select("status");

      const subCarriers = await SubCarrierModel.find({ parent: userId });
      const subCarrierIds = subCarriers.map((subCarrier) => subCarrier._id);

      subUserItems = await TruckModel.find({
        subContactInfo: { $in: subCarrierIds },
      }).select("status");
    } else if (req.body.userType === "subCustomer") {
      mainUserItems = await LoadModel.find({
        subContactInfo: userId,
      }).select("status");
    } else if (req.body.userType === "subCarrier") {
      mainUserItems = await TruckModel.find({
        subContactInfo: userId,
      }).select("status");
    }

    const AllLoads = (mainUserItems, subUserItems) => {
      if (mainUserItems && subUserItems) {
        return [...mainUserItems, ...subUserItems];
      } else if (!mainUserItems && subUserItems) {
        return subUserItems;
      } else if (mainUserItems && !subUserItems) {
        return mainUserItems;
      }
    };

    let statistic = {
      open: 0,
      onRoad: 0,
      delivered: 0,
      paid: 0,
    };

    const statusMapping = {
      open: "open",
      onRoad: "onRoad",
      delivered: "delivered",
      paid: "paid",
    };

    AllLoads(mainUserItems, subUserItems).forEach((item) => {
      const status = statusMapping[item.status];
      if (status) {
        statistic[status]++;
      }
    });

    // res.json(statistic);
    return statistic;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const Statistics = async (req, res) => {
  try {
    console.log(req.body);

    let workers = null;
    let user = null;
    if (!req.body.userType.includes("sub")) {
      workers = await workersSalary(req, res);
      user = await userStatistic(req, res);
    }
    let loadCount = await loadCountStatistic(req, res);
    let loadPrice = await loadPriceStatistic(req, res);
    let income = loadPrice.map((item) => {
      if (item.rate === 0) {
        return { rate: item.rate };
      } else {
        return { rate: Math.floor((item.rate / 100) * 10) };
      }
    });
    let load = await loadStatistic(req, res);

    let statistica = null;
    if (!req.body.userType.includes("sub")) {
      statistica = {
        workers: workers,
        user: user,
        loadCount: loadCount,
        loadPrice: loadPrice,
        income: income,
        loadStatistic: load,
      };
    } else {
      statistica = {
        loadCount: loadCount,
        loadPrice: loadPrice,
        income: income,
        loadStatistic: load,
      };
    }

    console.log(statistica);
    res.json(statistica);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};
