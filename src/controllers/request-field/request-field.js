import { RequestField } from "../../models/RequestField";
import { Response } from "../../models/Response";
const mongoose = require("mongoose");

function all(req, res, next) {
  RequestField.find({ isActive: true }).exec((err, data) => {
    let response = new Response();

    if (err) {
      response.success = false;
      response.message = "Error in fetching data.";
      response.error = err;
    } else if (!!data) {
      response.success = true;
      response.message = "Request completed successfully.";
      response.data = data;
    } else {
      response.success = true;
      response.message = "Request completed successfully.";
      response.data = [];
    }

    res.status(200).json(response);
  });
}

function create(req, res, next) {
  let field = new RequestField({
    name: req.body.name,
    fields: req.body.fields,
  });
  field.save((err, data) => {
    let response = new Response();
    if (err) {
      response.success = false;
      response.message = "Failed to create request field.";
      response.error = err;
    } else {
      response.success = true;
      response.message = "New field created.";
      response.data = data;
    }

    return res.status(200).json(response);
  });
}

function update(req, res, next) {
  let condition = { _id: mongoose.Schema.Types.ObjectId(req.body._id) };
  let field = req.body;
  RequestField.update(condition, field).exec((err, data) => {
    let response = new Response();
    if (err) {
      response.success = false;
      response.message = "Failed to update request field.";
      response.error = err;
    } else {
      response.success = true;
      response.message = "Request field updated successfully.";
      response.data = data;
    }

    return res.status(200).json(response);
  });
}

module.exports = {
  all,
  create,
  update,
};
