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


/* ------------------ INCLUDE & INIT ------------------ */
var express = require('express')
var Session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(Session)
var bodyParser = require('body-parser')
var Routes = require('./routes/router')
var User = require('./models/user')

var compression = require('compression')
var clock = require('date-events')()
var loginfo = require('./lib/logs')
var gsch = require('./lib/schedules/gsch')

var app = express()


/* -------------------- MONGO DB -------------------- */
// Connect to MongoDB
mongoose.connect('mongodb://localhost/solsteo')
var db = mongoose.connection

// Handle mongo error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function (err) {
  if (err) { throw err }
  loginfo("Connected to database !")
  User.init(function (err) {
    if (err) {
      loginfo(err)
      mongoose.connection.close()
    }


    /* -------------------- SERVER -------------------- */
    var server = app.listen(8082, function () {
      var port = server.address().port
      loginfo('Server running at port ' + port)
      // Check if months exists, else create new months
      gsch.init()
    })
    var io = require('socket.io')(server)
    var ios = require("express-socket.io-session")


    /* -------------------- SESSIONS -------------------- */
    var mongoStore = new MongoStore({
      mongooseConnection: db
    })
    // Use sessions for tracking logins
    var session = Session({
      secret: 'my-secret',
      key: 'express.sid',
      resave: true,
      saveUninitialized: true,
      //cookie: { secure: true },
      store: mongoStore
    })


    /* -------------------- ROUTER -------------------- */
    // Server use session
    app.use(session)
    // Shared express session with socket io
    io.use(ios(session, {
      autoSave: true,
    }))

    // Parse incoming requests
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    // Server define standard '/' routes
    app.use('/', Routes)

    // Serve static files from template
    app.use(compression())
    app.use(express.static(__dirname + '/style'))
    .use(express.static(__dirname + '/style/min'))
    .use(express.static(__dirname + '/views/js'))
    .use(express.static(__dirname + '/views/js/min'))
    .use(express.static(__dirname + '/assets'))

    // Catch 404 and forward to error handler
    /*app.use(function (req, res, next) {
      var err = new Error('File Not Found')
      err.status = 404
      next(err)
    })
    // Error handler, define as the last app.use callback
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      res.send(err.message)
    })*/


    /* -------------------- DATE EVENT -------------------- */
    clock.on('month', function (month) {
      // Check if months exists, else create new months
      gsch.init()
    })


    /* -------------------- SOCKET -------------------- */
    // When client connected
    io.sockets.on('connection', function (socket) {
      loginfo('New client connected !')

      socket.on('getSch', function (monthFrom, monthTo) {
        gsch.emit_sch(monthFrom, monthTo, function (err, obj) {
          if (err) { loginfo(err) }
          socket.emit('schedule', JSON.stringify(obj))
        })
      })

      socket.on('newTasks', function (task) {
        // Create an Model instance
        tasks = JSON.parse(task)

        if (tasks.clickTask) {
          // Update schedule, Find and emit schedule
          gsch.update_sch (tasks.clickTask, function (err, obj_c) {
            if (err) { loginfo(err) }
            // Update schedule, Find and emit schedule
            gsch.update_sch (tasks.newTask, function (err, obj) {
              if (err) { loginfo(err) }

              if (obj_c.schedule) {
                for (var month in obj_c.schedule) {
                  var header = sch.findHeader(obj.schedule)

                  if ((header.indexOf(month) === -1)) {
                    obj.schedule[month] = obj_c.schedule[month]
                  }
                }
              }
              socket.emit('schedule', JSON.stringify(obj))
              socket.broadcast.emit('schedule', JSON.stringify(obj))
            })
          })
        }
        else {
          // Update schedule, Find and emit schedule
          gsch.update_sch (tasks.newTask, function (err, obj) {
            if (err) { loginfo(err) }
            socket.emit('schedule', JSON.stringify(obj))
            socket.broadcast.emit('schedule', JSON.stringify(obj))
          })
        }
      })

      socket.on('newProject', function (task) {
        // Create an Model instance
        tasks = JSON.parse(task)
        // Update project, Find and emit project
        gsch.update_prj (tasks, function (err, obj) {
          if (err) { loginfo(err) }
          socket.emit('schedule', JSON.stringify(obj))
          socket.broadcast.emit('schedule', JSON.stringify(obj))
        })
      })

      socket.on('delProject', function (task) {
        // Create an Model instance
        tasks = JSON.parse(task)
        // Delete project, Remove and emit project
        gsch.del_prj (tasks, function (err, obj) {
          if (err) { loginfo(err) }
          socket.emit('schedule', JSON.stringify(obj))
          socket.broadcast.emit('schedule', JSON.stringify(obj))
        })
      })

      socket.on('newPerson', function (task) {
        // Create an Model instance
        tasks = JSON.parse(task)
        // Update team, Find and emit team
        gsch.add_person (tasks, function (err, obj) {
          if (err) { loginfo(err) }
          socket.emit('schedule', JSON.stringify(obj))
          socket.broadcast.emit('schedule', JSON.stringify(obj))
        })
      })

      socket.on('delPerson', function (task) {
        // Create an Model instance
        tasks = JSON.parse(task)
        // Delete team, Remove and emit team
        gsch.del_person (tasks, function (err, obj) {
          if (err) { loginfo(err) }
          socket.emit('schedule', JSON.stringify(obj))
          socket.broadcast.emit('schedule', JSON.stringify(obj))
        })
      })

      socket.on('disconnect', function (reason) {
        loginfo('Client disconnected !')
      })
    })
  })
})
