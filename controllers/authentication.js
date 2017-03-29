const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/user')
const config = require('../config/main')

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 10080 // in seconds
  })
}

// Set user info from request
function setUserInfo(request) {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    secondName: request.profile.lastName,
    email: request.email,
    role: request.role
  }
}

exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user)

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  })
}

exports.register = function(req, res, next) {
  const email = req.body.email
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const password = req.body.password

  if (!email) return res.status(422).send({ error: 'falta email'})
  if (!firstName || !lastName) return res.status(422).send({ error: 'falta nombre completo'})
  if (!password) return res.status(422).send({ error: 'ypu must enter a password'})

  User.findOne({ email: email}, function(err, existingUser) {
    if (err) return next(err)

    if (existingUser) return res.status(422).send({ error: 'that email address is already in use'})

    let user = new User({
      email: email,
      password: password,
      profile: { firstName: firstName, lastName: lastName }
    })

    user.save(function(err, user) {
      if (err) return next(err)

        // Subscribe member to Mailchimp list
        // mailchimp.subscribeToNewsletter(user.email);

        // Respond with JWT if user was created

        let userInfo = setUserInfo(user)

        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo),
          user: userInfo
        })
    })
  })
}

//========================================
// Authorization Middleware
//========================================

// Role authorization check
exports.roleAuthorization = function(role) {
  return function(req, res, next) {
    const user = req.user;

    User.findById(user._id, function(err, foundUser) {
      if (err) {
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (foundUser.role == role) {
        return next();
      }

      res.status(401).json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    })
  }
}
