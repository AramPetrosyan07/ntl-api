import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../models/Customer.js";
import SubCustomersModel from "../models/SubCustomer.js";
import SubCarrierModel from "../models/SubCarrier.js";
import CarrierModel from "../models/Carrier.js";
import { isValidPassword } from "../utils/handleValidationErrors.js";

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
