import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    opened: {
      type: Boolean,
      default: false,
    },
    pin: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    subContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCustomer",
    },
    subContactCarrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCarrier",
    },
    load: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Load",
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
