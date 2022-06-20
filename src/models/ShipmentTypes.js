const mongoose = require("mongoose");

const ShipmentTypesSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("ShipmentTypes", ShipmentTypesSchema);
