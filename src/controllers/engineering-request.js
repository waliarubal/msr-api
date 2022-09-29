"use strict";

const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const router = express.Router();
const validator = require("../helper/custom_validators");
const EngineeringRequest = require("../models/EngineeringRequest");

const STATUS_OPEN = "5ec8eb047ef9d51f3cc63813";

const PRIORITY = {
  Critical: 4,
  High: 1,
  Normal: 2,
  Low: 3,
};

const SHIPMENT_TYPE = {
  ShipToAddress: 1,
  ShipToWorkAddress: 2,
  Other: 3,
  PickupAtHwLabCabinet: 4,
  None: 5,
};

function post(req, res, next) {
  let {
    shipmentTypeId,
    shipmentAddress,
    dueDate,
    requestDescription,
    priority,
    projectName,
    requestTypes,
    userId,
    msftAlias,
    customerId,
    customerMsftAlias,
    isDraft,
    files,
    successCriteria,
  } = req.body;
  console.log(req.body);

  let engRequest = new EngineeringRequest();
  engRequest.priority = priority;
  engRequest.projectName = projectName;
  engRequest.requestDescription = requestDescription;
  engRequest.requestedCompletionDate = dueDate;
  engRequest.userId = mongoose.Types.ObjectId(userId); // discuss
  engRequest.msftAlias = msftAlias; // discuss
  engRequest.customerId = customerId; //mongoose.Types.ObjectId(customerId);
  engRequest.customerMsftAlias = customerMsftAlias;
  engRequest.shipmentType = shipmentTypeId; // discuss
  engRequest.shipmentAddress = shipmentAddress; // discuss
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
      // send email
      let mailPayload = {
        body: `Engineering request with project name '${projectName}' received from customer ${engRequest.customerId}.`,
        from: "hardlab@microsoft.com",
        subject: "Engineering Request Received",
        to: "hardlab@microsoft.com",
      };
      await axios
        .post(process.env.SEND_EMAIL, mailPayload)
        .then((response) => console.log("Request creation email sent."));

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
    userId,
    msftAlias,
    customerId,
    customerMsftAlias,
    requestDescription,
    priority,
    projectName,
    requestTypes,
    isDraft,
    files,
    successCriteria,
    status,
  } = req.body;
  console.log(req.body);

  let engRequest = {};
  engRequest.priority = priority;
  engRequest.projectName = projectName;
  engRequest.requestDescription = requestDescription;
  engRequest.requestedCompletionDate = requestedCompletionDate;
  engRequest.customerId = customerId; //mongoose.Types.ObjectId(customerId);
  engRequest.customerMsftAlias = customerMsftAlias;
  engRequest.userId = mongoose.Types.ObjectId(userId);
  engRequest.msftAlias = msftAlias;
  engRequest.shipmentType = shipmentTypeId;
  engRequest.shipmentAddress = shipmentAddress;
  engRequest.status = status;
  engRequest.requestTypes = requestTypes;
  engRequest.isDraft = isDraft;
  engRequest.files = files;
  engRequest.successCriteria = successCriteria;
  engRequest.status = status;

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
  EngineeringRequest.find(condition)
    .populate("userId")
    //.populate("customerId")
    .exec(async (err, data) => {
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
        record = engRequest.requestTypes.filter(
          (r) => r.name === "Consultation"
        );
        if (record && record.length > 0) {
          for (let index = 0; index < record[0].categories.length; index++) {
            consultation += `${record[0].categories[index].categoryName},`;
          }
        }

        let payload = {
          priority: engRequest.priority,
          projectName: engRequest.projectName,
          requestDescription: engRequest.requestDescription,
          shipmentType: engRequest.shipmentType,
          shipmentAddress: engRequest.shipmentAddress,
          userId: engRequest.userId.email, //"v-pamoh@microsoft.com"
          msftAlias: engRequest.msftAlias,
          customerId: engRequest.customerId, //engRequest.customerId.email, // "v-mifass@microsoft.com",
          customerMsftAlias: engRequest.customerMsftAlias,
          status: engRequest.status,
          successCriteria: engRequest.successCriteria,
          requestedCompletionDate: engRequest.requestedCompletionDate,
          mechanicalEngineeringRequest: mechanicalEngineeringRequest,
          turnkeyRequest: turnkeyRequest,
          eletricalEngineeringRequest: eletricalEngineeringRequest,
          consultation: consultation,
          crmId: engRequest.crmId,
        };

        console.log(JSON.stringify(payload));

        try {
          let crmId = await axios
            .post(process.env.CREATE_CASE, payload)
            .then(async (response) => {
              const crmid = response.headers.caseid;
              console.log(`CRM ID: ${crmid}`);
              EngineeringRequest.update(condition, {
                $set: { crmId: crmid },
              }).exec((error, data) => {
                if (!data)
                  console.log(
                    `Updated engineering request with CRM ID ${crmid}.`
                  );
              });

              return crmid;
            });

          let message =
            crmId == "NO_CUSTOMER"
              ? `Customer ${engRequest.customerId} does not exist. Please create it in CRM before submitting request.`
              : `Enginnering request '${req.query.id}' added to CRM with ID ${crmId}.`;

          return res.status(200).json({
            success: true,
            message: message,
            data: crmId,
          });
        } catch {
          // throw error in case of Logic App failure
          return res.status(200).json({
            success: false,
            message: `Failed to add Enginnering request to CRM.`,
            data: "",
          });
        }
      }
    });
}

function updateNotes(req, res, next) {
  const response = req.body;
  for (let index = 0; index < response.length; index++) {
    let record = response[index];
    let crmId = record.CrmId;
    let notes = record.Notes;

    let condition = { crmId: crmId };
    EngineeringRequest.update(condition, {
      $set: { notes: notes },
    }).exec((error, data) => {
      if (!data)
        console.log(
          `Updated notes for engineering request with CRM ID ${crmId}.`
        );
    });
  }

  return res.status(200).json({
    success: true,
    message: `Notes updated for engineering requests.`,
  });
}

router.get("/getById", validator.authTokenValidate, getById);
router.get("/addToCrm", validator.authTokenValidate, addToCrm);
router.get("/get", validator.authTokenValidate, get);
router.post("/updateNotes", updateNotes);
router.post("/post", validator.authTokenValidate, post);
router.put("/put", validator.authTokenValidate, put);
router.delete("/delete", validator.authTokenValidate, del);
module.exports = router;
