const Project = require("../../models/Project");

module.exports.get = function (req, res, next) {
  Project.find({ isActive: true }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Fetching Data",
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
  const { image_name, image_path, image_text, image_title } = req.body;
  const project = new Project({
    image_name,
    image_path,
    image_text,
    image_title,
  });
  project.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Creating Project",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Project Created",
        data: data,
      });
    }
  });
};

module.exports.put = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = req.body;
  Project.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " ERROR WHILE UPDATING PROJECT",
        err: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " PROJECT UPDATED SUCCESSFULLY ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " PROJECT NOT UPDATED ",
          error: data,
        });
      }
    }
  });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = { isActive: false };
  Project.updateOne(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "GOT ERROR WHILE DELETING",
        error: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " PROJECT UPDATED SUCCESSFULLY ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " PROJECT NOT UPDATED ",
          error: data,
        });
      }
    }
  });
};

module.exports.checkExistingProject = function (req, res, next) {
  const { image_name } = req.body;
  Project.findOne({ image_name }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error While Fetching Data",
        error: err,
      });
    } else {
      if (data) {
        return res.status(200).json({
          success: false,
          message: "Project Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
