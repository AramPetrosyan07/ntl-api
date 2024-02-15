import mongoose from "mongoose";
// shofer
const DriverSchema = new mongoose.Schema(
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

    subCarrier: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCarrier" }],

    trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Truck" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Carrier", DriverSchema);
