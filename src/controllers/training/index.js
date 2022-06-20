
const express = require('express')
const router = express.Router()
const trainingFile = require('./training')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get',cusValid.authTokenValidate,trainingFile.get)
router.post('/post',cusValid.authTokenValidate,trainingFile.checkExistingTraining,trainingFile.post)
router.put('/put',cusValid.authTokenValidate,trainingFile.put)
router.post('/delete',cusValid.authTokenValidate,trainingFile.delete)
module.exports = router
