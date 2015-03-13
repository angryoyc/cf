var RSVP = require('rsvp');

exports.mergeInto = function (o1, o2, list) {
	if (o1 == null){
		o1={};
		if(o2 == null){
			return(o1);
		};
	}else{
		if(o2 == null){
			return o1;
		};
	};

	if(list){
		for (var i=0; i<list.length; i++){
			var key=list[i];
			if (o2.hasOwnProperty(key)){
				o1[key]=o2[key];
			};
		}
	}else{
		for (var key in o2){
			if (o2.hasOwnProperty(key)){
				o1[key] = o2[key];
			};
		};
	};
	return o1;
};


exports.getRandomInt=function(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
};


exports.isArray=function(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == '[object Array]';
};

exports.isObject=function(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == "[object Object]";
};

exports.getJsModules=function(dirname){
	var fs = require('fs');
	var files=fs.readdirSync(dirname);
	var index={};
	for(var i=0;i<files.length;i++){
		var f=files[i];
		var re=/\.js$/;
		if(re.test(f) && f!='index.js'){
			f=f.replace(re,'');
			index[f]=require(dirname+'/'+files[i]);
		};
	};
	return(index);
};

exports.asy=function(argv, func){
	var options=[];
	var datas=[];
	var callbacks=[];
	Object.keys(argv).sort().forEach(function(k){
		if(typeof(argv[k])=='function'){
			callbacks.push(argv[k]);
		}else{
			if(callbacks.length>0){
				datas.push(argv[k]);
			}else{
				options.push(argv[k]);
			};
		};
	});
	var std_resolve = function(callbacks){
		return function(result){
			if(datas.length>0){
				exports.mergeInto(datas[0], result);
				if(callbacks.length>1){
					callbacks[0](datas[0]);
				}else{
					callbacks[0](null, datas[0]);
				};
			}else{
				if(callbacks.length>1){
					callbacks[0](result);
				}else{
					callbacks[0](null, result);
				}
			};
		};
	};
	var std_reject = function(callbacks){
		return function(err){
			if(callbacks.length>1){
				callbacks[1](err);
			}else{
				callbacks[0](err);
			}
		};
	};
	if(typeof(callbacks[0])=='function'){ // Задана callback-функция
		try{
			return func.apply(this, options.concat([std_resolve(callbacks), std_reject(callbacks)]));
		}catch(err){
			std_reject(callbacks)(err)
		}
	}else{
		return new RSVP.Promise(function(resolve, reject){
			try{
				func.apply(this, options.concat([std_resolve([resolve, reject]), reject]));
			}catch(err){
				reject(err);
			};
		});
	};
};

var getDelivery = require('delivery');
exports.mail=function(env, arg, callback, callback_err, res){
	var conf = env.conf.email[env.conf.email.checked];
	var delivery=getDelivery(conf);
	if(callback && typeof(callback)=='function'){
		delivery.mail.send(arg, 3)
		.then(
			function(result){
				//- console.log('// common: mail: ok result: '.green, result);
				if(res && exports.isObject(res)){
					exports.mergeInto(res, result);
					if(callback_err && typeof(callback_err)=='function'){
						callback(res);
					}else{
						callback(null, res);
					};
				}else{
					if(callback_err && typeof(callback_err)=='function'){
						callback(result);
					}else{
						callback(null, result);
					};
				};
			},
			function(err){
				//- console.log('// common: mail: err result: '.red, err);
				if(callback_err && typeof(callback_err)=='function'){
					callback_err(err);
				}else{
					callback(err);
				}
			}
		).catch(
			function(err){
				if(callback_err && typeof(callback_err)=='function'){
					callback_err(err);
				}else{
					callback(err);
				}
			}
		);
	}else{
		return new RSVP.Promise(function(resolve, reject){
			delivery.mail.send(arg, 3)
			.then(
				function(result){
					if(res){
						exports.mergeInto(res, result);
						resolve(res);
					}else{
						resolve(result);
					};
				},
				reject
			).catch(reject);
		});
	};
};

exports.md5=function(d){return crypto.createHash('md5').update(d).digest('hex');};
