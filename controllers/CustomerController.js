import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import DriverModel from "../modules/Driver.js";

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
      doc = new DriverModel(info);
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
    const hasEmail = await CustomersModel.findOne({ email: req.body.email });
    if (hasEmail) {
      return res
        .status(404)
        .json({ message: "Այս էլ. հասցեով օգտատեր գոյություն ունի" });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new SubCustomersModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userType: req.body.userType,
      parent: req.userId,
      passwordHash: hash,
    });
    const user = await doc.save();

    const updated = await CustomersModel.findOneAndUpdate(
      { _id: req.userId },
      { $push: { subCustomers: user._id } }
      // { new: true }
    );
    res.json(user);
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

export const getCustomersSubs = async (req, res) => {
  try {
    const schemeA = await CustomersModel.findOne({ _id: req.userId })
      .select("_id firstName subCustomers")
      .populate({
        path: "subCustomers",
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

export const login = async (req, res) => {
  try {
    const sliceOne = await CustomersModel.findOne({ email: req.body.email });
    const sliceTwo = await SubCustomersModel.findOne({ email: req.body.email });
    const sliceThree = await DriverModel.findOne({ email: req.body.email });
    let user = null;

    if (sliceOne) {
      user = sliceOne;
    } else if (sliceTwo) {
      user = sliceTwo;
    } else if (sliceThree) {
      user = sliceThree;
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
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const changePass = async (req, res) => {
  try {
    if (req.body.newPasswordOne !== req.body.newPasswordTwo) {
      return res.status(404).json({ message: "Անհամապատասխան գաղտնաբառ" });
    }

    const sliceOne = await CustomersModel.findOne({ email: req.body.email });
    const sliceTwo = await SubCustomersModel.findOne({ email: req.body.email });
    let user = null;

    if (sliceOne) {
      user = sliceOne;
    } else if (sliceTwo) {
      user = sliceTwo;
    }

    if (!user) {
      return res.status(404).json({ message: "Սխալ էլ. հասցե" });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(401).json({
        message: "Սխալ գաղտնաբառ",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPasswordOne, salt);

    user.passwordHash = hashedNewPassword;
    await user.save();

    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "4d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
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
    const user = await CustomersModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Օգտատեր չի գտնվել",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
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
