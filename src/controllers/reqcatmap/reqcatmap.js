const RequestCategoryMapping = require("../../models/RequestCategoryMapping");
const Category = require("../../models/Category");
const RequestType = require("../../models/RequestType");

module.exports.get = function (req, res, next) {
  RequestCategoryMapping.find({ isActive: true }).exec(function (err, data) {
    console.log("reqcat data", data);
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Fetching Data",
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
  const { requestTypeId, categoryId } = req.body;
  const rqcmap = new RequestCategoryMapping({ requestTypeId, categoryId });
  rqcmap.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Creating Data",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Mapping Created Successfully",
        data: data,
      });
    }
  });
};

module.exports.getReqTypeWiseCat = function (req, res, next) {
  let condition = { requestTypeId: mongoose.Types.ObjectId(req.body._id) };
  console.log(condition);
  RequestCategoryMapping.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "cat",
      },
    },
    { $unwind: "$cat" },
    { $project: { categoryName: "$cat.name", categoryId: "$cat._id", _id: 0 } },
  ]).exec(function (err, data) {
    // console.log('reqcat data', data)
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Fetching Data",
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
