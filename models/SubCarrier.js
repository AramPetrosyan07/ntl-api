import mongoose from "mongoose";

const SubCarrierSchema = new mongoose.Schema(
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
    },
    passwordHash: {
      type: String,
      required: true,
    },

    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Carrier" },

    trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Truck" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SubCarrier", SubCarrierSchema);
