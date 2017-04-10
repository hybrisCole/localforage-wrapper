'use strict';

angular
  .module('capilleira.localforage-wrapper', [])
  .factory('LocalForageFactory', function($q) {
    var CONSTANT_VARS = {
        DATE_FORMAT: 'MM/DD/YYYY HH:mm:ss',
        LOCALFORAGE_EXPIRATION: {
          unit: 'minutes',
          span: '15'
        }
      },
      sanitizeString = function(stringVal) {
        return validator.stripLow(validator.escape(validator.trim(stringVal)))
          .replace(/[^\x00-\x7F]/gi, '').replace(/[^\x00-\x80]/gi, '').replace(/\\u/gi, '');
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

      };
    localforage.config({
      name:'kZpVnlVcXkiOiI',
      version:1.0,
      storeName:'eaJcSmvKK496xmDaE7IFMgSXg', // Should be alphanumeric, with underscores.
      description:'4dWRZWkpEQXltL1dGMllRd0',
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
              }).catch(function(err) {
                console.error(err);
                defer.resolve(null);
              });
            }else {
              defer.resolve(item.value);
            }
          }else {
            defer.resolve(null);
          }
        }).catch(function(err) {
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
        localforage.setItem(key,{
          value:value,
          timeStamp:moment().format(CONSTANT_VARS.DATE_FORMAT),
          expiration:expiration
        }).then(function(data) {
          defer.resolve(data);
        }).catch(function(err) {
          console.error(err);
          defer.reject(err);
        });
        return defer.promise;
      },
      remove: function(key) {
        var defer = $q.defer();
        localforage.removeItem(key).then(function() {
          defer.resolve({status:'OK!'});
        }).catch(function (err) {
          defer.reject(err);
        });
        return defer.promise;
      }
    };
  });
