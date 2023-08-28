import LoadModel from "../modules/Load.js";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";

export const addNewLoad = async (req, res) => {
  try {
    let isSubUser = req.body.userType === "subCustomer";

    let forCustomer = {
      date: req.body.date,
      truckType: req.body.truckType,
      loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      commodity: req.body.commodity,
      comment: req.body.comment,

      customerInfo: req.userId,
      // subCustomerInfo: req.userId,
    };

    let forSubCustomer = {
      date: req.body.date,
      truckType: req.body.truckType,
      loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      commodity: req.body.commodity,
      comment: req.body.comment,

      customerInfo: req.body.parent,
      subCustomerInfo: req.userId,
    };

    const load = await LoadModel(isSubUser ? forSubCustomer : forCustomer);

    const result = await load.save();

    if (req.body.userType === "subCustomer") {
      await SubCustomersModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { loads: result._id } }
      );
    } else if (req.body.userType === "customer") {
      await CustomersModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { loads: result._id } }
      );
    }

    const fullLoad = await LoadModel.findOne({ _id: result._id })
      .populate({
        path: "customerInfo",
        select: "companyName",
      })
      .populate({
        path: "subCustomerInfo",
        select: "email phoneNumber",
      });

    res.json(fullLoad);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const getLoads = async (req, res) => {
  try {
    const allLoad = await LoadModel.find()
      .populate({
        path: "customerInfo",
        select: "companyName email phoneNumber",
      })
      .populate({
        path: "subCustomerInfo",
        select: "email phoneNumber",
      });

    res.json(allLoad);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const getDetailLoad = async (req, res) => {
  try {
    const allLoad = await LoadModel.findOne({ _id: req.body.id })
      .populate({
        path: "customerInfo",
        select: "companyName email phoneNumber",
      })
      .populate({
        path: "subCustomerInfo",
        select: "email phoneNumber",
      });

    res.json(allLoad);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const deleteLoad = async (req, res) => {
  try {
    await LoadModel.findOneAndDelete({ _id: req.body.id });

    res.json("deleted");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const updateLoad = async (req, res) => {
  try {
    let update = {
      date: req.body.date,
      truckType: req.body.truckType,
      // loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      commodity: req.body.commodity,
      comment: req.body.comment,
      status: req.body.status,
    };

    let response = await LoadModel.findOneAndUpdate(
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
