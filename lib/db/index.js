'use strict'

var config = require("config");
var mysql = require('mysql');
var pool  = mysql.createPool(config.get("mysql"));
var redis = require('redis');
console.log("db run!!!");

exports.createOrder = function(order, cb){
	pool.getConnection(function(err, connection) {
	  // Use the connection
	  connection.query('insert into orders(`customer_name`,`customer_phone`,`currency`,`price`,`payment_gateway_id`,`ref_code`) ' +
	  	' VALUES (?,?,?,?,?,?)', [order.name,order.phone,order.currency,order.price,order.gatewayType,order.ref_code] ,function (error, results, fields) {
	    // And done with the connection.
	    connection.release();

	    console.log(error);
	    console.log(results);
	    console.log(fields);
	    cb(error, results);  
	  });
	});
}

exports.getOrder = function(name, refCode, cb){
	pool.getConnection(function(err, connection) {
	  // Use the connection
	  connection.query('select `customer_name`,`customer_phone`,`currency`,`price`,`payment_gateway_id`,`ref_code` from orders where customer_name = ? and ref_code = ?',
	  	[name, refCode] ,function (error, results, fields) {
	    // And done with the connection.
	    connection.release();

	    console.log(error);
	    console.log(results);
	    console.log(fields);
	    cb(error, results);     
	  });
	});
}