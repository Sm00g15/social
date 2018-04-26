const express = require('express');
const app = express();
const mongoose = require('mongoose').set('debug', true);
const bodyParser = require('body-parser');
const User = require('./models/users.js');

mongoose.connect("mongodb://localhost/social");

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(require("express-session")({
	name: "socialCookie",
	secret: "Time to make a dopeass social network",
	resave: false,
	saveUninitialized: false
}));

app.get('/', function(req, res) {
	res.render('landing')
})

app.get('/home', function(req, res) {
	if(!req.session) {
		alert('sorry')
	} else {
		console.log('yup')
	res.render('home');
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
			console.log(req.session)
			console.log(validUser)
			res.redirect('/home')
		} else {
			console.log('sorry!')
		}
	})
});

app.listen(3000, function(req, res) {
	console.log('social network running')
})