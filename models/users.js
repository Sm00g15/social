var mongoose = require('mongoose');


const userProfileSchema = {
	location: {type: String, default: "None"},
	profile_pic: {type: String, default: "default_profile.png"},
	description: {type: String, default: "None"},
	interests: {type: String, default: "None"}
}

const userSchema = new mongoose.Schema({
	name: {type: String},
	email: {type: String},
	password: {type: String},
	friends: [{"member_id": String, "friend_name": String, "profile_pic": String}],
	friend_requests: [{"member_id": String,"friend_name": String,"profile_pic": String}],
	user_profile: userProfileSchema,
}, {collection: "User"});


module.exports = mongoose.model("User", userSchema, "User");