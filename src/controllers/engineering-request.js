"use strict";

const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const router = express.Router();
const validator = require("../helper/custom_validators");
const EngineeringRequest = require("../models/EngineeringRequest");

const STATUS_OPEN = "5ec8eb047ef9d51f3cc63813";

function post(req, res, next) {
  let {
    shipmentTypeId,
    shipmentAddress,
    dueDate,
    // requestBy,
    msftAlias,
    requestDescription,
    priority,
    projectName,
    requestTypes,
    userId,
    isDraft,
    files,
    successCriteria,
  } = req.body;
  console.log(req.body);

  let engRequest = new EngineeringRequest();
  // engRequest.quantity = 1;
  engRequest.priority = priority;
  engRequest.projectName = projectName;
  engRequest.requestDescription = requestDescription;
  engRequest.requestedCompletionDate = dueDate;
  // engRequest.expectedCompletionDate = dueDate;
  // engRequest.requestBy = requestBy;
  engRequest.msftAlias = msftAlias; // discuss
  engRequest.shipmentType = shipmentTypeId; // discuss
  engRequest.shipmentAddress = shipmentAddress; // discuss
  engRequest.userId = userId; // discuss
  engRequest.status = STATUS_OPEN;
  engRequest.requestTypes = requestTypes;
  engRequest.isDraft = isDraft;
  engRequest.files = files;
  engRequest.successCriteria = successCriteria;
  engRequest.save(async (err, data) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: `Failed to create ${
          isDraft ? "draft " : " "
        }engineering request.`,
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Engineering request ${isDraft ? "draft " : " "}created.`,
        data: data,
      });
    }
  });
}

function put(req, res, next) {
  let {
    _id,
    shipmentTypeId,
    shipmentAddress,
    requestedCompletionDate,
    // expectedCompletionDate,
    requestBy,
    msftAlias,
    requestDescription,
    priority,
    projectName,
    requestTypes,
    userId,
    isDraft,
    files,
    successCriteria,
    // techContact,
    // projectContact,
    status,
  } = req.body;
  console.log(req.body);

  let engRequest = {};
  // engRequest.quantity = 1;
  engRequest.priority = priority;
  engRequest.projectName = projectName;
  engRequest.requestDescription = requestDescription;
  engRequest.requestedCompletionDate = requestedCompletionDate;
  // engRequest.expectedCompletionDate = expectedCompletionDate;
  engRequest.requestBy = requestBy;
  engRequest.msftAlias = msftAlias;
  engRequest.shipmentType = shipmentTypeId;
  engRequest.shipmentAddress = shipmentAddress;
  engRequest.userId = mongoose.Types.ObjectId(userId);
  engRequest.status = status;
  engRequest.requestTypes = requestTypes;
  engRequest.isDraft = isDraft;
  engRequest.files = files;
  engRequest.successCriteria = successCriteria;
  engRequest.status = status;
  // engRequest.techContact = mongoose.Types.ObjectId(techContact) || null;
  // engRequest.projectContact = mongoose.Types.ObjectId(projectContact) || null;

  let condition = { _id: mongoose.Types.ObjectId(_id) };
  EngineeringRequest.update(condition, engRequest).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: `Failed to update ${
          isDraft ? "draft " : " "
        }engineering request.`,
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Engineering request ${isDraft ? "draft " : " "}updated.`,
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
    } else if (data) {
      return res.status(200).json({
        success: true,
        message: "Enginnering requests fetched.",
        data: data,
      });
    }
  });
}

function getById(req, res, next) {
  let condition = { _id: mongoose.Types.ObjectId(req.query.id) };

  EngineeringRequest.find(condition).exec((err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: `Failed to get engineering request '${req.query.id}'.`,
        error: err,
      });
    } else if (data && data.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Enginnering request '${req.query.id}' fetched.`,
        data: data[0],
      });
    }
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

async function addToCrm(req, res, next) {
  let condition = { _id: mongoose.Types.ObjectId(req.query.id) };
  EngineeringRequest.find(condition).exec(async (err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: `Failed to get engineering request '${req.query.id}' for adding to CRM.`,
        error: err,
      });
    } else if (data && data.length > 0) {
      let engRequest = data[0];

      let mechanicalEngineeringRequest = "";
      let record = engRequest.requestTypes.filter(
        (r) => r.name === "Mechanical Engineering Request"
      );
      if (record && record.length > 0) {
        for (let index = 0; index < record[0].categories.length; index++) {
          mechanicalEngineeringRequest += `${record[0].categories[index].categoryName},`;
        }
      }

      let turnkeyRequest = "";
      record = engRequest.requestTypes.filter(
        (r) => r.name === "Turnkey Request"
      );
      if (record && record.length > 0) {
        for (let index = 0; index < record[0].categories.length; index++) {
          turnkeyRequest += `${record[0].categories[index].categoryName},`;
        }
      }

      let eletricalEngineeringRequest = "";
      record = engRequest.requestTypes.filter(
        (r) => r.name === "Eletrical Engineering Request"
      );
      if (record && record.length > 0) {
        for (let index = 0; index < record[0].categories.length; index++) {
          eletricalEngineeringRequest += `${record[0].categories[index].categoryName},`;
        }
      }

      let consultation = "";
      record = engRequest.requestTypes.filter((r) => r.name === "Consultation");
      if (record && record.length > 0) {
        for (let index = 0; index < record[0].categories.length; index++) {
          consultation += `${record[0].categories[index].categoryName},`;
        }
      }

      let payload = {
        priority: engRequest.priority,
        projectName: engRequest.projectName,
        requestDescription: engRequest.requestDescription,
        msftAlias: engRequest.msftAlias,
        shipmentType: engRequest.shipmentType,
        shipmentAddress: engRequest.shipmentAddress,
        userId: engRequest.userId,
        status: engRequest.status,
        successCriteria: engRequest.successCriteria,
        requestedCompletionDate: engRequest.requestedCompletionDate,
        mechanicalEngineeringRequest: mechanicalEngineeringRequest,
        turnkeyRequest: turnkeyRequest,
        eletricalEngineeringRequest: eletricalEngineeringRequest,
        consultation: consultation,
        crmId: engRequest.crmId,
      };

      console.log(payload);

      let crmId = await axios
        .post(
          `https://hwlabemailservice.azurewebsites.net:443/api/CRMSync/triggers/manual/invoke?api-version=2022-05-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sY494hGI4sIyCfYUeSdlmbl2ejrA8qn3jaFw75npOY8`,
          payload
        )
        .then(async (response) => {
          EngineeringRequest.update(condition, {
            $set: { crmId: response.headers.crmId },
          }).exec((error, data) => {
            if (!data)
              console.log(
                `Updated engineering request with CRM ID ${response.headers.crmId}.`
              );
          });

          return response.headers.crmId;
        });

      return res.status(200).json({
        success: true,
        message: `Enginnering request '${req.query.id}' added to CRM with ID ${crmId}.`,
        data: data[0],
      });
    }
  });
}

router.get("/getById", validator.authTokenValidate, getById);
router.get("/addToCrm", validator.authTokenValidate, addToCrm);
router.get("/get", validator.authTokenValidate, get);
router.post("/post", validator.authTokenValidate, post);
router.put("/put", validator.authTokenValidate, put);
router.delete("/delete", validator.authTokenValidate, del);
module.exports = router;
