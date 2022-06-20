const mongoose = require("mongoose");

const RequestsSchema = new mongoose.Schema(
  {
    requestTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "RequestType" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    isImmediate: { type: String, default: "No" },
    quantity: { type: Number, default: 0 },
    jobName: { type: String },
    jobDetail: { type: String },
    requestedCompletionDate: { type: Date, default: Date.now },
    expectedCompletionDate: { type: Date, default: Date.now },
    timeline: { type: String },
    hardwareFilmware: { type: String },
    contactPerson: { type: String },
    shipmentTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShipmentType",
    },
    shippingAddress: { type: String },
    files: [],
    status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    reqStatus: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate: { type: String },
    endDate: { type: String },
    techContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    projectContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    history: [],
    createdBy: { type: String },
    crm_id: { type: String, default: "" },
    CRM_history: [],
    Notes: [],
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Requests", RequestsSchema);
