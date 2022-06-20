
const express = require('express')
const router = express.Router()
const userTrainMapFile = require('./usertrainmap')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get',cusValid.authTokenValidate,userTrainMapFile.get)
router.post('/post',cusValid.authTokenValidate,userTrainMapFile.post)
router.post('/updateStatus',cusValid.authTokenValidate,userTrainMapFile.updateStatus)

module.exports = router
