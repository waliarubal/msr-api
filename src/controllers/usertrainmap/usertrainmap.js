const UserTrainingMapping = require("../../models/UserTrainingMapping");

module.exports.get = function (req, res, next) {
  let condition = {};
  if (req.query.userId) {
    condition.userId = mongoose.Types.ObjectId(req.query.userId);
  }
  UserTrainingMapping.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "status",
        localField: "statusId",
        foreignField: "_id",
        as: "stData",
      },
    },
    { $unwind: "$stData" },
    {
      $lookup: {
        from: "trainings",
        localField: "trainingId",
        foreignField: "_id",
        as: "trData",
      },
    },
    { $unwind: "$trData" },
    {
      $project: {
        _id: 1,
        userId: 1,
        startDate: 1,
        endDate: 1,
        createdAt: 1,
        statusId: 1,
        trainingId: 1,
        status: "$stData.name",
        training: "$trData.name",
      },
    },
  ]).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Fetching Data",
        error: err,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Request Completed Successfully",
        data: data,
      });
    }
  });
};

module.exports.post = function (req, res) {
  const { userId, trainingId, statusId, startDate, endDate } = req.body;
  const usertrainmap = new UserTrainingMapping({
    userId,
    trainingId,
    statusId,
    startDate,
    endDate,
  });
  usertrainmap.save(function (err, data) {
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

module.exports.updateStatus = function (req, res) {
  let condition = { trainingId: req.body.id };
  let statusId = req.body.statusId;
  let userId = req.body.userId;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  UserTrainingMapping.findOneAndUpdate(
    condition,
    {
      $set: {
        statusId: statusId,
        userId: userId,
        startDate: startDate,
        endDate: endDate,
      },
    },
    { upsert: true }
  ).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Updating",
        error: err,
      });
    } else {
      if (data && data.nModified) {
        return res.status(200).json({
          success: true,
          message: " Status Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: " Status Not Updated",
          data: data,
        });
      }
    }
  });
};
