const mongoose = require("mongoose");

const SeveritySchema = new mongoose.Schema(
  {
    value: { type: Number, unique: true },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Severity", SeveritySchema);
