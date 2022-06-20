
const express = require('express')
const router = express.Router()
const reqcatmapFile = require('./reqcatmap')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, reqcatmapFile.get)
router.post('/post', cusValid.authTokenValidate, reqcatmapFile.post)
router.post('/req-wise-cat', cusValid.authTokenValidate, reqcatmapFile.getReqTypeWiseCat)


module.exports = router
