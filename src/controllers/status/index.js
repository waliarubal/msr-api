
const express = require('express')
const router = express.Router()
const statusFile = require('./status')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get',cusValid.authTokenValidate,statusFile.get)
router.post('/post',cusValid.authTokenValidate,statusFile.checkExistingStatus,statusFile.post)
router.put('/put',cusValid.authTokenValidate,statusFile.put)
router.put('/delete',cusValid.authTokenValidate,statusFile.delete)

module.exports = router
