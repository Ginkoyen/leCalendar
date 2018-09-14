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


var monthNames = new Array('Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre')
var tab_month_short = new Array("janv", "févr", "mars", "avr", "mai", "juin", "juill", "août", "sept", "oct", "nov", "déc")

/* -------------------- OBJECT SCHEDULES -------------------- */
//var Sch = new Obect()
class Schedules {
  // Constructor
  constructor() {
    this.months = new Object()
    this.first_date = undefined
    this.last_date = undefined
    this.start = undefined
    this.end = undefined
    this.start_month = undefined
    this.end_month = undefined
    this.project = undefined
    this.team = undefined

    this.request = {
      month_from: this.getMonth(new Date()),
      month_to: this.getMonth(new Date())
    }
  }
  updateDateMonth(monthFrom, monthTo, nbrMonth) {
    if (monthFrom) {
      this.request.month_from = monthFrom
    }
    if (monthTo) {
      this.request.month_to = monthTo
    } else {
      this.request.month_to = this.setMonth(monthFrom, nbrMonth)
    }
  }
  updateDate() {
    var months = this.findHeader(this.months)
    this.start_month = months[0]
    this.end_month = months[months.length-1]
    this.start = this.getDate(months[0])
    this.end = this.getDate(months[months.length-1])
  }
  updateInfos(first_date, last_date, months, project, team) {
    if (first_date) {
      this.first_date = new Date(first_date)
    }
    if (last_date) {
      this.last_date = new Date(last_date)
    }
    if (months) {
      for (var month in months) {
        this.months[month] = months[month]
      }
    }
    if (project) {
      this.project = project
    }
    if (team) {
      this.team = team
    }
  }

  // Get month of schedule date
  getMonth(date) {
    if (!date instanceof Date) return null
    var mm = ((date.getMonth()+1) > 9) ? String(date.getMonth()+1) : '0'+String(date.getMonth()+1)
    var yyyy = String(date.getFullYear())
    return parseInt(yyyy + mm)
  }

  // Get date of schedules month
  getDate(month) {
    var yyyy = parseInt(month/100)
    var mm = (parseInt(month%100) > 9) ? String(month%100) : String('0'+month%10)
    return new Date(yyyy + '-' + mm + '-01T02:00:00')
  }

  // Set month of schedule date
  setMonth(month, nbrMonth) {
    var yyyy = parseInt(month/100)*100
    var mm = parseInt(month%100) + nbrMonth-1
    return yyyy + parseInt(mm/12)*100 + (parseInt(mm%12))
  }

  // Find month of schedule
  findMonthN(firstDate, nbr) {
    var month = this.getMonth(firstDate)
    var months = [month]
    var yyyy = parseInt(month/100)
    var mm = parseInt(month%100)

    for (var i = 0; i < nbr; i++) {
      mm += 1
      if (mm > 12) {
        mm = 1
        yyyy += 1
      }
      months.push(parseInt(String(yyyy) + String((mm > 9) ? String(mm) : '0'+String(mm))))
    }
    return months
  }

  // Get month schedule [janv-18] from month header [201801]
  getMonthSch(month) {
    var yyyy = parseInt(month/100)
    var mm = parseInt(month%100)
    return tab_month_short[mm-1] + '-' + yyyy
  }

  // Get month header [2018] from month schedule [janv-18]
  getMonthHeader(month) {
    var arrayDate = month.split('-')
    var month_index = tab_month_short.indexOf(arrayDate[0])

    var yyyy = arrayDate[1]
    var mm = (month_index >= 9) ? String(month_index+1) : '0'+String(month_index+1)
    return parseInt(yyyy + mm)
  }

  // Increment/Decrement month [201801]
  incMonth(month, inc) {
    var yyyy = parseInt(month/100)
    var mm = parseInt(month%100)

    for (var i = 0; i < Math.abs(inc); i++) {
      if (inc < 0) {
        mm -= 1
        if (mm <= 0) {
          mm = 12
          yyyy -= 1
        }
      }
      if (inc > 0) {
        mm += 1
        if (mm > 12) {
          mm = 1
          yyyy += 1
        }
      }
    }
    return parseInt(String(yyyy) + String((mm > 9) ? String(mm) : '0'+String(mm)))
  }

  // Find Object header
  findHeader(table) {
    var header = []
    for (var key in table) {
      if (header.indexOf(key) === -1) {
        header.push(key)
      }
    }
    return header
  }

  // Find project header of month
  findProject(table) {
    var header = []
    for (var key in table) {
      if (header.indexOf(key) === -1 && /^_Project/.test(key)) {
        header.push(key)
      }
    }
    return header
  }

  // Find team header of month
  findTeam(table) {
    var header = []
    for (var key in table) {
      if (header.indexOf(key) === -1 && !/^_/.test(key)) {
        header.push(key)
      }
    }
    return header
  }

  // Find id of a project name
  findProjectID(name) {
    for (var id in this.project) {
      if (this.project[id].name == name) {
        return id
      }
    }
  }

  // Sort month
  sortHeader(header) {
    var headerSorted = []
    var arrayDate = header[0].split('-')
    var firstMonth = parseInt(arrayDate[0]), firstYear = parseInt(arrayDate[1])

    for (var i = 1; i < header.length; i++) {
      arrayDate = header[i].split('-')
      if (parseInt(arrayDate[1]) < firstYear) {
        firstYear = arrayDate[1]
        firstMonth = arrayDate[0]
      }
      if (parseInt(arrayDate[1]) == firstYear && parseInt(arrayDate[0]) < firstMonth) {
        firstMonth = arrayDate[0]
      }
    }
    for (var i = 0; i < header.length; i++) {
      if (firstMonth > 12) {
        firstYear++
        firstMonth = 1
      }
      headerSorted[i] = firstMonth + "-" + firstYear
      firstMonth++
    }
    return headerSorted
  }
}
var Sch = new Schedules()
