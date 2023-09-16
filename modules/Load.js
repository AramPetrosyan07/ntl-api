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
    contactInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    subContactInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCustomer",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Load", LoadSchema);
