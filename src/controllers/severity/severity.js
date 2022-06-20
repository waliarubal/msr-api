const Severity = require("../../models/Severity");

module.exports.get = function (req, res, next) {
  Severity.find({ isActive: true }).exec(function (err, data) {
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
  const { value } = req.body;
  const severity = new Severity({ value });
  severity.save(function (err, data) {
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

module.exports.checkExistingSeverity = function (req, res, next) {
  const { value } = req.body;
  Severity.findOne({ value }).exec(function (err, data) {
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
          message: "Severity Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
