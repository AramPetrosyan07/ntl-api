import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      // required: true,
    },
    truckType: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    pickup: {
      description: {
        type: String,
        required: true,
      },
      location: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    delivery: {
      description: {
        type: String,
        // required: true,
      },
      location: {
        lat: {
          type: Number,
          // required: true,
        },
        lng: {
          type: Number,
          // required: true,
        },
      },
    },
    distance: {
      type: String,
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
    comment: {
      type: String,
    },
    status: {
      type: String,
      default: "open",
    },
    contactInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Carrier",
    },
    subContactInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCarrier",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Truck", TruckSchema);
