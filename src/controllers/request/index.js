const express = require('express')
const router = express.Router()
const requestFile = require('./request')

const {
	body
} = require('express-validator')

const cusValid = require('../../helper/custom_validators')
const vMsg = require('../../helper/validation_message')

const regxPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?@#_=$:\-.])(?=.{10,})/

router.get('/get', cusValid.authTokenValidate, requestFile.get)
router.post('/getById', cusValid.authTokenValidate, requestFile.getById)

router.post('/getByUserId', cusValid.authTokenValidate, requestFile.getByUserId)

router.post('/changeById', cusValid.authTokenValidate, requestFile.changeById)

router.post('/post', cusValid.authTokenValidate, requestFile.uploadMulter, requestFile.upload, requestFile.post)
router.put('/put', cusValid.authTokenValidate, requestFile.uploadMulter, requestFile.upload, requestFile.put)
router.put('/putById', cusValid.authTokenValidate, requestFile.putById)
router.delete('/delete', cusValid.authTokenValidate, requestFile.delete)
router.post('/changeStatus', cusValid.authTokenValidate, requestFile.changeRequestStatus)
router.delete('/deleteById', cusValid.authTokenValidate, requestFile.deleteById)
//crm added
router.post('/addToCrm', requestFile.addToCrm)

router.post('/CRMToMSRDataUpdate', requestFile.CRMToMSRDataUpdate)
router.get('/getFilesOfCRMcase', requestFile.getFilesOfCRMcase)
module.exports = router
