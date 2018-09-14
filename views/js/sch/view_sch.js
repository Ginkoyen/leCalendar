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


var templateMonth = [ ["n-b s-l", "n-l n-b", "s-l d-r", "d-r", "s-r"],
                      ["s-l s-b", "n-l s-b", "d-r s-l s-b", "d-r s-b", "s-r s-b"]
]
var tapped = false
var onetapped = false

/* -------------------- GENERAL FUNCTION -------------------- */
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
    var month = Sch.getMonthSch(Sch.getMonth(today))
    var sch_today = document.querySelectorAll('.today')
    for (var i = 0; i < sch_today.length; i++) {
      sch_today[i].classList.remove('today')
    }
    var sch_obj = document.querySelector('.schedules-content caption.'+month).parentNode
    var tbody = sch_obj.querySelector('tbody')
    tbody.rows[today.getDate()-1].cells[2].classList.add('today')
  } catch (err) {}
  var tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate()+1)
  tomorrow.setUTCHours(0,0,0,0)
  eventDay = setTimeout(setDay, tomorrow.getTime() - today.getTime())
}


/* -------------------- DISPLAY SCHEDULE -------------------- */
//Generate bordure of schedule
function generateBordure (column, row, header, template, nbrOfDay) {
  var previousValue, currentValue // nextValue
  var x = 0
  var y = 0

  try { previousValue = header[column-1] }
  catch(err) { previousValue = "" }

  try { currentValue = header[column] }
  catch(err) { currentValue = "" }

  //try { nextValue = header[column+1] }
  //catch(err) { nextValue = "" }

  // Calcul X
  if (column != 0) {
    if (/^_/.test(currentValue)) {
      x = 1
    }
    else if (!/^_/.test(currentValue)) {
      x = 3
      if (/^_/.test(previousValue)) {
        x = 2
      }
    }
    if (column == (header.length-1)) {
      x = 4
    }
  }
  // Calcul Y
  if (row == (nbrOfDay-1)) {
    y = 1
  }

  if (/^_Project/.test(header[column])) {
    return template[y][x] + " prj"
  }
  return template[y][x]
}

// Update cell of html table
function updateCell (tabCell, data, column, row, header, nbrOfDay, week) {
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
      opositeColor = getOpositeColor(hexToRGB(Sch.project[value[2]].color))
    }

    if (value[1] == "" && value[0] != "") {
      value[1] = opositeColor[0]
    }

    if (!testIndisp(value[2])) {
      project_name = Sch.project[value[2]].name
      value[2] = Sch.project[value[2]].color
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
    if (!/_Week/gi.test(header[column]) && !/_NDay/gi.test(header[column]) && !/_Day/gi.test(header[column])) {
      tabCell.ondblclick = cellEvent

      tabCell.addEventListener('touchstart', function (e) {
        if (!tapped) {
          tapped = setTimeout(function() {
            tapped = null
            onetapped = null
            // Single tapped
          }, 200)
          onetapped = null
        }
        else if (onetapped) {
          clearTimeout(tapped)
          tapped = null
          onetapped = null
          // Double tapped
          tabCell.ondblclick()
        }
      }, false)
      tabCell.addEventListener('touchend', function () {
        onetapped = true
      }, false)
    }
  } catch (err) {}

  tabCell.innerHTML = ""
  if (/^_Project/gi.test(header[column]) && project_name != "") {
    tabCell.title = project_name
  }
  //tabCell.style.fontFamily = "calibri"
  tabCell.style.fontSize = "11px"
  //tabCell.style.fontWeight = "bold"
  if (!/^_/gi.test(column)) {
    tabCell.style.fontSize = "8px"
    tabCell.style.fontWeight = "bold"
  }
  tabCell.className = generateBordure(column, row, header, templateMonth, nbrOfDay) //value[0]
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
  var header = Sch.findHeader(data)

  // Create dynamic table
  var table = document.createElement('table')
  var spanNbr = 0

  // Title of table
  var caption = document.createElement('caption')
  var monthSch = Sch.getMonthSch(month)
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
  var nbrOfDay = data[header[0]].length

  for (var i = 0; i < nbrOfDay; i++) {
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
            updateCell(tabCellSpan[j], tabRow[i], j, i, header, nbrOfDay, week)
          }
          var tabCell = tr.insertCell(-1)
          tabCell.hidden = true
          continue
        }
      }
      var tabCell = tr.insertCell(-1)
      updateCell(tabCell, tabRow[i], j, i, header, nbrOfDay, week)
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
  var header = Sch.findHeader(months) // Sch.sortHeader(Sch.findHeader(months))
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
