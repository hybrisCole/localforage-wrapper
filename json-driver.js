'use strict';
(function() {
  var jsonArray = [];
  angular
    .module('capilleira.localforage-wrapper')
    .factory('JSONArrayDriver', function($q) {
      return {
        generateConfig: function() {
          return {
            _driver: 'jsonArrayWrapper',
            _support: true,
            _initStorage: function() {
              jsonArray = [];
            },
            clear: function() {
              var defer = $q.defer();
              jsonArray = [];
              defer.resolve(jsonArray);
              return defer.promise;
            },
            getItem: function(key) {
              var defer = $q.defer(),
                item = _.find(jsonArray, {key: key});
              defer.resolve(item.value);
              return defer.promise;

            },
            iterate: function() {
              // Custom implementation here...
              console.log('not implemented');
            },
            key: function() {
              // Custom implementation here...
              console.log('not implemented');
            },
            keys: function() {
              // Custom implementation here...
              console.log('not implemented');
            },
            length: function() {
              var defer = $q.defer();
              defer.resolve(jsonArray.length);
              return defer.promise;
            },
            removeItem: function(key) {
              var defer = $q.defer();
              jsonArray = _.difference(jsonArray, [_.find(jsonArray, {key: key})]);
              defer.resolve(jsonArray);
              return defer.promise;
            },
            setItem: function(key, value) {
              console.log('sie');
              var defer = $q.defer();
              jsonArray.push({
                key: key,
                value: value
              });
              defer.resolve(value);
              return defer.promise;
            }
          };
        }
      };
    });
})();
