const Category = require("../../models/Category");
const mongoose = require("mongoose");

module.exports.get = function (req, res, next) {
  Category.find({ isActive: true }).exec(function (err, data) {
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
  const { name, isActive, isRequired } = req.body;
  const category = new Category({ name, isActive, isRequired });
  category.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Creating New Category",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Category Created",
        data: data,
      });
    }
  });
};

module.exports.put = function (req, res) {
  let { categoryId, categoryName, isActive, isRequired } = req.body;
  let condition = { _id: mongoose.Types.ObjectId(categoryId) };
  let updateData = req.body;
  
  Category.update(condition, {
    name: categoryName,
    isActive: isActive,
    isRequired: isRequired
  }).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: `Error While Updating '${categoryName}'`,
        err: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: `Category '${categoryName}' Updated Successfully`,
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: `Category '${categoryName}' Not Updated`,
          error: data,
        });
      }
    }
  });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let updateData = { isActive: false };
  Category.updateOne(condition, updateData).exec(function (err, data) {
    console.log(err, data);
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Deleting",
        error: err,
      });
    } else {
      if (data.nModified === 1) {
        return res.status(200).json({
          success: true,
          message: " Category Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " Category Not Updated",
          error: data,
        });
      }
    }
  });
};

module.exports.checkExistingCategory = function (req, res, next) {
  const { name } = req.body;
  Category.findOne({ name }).exec(function (err, data) {
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
          message: "Category Post Operation Failed !",
          error: data,
        });
      } else {
        next();
      }
    }
  });
};
