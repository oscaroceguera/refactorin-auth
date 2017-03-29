const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String }
  },
  role: {
    type: String,
    enum: ['Member', 'Client', 'Owner', 'Admin'],
    default: 'Member'
  },
  resetPasswordToken: { type: String},
  resetPasswordExpires: { type: Date },
},{
  timestamps: true
})

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function(next) {
  const user = this
  const SALT_FACTOR = 5

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err)

    console.log('STAL', salt);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err)
      console.log('HASH', hash);
      console.log('user Pass', user.password);
      user.password = hash
      next()
    })
  })
})

// Method to compare password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log('candidatePassword', candidatePassword);
  console.log('this password', this.password);
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return cb(err)}
    console.log('isMatch', isMatch);
    cb(null, isMatch)
  })
}


module.exports = mongoose.model('User', UserSchema)
