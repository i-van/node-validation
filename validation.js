
var async = require('async');

/**
 * @param {Object} values
 * @constructor
 */
function Validation(values) {
    this.values = values;
    this.validators = [];

    this.init();
}

/**
 * @implement
 */
Validation.prototype.init = function() {};

/**
 * @param {string} field
 * @param {Function|string} validator
 * @param {string} message
 * @param {bool} breakChainOnFailure
 * @returns {Validation}
 */
Validation.prototype.add = function(field, validator, message, breakChainOnFailure) {
    this.validators.push({
        field: field,
        validator: validator,
        message: message || field + ' is invalid',
        breakChainOnFailure: !!breakChainOnFailure
    });

    return this;
};

/**
 * @param {Function} done
 */
Validation.prototype.validate = function(done) {
    var _this = this
      , errors = []
      , skipFields = [];

    async.eachSeries(this.validators, _each, function(err) {
        if (err) {
            return done(err);
        }
        done(null, errors);
    });

    function _each(item, done) {
        var field     = item.field
          , values    = _this.values
          , value     = values[field]
          , validator = item.validator
          , message   = item.message.replace(':value:', value).replace(':field:', field);

        async.waterfall([
            function(next) {
                if (~skipFields.indexOf(field)) {
                    return done();
                }
                next();
            },
            function(next) {
                if (1 === validator.length || 2 === validator.length) {
                    // synchronously
                    try {
                        next(null, validator(value, values));
                    } catch (err) {
                        next(err);
                    }
                } else if (3 === validator.length) {
                    // asynchronously
                    validator(value, values, next);
                } else {
                    throw new Error('Invalid validator');
                }
            },
            function(isValid, next) {
                if (!isValid) {
                    errors.push({ field: field, message: message });
                    if (item.breakChainOnFailure) {
                        skipFields.push(field);
                    }
                }
                next();
            }
        ], done);
    }
};

/**
 * @param {Object} protoProps
 * @param {Object} staticProps
 * @returns {Object}
 */
Validation.extend = require('./extend');

// exports
module.exports = Validation;
