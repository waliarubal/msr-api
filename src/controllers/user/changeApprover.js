const User = require("../../models/User");

module.exports.changeApprover = async function (req, res, next) {
  // let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  console.log(req.body);
  // console.log(req.body.length)
  new Promise((resolve, reject) => {
    if (req.body.app_i_remove) {
      let condition_old_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_i_remove._id),
      };
      let old_approver_data = req.body.app_i_remove;
      User.update(condition_old_approver, old_approver_data).exec(
        async function (err, data) {
          let user = await User.findOne({ approverLevel: "level1" });
          console.log(`user is removed as an approver${user.firstname}`);
        }
      );
    }

    if (req.body.app_ii_remove) {
      let condition_old_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_ii_remove._id),
      };
      let old_approver_data = req.body.app_ii_remove;
      User.update(condition_old_approver, old_approver_data).exec(function (
        err,
        data
      ) {});
    }
    if (req.body.app_iii_remove) {
      let condition_old_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_iii_remove._id),
      };
      let old_approver_data = req.body.app_iii_remove;
      User.update(condition_old_approver, old_approver_data).exec(function (
        err,
        data
      ) {});
    }
    resolve("ok");
  }).then(() => {
    if (req.body.app_i) {
      let condition_new_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_i._id),
      };
      let new_approver_data = req.body.app_i;

      User.update(condition_new_approver, new_approver_data).exec(
        async function (err, data) {
          let user = await User.findOne({ approverLevel: "level1" });
          console.log(`user is assigned as an approver ${user.firstname}`);
        }
      );
    }

    if (req.body.app_ii) {
      let condition_new_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_ii._id),
      };
      let new_approver_data = req.body.app_ii;

      User.update(condition_new_approver, new_approver_data).exec(function (
        err,
        data
      ) {});
    }

    if (req.body.app_iii) {
      let condition_new_approver = {
        _id: mongoose.Types.ObjectId(req.body.app_iii._id),
      };
      let new_approver_data = req.body.app_iii;

      User.update(condition_new_approver, new_approver_data).exec(function (
        err,
        data
      ) {
        // return res.status(200).json({
        //   success: true,
        //   message: "Approvers updated successfully",
        //   data: data
        // })
      });
    }
  });

  return res.status(200).json({
    success: true,
    message: "Approvers updated successfully",
    // data: data
  });
  // for (i=0; i<req)
  // let updateData = req.body.app_i;
};
