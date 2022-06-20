
const express = require('express')
const router = express.Router()
const projectFile = require('./project')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, projectFile.get)
router.post('/post', cusValid.authTokenValidate, projectFile.post)
router.put('/put', cusValid.authTokenValidate, projectFile.put)
router.post('/delete', cusValid.authTokenValidate, projectFile.delete)
module.exports = router
