
const express = require('express')
const router = express.Router()
const cactionFile = require('./caction')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, cactionFile.get)
router.post('/post', cusValid.authTokenValidate, cactionFile.checkExistingAction, cactionFile.post)
module.exports = router
