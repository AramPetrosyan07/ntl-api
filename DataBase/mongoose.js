import { red, green } from "console-log-colors";
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_KEY, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(green.bold.underline("DataBase OK"));
  } catch (error) {
    console.log(red.bold.underline("DB connection error"));
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
