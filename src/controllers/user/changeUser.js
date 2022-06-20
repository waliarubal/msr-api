const User = require("../../models/User");

module.exports.changeUser = function (req, res, next) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = req.body;
  User.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " Error While Updating",
        err: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " User Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " User Not Updated ",
          error: data,
        });
      }
    }
  });
};
