
const express = require('express')
const router = express.Router()
const equipmentFile = require('./severity')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get',cusValid.authTokenValidate,equipmentFile.get)
router.post('/post',cusValid.authTokenValidate,equipmentFile.checkExistingSeverity ,equipmentFile.post)
module.exports = router
