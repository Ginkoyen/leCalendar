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


/* -------------------- SCHEDULE CELLS FUNCTION -------------------- */
// Find cell limit of a task on schedule
function findCellLimits (table, month, column, row) {
  var header = Sch.findHeader(table)
  var currentValue = table[header[column]][row]
  var project = false, projectTemp = false
  var project_name = "_Project"
  var projectDet = ""

  if (/_Project/gi.test(header[column])) {
    project = currentValue[2]
    project_name = header[column]
    projectTemp = (currentValue[3]) ? true : false
    projectDet = currentValue[0]
  }

  // Find start cell on schedule
  var startCell = {}
  var month_s = month
  var table_s = table
  var header_s = header

  if (project && (!currentValue[2] || currentValue[2] == "") || (!project && (!currentValue[0] || currentValue[0] == "") && (!currentValue[1] || currentValue[1] == "") && (!currentValue[2] || currentValue[2] == "") && (!currentValue[3] || currentValue[3] == ""))) {
    startCell.month = month_s
    startCell.column = column
    startCell.row = row
    startCell.day = Sch.months[startCell.month][header[1]][startCell.row][0]
    startCell.date = Sch.getDate(startCell.month)
    startCell.date.setDate(startCell.day)
    return { project: { id: null, det: null, temp: null, name: project_name }, startCell: startCell, endCell: startCell }
  }

  for (var i = row-1; i >= -1; i--) {
    var previousValue = table_s[header_s[column]][i]
    if (!previousValue) {
      try {
        month_s = Sch.incMonth(month_s, -1)
        table_s = Sch.months[month_s]
        header_s = Sch.findHeader(table_s)
        i = table_s[header_s[column]].length-1
        previousValue = table_s[header_s[column]][i]

        if (previousValue[2] == undefined) {
          month_s = Sch.incMonth(month_s, 1)
          startCell.month = month_s
          startCell.column = column
          startCell.row = 0
          console.log("start undefined: " + startCell.row);
          break
        }
      }
      catch(err) {
        month_s = Sch.incMonth(month_s, 1)
        startCell.month = month_s
        startCell.column = column
        startCell.row = i+1
        break
      }
    }

    if (previousValue[2] != currentValue[2] || previousValue[0] != currentValue[0] || (!project && previousValue[1] != currentValue[1])) {
      startCell.month = month_s
      startCell.column = column
      startCell.row = i+1
      break
    }
  }

  // Find end cell on schedule
  var endCell = {}
  var month_e = month
  var table_e = table
  var header_e = header

  for (var i = row+1; i <= table_e[header_e[column]].length; i++) {
    var nextValue = table_e[header_e[column]][i]
    if (!nextValue) {
      try {
        month_e = Sch.incMonth(month_e, 1)
        table_e = Sch.months[month_e]
        header_e = Sch.findHeader(table_e)
        i = 0
        nextValue = table_e[header_e[column]][i]

        if (nextValue[2] == undefined) {
          month_e = Sch.incMonth(month_e, -1)
          table_e = Sch.months[month_e]
          header_e = Sch.findHeader(table_e)
          endCell.month = month_e
          endCell.column = column
          endCell.row = table_e[header_e[column]].length-1
          console.log("undefined: " + endCell.row)
          break
        }
      }
      catch(err) {
        month_e = Sch.incMonth(month_e, -1)
        table_e = Sch.months[month_e]
        header_e = Sch.findHeader(table_e)
        endCell.month = month_e
        endCell.column = column
        endCell.row = table_e[header_e[column]].length-1
        break
      }
    }

    if (nextValue[2] != currentValue[2] || nextValue[0] != currentValue[0] || (!project && nextValue[1] != currentValue[1])) {
      endCell.month = month_e
      endCell.column = column
      endCell.row = i-1
      break
    }
  }

  startCell.day = Sch.months[startCell.month][header[1]][startCell.row][0]
  startCell.date = Sch.getDate(startCell.month)
  startCell.date.setDate(startCell.day)

  endCell.day = Sch.months[endCell.month][header[1]][endCell.row][0]
  endCell.date = Sch.getDate(endCell.month)
  endCell.date.setDate(endCell.day)

  return { project: { id: project, det: projectDet, temp: projectTemp, name: project_name }, startCell: startCell, endCell: endCell }
}

// Find users link to project
function usersOfProject (monthID, NbrM, start_row, end_row, project) {
  var team_pjt = []
  for (var i = 0; i < NbrM; i++) {
    var month = Sch.incMonth(monthID, i)
    var table = Sch.months[month]
    var header = Sch.findHeader(table)
    var row_start = (i > 0) ? 0 : start_row,
        row_end = (i < NbrM-1) ? table[header[0]].length-1 : end_row

    for (var j = row_start; j <= row_end; j++) {
      var team = Sch.findTeam(table)
      for (var k = 0; k < team.length; k++) {
        if (table[team[k]][j][2] == project && team_pjt.indexOf(team[k]) === -1) {
          team_pjt.push(team[k])
        }
      }
    }
  }
  return team_pjt
}

// Find task on schedule
function findTask (month, column, row) {
  var table = Sch.months[month]
  var team = Sch.findTeam(table)

  if (table) {
    var limits = findCellLimits(table, month, column, row)
    if (limits) {
      var NbrM = (limits.endCell.date.getMonth() - limits.startCell.date.getMonth()) + 1

      // Find user link to project
      var team_pjt = []
      if (limits.project.id) {
        team_pjt = usersOfProject(limits.startCell.month, NbrM, limits.startCell.row, limits.endCell.row, limits.project.id)
      }
      else {
        var header = Sch.findHeader(table)
        var header_pjt = Sch.findProject(table)
        var currentValue = table[header[column]][row]

        limits.project.id = (currentValue[2] && currentValue[2] != "" && !/^#/gi.test(currentValue[2])) ? currentValue[2] : "Aucun"
        limits.project.temp = false
        limits.project.det = ""

        if (limits.project.id != "Aucun") {
          for (var j = 0; j < header_pjt.length; j++) {
            currentValue = table[header_pjt[j]][row]
            if (currentValue[2] == limits.project.id) {
              limits.project.temp = (currentValue[3] == "mesh") ? true : false
              limits.project.det = currentValue[0]
              limits.project.name = header_pjt[j]
            }
          }
        }
        if (!/^_Project/gi.test(header[column])) {
          team_pjt.push(header[column])
        }
      }

      var team_pjtAll = []
      if (limits.project.id != "Aucun") {
        team_pjtAll = usersOfProject(limits.startCell.month, NbrM, limits.startCell.row, limits.endCell.row, limits.project.id)
      }

      // Who | who = { del, depl, details, indisp, temp, proj }
      var who = {}
      for (var i = 0; i < team.length; i++) {
        who[team[i]] = {}
        var currentValue = table[team[i]][row]
        // Cell = [Bordure, Details, DetailsColor, ProjetColor, Background]
        who[team[i]]['del'] = false
        who[team[i]]['depl'] = ((team_pjt.indexOf(team[i]) > -1) && currentValue[3] == "cross") ? true : false
        who[team[i]]['det'] = (team_pjt.indexOf(team[i]) > -1 && currentValue[0]) ? currentValue[0] : ""
        who[team[i]]['indisp'] = ((team_pjt.indexOf(team[i]) > -1) && testIndisp(currentValue[2])) ? true : false
        who[team[i]]['temp'] = ((team_pjt.indexOf(team[i]) > -1) && currentValue[3] == "mesh") ? true : false
        who[team[i]]['proj'] = (limits.project.id != "Aucun" && team_pjt.indexOf(team[i]) > -1) ? true : false
      }

      // Project | proj = [proj, { del, temp }, project_det]
      var project = [limits.project.id, { del: false, det: limits.project.det, temp: limits.project.temp }, limits.project.name]
      // Task | task = { dateFrom, dateTo, project, who }
      return { team_ptr: team_pjt, team_ptrAll: team_pjtAll, dateFrom: limits.startCell.date, dateTo: limits.endCell.date, project: project, who: who }
    }
    else {
      return false
    }
  }
}

// Modification of task event
function modif_task (month, column, row) {
  var task = findTask(Sch.getMonthHeader(month), column, row-1)
  if (task) {
    console.log(task)
    openSchModal(null, task)
  }
  else {
    console.log("Empty cell")
    openSchModal(null, null)
  }
}

// cells event
function cellEvent (e) {
  var oElem = this.parentNode
  while (oElem && oElem.tagName != 'TR') {
    oElem = oElem.parentNode
  }
  if (oElem) {
    var table = oElem.parentNode.parentNode
    var month = table.querySelector('caption').innerHTML
    var column = this.cellIndex
    var row = oElem.rowIndex
    modif_task (month, column, row)
  }
}
