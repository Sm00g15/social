const mongoose = require('mongoose');

var userStatusSchema = mongoose.Schema({
	user_email: String,
	user_status: String,
	name: String,
	profile_pic: String,
	status_date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model("UserStatus", userStatusSchema, "UserStatus");