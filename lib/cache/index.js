'use strict'

var redis = require('redis');
var config = require('config');

exports.addOrder = function(order){
	var client = redis.createClient(config.get("redis"));
	var key = order.customer_name + "_" + order.ref_code;

	client.set(key,JSON.stringify(order));
	client.quit();
}

exports.getOrder = function(name, orderId, cb){
	var client = redis.createClient(config.get("redis"));
	var key = name + "_" + orderId;

	client.get(key, cb);
	client.quit();
}