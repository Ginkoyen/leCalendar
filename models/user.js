/* ---------------------------- HEADER -----------------------------
Copyright 2018 Pierre LE DU

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
----------------------------------------------------------------- */


var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

/* -------------------- MONGO DB SESSIONS -------------------- */
// Sessions schema
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstPassword: {
    type: Boolean,
    default: true
  },
  blocked: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: (new Date().toDateString() + ' ' + new Date().toLocaleTimeString('en-US'))
  },
  profil: {
    viewerMode: {
      type: Number,
      default: 0
    },
    privateMode: {
      type: Boolean,
      default: false
    },
    privateTime: {
      type: Number,
      default: 30
    },
    nbrMonth: {
      type: Number,
      default: 12,
      required: true
    }
  },
  data: {
    type: Array
  }
})

// Authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username })
  .exec(function (err, user) {
    if (err) {
      return callback(err)
    }
    else if (!user) {
      var err = new Error('User not found.')
      err.status = 401
      return callback(err)
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        return callback(null, user)
      }
      else {
        return callback()
      }
    })
  })
}

// Hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this
  bcrypt.hash(user.password, 12, function (err, hash){
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

// Hashing a password before update it to the database
UserSchema.pre('update', function (next) {
  var user = this
  if (!user._update.password) {
    return next()
  }
  console.log('hashing')
  bcrypt.hash(user._update.password, 12, function (err, hash){
    if (err) {
      return next(err)
    }
    user._update.password = hash
    next()
  })
})

var User = mongoose.model('User', UserSchema)

User.init = function (callback) {
  User.count({ 'username': 'admin' }, function (err, count) {
    if (err) { return callback(err) }
    if (!!!count) {
      console.log("no session exist")
      var userData = {
        email: "admin@admin.com",
        username: "admin",
        fullname: "Administrateur",
        type: 10,
        password: "CrIsTa0632@dmin",
        firstPassword: 0
      }
      // Record on MongoDB !
      User.create(userData, function (error, user) {
        if (error) { return callback(error) }
        console.log("First user commit !")
        return callback(null)
      })
    }
    else {
      return callback(null)
    }
  })
}
module.exports = User
