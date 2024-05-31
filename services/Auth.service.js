import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import CarrierModel from "../modules/Carrier.js";

import { checkRegisterSubOptions } from "../utils/tools.js";
import { isValidPassword } from "../utils/handleValidationErrors.js";

export const register = async (req, res) => {
  try {
    let UserModel;
    if (req.body.userType === "customer") {
      UserModel = SubCustomersModel;
    } else if (req.body.userType === "carrier") {
      UserModel = SubCarrierModel;
    }

    if (UserModel) {
      const hasEmail = await UserModel.findOne({
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

export const login = async (req, res) => {
  try {
    let user = null;

    const userTypeModels = new Map([
      ["customer", CustomersModel],
      ["carrier", CarrierModel],
      ["subCustomer", SubCustomersModel],
      ["subCarrier", SubCarrierModel],
    ]);

    user = await getData(userTypeModels.get(req.body.userType), req.body);

    async function getData(model, { userType, email }) {
      let user;
      if (!userType.toLowerCase().includes("sub")) {
        user = await model.findOne({ email });
      } else {
        user = await model.findOne({ email }).populate({
          path: "parent",
          select:
            "companyName address website paymentType paymentDuration about",
        });
      }
      return user;
    }

    if (!user) {
      return res.status(404).json({ message: "Incorrect email or password." });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );

    if (!isValidPass) {
      return res.status(403).json({ message: "Incorrect email or password." });
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
        "An error occurred while processing your request. Please try again later.",
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
