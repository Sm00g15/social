const express = require('express');
const app = express();
const mongoose = require('mongoose').set('debug', true);
const bodyParser = require('body-parser');
const User = require('./models/users.js');
const UserStatus = require('./models/user_status_model.js')

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
		console.log('nope')
	} else {
	console.log('yup');
	var user_statuses;
	UserStatus.find({}, function(err, statuses) {
		user_statuses = statuses;
		var name = req.session.name;
	res.render('home', {name: name, user_statuses: user_statuses});
	})
	}
})

app.post('/sign_up', function(req, res) {
	User.findOne({'email:': req.body.email}, function(err, existingUser) {
		if(existingUser) {
			console.log('this email has already been registered, try again')
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
			console.log(validUser)
			res.redirect('/home')
		} else {
			res.sendStatus(400);
		}
	})
});

app.post('/user_status/create', function(req, res) {
	User.find({"email": req.session.email}, function(err, validUser) {
		var user_status = new UserStatus({
			"user_email": req.session.email,
			"user_status": req.body.data,
			"name": req.session.name,
			"profile_pic": validUser[0].user_profile.profile_pic
		})
		user_status.save(function(err, result) {
			if(err) {
				console.log('error with status creation')
			}
		})
	})
})

app.post('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/')
})

app.listen(3000, function(req, res) {
	console.log('social network running')
})