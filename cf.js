'use strict';
/** @module cf
 * @name cf
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Common useful function for often use
 */

//var RSVP = require('rsvp');

var crypto = require('crypto');

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
 * Возвращает вхдную строку с обрезанными пробелами в конце и начале строки
 * @param  {string} s Входящая строка
 * @return {number}   Выходящая строка с обрезанными пробелами
 */
exports.trim = function(s){
	return s.replace(/^ +/,'').replace(/ +$/,'');
}


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
 * Возвращает случайную строку указанной длины
 * @param  {number} len Желаемая длина строки
 * @return {string}     Случайная строка
 */

exports.getRandomString=function(len){
	return crypto.randomBytes((parseInt(len)/2) || 16).toString('hex');
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
		return new Promise(function(resolve, reject){
			try{
				func.apply(this, options.concat([std_resolve([resolve, reject]), reject]));
			}catch(err){
				reject(err);
			};
		});
	};
};

/**
 * Возвращает md5-digest от входного парамтра
 * @param  {[string]} 			Параметр от которого будет считаться md5
 * @return {[string]}           md5-digest от входного парамтра
 */
exports.md5=function(d){return crypto.createHash('md5').update(d).digest('hex');};

/**
 * Возвращает числовое значение входного параметра округлённое до второго знака после запятой.
 * @param  {[string|float|integer]}		Число в для преобразование. Можно в виде строки
 * @return {[float]}					Вычисленное значение
 */
exports.money=function(s){
	return Math.round(parseFloat(s)*100)/100;
};

/**
 * Возвращает true если входная строка-аргумент напоминает e-mail
 * @param  {[string]}			тестируемый e-mail
 */
exports.testEmail = function(email){
	return email.match(/.+@.+\..+/)?true:false;
};