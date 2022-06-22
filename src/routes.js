"use strict";

const express = require("express"),
  router = express.Router(),
  config = require("./config");

router.use((req, res, next) => {
  res.status(200);
  next();
});

router.use("/request-field", require("./controllers/request-field"));
router.use("/user",  require("./controllers/user"));
router.use("/request", require("./controllers/request"));
router.use("/category", require("./controllers/category"));
router.use("/role", require("./controllers/role"));
router.use("/status", require("./controllers/status"));
router.use("/project", require("./controllers/project"));
router.use("/reqtype", require("./controllers/reqtype"));
router.use("/req-cat-map", require("./controllers/reqcatmap"));
router.use("/shipment-method-list", require("./controllers/shipmentmethods"));
router.use("/tour", require("./controllers/tour"));
router.use("/subscribe", require("./controllers/subscribe"));
router.use("/training", require("./controllers/training"));
router.use("/user/training", require("./controllers/usertrainmap"));
router.use("/equipment", require("./controllers/equipment"));
router.use("/severity", require("./controllers/severity"));
router.use("/action", require("./controllers/caction"));
router.use("/incident", require("./controllers/incident"));

module.exports = router;
