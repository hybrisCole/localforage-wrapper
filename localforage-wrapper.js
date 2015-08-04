'use strict';

angular
  .module('capilleira.localforage-wrapper', [])
  .factory('LocalForageFactory', function($q, JSONArrayDriver) {
    console.log(JSONArrayDriver.generateConfig());
    localforage.defineDriver(JSONArrayDriver.generateConfig());
    //is it IE?
    var msie,
      driverConfig = [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
      CONSTANT_VARS = {
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
      sanitizeString = function(stringVal) {
        return validator.stripLow(validator.escape(validator.trim(stringVal)))
          .replace(/[^\x00-\x7F]/gi, '').replace(/[^\x00-\x80]/gi, '').replace(/\\u/gi, '');
      };

    msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
    if (_.isNaN(msie)) {
      msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
    }

    if (!_.isNaN(msie)) {
      console.log('IE detected, localforage using localstorage');
      driverConfig = [localforage.LOCALSTORAGE];
    }

    /*Testing private browsing*/
    try {
      window.sessionStorage.setItem('test', '1');
      window.sessionStorage.removeItem('test');
    }catch (err) {
      driverConfig = ['jsonArrayWrapper'];
    }

    localforage.config({
      name:'kZpVnlVcXkiOiI',
      version:1.0,
      storeName:'eaJcSmvKK496xmDaE7IFMgSXg', // Should be alphanumeric, with underscores.
      description:'4dWRZWkpEQXltL1dGMllRd0',
      driver: driverConfig
    });

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
                console.log(err);
                defer.resolve(null);
              });
            }else {
              defer.resolve(item.value);
            }
          }else {
            defer.resolve(null);
          }
        }, function(err) {
          console.log(err);
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
            console.log(err);
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
