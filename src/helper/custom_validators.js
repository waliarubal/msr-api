
const jwt = require('jsonwebtoken');
const config = require('../config');
const process = require('process');
const {
	validationResult
} = require('express-validator');


//validation error response function
exports.validate = validations => async (req, res, next) => {
	await Promise.all(validations.map(validation => validation.run(req)))
	const errors = validationResult(req)
	if (errors.isEmpty()) {
		return next();
	}
	const errorList = errors.array()
	for (let e = 0; e < errorList.length; e++) {
		const error = errorList[e];
		if (error.param === 'authToken') {
			return res.status(200).json({
				'success': false,
				'message': 'Invalid Token',
				'error': error.msg
			})
		}
	}

	return res.status(200).json({
		'success': false,
		'message': 'Input Validation Failed',
		'error': errors.array()
	})

}

/**
 * @LOGIC : JWT TOKEN VALIDATE !
 * @REQUEST_PARAMS :  AUTHTOKEN
 * @RESPONSE : VALIDATION CHECK MIDDLEWARE
 */
exports.authTokenValidate = (req, res, next) => {
	let authToken = req.body.authToken || req.query.authToken || req.params.authToken || req.headers['authToken']
	if (authToken) {
		
		jwt.verify(authToken, process.env.JWT_SECRET, function (err, decoded) {
			if (err) {
				return res.status(200).json({
					'success': false,
					'message': 'Invalid Token',
					'error': req.body
				})

			} else {
				next()
			}
		})
	} else {
		return res.status(200).json({
			'success': false,
			'message': 'Please Provide Token !',
			'error': req.body
		})
	}

}
