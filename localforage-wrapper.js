'use strict';

angular
  .module('capilleira.localforage-wrapper', [])
  .factory('LocalForageFactory', function($q, JSONArrayDriver) {
    console.time('JSONArrayDriver.generateConfig()');
    localforage.defineDriver(JSONArrayDriver.generateConfig()).then(function() {
      //is it IE?
      var driverConfig = [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
        msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
      if (_.isNaN(msie)) {
        msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
      }

      if (!_.isNaN(msie)) {
        console.log('IE detected, localforage using localstorage');
        driverConfig = [localforage.LOCALSTORAGE];
      }
      if (!isLocalStorageNameSupported()) {
        driverConfig = ['jsonArrayWrapper'];
      }
      localforage.config({
        name:'kZpVnlVcXkiOiI',
        version:1.0,
        storeName:'eaJcSmvKK496xmDaE7IFMgSXg', // Should be alphanumeric, with underscores.
        description:'4dWRZWkpEQXltL1dGMllRd0',
        driver: driverConfig
      });
      console.timeEnd('JSONArrayDriver.generateConfig()');
    });
    var CONSTANT_VARS = {
        DATE_FORMAT: 'MM/DD/YYYY HH:mm:ss',
        LOCALFORAGE_EXPIRATION: {
          unit: 'minutes',
          span: '15'
        }
      },
      sanitizeValue = function(value) {
        var toSanitize = _.clone(value, true),
          sanitizedObj = {};
        if (_.isString(toSanitize)) {
          sanitizedObj = sanitizeString(toSanitize);
        }else if (_.isObject(toSanitize)) {
          _.forOwn(toSanitize, function(objectProp, objectKey) {
            if (_.isString(objectProp)) {
              objectProp = sanitizeString(objectProp);
            }
            sanitizedObj[objectKey] = objectProp;
          });
        }
        return sanitizedObj;

      },
      isLocalStorageNameSupported = function() {
        var key =  'capilleira__' + Math.round(Math.random() * 1e7),
          storage = window.sessionStorage,
          supported;
        try {
          supported = ('localStorage' in window && window.localStorage !== null);
          if (supported) {
            storage.setItem(key, '');
            storage.removeItem(key);
          }
          return true;
        } catch (error) {
          return false;
        }
      },
      sanitizeString = function(stringVal) {
        return validator.stripLow(validator.escape(validator.trim(stringVal)))
          .replace(/[^\x00-\x7F]/gi, '').replace(/[^\x00-\x80]/gi, '').replace(/\\u/gi, '');
      };

    return {
      retrieve: function(key) {
        var defer = $q.defer();

        localforage.getItem(key).then(function(item) {
          //localForage returns null, not undefined
          if (!_.isNull(item)) {
            var expirationUnit = CONSTANT_VARS.LOCALFORAGE_EXPIRATION.unit,
              expirationSpan = CONSTANT_VARS.LOCALFORAGE_EXPIRATION.span,
              spanDiff;
            if (item.expiration && item.expiration.unit && item.expiration.span) {
              expirationUnit = item.expiration.unit;
              expirationSpan = item.expiration.span;
            }
            spanDiff = moment().diff(moment(item.timeStamp, CONSTANT_VARS.DATE_FORMAT), expirationUnit);
            if (spanDiff > expirationSpan) {
              localforage.removeItem(key).then(function() {
                defer.resolve(null);
              }, function(err) {
                console.error(err);
                defer.resolve(null);
              });
            }else {
              defer.resolve(item.value);
            }
          }else {
            defer.resolve(null);
          }
        }, function(err) {
          console.error(err);
          defer.reject(err);
        });

        return defer.promise;
      },
      set: function(key, value, expiration) {
        expiration = expiration || CONSTANT_VARS.LOCALFORAGE_EXPIRATION;
        var isArray = _.isArray(value),
          defer = $q.defer();
        //sanitizing before saving
        value = sanitizeValue(value);
        if (isArray) {
          value = _.values(value);
        }

        localforage.setItem(key,
          {
            value:value,
            timeStamp:moment().format(CONSTANT_VARS.DATE_FORMAT),
            expiration:expiration
          }).then(function(data) {
            defer.resolve(data);
          }, function(err) {
            console.error(err);
            defer.reject(err);
          });

        return defer.promise;
      },
      remove: function(key) {
        var defer = $q.defer();
        localforage.removeItem(key).then(function(err) {
          if (err) {
            defer.reject(err);
          } else {
            defer.resolve({status:'OK!'});
          }
        });
        return defer.promise;
      }
    };
  });
