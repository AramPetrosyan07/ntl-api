import NotificationModel from "../models/Notification.js";
import CustomersModel from "../models/Customer.js";
import CarrierModel from "../models/Carrier.js";

export const getNotification = async (req, res) => {
  try {
    let not = await NotificationModel.find(
      { customer: req.userId },
      " -customer"
    )
      .populate({
        path: "subContact",
        select: "firstName lastName",
      })
      .populate({
        path: "subContactCarrier",
        select: "firstName lastName",
      })
      .populate({
        path: "load",
        select: "rate description pickup delivery  commodity status",
      })
      .populate({
        path: "truck",
        select: "rate description pickup delivery  commodity status",
      });

    console.log(not);
    console.log("ok");

    res.json(not);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const pinNotification = async (req, res) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { pin: !req.body.pin } },
      { new: true }
    );

    console.log(updated);
    res.json("ok");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const openNotification = async (req, res) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { opened: true } },
      { new: true }
    );
    console.log(updated);
    res.json("ok");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};

export const deleteNotification = async (req, res) => {
  try {
    console.log(req.body);
    const response = await NotificationModel.findOneAndDelete({
      _id: req.body.id,
    });

    let MODEL = null;
    if (req.body.userType === "customer") {
      MODEL = CustomersModel;
    } else if (req.body.userType === "carrier") {
      MODEL = CarrierModel;
    }

    const updatedSubCustomer = await MODEL.findOneAndUpdate(
      { _id: req.userId },
      { $pull: { notification: req.body.id } },
      { new: true }
    );

    console.log(updatedSubCustomer);

    res.json(updatedSubCustomer);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
  7;
};
