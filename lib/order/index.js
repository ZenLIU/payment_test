'use strict'

var cache = require("../cache");
var db = require("../db");

exports.getOrder = function(req, res, params){
	console.log(params);  
	cache.getOrder(params.name, params.refCode, function (err, reply) {
    if (err || reply == null){
    	//not found, query db
    	db.getOrder(params.name, params.refCode, function(err, results, fields){
    		if (!err && results != null && results.length > 0){
    			//add cache
    			cache.addOrder(results[0]);
    			res.send({"found":true, "data": results[0]});
    		}
    		else
    			res.send({"found":false});
    	});
    }else{
    	//found, return
    	res.send({"found":true, "data": JSON.parse(reply)});
    }
	});
}