const mongoose = require("mongoose");

const EngineeringRequestsSchema = new mongoose.Schema(
  {
    priority: { type: String },
    projectName: { type: String },
    requestDescription: { type: String },
    successCriteria: { type: String },
    requestedCompletionDate: { type: Date, default: Date.now },
    // expectedCompletionDate: { type: Date, default: Date.now },
    // quantity: {type: Number, default: 0},
    shipmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShipmentType",
    },
    shipmentAddress: { type: String },
    status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestBy: { type: String },
    msftAlias: { type: String },
    // techContact: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: false,
    // },
    // projectContact: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: false,
    // },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    // history: [],
    crmId: { type: String, default: "" },
    // crmHistory: [],
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
