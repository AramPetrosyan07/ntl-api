import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new CustomersModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userType: req.body.userType,
      companyName: req.body.companyName,
      passwordHash: hash,
    });

    const user = await doc.save();
    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "7d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    if (err.keyValue.email) {
      res.status(406).json({
        message: "Email already exists.",
      });
    } else if (err.keyValue.companyName) {
      res.status(406).json({
        message: "Company name already exists.",
      });
    } else if (err.keyValue.phoneNumber) {
      res.status(406).json({
        message: "Phone number already exists.",
      });
    } else {
      res.status(500).json({
        message: "An error occurred during registration.",
      });
    }
  }
};

export const login = async (req, res) => {
  try {
    const user = await CustomersModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Неверный логин или пароль" });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(403).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign({ _id: user._id }, "secret123", { expiresIn: "7d" });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизаваться",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await CustomersModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизаваться",
    });
  }
};
