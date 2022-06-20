const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    image_name: { type: String },
    image_path: { type: String },
    image_text: { type: String },
    image_title: { type: String },
    modifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamp: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

module.exports = mongoose.model("Project", ProjectSchema);
