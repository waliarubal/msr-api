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
  // let condition = { requestTypeId: mongoose.Types.ObjectId(req.body._id) };
  // console.log(condition);
  //query shipment methods to obtain the list of shipment methods and their ids
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
