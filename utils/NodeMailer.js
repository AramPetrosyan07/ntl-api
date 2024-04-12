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
    from: "aspetrosyan07@gmail.com",
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

    sendMessageToMail({
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

// app.get('/', async (_, res) => {
//   const source = fs.readFileSync('email_template.html', 'utf-8').toString();
//   const template = handlebars.compile(source);
//   const replacements = {
//     username: 'Shilleh',
//   };
//   const htmlToSend = template(replacements);

//   const info = await transporter.sendMail({
//     from: '<some email>',
//     to: '<some email>',
//     subject: 'Hello from node',
//     text: 'Hello world?', // dont really need this but it is recommended to have a text property as well
//     html: htmlToSend
//   });

//   console.log('Message sent: %s', info.response);
//   res.send('Email Sent!');
// });
