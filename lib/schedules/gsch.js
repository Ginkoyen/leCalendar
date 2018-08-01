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

'use strict'

var loginfo = require('../logs')
var mongoose = require('mongoose')
var scheduleModel = require('../../models/schedule')
var monthsModel = require('../../models/months')
var projectModel = require('../../models/project')
var infoModel = require('../../models/info')
var Schedules = require('./sch')
var genSch = require('./gen_sch')

var sch = new Schedules()
var GenSch = new genSch()


/* -------------------- APPLICATION PROTOTYPE -------------------- */

var gsch = exports = module.exports = {}



/* -------------------- Function Schedule -------------------- */
// Find header of Json file
function findHeader (table) {
  var header = []
  for (var key in table) {
    if (header.indexOf(key) === -1) {
      header.push(key)
    }
  }
  return header
}
gsch.findHeader = findHeader

// Get date of schedules month
gsch.getDate = sch.getDate

// Generate a new project id
function newProjectID (callback) {
  var id = 0
  // Find all schedule projects
  projectModel.find({}).exec(function(err, projects) {
    if (err) { return callback(err, null) }
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].shortId == ('_' + id)) {
        id++
        i = 0
      }
    }
    return callback(null, '_' + id)
  })
}

// Find number of new project columns (ex. _Projet1 --> _Projet2)
function newProject (callback) {
  for (var i = 1; i <= prj_header.length; i++) {
    var new_Project = "_Project" + i

    var exist = false
    for (var j = 0; j < prj_header.length; j++) {
      if (prj_header[j] == new_Project) {
        exist = true
      }
    }
    if (!exist) return new_Project
  }
  return "_Project" + parseInt(prj_header.length+1)
}

// var newPath = new monthsModel({ month: 201807, day: 3, person: "JBB", details: "OFF", details_color: "", project: "_0", background: "mesh" })
// // Record on MongoDB !
// newPath.save(function (err) {
//   if (err) { console.log(err) }
//   loginfo('Infos added !')
// })

// Initialisation of project model
function init_projectModel (callback) {
  loginfo("Check if new project")
  projectModel.count({}, function (err, count) {
    if (err) { return callback(err) }
    if (!!!count) {
      loginfo("project not exists")
      var newPath = new projectModel(sch.default.project)
      // Record first project !
      newPath.save(function (err) {
        if (err) { return callback(err) }
        loginfo('Project added !')
        return callback(null)
      })
    } else {
      return callback(null)
    }
  })
}

// Initialisation of info model
function init_infoModel (callback) {
  loginfo("Check if new info")
  infoModel.count({}, function (err, count) {
    if (err) { return callback(err) }
    if (!!!count) {
      loginfo("info not exists")
      var newPath = new infoModel({ first_date: new Date(), team: sch.default.team })
      // Record first info !
      newPath.save(function (err) {
        if (err) { return callback(err) }
        sch.getFirstDate()
        loginfo('Info added !')
        return callback(null)
      })
    } else {
      return callback(null)
    }
  })
}

// Save new month in the databases
function newMonth (month, team) {
  var newPath = new scheduleModel({
    month: month,
    days: sch.getDate(month).getNbrDay(),
    project: ["_Project1"],
    team: team
  })

  // Record on MongoDB !
  newPath.save(function (err) {
    if (err) { throw err }
    loginfo('Month added !')
  })
}

// Check if schedules and info of shcedules table exist in database, else create and init tables
function checkSch (months) {
  // Find Project and team
  infoModel.findOne({}, function(err, info_doc) {
    if (err) { throw err }
    loginfo("Check if new month")

    scheduleModel.find({ month: months }, function (err, result) {
      if (err) { throw err }
      var exists = []

      result.forEach(function(res) {
        if (exists.indexOf(res.month) === -1) {
          exists.push(res.month)
        }
      })

      for (var i = 0; i < months.length; i++) {
        if (exists.indexOf(months[i]) === -1) {
          loginfo("month not exists [" + months[i] + "]")
          newMonth(months[i], info_doc.team)
        }
      }
    })
  })
}

// Initialisation of schedules
function init (callback) {
  init_infoModel(function(err) {
    if (err) { return callback(err) }
    init_projectModel(function (err) {
      if (err) { return callback(err) }
      sch.updateDate()
      var now = new Date()
      var month = sch.getMonth(now)
      var months = sch.findMonth(month, sch.nbrMonth)
      checkSch(months)
    })
  })
}
gsch.init = init

// Generate a month of schedule
function genMonth (obj_t, date, month, template, person, callback) {
  return new Promise(function (resolve, reject) {
    var NWeek = date.getWeek()
    var NbrOfDay = date.getNbrDay()
    var hol = date.holidays()
    var mon = date.getMonth()
    var year = date.getFullYear()
    if (date.getMonth() == 0) NWeek = 1

    var day  = []
    var tasks = {}
    var date_t = new Date(date)

    // Get day of week
    for (var i = 0; i < NbrOfDay; i++) {
      date_t.setDate(i+1)
      day[i] = date_t.getDayOfWeek(true)
    }

    // Fill tasks object
    monthsModel.find({ month: month }, function(err, results) {
      if (err) { reject(err) }

      results.forEach(function(res) {
        if (/^_Project/gi.test(res.person) && person.indexOf(res.person) === -1 && template.indexOf(res.person) === -1) {
          person.unshift(res.person)
        }
      })

      // Init task object
      for (var i = 0; i < person.length; i++) {
        tasks[person[i]] = {}
      }

      results.forEach(function(res) {
        try {
          tasks[res.person][res.day] = [res.details, res.details_color, res.project, res.background]
        } catch (err) {}
      })

      var header = template.concat(person)
      for (var i = 0; i < header.length; i++) {
        obj_t[header[i]] = []

        for (var j = 0; j < NbrOfDay; j++) {
          var cell = []

          switch (header[i]) {
            case header[0]:
              if (/S|D/.test(day[j])) {
                cell[0] = ""
                if (/D/.test(day[j]) || (/S/.test(day[j]) && j < 1)) {
                  NWeek++
                }
              } else {
                cell[0] = "S"+NWeek
                for (var l = 0; l < 13; l++) {
                  if (new Date(year, mon, j+1).getTime() == hol[l].getTime()) {
                    cell[0] = "_S"+NWeek
                  }
                }
              }
              cell[1] = "#02658e"
            break

            case header[1]:
              cell[0] = j+1
              cell[1] = "#02658e"
            break

            case header[2]:
              cell[0] = day[j]
              cell[1] = "#02658e"
            break

            default:
              // Find tasks of months
              if (tasks[header[i]][j+1]) {
                cell = tasks[header[i]][j+1]
              }
            break
          }
          obj_t[header[i]][j] = cell
        }
      }
      resolve()
    })
  })
}

// Get months of schedule
function getMonths (monthFrom, monthTo, callback) {
  // Find schedule line in databases
  scheduleModel.find({ month: { $gte: monthFrom, $lte: monthTo } }, function(err, results) {
    if (err) { return callback(err, null) }
    var template = ["_Week", "_NDay", "_Day"]
    var promise = []
    var schedule = {}

    results.forEach(function(res) {
      var date = sch.getDate(res.month)
      var header = res.project.concat(res.team)

      schedule[res.month] = {}
      promise.push(genMonth(schedule[res.month], date, res.month, template, header))
    })

    Promise.all(promise).then(function() {
      //console.log(schedule)
      return callback(null, schedule)
    }).catch(function (err) {
      return callback(err, null)
    })
  })
}

// Emit schedule
function emitSch (monthFrom, monthTo, callback) {
  //var month = sch.getMonth(date_start)
  //var months = sch.findMonth(month, nbrMonth)

  infoModel.findOne({}, function(err, info) {
    if (err) { return callback(err, null) }

    projectModel.find({}, function(err, result) {
      if (err) { return callback(err, null) }
      var project = {}

      result.forEach(function(res) {
        project[res.shortId] = { name: res.name, type: res.type, color: res.color }
      })

      if (!monthFrom || !monthTo) {
        // Find and emit info schedule
        var obj = { schedule: null, project: project, team: info.team }
        return callback(null, obj)
      } else {
        // Find and emit schedule
        getMonths(monthFrom, monthTo, function(err, schedule) {
          if (err) { return callback(err, null) }
          var obj = { schedule: schedule, project: project, team: info.team }
          return callback(null, obj)
        })
      }
    })
  })
}
gsch.emit_sch = emitSch


// New task of months
function newTask (query, items) {
  return new Promise(function (resolve, reject) {
    var value = Object.assign({ details: items.det, details_color: "", project: items.proj, background: items.back }, query)

    monthsModel.findOne(query, function (err, result) {
      if (err) { reject(err) }

      // Create new project of month
      if (/^_Project/gi.test(query.person) && result && result.project != items.proj) {
        value.person = newProject()
      }
      // Update task of months
      monthsModel.findOneAndUpdate(query, value, { upsert: true }, function (err) {
        if (err) { reject(err) }
        loginfo('Tasks update !')
        resolve()
      })
    })
  })
}

// Update task of months table
function update_task (month, pos, persons) {
  // Persons | person = { del, det, proj, back }
  // task = { monthFrom, dayFrom, monthTo, dayTo, persons: { _Project: {}, JBB: {} } }
  return new Promise(function (resolve, reject) {
    var promise = []

    for (var i = pos[0]; i <= pos[1]; i++) {
      for (var person in persons) {
        var query = { month: month, day: i, person: person }

        if (persons[person].del) {
          promise.push(monthsModel.findOneAndDelete(query))
        } else {
          promise.push(newTask(query, persons[person]))
        }
      }
    }
    Promise.all(promise).then(function() {
      resolve()
      loginfo('Tasks update !')
    }).catch(function (err) {
      reject(err)
    })
  })
}

// Update months of schedule
gsch.update_sch = function (task, callback) {
  // Persons | person = { del, det, proj, back }
  // task = { monthFrom, dayFrom, monthTo, dayTo, persons: { _Project: {}, JBB: {} } }

  //var nbrM = (((tasks.monthTo/100) - (tasks.monthFrom/100)) * 12) + (((tasks.monthTo%100) - (tasks.monthFrom%100)) + 1)
  //var months = sch.findMonth(tasks.monthFrom, nbrM)

  // Find months of schedule
  scheduleModel.find({ month: { $gte: task.monthFrom, $lte: task.monthTo } }, function(err, result) {
    if (err) { return callback(err, null) }
    var promise = []

    result.forEach(function(res) {
      var pos = [1, res.days]

      if (res.month == task.monthFrom) {
        pos[0] = task.dayFrom
      }
      if (res.month == task.monthTo) {
        pos[1] = task.dayTo
      }

      promise.push(update_task(res.month, pos, task.persons))
    })

    Promise.all(promise).then(function() {
      // Find and emit (+broadcast) schedule
      emitSch(task.monthFrom, task.monthTo, (err, obj) => {
        return callback(err, obj)
      })
    }).catch(function(err) {
      return callback(err, null)
    })
  })
}


// Update project of schedule
gsch.update_prj = function (task, callback) {
  // task = { shortId, name, type, color, new }
  // Find one and update, if project not exist and new task selected then create a new project
  var value = { name: task.name, type: task.type, color: task.color }
  var query = (task.new) ? { shortId: null } : { shortId: task.shortId }
  projectModel.findOneAndUpdate(query, value, { new: true }, function(err, project) {
    if (err) { return callback(err, null) }

    if (!project && task.new) {
      loginfo("project not exists")

      newProjectID(function(err, id) {
        if (err) { return callback(err, null) }
        value['shortId'] = id

        var newPath = new projectModel(value)
        // Record on MongoDB !
        newPath.save(function (err) {
          if (err) { return callback(err, null) }
          loginfo('New project added !')
          // Find and emit (+broadcast) schedule
          emitSch(null, null, (err, obj) => {
            return callback(err, obj)
          })
        })
      })
    } else {
      loginfo('Project updated !')
      // Find and emit (+broadcast) schedule
      emitSch(null, null, (err, obj) => {
        return callback(err, obj)
      })
    }
  })
}


// Delete project of schedule
gsch.del_prj = function (task, callback) {
  // task = { monthFrom, monthTo, shortId }
  var promise = []

  projectModel.findOneAndDelete({ shortId: task.shortId }, function(err, project) {
    if (err) { return callback(err, null) }

    monthsModel.find({ project: task.shortId }, function(err, months) {
      if (err) { return callback(err, null) }

      months.forEach(function(res) {
        var query = { month: res.month, day: res.day, person: res.person, project: task.shortId }

        if (/^_Project/gi.test(res.person)) {
          // Delete task of months
          promise.push(monthsModel.findOneAndDelete(query))
        } else {
          // Update task of months
          var value = { project: "" }
          promise.push(monthsModel.findOneAndUpdate(query, value))
        }
      })

      Promise.all(promise).then(function() {
        loginfo("Project deleted !")
        // Find and emit (+broadcast) schedule
        emitSch(task.monthFrom, task.monthTo, (err, obj) => {
          return callback(err, obj)
        })
      })
    })
  })
}

// Add person of schedule
gsch.add_person = function (task, callback) {
  // task = { monthFrom, monthTo, person }
  var promise = []

  infoModel.findOne({}, function(err, info) {
    if (err) { return callback(err, null) }
    if (info.team.indexOf(task.person) <= -1) {
      info.team.push(task.person)
    }

    // Update general team of info
    infoModel.update({}, info, function (err) {
      if (err) { return callback(err, null) }

      scheduleModel.find({ month: { $sort: 1, $gte: monthFrom }}, function(err, result) {
        if (err) { return callback(err, null) }

        result.forEach(function(res) {
          if (res.team.indexOf(task.person) <= -1) {
            res.team.push(task.person)
          }
          // Update team of schedule
          promise.push(scheduleModel.update({ month: res.month }, res))
        })

        Promise.all(promise).then(function() {
          loginfo('Person: ' + task.person + ' added from ' + task.monthFrom)
          // Find and emit (+broadcast) schedule
          emitSch(task.monthFrom, task.monthTo, (err, obj) => {
            return callback(err, obj)
          })
        }).catch(function(err) {
          return callback(err, null)
        })
      })
    })
  })
}

// Delete person of schedule
gsch.del_person = function (task, callback) {
  // task = { monthFrom, monthTo, person }
  var promise = []

  infoModel.findOne({}, function(err, info) {
    if (err) { return callback(err, null) }
    info.team.splice(info.team.indexOf(task.person), 1)

    // Update general team of info
    infoModel.update({}, info, function (err) {
      if (err) { return callback(err, null) }

      scheduleModel.find({ month: { $sort: 1, $gte: monthFrom }}, function(err, result) {
        if (err) { return callback(err, null) }

        result.forEach(function(res) {
          res.team.splice(res.team.indexOf(task.person), 1)
          // Update team of schedule
          promise.push(scheduleModel.update({ month: res.month }, res))
        })

        monthModel.find({ month: { $sort: 1, $gte: monthFrom }, person: task.person}, function(err, result) {
          if (err) { return callback(err, null) }

          result.forEach(function(res) {
            // Delete month tasks
            promise.push(scheduleModel.deleteMany(res))
          })

          Promise.all(promise).then(function() {
            loginfo('Person: ' + task.person + ' deleted from ' + task.monthFrom)
            // Find and emit (+broadcast) schedule
            emitSch(task.monthFrom, task.monthTo, (err, obj) => {
              return callback(err, obj)
            })
          }).catch(function(err) {
            return callback(err, null)
          })
        })
      })
    })
  })
}
