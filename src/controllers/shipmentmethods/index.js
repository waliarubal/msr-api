
const express = require('express')
const router = express.Router()
const shipmentmethods = require('./shipmentmethods')

const {
  body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

// router.get('/get', cusValid.authTokenValidate, shipmentmethods.get)
// router.post('/post', cusValid.authTokenValidate, shipmentmethods.post)
router.get('/shipment-method-list', cusValid.authTokenValidate, shipmentmethods.getShipmentMethods)


module.exports = router
