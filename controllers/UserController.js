import NotificationModel from "../modules/Notification.js";
import LoadModel from "../modules/Load.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import CarrierModel from "../modules/Carrier.js";
import TruckModel from "../modules/Truck.js";

import {
  checkCountUsersByDate,
  checkRegisterSubOptions,
  loadPriceByDate,
} from "../utils/tools.js";
import RecoverModel from "../modules/RecoverPass.js";
import {
  generateVerificationCode,
  sendMessageToMail,
} from "../utils/NodeMailer.js";
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

// export const login = async (req, res) => {
//   try {
//     let user = null;
//     const userTypeModels = new Map([
//       ["customer", CustomersModel],
//       ["carrier", CarrierModel],
//       ["subCustomer", SubCustomersModel],
//       ["subCarrier", SubCarrierModel],
//     ]);

//     user = await getData(
//       userTypeModels.get(req.body.userType),
//       req.body.userType
//     );
//     console.log(req.body);
//     console.log(userTypeModels.get(req.body.userType));

//     async function getData(MODEL, type) {
//       if (!type.toLowerCase().includes("sub")) {
//         user = await MODEL.findOne({ email: req.body.email });
//       } else {
//         user = await MODEL.findOne({ email: req.body.email }).populate({
//           path: "parent",
//           select:
//             "companyName address website paymentType paymentDuration about",
//         });
//       }
//     }

//     if (!user) {
//       return res.status(404).json({ message: "Սխալ էլ. հասցե կամ գաղտնաբառ" });
//     }

//     const isValidPass = await bcrypt.compare(
//       req.body.password,
//       user._doc.passwordHash
//     );

//     if (!isValidPass) {
//       return res.status(403).json({
//         message: "Սխալ էլ. հասցե կամ գաղտնաբառ",
//       });
//     }

//     const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
//     const { passwordHash, ...userData } = user._doc;

//     res.json({
//       ...userData,
//       token,
//     });
//     //update
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message:
//         "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
//     });
//   }
// };

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
// }

export const getNotification = async (req, res) => {
  try {
    let not = await NotificationModel.find(
      { customer: req.userId },
      " -customer"
    )
      .populate({
        path: "subContact",
        select: "firstName lastName",
      })
      .populate({
        path: "subContactCarrier",
        select: "firstName lastName",
      })
      .populate({
        path: "load",
        select: "rate description pickup delivery  commodity status",
      })
      .populate({
        path: "truck",
        select: "rate description pickup delivery  commodity status",
      });

    console.log(not);
    console.log("ok");

    res.json(not);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const pinNotification = async (req, res) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { pin: !req.body.pin } },
      { new: true }
    );

    console.log(updated);
    res.json("ok");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const openNotification = async (req, res) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { opened: true } },
      { new: true }
    );
    console.log(updated);
    res.json("ok");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const deleteNotification = async (req, res) => {
  try {
    console.log(req.body);
    const response = await NotificationModel.findOneAndDelete({
      _id: req.body.id,
    });

    let MODEL = null;
    if (req.body.userType === "customer") {
      MODEL = CustomersModel;
    } else if (req.body.userType === "carrier") {
      MODEL = CarrierModel;
    }

    const updatedSubCustomer = await MODEL.findOneAndUpdate(
      { _id: req.userId },
      { $pull: { notification: req.body.id } },
      { new: true }
    );

    console.log(updatedSubCustomer);

    res.json(updatedSubCustomer);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};
