
// @todo: do something..

var Validation = require('./validation')
  , validators = require('./validators');

var validation = new Validation({
    email: 'incorect',
    password: '12345'
});
validation
    .add('email', validators.notEmpty, 'Email is required', true)
    .add('email', validators.isEmail, 'Email is incorrect')
    .add('password', validators.notEmpty, 'Password is required', true)
    .add('password', validators.length(6), 'Password length should be greater than 6')
    .add('password', validators.equalField('passwordConfirmation'), 'Passwords should be matched');

validation.validate(function(err, errors) {
    console.log(errors);
});
