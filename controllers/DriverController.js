import TruckModel from "../modules/Truck.js";
import CarrierModel from "../modules/Carrier.js";
import SubCarrierModel from "../modules/SubCarrier.js";

export const addTruck = async (req, res) => {
  try {
    let isSubUser = req.body.userType === "subCarrier";

    let forCarrier = {
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

      contactInfo: req.userId,
      // subCustomerInfo: req.userId,
    };

    let forSubCarrier = {
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

      contactInfo: req.body.parent,
      subContactInfo: req.userId,
    };

    const load = new TruckModel(isSubUser ? forSubCarrier : forCarrier);

    const result = await load.save();

    if (req.body.userType === "subCarrier") {
      await SubCarrierModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { trucks: result._id } }
      );
    } else if (req.body.userType === "carrier") {
      await CarrierModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { trucks: result._id } }
      );
    }

    const fullTruck = await TruckModel.findOne({ _id: result._id })
      .populate({
        path: "contactInfo",
        select: "companyName",
      })
      .populate({
        path: "subContactInfo",
        select: "email phoneNumber",
      });

    res.json(fullTruck);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизаваться",
    });
  }
};

export const getTrucks = async (req, res) => {
  try {
    const allLoad = await TruckModel.find({ status: "open" })
      .sort({ updatedAt: -1 })
      .populate({
        path: "contactInfo",
        select: "companyName email phoneNumber",
      })
      .populate({
        path: "subContactInfo",
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

export const getUserTrucks = async (req, res) => {
  try {
    let userType = req.body.userType === "carrier";
    const schemeA = await TruckModel.find(
      userType ? { contactInfo: req.userId } : { subContactInfo: req.userId }
    ).sort({ updatedAt: -1 });

    res.json(schemeA);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

// export const getDetailTruck = async (req, res) => {
//   try {
//     const allLoad = await TruckModel.findOne({ _id: req.body.id })
//       .populate({
//         path: "contactInfo",
//         select: "companyName email phoneNumber",
//       })
//       .populate({
//         path: "subContactInfo",
//         select: "email phoneNumber",
//       });

//     res.json(allLoad);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Не",
//     });
//   }
// };

export const deleteTruck = async (req, res) => {
  try {
    const oneLoad = await TruckModel.findOne({ _id: req.body.id });

    let response = null;
    if (oneLoad?.subContactInfo) {
      if (oneLoad.subContactInfo.toString().includes(req.userId)) {
        response = await TruckModel.findOneAndDelete({
          _id: req.body.id,
        });
      }
    } else if (oneLoad.contactInfo.toString().includes(req.userId)) {
      response = await TruckModel.findOneAndDelete({
        _id: req.body.id,
      });
    } else {
      res.status(404).json({
        message: "You is not parent of this load",
      });
    }

    if (response) {
      // res.json({ id: response._id });
      res.json({ id: req.body.id });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const updateTruck = async (req, res) => {
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
      comment: req.body.comment,
      status: req.body.status,
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
