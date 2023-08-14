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
      sparse: true,
    },
    userType: {
      type: String,
      required: true,
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },

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

let s1 = {
  id: "z",
  name: "z",
  parent: 1,
};
let s2 = {
  id: "z",
  name: "z",
  parent: 1,
};
let s3 = {
  id: "zasas",
  name: "zeegfeffef",
  parent: 1,
};
