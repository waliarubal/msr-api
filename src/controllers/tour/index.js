
const express = require('express')
const router = express.Router()
const tourFile = require('./tour')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/getWeeklyTours',cusValid.authTokenValidate,tourFile.getWeekDate,tourFile.getWeeklyTours)
router.post('/post',cusValid.authTokenValidate,tourFile.post)

router.get('/delete',cusValid.authTokenValidate,tourFile.delete)
module.exports = router
