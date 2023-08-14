import LoadModel from "../modules/Load.js";

export const addNewLoad = async (req, res) => {
  try {
    const load = await LoadModel({
      date: req.body.date,
      truckType: req.body.truckType,
      loadType: req.body.loadType,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      customerInfo: req.body.parent,
      subCustomerInfo: req.userId,
    });

    const result = await load.save();

    const fullLoad = await LoadModel.findOne({ _id: result._id })
      .populate({
        path: "customerInfo",
        select: "companyName email phoneNumber",
      })
      .populate({
        path: "subCustomerInfo",
        select: "email phoneNumber",
      });

    console.log(new Date() - fullLoad.createdAt);

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
