const Role = require("../../models/Role");

module.exports.get = function (req, res, next) {
  Role.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error In Fetching Data",
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
  const role = new Role({ name });
  role.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error Whiile Creating Role",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Role Created",
        data: data,
      });
    }
  });
};

module.exports.put = function (req, res) {
  let condition = { _id: mongoose.Schema.Types.ObjectId(req.body._id) };
  let updateData = req.body;
  Role.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " Error In Updating Role",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: " Role Updated Succesfully ",
        data: data,
      });
    }
  });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.params.id) };
  let updateData = { isActive: false };
  Role.updateOne(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error In Deleting",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Updated Successfully",
        data: data,
      });
    }
  });
};

module.exports.checkExistingRole = function (req, res, next) {
  const { name } = req.body;
  Role.findOne({ name }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error In Fetching Data",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "Role Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
