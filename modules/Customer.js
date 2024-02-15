import mongoose from "mongoose";
//patviratu
const CustomersSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    //
    address: {
      type: String,
    },
    website: {
      type: String,
    },
    paymentType: {
      type: String,
    },
    paymentDuration: {
      type: Number,
    },
    about: {
      type: String,
      default: "Նկարագրեք ձեր ընկերության գործունեությունը մի քանի տողով",
    },
    planType: {
      type: String,
      default: "Starter",
    },
    notification: {
      type: Array,
      default: [],
    },

    isVeryfied: {
      type: Boolean,
      default: false,
    },

    subCustomers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SubCustomer" },
    ],

    loads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Load" }],

    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", CustomersSchema);
