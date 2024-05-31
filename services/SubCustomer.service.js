import CustomersModel from "../modules/Customer.js";
import SubCustomersModel from "../modules/SubCustomer.js";
import SubCarrierModel from "../modules/SubCarrier.js";
import CarrierModel from "../modules/Carrier.js";

export const getDetailSub = async (req, res) => {
  try {
    const user = await SubCustomersModel.findById(req.userId)
      .select("-passwordHash")
      .populate({
        path: "parent",
        select: "companyName address website paymentType paymentDuration about",
      });

    if (!user) {
      return res.status(404).json({
        message: "Օգտատեր չի գտնվել",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};

export const removeSub = async (req, res) => {
  try {
    let user = null;
    if (req.body.userType === "customer") {
      user = await CustomersModel.findOne({ _id: req.userId });
    } else if (req.body.userType === "carrier") {
      user = await CarrierModel.findOne({ _id: req.userId });
    }

    user.subCustomers.pull(req.body.userId);
    let deleted = await user.save();

    let sub = null;
    if (req.body.userType === "customer") {
      sub = await SubCustomersModel.findByIdAndDelete(req.body.userId);
    } else if (req.body.userType === "carrier") {
      sub = await SubCarrierModel.findByIdAndDelete(req.body.userId);
    }

    res.status(200).json(req.body.userId);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "Տեղի է ունեցել սխալ գործողության ընդացքում, խնդրում ենք փորձել մի փոքր ուշ",
    });
  }
};
