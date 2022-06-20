const mongoose = require("mongoose");

const SubscribeSchema = new mongoose.Schema(
  {
    email: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Subscribe", SubscribeSchema);
