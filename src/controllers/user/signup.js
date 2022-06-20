const User = require("../../models/User");
const Role = require("../../models/Role");

module.exports.signup = function (req, res) {
  const { firstname, lastname, email, password, phone, role, username } =
    req.body;
  Role.find({ name: { $in: ["Admin", "SuperAdmin"] } })
    .select("_id")
    .exec((err, data) => {
      if (err) {
        return res.status(200).json({
          success: false,
          message: "Error While Creating User",
          error: err,
        });
      } else {
        if (data && data.length > 0) {
          console.log(data, req.body.role);
          data.filter((d) => {
            if (d._id == role) {
              req["isTechContact"] = true;
              req["isProjectContact"] = true;
            } else {
              req["isTechContact"] = false;
              req["isProjectContact"] = false;
            }
          });
          const user = new User({
            firstname,
            lastname,
            email,
            password,
            phone,
            role,
            username,
            isProjectContact: req.isProjectContact,
            isTechContact: req.isTechContact,
            otherRole: "",
            approverLevel: "",
          });
          user.save(function (err, data) {
            if (err) {
              return res.status(200).json({
                success: false,
                message: "Error While Creating User",
                error: err,
              });
            } else {
              return res.status(200).json({
                success: true,
                message: "New User Created Successfully",
                data: data,
              });
            }
          });
        } else {
          return res.status(200).json({
            success: false,
            message: "Error While Creating User",
            error: err,
          });
        }
      }
    });
};

module.exports.checkExistingUsername = function (req, res, next) {
  const { username } = req.body;
  User.findOne({ username }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Getting Data ",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "User Registration Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
