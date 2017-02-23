var validation = {};

validation.validatePhone = function(val){
	return /^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/.test(val);
}

validation.validateCCV = function (val){
	return /^\d{3,4}$/.test(val);
}

validation.validateExpire = function(val){
	var tmp = val.split("/");
	if (tmp.length != 2){
		return false;
	}

	if (/^\d{2}$/.test(tmp[0]) && /^\d{4}$/.test(tmp[1])){
		var i = parseInt(tmp[0]);
		if (i >= 1 && i <= 12)
			return true;
		else
			return false;
	}else{
		return false;
	}
}

// Frontend
if (typeof window !== 'undefined' && window) {
    window.validation = validation;

// Backend
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = validation;
}
