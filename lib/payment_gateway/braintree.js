'use strict'

var config = require('config');
var braintree = require("braintree");
var db = require("../db");
var cache = require("../cache");

var paymentGateway = {};

paymentGateway.process = function(req, res, params) {
	var braintreeConfig = config.get("braintree");
	braintreeConfig.environment = braintree.Environment.Sandbox;

	var gateway = braintree.connect(braintreeConfig);

	//gateway specific param
	var nonceFromTheClient = req.body.nonce;
	gateway.transaction.sale({
		amount: params.price,
		paymentMethodNonce: nonceFromTheClient,
		options: {
			submitForSettlement: true
		}
	}, function(err, result) {
		console.log(result);
		var resp = {};
		if (err == null) {
			if (result.success) {
				params.ref_code = result.transaction.id;

				//store into db
				db.createOrder(params, function(dbErr, dbResult) {
					if (dbErr != null) {
						console.log(dbErr);
						resp.success = false;
						resp.err_msg = "Payment fail!";
					}else{
						//store to cache
						db.getOrder(params.name, params.ref_code, function(err, results, fields){
							cache.addOrder(results[0]);
						})					
						resp.success = true;
						resp.payment_ref = result.transaction.id;
					}
					res.send(resp);
				});
			}else{
				resp.success = false;
				resp.err_msg = "Payment fail!";
				res.send(resp);
			}
		} else {
			resp.success = false;
			resp.err_msg = "Payment fail!";
			res.send(resp);
		}
	});
}

module.exports = paymentGateway;