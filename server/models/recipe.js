var mongoose = require('mongoose');

var recipeSchema = mongoose.Schema({
	name : String,
	ingredients : String,
	method : String,
	chef : String,
	imageName : String,
	cuisine : String,
	type : String,
	url : String
});

module.exports = mongoose.model('Recipe', recipeSchema, 'Recipe');
