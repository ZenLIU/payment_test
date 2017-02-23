'use strict'
var paypal = require("./paypal");
var braintree = require("./braintree");

var gateway = {
	"paypal": paypal,
	"braintree": braintree
}

exports.get = function(gatewayName){
	console.log("get() call");
	console.log(gatewayName);
	return gateway[gatewayName];
}