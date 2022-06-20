
const express = require('express')
const router = express.Router()
const reqtypeFile = require('./reqtype')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, reqtypeFile.get)
router.post('/post', cusValid.authTokenValidate, reqtypeFile.checkExistingRequestType, reqtypeFile.post)
router.put('/put', cusValid.authTokenValidate, reqtypeFile.put)
router.post('/delete', cusValid.authTokenValidate, reqtypeFile.delete)
module.exports = router
