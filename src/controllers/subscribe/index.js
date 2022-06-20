
const express = require('express')
const router = express.Router()
const subscribeFile = require('./subscribe')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.post('/post',cusValid.authTokenValidate,subscribeFile.post)


module.exports = router
