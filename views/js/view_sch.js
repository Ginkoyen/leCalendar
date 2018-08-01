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


var monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
var tapped = false

/* -------------------- GENERAL FUNCTION -------------------- */
// Find Object header
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

// Find team header of month
function findTeam (table) {
  var header = []
  for (var key in table) {
    if (header.indexOf(key) === -1 && !/^_/.test(key)) {
      header.push(key)
    }
  }
  return header
}

// Get month of schedule date
function getMonth (date) {
  var mm = ((date.getMonth()+1) > 9) ? String(date.getMonth()+1) : '0'+String(date.getMonth()+1)
  var yyyy = String(date.getFullYear())
  return parseInt(yyyy + mm)
}

// Get date of schedules month
function getDate (month) {
  var yyyy = parseInt(month/100)
  var mm = (parseInt(month%100) > 9) ? String(month%100) : String('0'+month%10)
  return new Date(yyyy + '-' + mm + '-01T02:00:00')
}

// Set month of schedule date
function setMonth (month, nbrMonth) {
  var yyyy = parseInt(month/100)*100
  var mm = parseInt(month%100) + nbrMonth-1
  return yyyy + parseInt(mm/12)*100 + (parseInt(mm%12))
}

// Find month of schedule
function findMonthN (NbrMonth, firstDate) {
  var month = parseInt(firstDate.getMonth())
  var year = parseInt(String(firstDate.getFullYear()).substr(-2))
  var monthN = []

  for (var i = 0; i < NbrMonth; i++) {
    monthN[i] = parseInt(((month+i)%12)+1) + "-" + parseInt(year+((month+i)/12))
  }
  return monthN
}

// Get month of schedule
function getMonthN (date) {
  var month = parseInt(date.getMonth())+1
  var year = parseInt(String(date.getFullYear()).substr(-2))

  if (month >= 13) {
    month = 1
    year++
  }

  return month + "-" + year
}

// Copy of date
function copyOfDate (date, init = false, year = 0, month = 0, day = 1) {
  var newDate = new Date()
  newDate.setFullYear(date.getFullYear()+parseInt(year))
  newDate.setMonth(date.getMonth()+parseInt(month))
  newDate.setDate(day)
  if (init) {
    newDate.setHours(2,0,0,0)
  }
  else {
    newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
  }
  return newDate
}

// Retrieve date from month date
function retrieveDate (month) {
  var arrayDate = month.split('-')
  var date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setDate(1)
  date.setMonth(parseInt(arrayDate[0])-1)
  date.setFullYear(2000 + parseInt(arrayDate[1]))
  return date
}

// Convert string to date
function convStr_Date (date_str) {
  try {
    var date_d = new Date()
    date_d.setHours(2,0,0,0)
    date_d.setDate(date_str.substr(8,2))
    date_d.setMonth(date_str.substr(5,2)-1)
    date_d.setFullYear(date_str.substr(0,4))
  }
  catch(err) {
    return 0
  }
  return date_d
}

// Left pad number with 0, returns string of length 2.
function pad (a) {
  var str = String(a)
  var pad = '00'
  return pad.substring(0, pad.length - str.length) + str
}

// Return \String
Date.prototype.Ymd = function () {
	return this.getFullYear() + '-' + pad(this.getMonth() + 1) + '-' + pad(this.getDate())
}


/* -------------------- COLOR FUNCTION -------------------- */
// Convert a hexidecimal color string to 0..255 R,G,B
function hexToRGB (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    var rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
    return rgb.r + ", " + rgb.g + ", " + rgb.b
}

// Get oposite color of background
function getOpositeColor (rgb) { // Like this : rgb(0, 0, 0)
    while (rgb.indexOf(' ') != -1) rgb = rgb.replace(' ', '')
    //Check if is formatted as RGB
    if ((x = /([0-9]{0,3}),([0-9]{0,3}),([0-9]{0,3})/.exec(rgb))) {
        //Extract colors
        color = {
            'r': parseInt(x[1]),
            'g': parseInt(x[2]),
            'b': parseInt(x[3])
        };
        var backgroundContrast = (0.3 * (color['r'])) + (0.59 * (color['g'])) + (0.11 * (color['b']))
        //If background contrast be <= 128 return white, others else return black
        var opositeColor = (backgroundContrast <= 128) ? '#FFF' : '#000'
        //If background contrast be <= 128 return white, others else return black
        var opositeColorBackground = (backgroundContrast <= 64) ? 'white' : 'black'

        return [opositeColor, opositeColorBackground]
    }
    return -1
}

// Test indisp value
function testIndisp (color) {
  if (color == "black" || color == "#000" || color == "#000000" || color == "rgb(0, 0, 0)" || color == "rgba(0, 0, 0, 0)") {
    return true
  }
  return false
}


/* -------------------- EVENTS SCHEDULE -------------------- */
var eventDay = undefined
function setDay () {
  clearTimeout(eventDay)
  var today = new Date()
  try {
    var month = getMonthSch(getMonthN(today))
    var sch_today = document.querySelectorAll('.today')
    for (var i = 0; i < sch_today.length; i++) {
      sch_today[i].classList.remove('today')
    }
    var sch_obj = document.querySelector('.schedules-content caption.'+month).parentNode
    var tbody = sch_obj.querySelector('tbody')
    tbody.rows[today.getDate()-1].cells[2].classList.add('today')
  } catch (err) {}
  var tomorrow = copyOfDate(today, true, 0, 0, today.getDate()+1)
  tomorrow.setUTCHours(0,0,0,0)
  eventDay = setTimeout(setDay, tomorrow.getTime() - today.getTime())
}


/* -------------------- DISPLAY SCHEDULE -------------------- */
// Find id of a project name
function findProjectID (name) {
  for (var id in sch.project) {
    if (sch.project[id].name == name) {
      return id
    }
  }
}

// Get month schedule [janv-18] from month header [1-18]
function getMonthSch (month) {
  var tab_month_short = new Array("janv", "févr", "mars", "avr", "mai", "juin", "juill", "août", "sept", "oct", "nov", "déc")
  var yyyy = parseInt(month/100)
  var mm = parseInt(month%100)
  return tab_month_short[mm-1] + '-' + yyyy
}

// Get month header [1-18] from month schedule [janv-18]
function getMonthHeader (month) {
  var tab_month_short = new Array("janv", "févr", "mars", "avr", "mai", "juin", "juill", "août", "sept", "oct", "nov", "déc")
  var arrayDate = month.split('-')
  for (var i = 1; i < tab_month_short.length; i++) {
    if ((tab_month_short[i-1] + '-' + arrayDate[1]) == month) {
      if (i == 1) {
        arrayDate[1] = parseInt(arrayDate[1]) + 1
      }
      return i + '-' + arrayDate[1]
    }
  }
  return false
}

// Increment/Decrement month header [1-18]
function incMonthHeader (month, inc) {
  var arrayDate = month.split('-')
  for (var i = 0; i < Math.abs(inc); i++) {
    if (inc < 0) {
      arrayDate[0] = parseInt(arrayDate[0]) - 1
      if (arrayDate[0] <= 0) {
        arrayDate[0] = 12
        arrayDate[1] = parseInt(arrayDate[1]) - 1
      }
    }
    if (inc > 0) {
      arrayDate[0] = parseInt(arrayDate[0]) + 1
      if (arrayDate[0] > 12) {
        arrayDate[0] = 1
        arrayDate[1] = parseInt(arrayDate[1]) + 1
      }
    }
  }
  return arrayDate[0] + '-' + arrayDate[1]
}

// Sort month
function sortHeader (header) {
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

// Update cell of html table
function updateCell (tabCell, data, column, week = true) {
  var value = []
  var backgroundSize = "auto"
  var opositeColor = ["#000", "black"]
  var project_name = ""

  for (var i = 0; i < 4; i++) {
    try { value[i] = data[i] }
    catch(err) { value[i] = "" }
    if (!value[i] || value[i] == undefined) {
      value[i] = ""
    }
  }

  value[0] = value[0].toString().replace(/^_/gi, '')

  if (value[2] != "" ) {
    if (/^#/.test(value[2])) {
      opositeColor = getOpositeColor(hexToRGB(value[2]))
    }
    else {
      opositeColor = getOpositeColor(hexToRGB(sch.project[value[2]].color))
    }

    if (value[1] == "" && value[0] != "") {
      value[1] = opositeColor[0]
    }

    if (!testIndisp(value[2])) {
      project_name = sch.project[value[2]].name
      value[2] = sch.project[value[2]].color
    }
  }
  else if (value[2] == "" && !week) {
    value[2] = "#d9d9d9"
  }

  if (value[0] == "" && opositeColor[1] == "white") {
    var regex = /d-(t|l|r|b)/g
    //value[-1] = value[-1].replace(regex, "d-$1-w")
  }

  if (value[3] != "") {
    value[3] = value[3] + '-' + opositeColor[1]
    if (/^cross/.test(value[3])) {
      backgroundSize = "100% 100%"
    }
  }

  try {
    if (!/_Week/gi.test(column) && !/_NDay/gi.test(column) && !/_Day/gi.test(column)) {
      tabCell.ondblclick = cellEvent

      tabCell.addEventListener('touchstart', function () {
        if (!tapped) {
          tapped = setTimeout(function() {
            tapped = null
            // Single tapped
          }, 200)
        }
        else {
          clearTimeout(tapped)
          tapped = null
          // Double tapped
          tabCell.ondblclick()
        }
      }, false)
    }
  } catch (err) {}

  tabCell.innerHTML = ""
  if (/^_Project/gi.test(column) && project_name != "") {
    tabCell.title = project_name
  }
  //tabCell.style.fontFamily = "calibri"
  tabCell.style.fontSize = "11px"
  //tabCell.style.fontWeight = "bold"
  if (!/^_/gi.test(column)) {
    tabCell.style.fontSize = "8px"
    tabCell.style.fontWeight = "bold"
  }
  //tabCell.className = value[0]
  tabCell.innerHTML = value[0]
  tabCell.style.color = value[1]
  tabCell.style.backgroundColor = value[2]
  if (value[3] != "") {
    tabCell.style.backgroundImage = "url('"+value[3]+".png')"
    tabCell.style.backgroundSize = backgroundSize
  }
}

// Create html table from Json file
function createTableFromJSON (data, month) {
  // Extract value for html header
  var header = findHeader(data)

  // Create dynamic table
  var table = document.createElement('table')
  var spanNbr = 0

  // Title of table
  var caption = document.createElement('caption')
  var monthSch = getMonthSch(month)
  caption.innerHTML = monthSch
  caption.className = monthSch

  // Create html table header row using the extracted headers above
  var thead = document.createElement('thead')
  var tr = document.createElement('tr')

  for (var i = 0; i < header.length; i++) {
    if (/^_/.test(header[i])) {
      spanNbr++
      continue

    }
    if (/^_/.test(header[i-1]) && !/^_/.test(header[i])) {
      var th = document.createElement('th')
      th.colSpan = spanNbr
      th.className = "s"
      tr.appendChild(th)
      spanNbr = 0
    }
    var th = document.createElement('th')
    th.innerHTML = header[i]
    //th.style.fontFamily = "calibri"
    th.style.fontSize = "14px"
    //th.style.fontWeight = "bold"
    th.className = "s"
    tr.appendChild(th)
  }
  thead.appendChild(tr)

  // Create html table header row using the extracted headers above
  var tbody = document.createElement('tbody')

  // Add Json data to the table as rows
  var previousValue, currentValue, nextValue
  var tabCellSpan = []

  for (var i = 0; i < data[header[0]].length; i++) {
    tr = tbody.insertRow(-1)

    for (var j = 0; j < header.length; j++) {
      var tabRow = data[header[j]]
      var week = false
      if ((!/^_/.test(data["_Week"][i][0]) && data["_Week"][i][0]) || header[j] == "_Week") week = true

      if (/^_/.test(header[j]) && header[j].indexOf("_Day") && tabRow[i][0] != "" && tabRow[i][0]) {
        try { previousValue = tabRow[i-1][0].toString().replace(/^_/g, '') }
        catch(err) { previousValue = "" }

        try { currentValue = tabRow[i][0].toString().replace(/^_/g, '') }
        catch(err) { currentValue = "" }

        try { nextValue = tabRow[i+1][0].toString().replace(/^_/g, '') }
        catch(err) { nextValue = "" }

        if (previousValue != currentValue && nextValue == currentValue) {
          tabCellSpan[j] = tr.insertCell(-1)
          continue
        }
        if (previousValue == currentValue) {
          tabCellSpan[j].rowSpan++
          if (nextValue != currentValue) {
            updateCell(tabCellSpan[j], tabRow[i], header[j], week)
          }
          var tabCell = tr.insertCell(-1)
          tabCell.hidden = true
          continue
        }
      }
      var tabCell = tr.insertCell(-1)
      updateCell(tabCell, tabRow[i], header[j], week)
    }
  }
  table.appendChild(caption)
  table.appendChild(thead)
  table.appendChild(tbody)
  return table
}

function copyHeader (ctable) {
  var table = ctable.cloneNode(true)
  var tbody = table.querySelector('tbody')
  tbody.style.visibility = "hidden"
  return table
}

function showSchedule (idHeader, idTable, months, mobile) {
  var header = findHeader(months)//sortHeader(findHeader(months))
  console.log(header)
  console.log(months);
  var divHead = document.querySelector(idHeader)
  var divTable = document.querySelector(idTable)
  divHead.innerHTML = ""
  divTable.innerHTML = ""
  for (var i = 0; i < header.length; i++) {
    var table = createTableFromJSON(months[header[i]], header[i])
    table = divTable.appendChild(table)
    if (!mobile) {
      divHead.appendChild(copyHeader(table))
    }
  }
  setDay()
}
