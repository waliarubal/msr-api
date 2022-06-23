const mongoose = require("mongoose");

const RequestFieldSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    fields: [
      {
        name: { type: String, unique: true, required: true },
        isActive: { type: Boolean, default: true },
        isRequired: { type: Boolean, default: false },
      },
    ],
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("RequestField", RequestFieldSchema);
