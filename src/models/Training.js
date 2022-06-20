const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    link: { type: String },
    description: { type: String },
    duration: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Training", TrainingSchema);
