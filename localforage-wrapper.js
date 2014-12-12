angular
  .module('capilleira.localforage-wrapper', [])
  .factory('LocalForageFactory', function($q) {

    localforage.config({
      name:'Capilleira',
      version:1.0,
      storeName:'capilleira_desktop', // Should be alphanumeric, with underscores.
      description:'Local Forage for Capilleira Desktop'
    });

    var CONSTANT_VARS = {
        DATE_FORMAT: 'MM/DD/YYYY HH:mm:ss',
        LOCALFORAGE_EXPIRATION: {
          unit: 'minutes',
          span: '5'
        }
      },
      sanitizeValue = function(value) {
      if (_.isString(value)) {
        value = sanitizeString(value);
      }else if (_.isObject(value)) {
        var sanitizedObj = {};
        _.forOwn(value, function(objectProp, objectKey) {
          if (_.isString(objectProp)) {
            objectProp = sanitizeString(objectProp);
          }
          sanitizedObj[objectKey] = objectProp;
        });
        value = sanitizedObj;
      }
      return value;

    }, sanitizeString = function(stringVal) {
      return validator.stripLow(validator.escape(validator.trim(stringVal)))
        .replace(/[^\x00-\x7F]/gi, '').replace(/[^\x00-\x80]/gi, '').replace(/\\u/gi, '');
    };

    return {
      retrieve: function(key) {
        var defer = $q.defer();

        localforage.getItem(key).then(function(item) {
          //localForage returns null, not undefined
          if (!_.isNull(item)) {
            var spanDiff = moment().diff(moment(item.timeStamp, CONSTANT_VARS.DATE_FORMAT),
              CONSTANT_VARS.LOCALFORAGE_EXPIRATION.unit);
            if (spanDiff > CONSTANT_VARS.LOCALFORAGE_EXPIRATION.span) {
              localforage.removeItem(key);
              defer.resolve(null);
            }else {
              item.value = sanitizeValue(item.value);
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
      set: function(key, value) {
        //sanitizing before saving
        value = sanitizeValue(value);

        var defer = $q.defer();
        localforage.setItem(key, {value:value,
          timeStamp:moment().format(CONSTANT_VARS.DATE_FORMAT)
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