import mongoose from "mongoose";
// shofer
const CarrierSchema = new mongoose.Schema(
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
    notification: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
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

    subCarrier: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCarrier" }],

    trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Truck" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Carrier", CarrierSchema);
