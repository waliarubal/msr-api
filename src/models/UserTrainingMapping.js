const mongoose = require("mongoose");

const UserTrainingMappingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training" },
    statusId: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    startDate: { type: String },
    endDate: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("UserTraining", UserTrainingMappingSchema);
