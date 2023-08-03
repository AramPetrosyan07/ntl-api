import mongoose from "mongoose";

const SubCustomerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    userType: {
      type: String,
      required: true,
    },
    companyName: {
      type: mongoose.Schema.Types.ObjectId,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SubCustomer", SubCustomerSchema);
