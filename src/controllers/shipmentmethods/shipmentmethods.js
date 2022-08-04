const ShipmentTypes = require("../../models/ShipmentTypes");

module.exports.get = function (req, res, next) {
  ShipmentTypes.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Fetching Data",
        error: err,
      });
    } else {
      if (!!data) {
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: data,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: [],
        });
      }
    }
  });
};

module.exports.getShipmentMethods = async function (req, res, next) {
  let methods = [
    { _id: 1, name: "Ship to Address" },
    { _id: 2, name: "Ship to Work Address" },
    { _id: 3, name: "Other" },
    { _id: 4, name: "Pickup at HWLab(Cabinet)" },
    { _id: 5, name: "None" },
  ];

  return res.status(200).json({
    success: true,
    message: "Request completed successfully.",
    data: methods,
  });

  // OLD CODE
  let condition = { isActive: true };
  let shiptypes = await ShipmentTypes.find(condition).exec(function (
    err,
    data
  ) {
    // console.log('shipment methods data', data)
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Fetching Data",
        error: err,
      });
    } else {
      if (!!data) {
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: data,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: [],
        });
      }
    }
  });
};
