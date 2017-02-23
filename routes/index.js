'use strict'

var express = require('express');
var router = express.Router();

var cardValidator = require('card-validator');
var validation = require('../public/js/validation');
var paymentGateway = require('../lib/payment_gateway');
var order = require('../lib/order');

var config = require("config");

router.get("/test", function(req, res, next) {
	paypal.configure(config.get("paypal"));
	paypal.generateToken(function(err, token) {
		console.log(token);
		res.send(token);
	})
});

/* GET form */
router.get('/form', function(req, res, next) {
	res.render('form', {});
});

router.get('/check_form', function(req, res, next) {
	res.render('check_form', {});
});

router.get('/orders', function(req, res, next) {
	var params = {
		"name": req.query.customer_name,
		"refCode": req.query.ref_code
	};

	order.getOrder(req, res, params);
});


// router.get("/client_token", function (req, res) {
//   gateway.clientToken.generate({}, function (err, response) {
//     res.send(response.clientToken);
//   });
// });

router.post("/checkout", function(req, res) {
	//common field
	var params = extractParam(req);
	console.log(params);
	//validate params
	var validate = validateParams(params);
	if (validate.errors.length > 0) {
		//error occur
		res.send({
			"success": false,
			"err_msg": validate.errors.join("<br/>")
		});
		return;
	}

	params = validate.params;

	try {
		paymentGateway.get(params.gatewayType).process(req, res, params);
	} catch (err) {
		console.log(err);
		res.send({
			"success": false,
			"err_msg": "Payment gateway not support!"
		});
	}
});

function extractParam(req) {
	//common field
	var data = {};
	data.name = req.body.customer_name;
	data.phone = req.body.customer_phone;
	data.currency = req.body.currency;
	data.price = req.body.price;
	data.gatewayType = req.body.gateway;

	data.credit_card_name = req.body.credit_card_name;
	data.ccv = req.body.credit_card_ccv;
	data.credit_card_no = req.body.credit_card_no;
	data.credit_card_exp = req.body.credit_card_exp;
	var expire = data.credit_card_exp.split('/');
	if (expire.length === 2) {
		data.exp_year = expire[1];
		data.exp_month = expire[0];
	}

	var cardValid = cardValidator.number(data.credit_card_no);
	data.credit_card = cardValid;

	return data;
}

function validateParams(params) {
	var errors = [];
	if (params.name == '') {
		errors.push("Customer name required.");
	}

	if (params.currency == '') {
		errors.push("Currency required.");
	}

	if (!validation.validatePhone(params.phone)) {
		errors.push("Invalid phone number.");
	}

	if (isNaN(parseFloat(params.price))) {
		errors.push("Invalid price.");
	}

	if (!params.credit_card.isValid) {
		//credit card no invalid
		errors.push("Invalid credit card number.");
	}

	if (params.credit_card_name == '') {
		errors.push("Credit card name required.");
	}

	if (!validation.validateCCV(params.ccv)) {
		errors.push("Invalid credit card ccv.");
	}

	if (!validation.validateExpire(params.credit_card_exp)) {
		errors.push("Invalid credit card expiry date.");
	}

	return {
		"errors": errors,
		"params": params
	};
}

module.exports = router;