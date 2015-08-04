'use strict';

angular
  .module('capilleira.localforage-wrapper')
  .factory('JSONArrayDriver', function($q) {
    var jsonArray = [];
    return {
      generateConfig: function() {
        return {
          _driver: 'jsonArrayWrapper',
          _support: true,
          _initStorage: function() {
            console.log(1);
            jsonArray = [];
          },
          clear: function(callback) {
            console.log(2);
            var defer = $q.defer();
            jsonArray = [];
            defer.resolve(jsonArray);
            callback(null, jsonArray);
            return defer.promise;
          },
          getItem: function(key, callback) {
            console.log(3);
            var defer = $q.defer(),
              item = _.find(jsonArray, {key: key});
            defer.resolve(item);
            callback(null, item);
            return defer.promise;

          },
          iterate: function() {
            console.log(4);
            // Custom implementation here...
          },
          key: function() {
            console.log(5);
            // Custom implementation here...
          },
          keys: function() {
            console.log(6);
            // Custom implementation here...
          },
          length: function(callback) {
            console.log(7);
            var defer = $q.defer();
            defer.resolve(jsonArray.length);
            callback(null, jsonArray);
            return defer.promise;
          },
          removeItem: function(key, callback) {
            console.log(8);
            var defer = $q.defer();
            jsonArray = _.difference(jsonArray, [_.find(jsonArray, {key: key})]);
            defer.resolve(jsonArray);
            callback(null, jsonArray);
            return defer.promise;
          },
          setItem: function(key, value, callback) {
            console.log(9);
            var defer = $q.defer();
            jsonArray.push({
              key: key,
              value: value
            });
            defer.resolve(jsonArray);
            callback(null, jsonArray);
            return defer.promise;
          }
        };
      }
    };
  });
