import NotificationModel from "../modules/Notification.js";
import LoadModel from "../modules/Load.js";
import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import { Types } from "mongoose";
const { ObjectId } = Types;

//addNewLoad          done      wwf  (work with front)
//getLoads            done      wwf
//getUserLoads        done
//getDetailLoad       done
//deleteLoad          done
//updateLoad          done   (front ic pickup object uxarkelis petqa misht kordinatnery tanq)

export const addNewLoad = async (req, res) => {
  try {
    // console.log(req.body);
    let isSubUser = req.body.userType === "subCustomer";

    let forCustomer = {
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
        description: req.body.toInfo.description,
        location: {
          lat: req.body.toInfo.location.lat,
          lng: req.body.toInfo.location.lng,
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

    let forSubCustomer = {
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
        description: req.body.toInfo.description,
        location: {
          lat: req.body.toInfo.location.lat,
          lng: req.body.toInfo.location.lng,
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
        path: "contactInfo",
        select: "companyName",
      })
      .populate({
        path: "subContactInfo",
        select: "email phoneNumber",
      });

    res.json(fullLoad);
    console.log("sended");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const getLoads = async (req, res) => {
  try {
    const allLoad = await LoadModel.find({ status: "open" })
      .sort({ updatedAt: -1 })
      .populate({
        path: "contactInfo",
        select: "companyName email phoneNumber",
      })
      .populate({
        path: "subContactInfo",
        select: "email phoneNumber",
      });

    if (allLoad.length) {
      res.json(allLoad);
    } else {
      res.json("Բեռ չի գտնվել");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не",
    });
  }
};

export const getUserLoads = async (req, res) => {
  try {
    let userType = req.body.userType === "customer";
    const schemeA = await LoadModel.find(
      userType ? { contactInfo: req.userId } : { subContactInfo: req.userId }
    ).sort({ updatedAt: -1 });

    // .select("")
    // .populate({
    //   path: "subCustomers",
    //   select: "-passwordHash",
    // });

    res.json(schemeA);
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

export const deleteLoad = async (req, res) => {
  try {
    const oneLoad = await LoadModel.findOne({ _id: req.body.id });

    let updatedSubCustomer = null;
    let response = null;
    if (oneLoad?.subContactInfo) {
      if (oneLoad.subContactInfo.toString().includes(req.userId)) {
        response = await LoadModel.findOneAndDelete({
          _id: req.body.id,
        });

        updatedSubCustomer = await SubCustomersModel.findOneAndUpdate(
          { _id: req.userId },
          { $pull: { loads: req.body.id } },
          { new: true }
        );
      }
    } else if (oneLoad.contactInfo.toString().includes(req.userId)) {
      response = await LoadModel.findOneAndDelete({
        _id: req.body.id,
      });

      updatedSubCustomer = await CustomersModel.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { loads: req.body.id } },
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

export const updateLoad = async (req, res) => {
  try {
    let forCustomer = {};

    const propertiesToUpdate = [
      "_id",
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
        forCustomer[property] = req.body[property];
      }
    });

    if (req.body?.fromInfo) {
      forCustomer.pickup = {
        description: req.body.fromInfo.description,
        location: {
          lat: req.body.fromInfo.location?.lat,
          lng: req.body.fromInfo.location?.lng,
        },
      };
    }
    if (req.body?.toInfo) {
      forCustomer.delivery = {
        description: req.body.toInfo.description,
        location: {
          lat: req.body?.toInfo?.location?.lat,
          lng: req.body?.toInfo?.location?.lng,
        },
      };
    }

    let response = await LoadModel.findOneAndUpdate(
      { _id: req.body.id },
      forCustomer,
      { new: true }
    );

    if (req.body.userType.includes("sub")) {
      let load = await LoadModel.findOne({ _id: req.body.id }).exec();
      const customer = await CustomersModel.findOne({
        _id: load.contactInfo,
      }).exec();

      if (!customer) {
        console.log("Customer not found");
        return;
      }

      const notificationObject = await NotificationModel({
        customer: load?.contactInfo.toString(),
        subContact: load?.subContactInfo.toString(),
        load: load?._id.toString(),
      });

      const notification = await notificationObject.save();

      if (req.body.userType === "subCustomer") {
        const updated = await CustomersModel.findOneAndUpdate(
          { _id: load.contactInfo.toString() },
          { $push: { notification: notification._id } }
        );
      }
    }

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
