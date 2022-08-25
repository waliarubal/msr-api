const mongoose = require("mongoose");

const EngineeringRequestsSchema = new mongoose.Schema(
  {
    priority: { type: Number },
    projectName: { type: String },
    requestDescription: { type: String },
    successCriteria: { type: String },
    requestedCompletionDate: { type: Date, default: Date.now },
    shipmentType: { type: Number },
    shipmentAddress: { type: String },
    status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // requester
    msftAlias: { type: String }, // requester
    customerId: {type: String}, //{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerMsftAlias: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    crmId: { type: String, default: "" },
    notes: [],
    files: [],
    requestTypes: [],
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model(
  "EngineeringRequests",
  EngineeringRequestsSchema
);
