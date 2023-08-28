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
    pickup: {
      type: String,
      required: true,
    },
    delivery: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      // required: true,
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
    commodity: {
      type: String,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      default: "open",
    },
    customerInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    subCustomerInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCustomer",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Load", LoadSchema);
