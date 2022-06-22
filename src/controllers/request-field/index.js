const express = require("express"),
  router = express.Router(),
  controller = require("./request-field"),
  validator = require("../../helper/custom_validators");

router.get("/all", controller.all);
router.post("/create", validator.authTokenValidate, controller.create);
router.patch("/update", validator.authTokenValidate, controller.update);

module.exports = router;
