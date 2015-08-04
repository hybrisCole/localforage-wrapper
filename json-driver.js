'use strict';

angular
  .module('capilleira.localforage-wrapper')
  .factory('JSONArrayDriver', function($q) {
    var jsonArray = [];
    return {
      generateConfig: function() {
        return {
          _driver: 'jsonArrayWrapper',
          _initStorage: function() {
            jsonArray = [];
          },
          clear: function(callback) {
            var defer = $q.defer();
            jsonArray = [];
            defer.resolve(jsonArray);
            callback(null, jsonArray);
            return defer.promise;
          },
          getItem: function(key, callback) {
            var defer = $q.defer(),
              item = _.find(jsonArray, {key: key});
            defer.resolve(item);
            callback(null, item);
            return defer.promise;

          },
          key: function() {
            // Custom implementation here...
          },
          keys: function() {
            // Custom implementation here...
          },
          length: function(callback) {
            var defer = $q.defer();
            defer.resolve(jsonArray.length);
            callback(null, jsonArray);
            return defer.promise;
          },
          removeItem: function(key, callback) {
            var defer = $q.defer();
            jsonArray = _.difference(jsonArray, [_.find(jsonArray, {key: key})]);
            defer.resolve(jsonArray);
            callback(null, jsonArray);
            return defer.promise;
          },
          setItem: function(key, value, callback) {
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
