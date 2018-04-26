var mongoose = require('mongoose');

var userProfileSchema = mongoose.Schema({
	location: {type: String, default: "None"},
	description: {type: String, default: "None"},
	interests: {type: String, default: "None"},
	profile_pic: {type: String, default: "default_profile.png"}
})

var userSchema = mongoose.Schema({
	name: {type: String},
	email: {type: String},
	password: {type: String},
	member_id: {type: String},
	friends: [{"member_id": String, "friend_name": String, "profile_pic": String}],
	user_profile: [userProfileSchema]
}, {collection: "User"});


module.exports = mongoose.model("User", userSchema, "User");