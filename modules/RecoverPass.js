import mongoose from "mongoose";

const RecoverPass = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    verifyToken: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    verificationCode: {
      type: Number,
      required: true,
    },
    expirationTime: {
      type: Number,
      required: true,
    },
    verify: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("recover", RecoverPass);
