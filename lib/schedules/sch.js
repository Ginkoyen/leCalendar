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

var infoModel = require('../../models/info')


/* -------------------- CLASS SCHEDULES -------------------- */
class Schedules {
  // Constructor
  constructor() {
    this.nbrMonth = 12
    this.first_date = new Date()
    this.date_start = new Date()
    this.date_end = new Date()

    this.month = {
      first_date: 0,
      date_start: 0,
      date_end: 0
    }

    this.default = {
      team: ["JBB", "PB"],
      project: { shortId: "_0", name: "Formation", type: "Général", color: "#f44141" }
    }

    // Init end date of schedules
    this.date_end.setMonth(this.date_end.getMonth()+this.nbrMonth)

    // Init month values
    this.month.first_date = this.getMonth(this.first_date)
    this.month.date_start = this.getMonth(this.date_start)
    this.month.date_end = this.getMonth(this.date_end)
  }

  /* --------------- FUNCTION SCHEDULES --------------- */
  // Get month of schedule date
  getMonth (date) {
    var mm = ((date.getMonth()+1) > 9) ? String(date.getMonth()+1) : '0'+String(date.getMonth()+1)
    var yyyy = String(date.getFullYear())
    return parseInt(yyyy + mm)
  }

  // Get date of schedules month
  getDate (month) {
    var yyyy = parseInt(month/100)
    var mm = (parseInt(month%100) > 9) ? String(month%100) : String('0'+month%10)
    return new Date(yyyy + '-' + mm + '-01T02:00:00')
  }

  // Get first schedules date
  getFirstDate () {
    var sch = this
    infoModel.findOne({}, function(err, info) {
      if (err) { throw err }
      sch.first_date = info.first_date
    })
  }

  // Update date of schedules
  updateDate () {
    this.date_start = new Date()
    this.date_end = new Date()
    this.date_end.setMonth(this.date_end.getMonth()+this.nbrMonth)
    this.month.date_start = this.getMonth(this.date_start)
    this.month.date_end = this.getMonth(this.date_end)
  }

  // Find month of schedule
  findMonth (month, nbr) {
    var months = [month]
    var end = this.month.date_end

    for (var i = 1; i < nbr; i++) {
      var value = months[months.length-1]+1
      var decade = value%100
      // Check if new year
      if (decade > 12) {
        value += (101-decade)
      }
      // Check if server limit reached
      if (value > end) {
        return months
      }
      months.push(value)
    }
    return months
  }
}
module.exports = Schedules
