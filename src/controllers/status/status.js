const Status = require("../../models/Status");

module.exports.get = function (req, res, next) {
  Status.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GOT ERROR WHILE GETTING DATA",
        error: err,
      });
    } else {
      if (!!data) {
        res.status(200).json({
          success: true,
          message: "REQUEST COMPLETED SUCCESSFULLY",
          data: data,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "REQUEST COMPLETED SUCCESSFULLY",
          data: [],
        });
      }
    }
  });
};

module.exports.post = function (req, res) {
  const { name } = req.body;
  const status = new Status({ name });
  status.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GOT ERROR WHILE CREATING NEW STATUS",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "NEW STATUS CREATED SUCCESSFULLY",
        data: data,
      });
    }
  });
};

module.exports.put = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body.id) };
  let updateData = req.body;
  Status.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " ERROR WHILE UPDATING STATUS",
        err: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: " STATUS UPDATED SUCCESSFULLY ",
        data: data,
      });
    }
  });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.params._id) };
  let updateData = { isActive: false };
  Status.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GOT ERROR WHILE DELETING",
        err: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "UPDATED",
        data: data,
      });
    }
  });
};

module.exports.checkExistingStatus = function (req, res, next) {
  const { name } = req.body;
  Status.findOne({ name }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GOT ERROR WHILE GETTING DATA",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "STATUS POST OPERATION FAILED !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
