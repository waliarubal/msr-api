
const express = require('express');
const router = express.Router();
const roleFile = require('./role')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get',roleFile.get)
router.post('/post',cusValid.authTokenValidate,roleFile.checkExistingRole,roleFile.post)
router.put('/put',cusValid.authTokenValidate,roleFile.put)
router.put('/delete',cusValid.authTokenValidate,roleFile.delete)

module.exports = router
