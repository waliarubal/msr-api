const mongoose = require("mongoose");

const RequestCategoryMappingSchema = new mongoose.Schema(
  {
    requestTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "RequestType" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model(
  "RequestCategoryMapping",
  RequestCategoryMappingSchema
);
