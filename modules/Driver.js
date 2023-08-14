import mongoose from "mongoose";

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
    trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Truck" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Driver", DriverSchema);
