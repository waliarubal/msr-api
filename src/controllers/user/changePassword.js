const User = require("../../models/User");

module.exports.changePassword = function (req, res, next) {
  const { username, currentPassword, newPassword, authToken } = req.body;
  if (currentPassword.localeCompare(newPassword)) {
    User.findOne({ username, password: currentPassword }).exec(function (
      err,
      data
    ) {
      if (err) {
        return res.status(200).json({
          success: false,
          message: "GOT ERROR WHILE GETTING DATA",
          error: err,
        });
      } else {
        if (!!data) {
          User.update({ username }, { $set: { password: newPassword } }).exec(
            function (err, updatedData) {
              if (err) {
                return res.status(200).json({
                  success: false,
                  message: "GOT ERROR WHILE UPDATING PASSWORD",
                  error: err,
                });
              } else {
                return res.status(200).json({
                  success: true,
                  message: "PASSWORD SUCCESSFULLY UPDATED !",
                  data: updatedData,
                });
              }
            }
          );
        } else {
          res.status(200).json({
            success: false,
            message: "PASSWORD UPDATION FAILED",
            error: data,
          });
        }
      }
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "PASSWORD NOT UPDATED",
      error: req.body,
    });
  }
};
