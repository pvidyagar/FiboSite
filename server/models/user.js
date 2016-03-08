var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = mongoose.Schema({
	provider : String,
	profileId : String,
	token : String,
	name : String,
	email : {type: String, unique: true},
	gender : String,
	mobileno : String,
	address : String,
	photo : String,
	role : String
	
	/*google : {
		provider : String,
		id : String,
		token : String,
		name : String,
		email : String,
		gender : String,
		mobileno : String,
		address : String,
		photo : String,
		role : String

	},
	facebook : {
		provider : String,
		id : String,
		token : String,
		name : String,
		email : String,
		gender : String,
		mobileno : String,
		address : String,
		photo : String,
		role : String
	}*/
});

userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })


userSchema.methods.generateHash = function(password) {

	return bcrypt.hashSync(password, bcrypt.getSaltSync(8), null)
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
