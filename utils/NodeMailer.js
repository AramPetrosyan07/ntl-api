import nodemailer from "nodemailer";
import RecoverModel from "../modules/RecoverPass.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import DriverModel from "../modules/Carrier.js";

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thesevaksargsyan@gmail.com",
    pass: "whaidffvttnizhpg",
  },
});

const sendVerification = ({ email, verifyCode }) => {
  let details = {
    from: "thesevaksargsyan@gmail.com",
    to: email,
    subject: "testing",
    text: `Youre verification code is  ${verifyCode}`,
  };

  mailTransporter.sendMail(details, (err) => {
    if (err) {
      console.log("some problem", err);
    } else {
      console.log("sent");
    }
  });
};

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const RecoverSend = async (req, res) => {
  try {
    const { email } = req.body;

    const sliceOne = await CustomersModel.findOne({ email });
    const sliceTwo = await SubCustomersModel.findOne({ email });
    const sliceThree = await DriverModel.findOne({ email });

    if (!sliceOne && !sliceTwo && !sliceThree) {
      return res.status(404).json({ message: "invalid email" });
    }

    const verificationCode = generateVerificationCode();
    const salt = await bcrypt.genSalt(10);
    const token = await bcrypt.hash(email, salt);
    const expirationTime = Date.now() + 120000;

    const doc = new RecoverModel({
      token,
      email,
      verificationCode,
      expirationTime,
    });

    await doc.save();

    sendVerification({
      email: email,
      verifyCode: verificationCode,
    });

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "RecoverSend error",
    });
  }
};

export const RecoverResponse = async (req, res) => {
  try {
    const { token, verificationCode } = req.body;

    const data = await RecoverModel.findOne({ token });

    if (!data || data.expirationTime < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (data.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const salt = await bcrypt.genSalt(10);
    const verifyToken = await bcrypt.hash(data.email, salt);

    data.verifyToken = verifyToken;
    data.verify = true;
    data.expirationTime = Date.now() + 120000;
    await data.save();

    res.json({ message: "Verification successful", verifyToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "RecoverResponse error",
    });
  }
};

export const PassRecovery = async (req, res) => {
  try {
    const { token, verifyToken, newPasswordOne, newPasswordTwo, email } =
      req.body;

    const data = await RecoverModel.findOne({ token });

    if (!data || data.expirationTime < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (data.verifyToken !== verifyToken && data.verify) {
      console.log(data.verifyToken, verifyToken);
      console.log(data);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (newPasswordOne !== newPasswordTwo) {
      return res.status(404).json({ message: "anhamapatasxan new password" });
    }

    const sliceOne = await CustomersModel.findOne({ email });
    const sliceTwo = await SubCustomersModel.findOne({ email });
    const sliceThree = await DriverModel.findOne({ email });

    let user = null;

    if (sliceOne) {
      user = sliceOne;
    } else if (sliceTwo) {
      user = sliceTwo;
    } else if (sliceThree) {
      user = sliceTwo;
    }

    if (!user) {
      return res.status(404).json({ message: "invalid email" });
    }

    await RecoverModel.findOneAndDelete({ token });

    // const isValidPass = await bcrypt.compare(
    //   req.body.password,
    //   user._doc.passwordHash
    // );

    // if (!isValidPass) {
    //   return res.status(401).json({
    //     message: "Неверный  пароль",
    //   });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(req.body.newPasswordOne, salt);

    user.passwordHash = hashedNewPassword;
    await user.save();

    const tokenAuth = jwt.sign({ _id: user._id }, "secret123", {
      expiresIn: "4d",
    });
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      tokenAuth,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "PassRecovery error",
    });
  }
};
