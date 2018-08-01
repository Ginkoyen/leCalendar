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


var MobileDetect = require('mobile-detect')
var express = require('express')
var router = express.Router()
var User = require('../models/user')

/* -------------------- ROUTER -------------------- */
// GET route for reading data
router.get('/', requiresLogin, function (req, res, next) {
  md = new MobileDetect(req.headers['user-agent'])
  User.findById(req.session.userId).exec(function (error, user) {
    if (error || user === null) {
      var err = new Error('Pas autorisé! Retour!')
      err.status = 400
      return res.render('login.ejs', { err: err })
    }
    if (user.type < 10) {
      return res.render('index.ejs', { user: user, users: null, msg: null, mobile: (md.mobile() || md.phone()) })
    }
    User.find().exec(function(error, users) {
      return res.render('index.ejs', { user: user, users: users, msg: null, mobile: (md.mobile() || md.phone()) })
    })
  })
})

// GET route for reading data
router.get('/login', function(req, res, next) {
  req.session.destroy(function (err) {
    return res.render('login.ejs', { err: null })
  })
})

// POST route for registering
router.post('/register', requiresAdmin, function (req, res, next) {
  // Confirm that user typed same password twice
  if (req.body.password_r !== req.body.passwordConf_r) {
    var err = new Error('Les mots de passe ne correspondent pas.')
    err.status = 400
    return sendIndex(res, req.session.userId, err)
  }

  if (!req.body.email_r || !req.body.username_r || !req.body.fullname_r || !req.body.type_r || !req.body.password_r || !req.body.passwordConf_r) {
    var err = new Error('Tous les champs sont obligatoires.')
    err.status = 400
    return sendIndex(res, req.session.userId, err)
  }

  var userData = {
    email: req.body.email_r,
    username: req.body.username_r,
    fullname: req.body.fullname_r,
    type: req.body.type_r,
    password: req.body.password_r,
  }

  User.create(userData, function (error, user) {
    if (error) {
      return sendIndex(res, req.session.userId, error)
    }
    return sendIndex(res, req.session.userId, "L'utilisateur à bien été ajouté !")
  })
})

// POST route for select a new password
router.post('/newPassword', requiresLogin, function (req, res, next) {
  // Confirm that user typed same password twice
  if (req.body.password_rn !== req.body.passwordConf_rn) {
    var err = new Error('Les mots de passe ne correspondent pas.')
    err.status = 400
    return res.render('newPassword.ejs', { err: err })
  }

  if (!req.body.password_rn || !req.body.password_rn) {
    var err = new Error('Tous les champs sont obligatoires.')
    err.status = 400
    return res.render('newPassword.ejs', { err: err })
  }

  var userData = {
    password: req.body.password_rn,
    firstPassword: false
  }

  User.update({ _id: req.session.userId }, userData, { multi : true }, function (error, user) {
    if (error) {
      var err = new Error("Erreur lors de l'enregistrement ! Veuillez contacter un administrateur")
      err.status = 401
      return res.render('newPassword.ejs', { err: err })
    }
    return res.redirect('/')
  })
})

// POST route for modify user
router.post('/modif_users', requiresAdmin, function (req, res, next) {
  if (!req.body.email_m || !req.body.username_m || !req.body.fullname_m || !req.body.type_m) {
    var err = new Error('Certains champs sont obligatoires.')
    err.status = 400
    return sendIndex(res, req.session.userId, err)
  }

  var userData = {
    email: req.body.email_m,
    username: req.body.username_m,
    fullname: req.body.fullname_m,
    type: req.body.type_m,
    firstPassword: (req.body.firstPassword_m == "on") ? true : false,
    blocked: (req.body.blocked_m == "on") ? true : false
  }

  if (req.body.password_m) {
    userData['password'] = req.body.password_m
  }

  User.update({ _id: req.body.id_m }, userData, { multi : true }, function (error, user) {
    if (error) {
      return sendIndex(res, req.session.userId, error)
    }
    return sendIndex(res, req.session.userId, "L'utilisateur à bien été modifié !")
  })
})

// POST route for delete user
router.post('/delete_users', requiresAdmin, function (req, res, next) {
  User.remove({ _id: req.body.id_d }, function (error, user) {
    if (error) {
      return sendIndex(res, req.session.userId, error)
    }
    User.count({ 'username': 'admin' }, function (err, count) {
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
          if (error) { throw error }
          console.log("First user commit !")
          return sendIndex(res, req.session.userId, "L'utilisateur à bien été supprimé !")
        })
      }
      else {
        return sendIndex(res, req.session.userId, "L'utilisateur à bien été supprimé !")
      }
    })
  })
})

// POST route for login
router.post('/login', function (req, res, next) {
  if (!req.body.login || !req.body.password) {
    var err = new Error('Tous les champs sont obligatoires.')
    err.status = 400
    return res.render('login.ejs', { err: err })
  }
  User.authenticate(req.body.login, req.body.password, function (error, user) {
    if (error || !user) {
      var err = new Error('Mauvais utilisateur ou mot de passe.')
      err.status = 401
      return res.render('login.ejs', { err: err })
    }
    else {
      if (user.blocked) {
        var err = new Error('Cet utilisateur est bloqué !')
        err.status = 401
        return res.render('login.ejs', { err: err })
      }
      req.session.userId = user._id
      if (user.firstPassword) {
        return res.render('newPassword.ejs', { err: null })
      }
      return res.redirect('/')
    }
  })
})

// POST route for modify user
router.post('/modif_profile', requiresLogin, function (req, res, next) {
  if (!req.body.nbrMonth_mp) {
    var err = new Error('Certains champs sont obligatoires.')
    err.status = 400
    return sendIndex(res, req.session.userId, err)
  }

  var userData = {
    profil: {
      viewerMode: req.body.viewerMode_mp,
      privateMode: (req.body.privateMode_mp == "on") ? true : false,
      nbrMonth: req.body.nbrMonth_mp
    }
  }

  User.update({ _id: req.session.userId }, userData, { multi : true }, function (error, user) {
    if (error) {
      return sendIndex(res, req.session.userId, error)
    }
    return sendIndex(res, req.session.userId, "L'utilisateur à bien été modifié !")
  })
})

// GET route for profileprofile
/*router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return res.render('login.ejs', { err: null })
    }
    else {
      if (user === null) {
        var err = new Error('Pas autorisé! Retour!')
        err.status = 400
        return res.render('login.ejs', { err: err })
      }
      else {
        return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
      }
    }
  })
})*/

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // Delete session object
    req.session.destroy(function (err) {
      return res.redirect('/login')
    })
  }
  else {
    return res.redirect('/login')
  }
})
module.exports = router


/* -------------------- FUNCTION -------------------- */
// Require login access
function requiresLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    //console.log("User not authorizate ! !")
    return res.render('login.ejs', { err: null })
  }
  //console.log("User authorizate !")
  User.count({ '_id': req.session.userId }, function (err, count) {
    if (!!!count) {
      //console.log("User not authorizate ! !")
      return res.render('login.ejs', { err: null })
    }
    //console.log("User authorizate ! !")
    return next()
  })
}

// Require administrator access
function requiresAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    //console.log("User not authorizate ! !")
    return res.render('login.ejs', { err: null })
  }
  //console.log("User authorizate !")
  User.findById(req.session.userId).exec(function (error, user) {
    //console.log("User authorizate ! !")
    if (user && user.type >= 10) {
      return next()
    }
    //console.log("User not authorizate ! !")
    return res.render('login.ejs', { err: null })
  })
}

// GET index
function sendIndex(res, userId, msg) {
  User.findById(userId).exec(function (error, user) {
    if (error || user === null) {
      var err = new Error('Pas autorisé! Retour!')
      err.status = 400
      return res.render('login.ejs', { err: err })
    }
    if (user.type < 10) {
      return res.redirect('/')
    }
    User.find().exec(function(error, users) {
      return res.redirect('/')
    })
  })
}
