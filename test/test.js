#!/usr/local/bin/node
var should = require('should');
var cf = require('../cf');

describe('cf', function(){

	describe('isObject', function(){
		it('should return true', function(done){
			cf.isObject({}).should.eql(true)
			done();
		});
		it('should return false', function(done){
			cf.isObject([]).should.eql(false)
			done();
		});
	});
	describe('isArray', function(){
		it('should return true', function(done){
			cf.isArray([]).should.eql(true);
			done();
		});
		it('should return false', function(done){
			cf.isArray('wtf').should.eql(false);
			done();
		});
	});
	describe('mergeInto', function(){
		it('should return united object with selected propertys', function(done){
			cf.mergeInto({a:1}, {b:2, d:7, c:6}, ["a", "b"]).should.eql({a:1, b:2});
			done();
		});
	});

	describe('getRandomInt', function(){
		it('should return int value', function(done){
			cf.getRandomInt(21, 21).should.eql(21);
			done();
		});
	});

	describe('md5', function(){
		it('should return string value 32 chars length', function(done){
			cf.md5('oyc').length.should.eql(32);
			done();
		});
	});

	describe('money', function(){
		it('should return number in string with length=5', function(done){
			cf.money('55.66').toString().length.should.eql(5);
			done();
		});
	});

	describe('asy', function(){
		it('should return first parameter', function(done){
			cf.asy({"0":1, "1": 2}, function(a, b, cb, cb_e){cb(a)})
			.then(function(result){
				result.should.eql(1);
				done();
			});
		});
		it('should return error', function(done){
			cf.asy({"0":1, "1": 2}, function(a, b, cb, cb_e){
				r/7;
				cb(a);
			})
			.then(
				function(result){
					done();
				},
				function(err){
					should(err).Error;
					//[ReferenceError: r is not defined]
					done();
				}
			);
		});
	});

	describe('testEmail', function(){
		it('should return true if string like e-mail', function(done){
			cf.testEmail('serg.osipov@gmail.com').should.eql(true);
			done();
		});
		it('should return false if string not like e-mail', function(done){
			cf.testEmail('serg.osipov@gmail').should.eql(false);
			done();
		});
	});
	
});
