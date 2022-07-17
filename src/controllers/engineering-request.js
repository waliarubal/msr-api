"use strict";

const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const validator = require("../helper/custom_validators");
const EngineeringRequest = require("../models/EngineeringRequest");

const STATUS_OPEN = "5ec8eb047ef9d51f3cc63813";

function post(req, res, next) {
  let {
    shipmentTypeId,
    shipmentAddress,
    dueDate,
    requestBy,
    msftAlias,
    requestDescription,
    priority,
    projectName,
    requestTypes,
    userId,
  } = req.body;
  console.log(req.body);

  let engRequest = new EngineeringRequest();
  engRequest.quantity = 1;
  engRequest.priority = priority;
  engRequest.projectName = projectName;
  engRequest.requestDescription = requestDescription;
  engRequest.requestedCompletionDate = dueDate;
  engRequest.expectedCompletionDate = dueDate;
  engRequest.requestBy = requestBy;
  engRequest.msftAlias = msftAlias;
  engRequest.shipmentType = shipmentTypeId;
  engRequest.shipmentAddress = shipmentAddress;
  engRequest.userId = userId;
  engRequest.status = STATUS_OPEN;
  engRequest.requestTypes = requestTypes;
  engRequest.save(async (err, data) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Failed to create engineering request.",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Engineering request created.",
        data: data,
      });
    }
  });
}

function get(req, res, next) {
  let condition = {};
  let userId = req.query.userId;
  if (userId) condition.techContact = mongoose.Types.ObjectId(userId);

  EngineeringRequest.find(condition).exec((err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Failed to get engineering requests.",
        error: err,
      });
    } else if (data && data.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Enginnering requests fetched.",
        data: data,
      });
    }
  });
}

function getById(req, res, next) {
  let condition = { _id: mongoose.Types.ObjectId(req.params.id) };

  EngineeringRequest.find(condition).exec((err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Failed to get engineering requests.",
        error: err,
      });
    } else if (data && data.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Enginnering requests fetched.",
        data: data[0],
      });
    }
    console.log(data);
  });
}

async function del(req, res, next) {
  let id = req.query.requestId;
  await EngineeringRequest.deleteOne({ _id: id });

  return res.status(200).json({
    success: true,
    message: "Enginnering requests deleted.",
  });
}

router.get("/getById", validator.authTokenValidate, getById);
router.get("/get", validator.authTokenValidate, get);
router.post("/post", validator.authTokenValidate, post);
router.delete("/delete", validator.authTokenValidate, del);
module.exports = router;
