const RequestType  = require("../../models/RequestType");

module.exports.get = function (req, res, next) {
  RequestType.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Getting Data",
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

module.exports.post = function (req, res) {
  const { name } = req.body;
  const requestType = new RequestType({ name });
  requestType.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GET ERROR WHILE CREATING New Requesttype",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Requesttype Created Successfully",
        data: data,
      });
    }
  });
};

module.exports.put = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = req.body;
  RequestType.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " Error While Getting RequestType",
        err: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " RequestType Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " RequestType Not Updated ",
          error: data,
        });
      }
    }
  });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = { isActive: false };
  RequestType.updateOne(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Got Error While Getting Data",
        error: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " RequestType Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " RequestType Not Updated ",
          error: data,
        });
      }
    }
  });
};

module.exports.checkExistingRequestType = function (req, res, next) {
  const { name } = req.body;
  RequestType.findOne({ name }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Got Error While Updating",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "RequestType Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
