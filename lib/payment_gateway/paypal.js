'use strict'

var config = require('config');
var paypal = require('paypal-rest-sdk');
var db = require("../db");
var cache = require("../cache");

var paymentGateway = {};

var TYPE_MAPPING = {
	'visa': 'visa',
	'master-card': 'mastercard',
	'american-express': 'amex',
	'discover': 'discover',
	'jcb': 'jcb'
};

paymentGateway.process = function(req, res, params) {
	//paypal
	paypal.configure(config.get("paypal"));

	// create paypal payment json object
	var payment = {};

	payment.intent = 'sale';
	payment.payer = {};
	payment.payer.payment_method = 'credit_card';

	payment.payer.funding_instruments = [];
	payment.payer.funding_instruments.push({
		'credit_card': {
			'type': TYPE_MAPPING[params.credit_card.card.type],
			'number': params.credit_card_no,
			'expire_month': params.exp_month,
			'expire_year': params.exp_year,
			'cvv2': params.ccv,
			'first_name': params.credit_card_name,
			'last_name': params.credit_card_name, //just use the name as both first_name and last_name
			'billing_address': { /* due to no address provided, use sample */
				'line1': '52 N Main ST',
				'city': 'Johnstown',
				'state': 'OH',
				'postal_code': '43210',
				'country_code': 'US'
			}
		}
	});

	payment.transactions = [];
	payment.transactions.push({
		amount: {
			total: '' + params.price,
			currency: '' + params.currency,
			details: {
				subtotal: '' + params.price,
				tax: '0',
				shipping: '0'
			}
		},
		description: 'This is the payment transaction description.'
	});

	//debug('Submit direct credit card payment to paypal \n' + JSON.stringify(payment, null, 4));

	paypal.payment.create(payment, function(err, payment) {
		if (err) {
			console.log(JSON.stringify(payment, null, 4));
			console.log('err');
			console.log(JSON.stringify(err, null, 4));
			res.send({
				"success": false,
				"err_msg": "Payment fail!"
			});
		} else {
			console.log("Create Payment Response");
			console.log(JSON.stringify(payment, null, 4));
			var resp = {};
			resp.success = (payment.state == "approved");
			if (resp.success) {
				params.ref_code = payment.id;

				//store into db
				db.createOrder(params, function(dbErr, dbResult) {
					if (dbErr != null) {
						console.log(dbErr);
						resp.success = false;
						resp.err_msg = "Payment fail!";
					} else {
						//store to cache
						db.getOrder(params.name, params.ref_code, function(err, results, fields){
							cache.addOrder(results[0]);
						});		

						resp.success = true;
						resp.payment_ref = payment.id;
					}
					res.send(resp);
				});
			} else {
				resp.err_msg = "Payment fail!";
				res.send(resp);
			}
		}
	});
}

module.exports = paymentGateway;