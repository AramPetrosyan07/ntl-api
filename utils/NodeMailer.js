import nodemailer from "nodemailer";
import RecoverModel from "../modules/RecoverPass.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import DriverModel from "../modules/Carrier.js";

export const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.email",
  secure: false,
  service: "gmail",
  auth: {
    user: "thearampetrosyan@gmail.com",
    pass: "faclvajajdjr osmh",
  },
});

export const sendMessageToMail = async ({ email, verifyCode }) => {
  let details = {
    from: "thearampetrosyan@gmail.com",
    to: email,
    subject: "Recover password",
    text: `Youre code is  ${verifyCode}`,
  };

  let res = await mailTransporter.sendMail(details, (err) => {
    if (err) {
      console.log("some problem", err);
    } else {
      console.log("sent");
    }
  });
  console.log(res);
};

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

// export const changePassword = async (req, res) => {
//   try {
//     console.log(req.body);

//     let User = null;
//     if (req.body.userType === "customer") {
//       User = CustomersModel
//     } else if (req.body.userType === "carrier") {
//       User = CarrierModel
//     } else if (req.body.userType === "subCustomer") {
//       User = SubCustomersModel
//     } else if (req.body.userType === "subCarrier") {
//       User = SubCarrierModel
//     }

//       User.findOne({ email: req.body.email });

//     // const verificationCode = generateVerificationCode();

//     // sendMessageToMail({
//     //   email: email,
//     //   verifyCode: verificationCode,
//     // });

//     // res.json("Email send");
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "RecoverSend error",
//     });
//   }
// };

export const RecoverSend = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    let user = null;
    if (!user) {
      user = await CustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await CarrierModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCarrierModel.findOne({ email: req.body.email });
    }
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "invalid email" });
    }
    const verificationCode = generateVerificationCode();

    const doc = new RecoverModel({
      email,
      verificationCode,
    });

    await doc.save();

    sendMessageToMail({
      email: email,
      verifyCode: verificationCode,
    });

    res.json("code send to email");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "RecoverSend error",
    });
  }
};

export const RecoverResponse = async (req, res) => {
  try {
    const { verificationCode, email } = req.body;

    const data = await RecoverModel.findOne({ verificationCode, email });

    const salt = await bcrypt.genSalt(10);
    const verifyToken = await bcrypt.hash(data.email, salt);

    data.verifyToken = verifyToken;
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
    const { verifyToken, newPasswordOne, newPasswordTwo, email } = req.body;

    const data = await RecoverModel.findOne({ verifyToken, email });

    if (!data || data.expirationTime < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (data.verifyToken !== verifyToken) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (newPasswordOne !== newPasswordTwo) {
      return res.status(404).json({ message: "anhamapatasxan new password" });
    }

    let user = null;
    if (!user) {
      user = await CustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await CarrierModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCustomersModel.findOne({ email: req.body.email });
    } else if (!user) {
      user = await SubCarrierModel.findOne({ email: req.body.email });
    }

    if (!user) {
      return res.status(404).json({ message: "invalid email" });
    }

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

// change email
