const Equipment = require("../../models/Equipment");

module.exports.get = function (req, res, next) {
  Equipment.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Getting Data",
        error: err,
      });
    } else {
      if (!!data) {
        res.status(200).json({
          success: true,
          message: "Rquest Completed Successfully",
          data: data,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Rquest Completed Successfully",
          data: [],
        });
      }
    }
  });
};

module.exports.post = function (req, res) {
  const { name } = req.body;
  const equipment = new Equipment({ name });
  equipment.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Creating New Equipment",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Equipment Created",
        data: data,
      });
    }
  });
};

module.exports.checkExistingEquipment = function (req, res, next) {
  const { name } = req.body;
  Equipment.findOne({ name }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Fetching Data",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "Equipment Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
