import TruckModel from "../modules/Truck.js";
import DriverModel from "../modules/Driver.js";

export const addTrick = async (req, res) => {
  try {
    const doc = new TruckModel({
      date: req.body.date,
      truckType: req.body.truckType,
      loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      comment: req.body.comment,

      driver: req.userId,
    });
    const user = await doc.save();

    const updated = await DriverModel.findOneAndUpdate(
      { _id: req.userId },
      { $push: { trucks: user._id } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизаваться",
    });
  }
};

export const getTrick = async (req, res) => {
  try {
    const allLoad = await TruckModel.find().populate({
      path: "driver",
      select: "companyName email phoneNumber",
    });

    res.json(allLoad);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const getDriver = async (req, res) => {
  try {
    const allLoad = await DriverModel.find({ _id: req.userId })
      .select("-passwordHash")
      .populate({
        path: "trucks",
        //   select: "companyName email phoneNumber",
      });

    res.json(allLoad);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const updateTruck = async (req, res) => {
  try {
    const driver = await DriverModel.findOne({
      _id: req.userId,
      trucks: { $in: [req.body.id] }, // Check if the truckId exists in the trucks array
    });

    if (!driver) {
      console.log(err);
      res.status(400).json({
        message: "You aren't the owner",
      });
    }

    let update = {
      date: req.body.date,
      truckType: req.body.truckType,
      loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      comment: req.body.comment,
    };

    let response = await TruckModel.findOneAndUpdate(
      { _id: req.body.id },
      update,
      { new: true }
    );

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const deleteTruck = async (req, res) => {
  try {
    // const driver = await DriverModel.findOne({
    //   _id: req.userId,
    //   trucks: { $in: [req.body.id] }, // Check if the truckId exists in the trucks array
    // });

    const driver = await DriverModel.updateOne(
      { _id: req.userId }, // Specify the document by its _id
      { $pull: { trucks: { $in: [req.body.id] } } }
    );

    if (driver.acknowledged !== true) {
      res.status(400).json({
        message: "parent i mejic id-n chi jnjel",
      });
    }

    // if (!driver) {
    //   console.log(err);
    //   res.status(400).json({
    //     message: "You aren't the owner",
    //   });
    // }

    await TruckModel.findOneAndDelete({ _id: req.body.id });

    res.json(driver);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};
