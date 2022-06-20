
const express = require('express')
const router = express.Router()
const incidentFile = require('./incident')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, incidentFile.get)
router.get('/monthlyCount', cusValid.authTokenValidate, incidentFile.getMonthlyCount)
router.get('/contactUsers', cusValid.authTokenValidate, incidentFile.getTechContactUsers)

router.post('/post', cusValid.authTokenValidate, incidentFile.post)
module.exports = router
