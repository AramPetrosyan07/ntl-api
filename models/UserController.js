import LoadModel from "../modules/Load.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import CarrierModel from "../modules/Carrier.js";
import { checkRegisterSubOptions } from "../utils/tools.js";
import RecoverModel from "../modules/RecoverPass.js";
import pkg from "mongoose";
import moment from "moment";
import {
  generateVerificationCode,
  sendMessageToMail,
} from "../utils/NodeMailer.js";
import { isValidPassword } from "../utils/handleValidationErrors.js";

const { MongoServerError } = pkg;

export const register = async (req, res) => {
  try {
    if (req.body.userType === "customer") {
      const hasEmail = await SubCustomersModel.findOne({
        email: req.body.email,
      });
      if (hasEmail) {
        return res
          .status(404)
          .json({ message: "Այս էլ. հասցեով օգտատեր գոյություն ունի" });
      }
    } else if (req.body.userType === "carrier") {
      const hasEmail = await SubCarrierModel.findOne({
        email: req.body.email,
      });
      if (hasEmail) {
        return res
          .status(404)
          .json({ message: "Այս էլ. հասցեով օգտատեր գոյություն ունի" });
      }
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const info = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userType: req.body.userType,
      companyName: req.body.companyName,
      passwordHash: hash,
    };

    let doc = null;
    if (req.body.userType === "carrier") {
      doc = new CarrierModel(info);
    } else if (req.body.userType === "customer") {
      doc = new CustomersModel(info);
    }

    const user = await doc.save();
    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    if (err?.keyValue?.email) {
      res.status(406).json({
        message: "Այս էլ. հասցեով օգտատեր գոյություն ունի",
      });
    } else if (err?.keyValue?.companyName) {
      res.status(406).json({
        message: "Այս ընկերության անունով օգտատեր գոյություն ունի",
      });
    } else if (err?.keyValue?.phoneNumber) {
      res.status(406).json({
        message: "Այս հեռախոսահամարով օգտատեր գոյություն ունի",
      });
    } else {
      res.status(500).json({
        message:
          "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
      });
    }
  }
};

export const registerSub = async (req, res) => {
  try {
    if (req.body.password !== req.body.repetPassword) {
      return res.status(404).json({ message: "Անհամապատասխան գաղտնաբառ" });
    }

    //check
    if (req.body.currentUserType === "customer") {
      const hasEmail = await CustomersModel.findOne({
        email: req.body.email,
      });
      if (hasEmail) {
        return res
          .status(409)
          .json({ message: "Այս էլ. հասցեով օգտատեր գոյություն ունի" });
      }
    } else if (req.body.currentUserType === "carrier") {
      const hasEmail = await CarrierModel.findOne({
        email: req.body.email,
      });
      if (hasEmail) {
        return res
          .status(409)
          .json({ message: "Այս էլ. հասցեով օգտատեր գոյություն ունի" });
      }
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let info = checkRegisterSubOptions(req.body, req.userId, hash);

    let doc = null;
    if (req.body.currentUserType === "customer") {
      doc = new SubCustomersModel(info);
    } else if (req.body.currentUserType === "carrier") {
      doc = new SubCarrierModel(info);
    }

    const user = await doc.save();

    if (req.body.currentUserType === "customer") {
      const updated = await CustomersModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { subCustomers: user._id } }
        // { new: true }
      );
    } else if (req.body.currentUserType === "carrier") {
      const updated = await CarrierModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { subCarrier: user._id } }
        // { new: true }
      );
    }
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData });
  } catch (err) {
    if (err?.keyValue?.email) {
      res.status(409).json({
        message: "Այս տվյալներով օգտատեր գոյություն ունի",
      });
    } else if (err?.keyValue?.companyName) {
      res.status(406).json({
        message: "Այս ընկերության անունով օգտատեր գոյություն ունի",
      });
    } else if (err?.keyValue?.phoneNumber) {
      res.status(406).json({
        message: "Այս հեռախոսահամարով օգտատեր գոյություն ունի",
      });
    } else {
      res.status(500).json({
        message:
          "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
      });
      console.log(err);
    }
  }
};

export const updateUser = async (req, res) => {
  try {
    let forCustomer = {};

    const propertiesToUpdate = [
      "companyName",
      "email",
      "phoneNumber",
      "address",
      "website",
      "about",
    ];

    propertiesToUpdate.forEach((property) => {
      if (req.body.data[property] !== undefined) {
        forCustomer[property] = req.body.data[property];
      }
    });

    let curentlyModel = null;
    if (req.body.userType === "customer") {
      curentlyModel = CustomersModel;
    } else if (req.body.userType === "carrier") {
      curentlyModel = CustomersModel;
    } else if (req.body.userType === "subCustomer") {
      curentlyModel = SubCustomersModel;
    } else if (req.body.userType === "subCarrier") {
      curentlyModel = SubCarrierModel;
    }

    let response = await curentlyModel.findOneAndUpdate(
      { _id: req.userId },
      forCustomer,
      { new: true }
    );

    if (response?._id) {
      res.status(200).json(forCustomer);
    }
  } catch (error) {
    console.log(error);
    // console.log(error);
    if (error?.codeName === "DuplicateKey") {
      res.status(400).json({
        message: "Դուք չեք կարող մուտքագրել այդ համարը",
      });
    } else {
      res.status(404).json({
        message: "Internal Server Error",
      });
    }
  }
};

export const login = async (req, res) => {
  try {
    let user = null;
    if (req.body.userType === "customer") {
      await getData(CustomersModel, "customer");
    } else if (req.body.userType === "carrier") {
      await getData(CarrierModel, "carrier");
    } else if (req.body.userType === "subCustomer") {
      await getData(SubCustomersModel, "subCustomer");
    } else if (req.body.userType === "subCarrier") {
      await getData(SubCarrierModel, "subCarrier");
    }

    if (!user) {
      user = await CustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await CarrierModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCarrierModel.findOne({ email: req.body.email });
    }

    async function getData(MODEL, type) {
      if (!type.toLowerCase().includes("sub")) {
        user = await MODEL.findOne({ email: req.body.email });
      } else {
        user = await MODEL.findOne({ email: req.body.email }).populate({
          path: "parent",
          select:
            "companyName address website paymentType paymentDuration about",
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "Սխալ էլ. հասցե կամ գաղտնաբառ" });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(403).json({
        message: "Սխալ էլ. հասցե կամ գաղտնաբառ",
      });
    }

    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
    //update
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    let user = null;
    if (req.body.userType === "customer") {
      await getData(CustomersModel, "customer");
    } else if (req.body.userType === "carrier") {
      await getData(CarrierModel, "carrier");
    } else if (req.body.userType === "subCustomer") {
      await getData(SubCustomersModel, "subCustomer");
    } else if (req.body.userType === "subCarrier") {
      await getData(SubCarrierModel, "subCarrier");
    }

    if (!user) {
      user = await CustomersModel.findOne({ _id: req.userId });
    } else if (!user) {
      user = await CarrierModel.findOne({ _id: req.userId });
    } else if (!user) {
      user = await SubCustomersModel.findOne({ _id: req.userId });
    } else if (!user) {
      user = await SubCarrierModel.findOne({ _id: req.userId });
    }

    async function getData(MODEL, type) {
      if (!type.toLowerCase().includes("sub")) {
        user = await MODEL.findOne({ _id: req.userId });
      } else {
        user = await MODEL.findOne({ _id: req.userId }).populate({
          path: "parent",
          select:
            "companyName address website paymentType paymentDuration about",
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "Օգտատեր չի գտնվել",
      });
    }

    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ` գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const getDetailSub = async (req, res) => {
  try {
    const user = await SubCustomersModel.findById(req.userId)
      .select("-passwordHash")
      .populate({
        path: "parent",
        select: "companyName address website paymentType paymentDuration about",
      });

    if (!user) {
      return res.status(404).json({
        message: "Օգտատեր չի գտնվել",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const getUserSubs = async (req, res) => {
  try {
    let isCustomer = req.body.userType === "customer";
    let subs = null;
    if (isCustomer) {
      subs = await CustomersModel.findOne({ _id: req.userId })
        .select("_id firstName subCustomers")
        .populate({
          path: "subCustomers",
          select: "-passwordHash",
        });
    } else {
      subs = await CarrierModel.findOne({ _id: req.userId })
        .select("_id firstName subCarrier")
        .populate({
          path: "subCarrier",
          select: "-passwordHash",
        });
    }
    res.json(subs);
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

//----
export const getCarrierSubs = async (req, res) => {
  try {
    const schemeA = await CarrierModel.findOne({ _id: req.userId })
      .select("_id firstName subCarrier")
      .populate({
        path: "subCarrier",
        select: "-passwordHash",
      });

    res.json(schemeA);
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const removeSub = async (req, res) => {
  try {
    let user = null;
    if (req.body.userType === "customer") {
      user = await CustomersModel.findOne({ _id: req.userId });
    } else if (req.body.userType === "carrier") {
      user = await CarrierModel.findOne({ _id: req.userId });
    }

    user.subCustomers.pull(req.body.userId);
    let deleted = await user.save();

    let sub = null;
    if (req.body.userType === "customer") {
      sub = await SubCustomersModel.findByIdAndDelete(req.body.userId);
    } else if (req.body.userType === "carrier") {
      sub = await SubCarrierModel.findByIdAndDelete(req.body.userId);
    }

    res.status(200).json(req.body.userId);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (req.body.newPassword !== req.body.repetPassword) {
      console.log("Անհամապատասխան գաղտնաբառ");
      return res.status(404).json({ message: "Անհամապատասխան գաղտնաբառ" });
    }
    if (isValidPassword(req.body.newPassword)) {
      return res.status(404).json({
        message:
          "Գաղնտաբառը պետք է պարունակի մինիմում 8 տառ,առնվազն 1 թիվ և առնվազն 1 նշան(!@#$%^&*.)",
      });
    }

    let User = null;
    if (req.body.userType === "customer") {
      User = CustomersModel;
    } else if (req.body.userType === "carrier") {
      User = CarrierModel;
    } else if (req.body.userType === "subCustomer") {
      User = SubCustomersModel;
    } else if (req.body.userType === "subCarrier") {
      User = SubCarrierModel;
    }

    let currentlyUser = await User.findOne({
      _id: req.userId,
      email: req.body.email,
    });

    // console.log(currentlyUser);

    if (!currentlyUser) {
      res.status(404).json({
        message: "Ձեր տվյալները սխալ են",
      });
    }
    const verificationCode = generateVerificationCode();

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

    const doc = new RecoverModel({
      email: req.body.email,
      verificationCode,
      newPassword: hashedNewPassword,
    });

    await doc.save();

    sendMessageToMail({
      email: req.body.email,
      verifyCode: verificationCode,
    });

    res.json("ok");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "RecoverSend error",
    });
  }
};

export const changePass = async (req, res) => {
  try {
    if (req.body.newPassword !== req.body.repetPassword) {
      console.log("Անհամապատասխան գաղտնաբառ");
      return res.status(404).json({ message: "Անհամապատասխան գաղտնաբառ" });
    }
    if (!isValidPassword(req.body.newPassword)) {
      return res.status(404).json({
        message:
          "Գաղնտաբառը պետք է պարունակի մինիմում 8 տառ,առնվազն 1 թիվ և առնվազն 1 նշան(!@#$%^&*.)",
      });
    }

    let userModel = null;
    if (req.body.userType === "customer") {
      userModel = CustomersModel;
    } else if (req.body.userType === "carrier") {
      userModel = CarrierModel;
    } else if (req.body.userType === "subCustomer") {
      userModel = SubCustomersModel;
    } else if (req.body.userType === "subCarrier") {
      userModel = SubCarrierModel;
    }

    let user = await userModel.findOne({
      _id: req.userId,
      email: req.body.email,
    });

    if (!user) {
      res.status(404).json({
        message: "Ձեր տվյալները սխալ են",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.currentPassword,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(401).json({
        message: "Սխալ գաղտնաբառ",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

    user.passwordHash = hashedNewPassword;
    await user.save();

    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
    const { passwordHash } = user._doc;

    res.json({
      // ...userData,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

// statistica
// {
export const workersSalary = async (req, res) => {
  let customerId = req.userId;
  try {
    const customer = await CustomersModel.findById(customerId)
      .populate("subCustomers")
      .exec();
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const subCustomers = customer.subCustomers;
    const subCustomerResults = [];
    for (const subCustomer of subCustomers) {
      const loads = await LoadModel.find({
        subContactInfo: subCustomer._id,
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
      const subCustomerResult = {
        username: subCustomer.firstName + " " + subCustomer.lastName,
        email: subCustomer.email,
        amount: totalPrice,
        amountPerMonth: amountPerMonth,
      };
      subCustomerResults.push(subCustomerResult);
    }

    // return res.json(subCustomerResults);
    return subCustomerResults;
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userStatistic = async (req, res) => {
  try {
    const subCustomers = await SubCustomersModel.find({ parent: req.userId });

    const subCustomersByMonth = subCustomers.reduce((acc, subCustomer) => {
      const dateKey = moment(subCustomer.createdAt)
        .startOf("month")
        .format("YYYY-MM");
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    const statistics = Object.entries(subCustomersByMonth).map(
      ([date, count]) => ({
        month: date,
        users: count,
      })
    );

    const currentMonth = moment().format("YYYY-MM");
    let lastMonth = moment().subtract(3, "months").format("YYYY-MM");
    while (lastMonth < currentMonth) {
      if (!subCustomersByMonth[lastMonth]) {
        statistics.push({ month: lastMonth, users: 0 });
      }
      lastMonth = moment(lastMonth).add(1, "month").format("YYYY-MM");
    }

    statistics.sort((a, b) => moment(a.month).diff(moment(b.month)));

    // res.json(statistics);
    return statistics;
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
    const userId = req.userId; // Assuming userId is available in the request

    const currentMonth = moment().startOf("month");
    const months = Array.from({ length: 4 }, (_, i) =>
      currentMonth.clone().subtract(i, "months")
    );

    const customerLoads = await LoadModel.find({
      contactInfo: req.userId,
      status: "paid",
    });

    const subCustomers = await SubCustomersModel.find({ parent: userId });
    const subCustomerIds = subCustomers.map((subCustomer) => subCustomer._id);
    const subCustomerLoads = await LoadModel.find({
      subContactInfo: { $in: subCustomerIds },
      status: "paid",
    }).exec();

    const loadCounts = {};
    months.forEach((month) => {
      loadCounts[month.format("DD.MM.YYYY")] = 0;
    });

    customerLoads.forEach((load) => {
      const month = moment(load.createdAt)
        .startOf("month")
        .format("DD.MM.YYYY");
      if (loadCounts.hasOwnProperty(month)) {
        loadCounts[month]++;
      }
    });

    subCustomerLoads.forEach((load) => {
      const month = moment(load.createdAt)
        .startOf("month")
        .format("DD.MM.YYYY");
      if (loadCounts.hasOwnProperty(month)) {
        loadCounts[month]++;
      }
    });

    const statistics = months.map((month) => ({
      loadCount: loadCounts[month.format("DD.MM.YYYY")],
    }));

    // console.log(statistics);
    // res.json(statistics);
    return statistics.reverse();
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
    const currentMonth = moment().startOf("month");
    const months = Array.from({ length: 4 }, (_, i) =>
      currentMonth.clone().subtract(i, "months")
    );

    const customerLoads = await LoadModel.find({
      contactInfo: userId,
      status: "paid",
    }).select("rate createdAt");

    const subCustomers = await SubCustomersModel.find({ parent: userId });
    const subCustomerIds = subCustomers.map((subCustomer) => subCustomer._id);

    const subCustomerLoads = await LoadModel.find({
      subContactInfo: { $in: subCustomerIds },
      status: "paid",
    }).select("rate createdAt");
    console.log(subCustomerLoads);

    const loadPrices = Array.from({ length: 4 }, () => 0);

    customerLoads.forEach((load) => {
      const monthIndex = months.findIndex((month) =>
        moment(load.createdAt).isSame(month, "month")
      );
      if (monthIndex !== -1) {
        loadPrices[monthIndex] += load.rate || 0;
      }
    });

    subCustomerLoads.forEach((load) => {
      const monthIndex = months.findIndex((month) =>
        moment(load.createdAt).isSame(month, "month")
      );
      if (monthIndex !== -1) {
        loadPrices[monthIndex] += load.rate || 0;
      }
    });

    const statistics = loadPrices.map((totalPrice) => ({ rate: totalPrice }));

    // res.json(statistics);
    return statistics.reverse();
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
    const customerLoads = await LoadModel.find({
      contactInfo: userId,
    }).select("status");

    const subCustomers = await SubCustomersModel.find({ parent: userId });
    const subCustomerIds = subCustomers.map((subCustomer) => subCustomer._id);

    const subCustomerLoads = await LoadModel.find({
      subContactInfo: { $in: subCustomerIds },
    }).select("status");

    const allLoads = [...customerLoads, ...subCustomerLoads];

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

    allLoads.forEach((item) => {
      const status = statusMapping[item.status];
      if (status) {
        statistic[status]++;
      }
    });

    // console.log(statistic);
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
    let workers = await workersSalary(req, res);
    let user = await userStatistic(req, res);
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

    let statistica = {
      workers: workers,
      user: user,
      loadCount: loadCount,
      loadPrice: loadPrice,
      income: income,
      loadStatistic: load,
    };
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
// }
