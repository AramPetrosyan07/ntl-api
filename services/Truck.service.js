import TruckModel from "../modules/Truck.js";
import CarrierModel from "../modules/Carrier.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import NotificationModel from "../modules/Notification.js";

//addTruck
//getTrucks
//getUserTrucks
//deleteTruck
//updateTruck

export const addTruck = async (req, res) => {
  try {
    let isSubUser = req.body.userType === "subCarrier";

    console.log(req.body);

    let forCarrier = {
      date: req.body.date,
      truckType: req.body.truckType,
      type: req.body.type,
      pickup: {
        description: req.body.fromInfo.description,
        location: {
          lat: req.body.fromInfo.location.lat,
          lng: req.body.fromInfo.location.lng,
        },
      },
      delivery: {
        description: req?.body?.toInfo?.description,
        location: {
          lat: req?.body.toInfo?.location?.lat,
          lng: req?.body?.toInfo?.location?.lng,
        },
      },
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      commodity: req.body.commodity,
      comment: req.body.comment,

      contactInfo: req.userId,
      // subContactInfo: req.userId,
    };

    let forSubCarrier = {
      date: req.body.date,
      truckType: req.body.truckType,
      type: req.body.type,
      pickup: {
        description: req.body.fromInfo.description,
        location: {
          lat: req.body.fromInfo.location.lat,
          lng: req.body.fromInfo.location.lng,
        },
      },
      delivery: {
        description: req?.body?.toInfo?.description,
        location: {
          lat: req?.body.toInfo?.location?.lat,
          lng: req?.body?.toInfo?.location?.lng,
        },
      },
      distance: req.body.distance,
      length: req.body.length,
      weight: req.body.weight,
      rate: req.body.rate,
      commodity: req.body.commodity,
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

export const deleteTruck = async (req, res) => {
  try {
    const oneLoad = await TruckModel.findOne({ _id: req.body.id });

    let updatedSubCarrier = null;
    let response = null;
    if (oneLoad?.subContactInfo) {
      if (oneLoad.subContactInfo.toString().includes(req.userId)) {
        response = await TruckModel.findOneAndDelete({
          _id: req.body.id,
        });

        updatedSubCarrier = await SubCarrierModel.findOneAndUpdate(
          { _id: req.userId },
          { $pull: { loads: req.body.id } },
          { new: true }
        );
      }
    } else if (oneLoad.contactInfo.toString().includes(req.userId)) {
      response = await TruckModel.findOneAndDelete({
        _id: req.body.id,
      });

      updatedSubCarrier = await CarrierModel.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { trucks: req.body.id } },
        { new: true }
      );
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
    let forCarrier = {};

    const propertiesToUpdate = [
      "date",
      "truckType",
      "type",
      "pickup",
      "delivery",
      "distance",
      "length",
      "weight",
      "rate",
      "commodity",
      "comment",
      "status",
    ];
    propertiesToUpdate.forEach((property) => {
      if (req.body[property] !== undefined) {
        forCarrier[property] = req.body[property];
      }
    });

    if (req.body?.fromInfo) {
      forCarrier.pickup = {
        description: req.body.fromInfo.description,
        location: {
          lat: req.body.fromInfo.location?.lat,
          lng: req.body.fromInfo.location?.lng,
        },
      };
    }

    if (req.body?.toInfo) {
      forCarrier.delivery = {
        description: req.body.toInfo.description,
        location: {
          lat: req.body?.toInfo?.location?.lat,
          lng: req.body?.toInfo?.location?.lng,
        },
      };
    } else {
      forCarrier.delivery = {}; // Reset delivery value to empty object
    }

    let truck = await TruckModel.findOneAndUpdate(
      { _id: req.body.id },
      forCarrier,
      { new: true }
    );

    if (req.body.userType.includes("sub")) {
      console.log("truck");
      let truck = await TruckModel.findOne({ _id: req.body.id }).exec();
      const carrier = await CarrierModel.findOne({
        _id: truck.contactInfo,
      }).exec();

      if (!carrier) {
        console.log("Carrier not found");
        return;
      }

      const notificationObject = await NotificationModel({
        customer: truck?.contactInfo.toString(),
        subContactCarrier: truck?.subContactInfo.toString(),
        truck: truck?._id.toString(),
      });

      const notification = await notificationObject.save();

      if (req.body.userType === "subCarrier") {
        const updated = await CarrierModel.findOneAndUpdate(
          { _id: truck.contactInfo.toString() },
          { $push: { notification: notification._id } }
        );
      }
    }

    res.json(truck);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};
