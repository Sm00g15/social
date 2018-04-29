const express = require('express');
const app = express();
const mongoose = require('mongoose').set('debug', true);
const bodyParser = require('body-parser');
const User = require('./models/users.js');
const UserStatus = require('./models/user_status_model.js');
const fs = require('fs');
const shortid = require('shortid');

mongoose.connect("mongodb://localhost/social");

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static('public'))
app.use("/profile_images", express.static(__dirname + "/profile_images"));
app.set('view engine', 'ejs');
app.use(require("express-session")({
	name: "socialCookie",
	secret: "Time to make a dopeass social network",
	resave: false,
	saveUninitialized: false,
	cookie: {
		path: "/"
	}
}));

app.get('/', function(req, res) {
	res.render('landing')
})

app.get('/home', function(req, res) {
	if(!req.session) {
		console.log('No req.session at /home')
	} else {
	var user_statuses;
	UserStatus.find({}, function(err, statuses) {
		user_statuses = statuses;
		var name = req.session.name;
	res.render('home', {name: name, user_statuses: user_statuses});
	})
	}
})

app.get('/user_profile', function(req, res) {
	User.findOne({'email':req.session.email}, function(err, validUser) {
		console.log(validUser);
		if(err) {
			console.log(err)
		} else {
			console.log(validUser);
			res.render('user_profile', {validUser: validUser});
		}
	});	
})

app.post('/sign_up', function(req, res) {
	User.findOne({'email': req.body.email}, function(err, existingUser) {
		if(existingUser) {
			console.log('this email has already been registered, try again');
			res.redirect('/');
		} else {
			var newUser = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
			});
		User.create(newUser, function(err, savedUser) {
			if(err) {
				console.log("error signing up")
			} else {
				console.log('successfully signed up')
			}
		})
		}
	})
})

app.post('/login', function(req, res) {
	if(!req.session) {
		console.log('error with login')
	} else {
	var validUser = {
		email: req.body.email,
		password: req.body.password 
	}
	User.findOne(validUser, function(err, validUser) {
		if(validUser) {
			req.session.email = validUser.email;
			req.session.id = validUser._id;
			req.session.name = validUser.name;
			req.session.cookie.expires = false;
			console.log(validUser);
			res.redirect('/home');
		}
	})
	}
});

app.post('/user_status/create', function(req, res) {
	User.find({"email": req.session.email}, function(err, validUser) {
		console.log(validUser);
		var status = new UserStatus({
			"user_status": req.body.data,
			"user_email": req.session.email,
			"name": req.session.name,
			"profile_pic": validUser[0].user_profile.profile_pic
		})
		status.save(function(err, result) {
			if(err) {
				console.log('error with status creation')
			} 
		})
		res.send(status);
	})
})

app.post('/user_profile/edit', function(req, res) {
	if(req.session) {
		User.findOne({"email": req.session.email}, function(err, user) {
			console.log(user);
			user.name = req.body.name;
			user.user_profile.location = req.body.location;
			user.user_profile.description = req.body.description;
			user.user_profile.interests = req.body.interests;
			user.save(function(err, user) {
				if(err) {
					console.log(err);
				} else {
					res.send(user)
				}
			});
		})
	}
})

app.get('/friends', function(req, res) {
	User.find({"email": {$ne: req.session.email}},function(err, users) {
		res.render('friends', {users: users})
	})
})

app.post('/friend_request', function(req, res) {
	if(req.session) {
		User.find({'email': req.session.email}, function(err, sendingUser) {
			if(err) {
				console.log(err)
			} else {
				User.find({"_id": req.body.data}, function(err, potentialFriend) {
					potentialFriend[0].update({$push: {"friend_requests": {"_id": sendingUser[0]._id, "friend_name": sendingUser[0].name, "profile_pic": sendingUser[0].user_profile.profile_pic}}}, function(err) {
						res.send(JSON.stringify(potentialFriend));
					})
				})
			}
		})
	}
})

app.post('/accept_friend_request', function(req, res) {
	if(req.session) {
		User.find({'email': req.session.email}, function(err, user) {
			if(err) {
				console.log(err)
			} else {
				User.find({"_id": req.body.data}, function(err, acceptedFriendUser) {
						user[0].update({$push: {"friends": {"_id": acceptedFriendUser[0]._id, "friend_name": acceptedFriendUser[0].name, "profile_pic": acceptedFriendUser[0].user_profile.profile_pic}}, $pull: {"friend_requests": {"_id": req.body.data}}}, function(err) {
							console.log(err); 
							});
						acceptedFriendUser[0].update({$push: {"friends": {"_id": user[0]._id, "friend_name": user[0].name, "profile_pic": user[0].user_profile.profile_pic}}}, function(err, data) {
							console.log(err);
						});
					console.log('you have accepted a friend request!');
					});
								  
				}
			});
		}
	});

// app.post('/profile_pic/upload', function(req, res) {
// 	if(req.session) {
// 		var newImageData = JSON.stringify(req.body.imageData)
// 		console.log(newImageData)
// 		// var user_profile_image = "profile_images/" + shortid.generate() + "." + newImageData.image_type
// 		// fs.writeFile("/profile_images/" + user_profile_image, new Buffer(newImageData, "base64"), function(err) {
// 		// 	if(!err) {
// 		// 		User.findOne({"email": req.session.email}, function(err, user) {
// 		// 			user.user_profile.profile_pic = user_profile_image;
// 		// 			user.save(function(err, updatedUser) {
// 		// 				if(err) {
// 		// 					console.log(err)
// 		// 				} else {
// 		// 					UserStatus.update({"user_email": req.session.email}, {"profile_pic": user_profile_image}, function(err, user) {
// 		// 						console.log(user_profile_image);
// 		// 					})
// 		// 				}
// 		// 			})
// 		// 		})
// 		// 	}
// 		// })
// 	}
// })

app.post('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/')
})

app.listen(3000, function(req, res) {
	console.log('social network running')
})