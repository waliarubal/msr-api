const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
    severityId: { type: mongoose.Schema.Types.ObjectId, ref: "Severity" },
    correctiveActionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorrectiveAction",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    briefDescription: { type: String },
    detailedDescription: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Incident", IncidentSchema);
