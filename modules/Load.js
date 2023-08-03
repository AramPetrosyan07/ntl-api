import mongoose from "mongoose";

const LoadSchema = new mongoose.Schema(
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
    pickUp: {
      type: String,
      required: true,
    },
    delivery: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
    },
    weight: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
    },
    status: {
      type: String,
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Load", LoadSchema);
