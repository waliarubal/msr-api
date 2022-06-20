const Incident = require("../../models/Incident");
const Request = require("../../models/Request");
const RequestType = require("../../models/RequestType");
const User = require("../../models/User");

const date = require("date-and-time");

let monthArr = [
  { month: "Jan", index: 1 },
  { month: "Feb", index: 2 },
  { month: "Mar", index: 3 },
  { month: "Apr", index: 4 },
  { month: "May", index: 5 },
  { month: "Jun", index: 6 },
  { month: "Jul", index: 7 },
  { month: "Aug", index: 8 },
  { month: "Sep", index: 9 },
  { month: "Oct", index: 10 },
  { month: "Nov", index: 11 },
  { month: "Dec", index: 12 },
];

module.exports.getMonthlyCount = function (req, res) {
  const now = new Date();
  if (req.query.year) {
    year = req.query.year;
  } else {
    year = date.format(now, "YYYY");
  }

  let prmsArr = [];
  monthArr.forEach((el) => {
    let prms = new Promise((rs, rj) => {
      Incident.aggregate([
        {
          $project: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            _id: 1,
          },
        },

        {
          $group: {
            _id: {
              month: "$month",
              year: "$year",
            },
            Arr: { $addToSet: "$_id" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            count: { $size: "$Arr" },
          },
        },
      ]).exec(function (err, data) {
        if (err) {
          rj({ message: `error in getting count data for month ${el}` });
        } else {
          if (!!data) {
            console.log(JSON.stringify(data));
            let p = [];
            data.forEach((d) => {
              if (el.index == parseInt(d.month) && year == d.year) {
                rs({ month: el.month, year: d.year, count: d.count });
              }
            });

            rs({ month: el.month, year: year, count: 0 });
          }
        }
      });
    });
    prmsArr.push(prms);
  });
  Promise.all(prmsArr)
    .then((values) => {
      res.status(200).json({
        success: true,
        message: "Request Completed Successfully",
        data: values,
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

module.exports.get = function (req, res, next) {
  let condition = {};
  if (req.query.id) {
    condition._id = mongoose.Types.ObjectId(req.query.id);
  }
  if (req.query.from && req.query.to) {
    var fromDate = new Date(req.query.from);
    var toDate = new Date(req.query.to);
    if (fromDate && toDate) {
      toDate.setDate(toDate.getDate() + 1);
      if (fromDate && toDate) {
        condition["createdAt"] = {
          $gte: fromDate,
          $lte: toDate,
        };
      }
    }
  }
  Incident.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "equipment",
        localField: "equipmentId",
        foreignField: "_id",
        as: "eq",
      },
    },
    { $unwind: "$eq" },
    {
      $lookup: {
        from: "correctiveactions",
        localField: "correctiveActionId",
        foreignField: "_id",
        as: "ca",
      },
    },
    { $unwind: "$ca" },
    {
      $lookup: {
        from: "severities",
        localField: "severityId",
        foreignField: "_id",
        as: "sd",
      },
    },
    { $unwind: "$sd" },
    {
      $project: {
        _id: 1,
        severityId: "$sd._id",
        severityValue: "$sd.value",
        actionId: "$ca._id",
        actionName: "$ca.name",
        equipmentId: "$eq._id",
        equipmentValue: "$eq.name",
        description: 1,
        briefDescription: 1,
        detailedDescription: 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Getting Data",
        error: err,
      });
    } else {
      if (!!data) {
        let newData = data.map((data) => {
          return {
            createdAt: changeDateFormat(data.createdAt),
            modifiedAt: changeDateFormat(data.modifiedAt),
            _id: data._id,
            severityId: data.severityId,
            severityValue: data.severityValue,
            actionId: data.actionId,
            actionName: data.actionName,
            equipmentId: data.equipmentId,
            equipmentValue: data.equipmentValue,
            description: data.description,
            briefDescription: data.briefDescription,
            detailedDescription: data.detailedDescription,
          };
        });
        res.status(200).json({
          success: true,
          message: "Rquest Completed Successfully",
          data: newData,
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
  const {
    userId,
    equipmentId,
    severityId,
    correctiveActionId,
    description,
    briefDescription,
    detailedDescription,
  } = req.body;
  const incident = new Incident({
    userId,
    equipmentId,
    severityId,
    correctiveActionId,
    description,
    briefDescription,
    detailedDescription,
  });
  incident.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Creating New Incident",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "New Incident Created",
        data: data,
      });
    }
  });
};

module.exports.getTechContactUsers = function (req, res) {
  RequestType.find().exec((err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Get Error While Getting Data",
        error: err,
      });
    } else {
      let d = data ? data : [];
      let arr = [];

      d.forEach((rt) => {
        let promise = new Promise((resolve, reject) => {
          Request.aggregate([
            { $match: { requestTypeId: rt._id } },
            {
              $lookup: {
                from: "requesttypes",
                localField: "requestTypeId",
                foreignField: "_id",
                as: "rq",
              },
            },
            { $unwind: "$rq" },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "us",
              },
            },
            { $unwind: "$us" },
            {
              $project: {
                _id: 0,
                request: "$rq._id",
                name: "$rq.name",
                userDetail: "$us",
              },
            },
            {
              $group: {
                _id: { _id: "$request", name: "$name" },
                userIds: { $addToSet: "$userDetail" },
              },
            },
            {
              $project: {
                _id: 0,
                request: "$_id._id",
                name: "$_id.name",
                userDetail: "$userIds",
              },
            },
          ]).exec((err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
        arr.push(promise);
      });

      Promise.all(arr)
        .then((values) => {
          let finalArr = values.filter((v) => {
            if (!!v && v.length > 0) {
              return true;
            }
          });
          return res.status(200).json({
            success: true,
            message: "Data found",
            data: finalArr,
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  });
};

const changeDateFormat = (date) => {
  if (date && date != null && date != undefined) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let output = month + "/" + day + "/" + year;

    return output;
  } else {
    return "";
  }
};
