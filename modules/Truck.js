import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    truckType: {
      type: String,
      required: true,
    },
    loadType: {
      type: String,
      required: true,
    },
    pickup: {
      type: String,
      required: true,
    },
    delivery: {
      type: String,
    },
    distance: {
      type: Number,
    },
    length: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    rate: {
      type: Number,
    },
    status: {
      type: String,
      default: "open",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Truck", TruckSchema);
