
/** @module cf
 * @name cf
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Common useful function for often use
 */
var RSVP = require('rsvp');

/**
 * Объединение двух объектов
 * @param  {Object} o1		Объект в который будет произведено копирования свойств второго объекта
 * @param  {Object} o2		Объект из которого будет произведное копирование свойств.
 * @param  {Array} list		Необязательный. Если задан, то описывает список имён свойст, которые будут скопированы, если не задан, то копируются все свойства.
 * @return {Object}			Результирующий объект.
 */
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

/**
 * Возвращает случайное целое число большее чем min, но меньшее чем max
 * @param  {number} min Минимальное значение (целое)
 * @param  {number} max Максимальное значение (целое)
 * @return {number}     Случайная величина (целое)
 */
exports.getRandomInt=function(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Возвращает true если переданный параметр является массивом.
 * @param  {any}  obj 	Параметр, тип которого проверяется.	
 * @return {Boolean}     
 */
exports.isArray=function(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == '[object Array]';
};

/**
 * Возвращает true если переданный параметр является объектом.
 * @param  {any}  obj 	Параметр, тип которого проверяется.	
 * @return {Boolean}     
 */
exports.isObject=function(obj){
	if(typeof(obj)=='undefined') return false;
	return Object.prototype.toString.call(obj) == "[object Object]";
};

/**
 * Функция-обёртка, для оформления асинхронных функций в зависимости от набора входных параметров
 * - (v1) Если callback'и не заданы, то функция объёртывается в Promise.
 * - (v2) Если задан один callback, то ему передаются два параметра - (err, result)
 * - (v3) Если заданы два обратных вызова: callback  и  callback_err, то в случае успшного завершения вызывается callback(result), а в случае завершения с ошибкой callback_err(err)
 * @param  {arguments} argv 	Значение arguments оформляемой функции
 * @param  {func} func 			Функция, которой на вход подаются все входные параметры + еще два параметра: resolve  и reject, 
 *                        		которые и должны быть вызываны асинхронной функцией func в случае успешного выполнения и выполнения с
 *                        		ошибкой соответственно (resolve(<результат выполнения>) или reject(<ошибка>))
 * @return {any}      			Возвращаемое значение зависит от варианта вызова:
 *                              v1 - возвращается Promise (rsvp library)
 *                              v2 - возвращает то, что вернёт (через return) функция func
 *                              v3 - возвращает то, что вернёт (через return) функция func
 * @example
 * // Оформление фукнции:
 * function myfunc(a,b,c, callback, callback_err, d){
 *   return asy(arguments, function(a, b, c, resolve, reject){
 * 	   // t/0;				// генерируем ошибку
 * 	   resolve([a,b,c]); 	// возвращаем рузельтат
 * 	   return 'bb';			// возвращается немедленно
 *   });
 * };
 *
 * // Варианты вызовов:
 *
 * v1:
 * myfunc(1, 2, 3)
 * 
 * или
 * 
 * myfunc(1, 2, 3)
 * .then(
 * 	 function(result){
 *     console.log(result);
 *   },
 *   function(err){
 *     console.log(err);
 *   }
 * );
 *
 * v2:
 * myfunc(1, 2, 3, function(err, result){
 *   if(err){
 *   	console.log(err);
 *   }else{
 *   	console.log(result);
 *   };
 * });
 * 
 * v3:
 * myfunc(
 * 	 1, 2, 3, 
 * 	 function(result){
 *     console.log(result);
 *   },
 *   function(err){
 *     console.log(err);
 *   }
 * );
 * 
 */
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

/**
 * Возвращает md5-digest от входного парамтра
 * @param  {[string]} 			Параметр от которого будет считаться md5
 * @return {[string]}           md5-digest от входного парамтра
 */
exports.md5=function(d){return crypto.createHash('md5').update(d).digest('hex');};
