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


var loginfo = require('../logs')
var date = require('../date')
// Cell = [Bordure, Details, DetailsColor, ProjetColor, Background]
var mesh = "mesh"
var cross = "cross"
var templateMonth = [ ["n-b s-l", "n-l n-b", "s-l d-r", "d-r", "s-r"],
                      ["s-l s-b", "n-l s-b", "d-r s-l s-b", "d-r s-b", "s-r s-b"]
]

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

// Find project header of month
function findProject (table) {
  var header = []
  for (var key in table) {
    if (header.indexOf(key) === -1 && /^_Project/.test(key)) {
      header.push(key)
    }
  }
  return header
}

// Delete column of month
function delColumn (table, name) {
  delete table[name]
  return table
}

// Generate a new columns of month
function newCol (NbrOfDay) {
  col = []
  for (var i = 0; i < NbrOfDay; i++) {
    var cell = []
    for (var j = 0; j < 1; j++) {
      cell[j] = ""
    }
    col[i] = cell
  }
  return col
}

//Delete empty Project columns
function checkProject (table) {
  var Prj_header = findProject(table)

  for (var i = 0; i < Prj_header.length; i++) {
    var empty = true
    for (var j = 0; j < table[Prj_header[i]].length; j++) {
      try { var idCell = table[Prj_header[i]][j][3] }
      catch(err) { var idCell = "" }
      if (idCell && idCell != "") {
        empty = false
      }
    }
    if (empty == true && Prj_header.length > 1) {
      delColumn(table, Prj_header[i])
    }
  }
  return table
}

//Generate bordure of schedule
function generateBordure (table, header, template, NbrOfDay) {
  var previousValue, currentValue // nextValue

  for (var i = 0; i < header.length; i++) {
    for (var j = 0; j < NbrOfDay; j++) {
      var x = 0
      var y = 0

      try { previousValue = header[i-1] }
      catch(err) { previousValue = "" }

      try { currentValue = header[i] }
      catch(err) { currentValue = "" }

      //try { nextValue = header[cellx+1] }
      //catch(err) { nextValue = "" }

      // Calcul X
      if (i != 0) {
        if (/^_/.test(currentValue)) {
          x = 1
        }
        else if (!/^_/.test(currentValue)) {
          x = 3
          if (/^_/.test(previousValue)) {
            x = 2
          }
        }
        if (i == (header.length-1)) {
          x = 4
        }
      }
      // Calcul Y
      if (j == (NbrOfDay-1)) {
        y = 1
      }
      table[header[i]][j][0] = template[y][x]
      if (/^_Project/.test(header[i])) {
        table[header[i]][j][0] += " prj"
      }
    }
  }
}

//var header = ["_Week", "_NDay", "_Day", "_Project1"]


// Generate a month of schedule
function generateMonth (date, header, data) {
  var NWeek = date.getWeek()
  //if (date.getMonth() == 0) NWeek = 1
  var NbrOfDay = date.getNbrDay()
  var hol = date.holidays()
  var mon = date.getMonth()
  var year = date.getFullYear()

  var day  = []
  var month = {}
  var t_date = new Date(date)

  // Get day of week
  for (var i = 0; i < NbrOfDay; i++) {
    t_date.setDate(i+1)
    day[i] = t_date.getDayOfWeek(true)
  }

  for (var i = 0; i < header.length; i++) {
    month[header[i]] = []

    for (var j = 0; j < NbrOfDay; j++) {
      var monthCell = []

      switch (header[i]) {
        case header[0]:
          if (/S|D/.test(day[j])) {
            monthCell[0] = ""
            if (/D/.test(day[j]) || (/S/.test(day[j]) && j < 1)) {
              NWeek++
            }
          }
          else {
            monthCell[0] = "S"+NWeek
            for (var l = 0; l < 13; l++) {
              if (new Date(year, mon, j+1).getTime() == hol[l].getTime()) {
                monthCell[0] = "_S"+NWeek
              }
            }
          }
          monthCell[1] = "#02658e"
        break

        case header[1]:
          monthCell[0] = j+1
          monthCell[1] = "#02658e"
        break

        case header[2]:
          monthCell[0] = day[j]
          monthCell[1] = "#02658e"
        break

        default:
        // Implement data set
        try {
          monthCell = data[header[i]][j]
        } catch (err) {}
        break
      }
      month[header[i]][j] = monthCell
    }
  }
  //generateBordure(month, header, templateMonth, NbrOfDay)
  return month
}

// Add a new columns in a month of schedule
function newColumn (month, name, project) {
  var header = findHeader(month)
  var NbrOfDay = month[header[0]].length
  var table = new Object()
  var colAdded = false

  if (header.indexOf(name) <= -1) {
    //loginfo("Column not exist !")
    if (project) {
      for (var i = 0; i < header.length; i++) {
        if (!/^_/.test(header[i]) && !colAdded) {
          table[name] = newCol(NbrOfDay)
          colAdded = true
        }
        table[header[i]] = month[header[i]]
      }
    }
    else {
      table = month
      table[name] = newCol(NbrOfDay)
    }
    header = findHeader(table)
    generateBordure(table, header, templateMonth, NbrOfDay)
    return table
  }
  else {
    //loginfo("Column exist !")
    return month
  }
}

function genSch () {
  // Cell = [Bordure, Details, DetailsColor, Project, Background]
  this.newMonth = function (date, header, data) {
    var template = ["_Week", "_NDay", "_Day"]
    return generateMonth(date, template.concat(header), data)
  }

  this.addColumns = function (month, name, project = false) {
    return newColumn(month, name, project)
  }
  this.removeColumn = function (month, name) {
    var table = delColumn(month, name)
    var header = findHeader(table)
    var NbrOfDay = month[header[0]].length
    generateBordure(table, header, templateMonth, NbrOfDay)
    return table
  }
  this.update_task = function (month, pos, persons) {
    // Persons | person = { del, det, proj, back }
    // tasks = { monthFrom, dayFrom, monthTo, dayTo, persons: { _Project: {}, JBB: {} } }
    return new Promise(function (resolve, reject) {
      var promise = []

      for (var i = pos[0]; i <= pos[1]; i++) {
        for (var person in persons) {
          var query = { month: month, day: i, person: person }

          if (persons[person].del) {
            promise.push(monthsModel.findOneAndRemove(query))
          } else {
            var value = { month: month, day: i, person: person, details: persons[person].det, details_color: "", project: persons[person].proj, background: persons[person].back }
            promise.push(monthsModel.findOneAndUpdate(query, value))
          }
        }
      }
      Promise.all(promise).then(function() {
        resolve()
      }).catch(function (error) {
        reject(error)
      })
    })

    // Project | proj = [proj, { del, temp }, project_det]
    /*if (proj[0] != "Aucun" && proj[2] != "") {
      var Prj_header = findProject(table)
      var Prj_mod = Prj_header[0]

      if (proj[1].del) {
        for (var i = 0; i < Prj_header.length; i++) {
          for (var j = pos[0]; j <= pos[1]; j++) {
            try {
              var idCell = []
              idCell[0] = table[Prj_header[i]][j][3]
              idCell[1] = table[Prj_header[i]][j][1]
            }
            catch(err) { var idCell = ["", ""] }
            if (idCell[0] != "" && idCell[0] == proj[0] && idCell[1] == proj[2]) {
              var Cell = []
              Cell[0] = table[Prj_header[i]][j][0]
              table[Prj_header[i]][j] = Cell
            }
          }
        }
      }
      else {
        var available = true
        for (var i = 0; i < Prj_header.length; i++) {
          available = true
          for (var j = pos[0]; j <= pos[1]; j++) {
            try { var idCell = table[Prj_header[i]][j][3] }
            catch(err) { var idCell = "" }
            if (idCell && idCell != "" && idCell != proj[0]) {
              available = false
            }
          }
          if (available) {
            Prj_mod = Prj_header[i]
            break
          }
        }
        if (!available) {
          Prj_mod = newProject(Prj_header)
          table = newColumn(table, Prj_mod, true)
        }
        for (var j = pos[0]; j <= pos[1]; j++) {
          table[Prj_mod][j][1] = proj[2]
          table[Prj_mod][j][2] = ""
          if (proj[0] == "Aucun") {
            proj[0] = ""
          }
          table[Prj_mod][j][3] = proj[0]
          if (proj[1].temp) {
            table[Prj_mod][j][4] = mesh
          }
        }
      }
    }
    table = checkProject(table)

    // Who | who = { del, depl, details, indisp, temp, proj }
    for (var person in who) {
      if (table[person] && (!proj[1].del || (proj[1].del && who[person].del))) {
        for (var i = pos[0]; i <= pos[1]; i++) {
          var Cell = []
          Cell[0] = table[person][i][0]
          if (!who[person].del) {
            try { Cell[1] = table[person][i][1] } catch(err) {}
            if (who[person].details != "") {
              Cell[1] = who[person].details
            }
            try { Cell[3] = table[person][i][3] } catch(err) {}
            try { Cell[4] = table[person][i][4] } catch(err) {}

            if (proj[0] != "Aucun") {
              Cell[2] = ""
              if (who[person].proj) {
                Cell[3] = proj[0]
              }
              if (who[person].temp) {
                Cell[4] = mesh
              }
            }
            if (who[person].indisp) {
              Cell[2] = "#ffffff"
              Cell[3] = "#000000"
            }
            else if (who[person].depl) {
              Cell[2] = table[person][i][2]
              Cell[4] = cross
            }
          }
          table[person][i] = Cell
        }
      }
    }
    return table*/
  }
  this.remove_project = function (table, project) {
    var header = findHeader(table)
    for (var i = 0; i < header.length; i++) {
      if (!/^_Week/.test(header[i]) && !/^_NDay/.test(header[i]) && !/^_Day/.test(header[i])) {
        for (var j = 0; j < table[header[i]].length; j++) {
          var Cell = []
          Cell[0] = table[header[i]][j][0]
          if (table[header[i]][j][3] == project) {
            table[header[i]][j] = Cell
          }
        }
      }
    }
    table = checkProject(table)
    return table
  }
}
module.exports = genSch
