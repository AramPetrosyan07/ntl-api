import mongoose from "mongoose";

const RecoverPassSchema = new mongoose.Schema(
  {
    modelType: {
      type: String,
      // enum: ["forget password", "change password"],
      // required: true,
    },
    token: {
      type: String,
    },
    verifyToken: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    verificationCode: {
      type: Number,
    },
    newPassword: {
      type: String,
      // validate: {
      //   validator: function (v) {
      //     return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      //       v
      //     );
      //   },
      //   message: (props) => `${props.value} is not a valid password!`,
      // },
    },
    expirationTime: {
      type: Date, // Change type to Date for storing date/time
      default: () => Date.now() + 1000 * 60 * 3,
      expires: 0, // Set to 0 to use the default index expiry time
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RecoverPassSchema.index({ expirationTime: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RecoverPass", RecoverPassSchema);
