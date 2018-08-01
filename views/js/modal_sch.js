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


/* -------------------- SCHEDULE MODAL -------------------- */
// When the user clicks on the <button> (btn_modif_s), open the schedule modal
var btn_s = document.querySelector('#btn_modif_s')
btn_s.addEventListener('click', function() {
  openSchModal()
})

// Check only one checkboxes of project part
var pjt_checkboxes = document.querySelectorAll('.pjt_checkboxes_s input[type=checkbox]')
for (var i = 0; i < pjt_checkboxes.length; i++) {
  pjt_checkboxes[i].addEventListener('change', function () {
    if (this.checked) {
      var parent = this.parentNode.parentNode.parentNode
      var checkboxes = parent.querySelectorAll('input[type=checkbox]')
      for (var j = 0; j < checkboxes.length; j++) {
        checkboxes[j].checked = false
      }
      this.checked = true
    }
  })
}

// Select who in function of who selection
var whoS_s = document.querySelector('#whoS_s')
whoS_s.addEventListener('change', function (e) {
  var select = this
  var div = this.parentNode.parentNode

  div.querySelector('.who-options.active').classList.remove('active')
  div.querySelector(".who-options."+select.value).classList.add('active')
})

// Put checkboxes value of class 'all' to all checkboxes classes
var checkboxesAll = document.querySelectorAll('.who-options.Tout input[type=checkbox]')
for (var i = 0; i < checkboxesAll.length; i++) {
  checkboxesAll[i].addEventListener('change', function () {
    if (this.checked) {
      var parent = this.parentNode.parentNode.parentNode
      var checkboxes = parent.querySelectorAll('input[type=checkbox]')
      for (var k = 0; k < checkboxes.length; k++) {
        checkboxes[k].checked = false
      }
      this.checked = true
    }

    var who_options = document.querySelectorAll('.who-options')
    for (var j = 0; j < who_options.length; j++) {
      if (!who_options[j].classList.contains('Tout')) {
        var inputs = who_options[j].querySelectorAll('input[type=checkbox]')
        for (var k = 0; k < inputs.length; k++) {
          inputs[k].checked = false
          if (inputs[k].classList.contains(this.className)) {
            inputs[k].checked = this.checked
          }
        }
      }
      var inputs = who_options[j].querySelectorAll('input[type=checkbox]')
      for (var k = 0; k < inputs.length; k++) {
        if (inputs[k].classList.contains('who_del_s')) {
          var parent = inputs[k].parentNode.parentNode.parentNode.parentNode
          var del_cols = parent.querySelectorAll('.del-col')
          for (var l = 0; l < del_cols.length; l++) {
            del_cols[l].style.display = "block"
            if (inputs[k].checked) {
              del_cols[l].style.display = "none"
            }
          }
        }
      }
    }
  })
}

// Put texts of class 'all' to all texts classes
var textsAll = document.querySelectorAll('.who-options.Tout input[type=text]')
for (var i = 0; i < textsAll.length; i++) {
  textsAll[i].addEventListener('change', function () {
    var who_options = document.querySelectorAll('.who-options')
    for (var j = 0; j < who_options.length; j++) {
      if (!who_options[j].classList.contains('Tout')) {
        var inputs = who_options[j].querySelectorAll('input[type=text]')
        for (var k = 0; k < inputs.length; k++) {
          inputs[k].value = this.value
        }
      }
    }
  })
}

// When the user clicks on <span> (x), close the schedule modal
var span_s = document.querySelector('.close_s')
span_s.addEventListener('click', function() {
  document.querySelector('#modal_modif_s').style.display = "none"
})

// When <select> (project_s) change, find and update project details
var projectSelect = document.querySelector('#project_s')
projectSelect.addEventListener('change', function() {
  if (this.value != "Aucun") {
    findProjDet_s()
  }
})


/* -------------------- FUNCTION -------------------- */
// Open schedule modal
function openSchModal (mod = false, task = false) {
  var modal_modif = document.querySelector('#modal_modif_s')
  modal_modif.style.display = "block"
  modal_modif.clickTask = task

  var dateFrom = document.querySelector('#dateFrom_s'),
      dateTo = document.querySelector('#dateTo_s')
  var altFrom = document.querySelector('#altFrom_s'),
      altTo = document.querySelector('#altTo_s')

  var project_del_obj = document.querySelector('.project_del_s'),
      project_details_obj = document.querySelector("input[name='project_details_s']"),
      project_temp_obj = document.querySelector('.project_temp_s')

  var checkboxesAll = document.querySelectorAll(".who-options.Tout input[type=checkbox]"),
      textsAll = document.querySelectorAll(".who-options.Tout input[type=text]"),
      del_colAll = document.querySelectorAll(".who-options.Tout .del-col")

  project_del_obj.checked = (task && task.project[1].del) ? true : false
  project_details_obj.value = (task && task.project[2]) ? task.project[2] : ""
  project_temp_obj.checked = (task && task.project[1].temp) ? true : false

  for (var i = 0; i < checkboxesAll.length; i++) {
    checkboxesAll[i].checked = false
  }
  for (var i = 0; i < textsAll.length; i++) {
    textsAll[i].value = ""
  }
  for (var i = 0; i < del_colAll.length; i++) {
    del_colAll[i].style.display = "block"
  }

  if (task) {
    findProj_s(task.project[0])
    findAttr_s(task.dateFrom, true, task.who)
    whoEventUpdate(task.dateFrom, mod, task.who, task.team_ptr)
  }
  else {
    findProj_s()
    findAttr_s(sch.start)
    whoEventUpdate(sch.start, mod)
  }
  console.log(sch.start)
  console.log(sch.end)
  dateFrom.min = sch.start
  dateFrom.max = sch.end
  dateTo.min = sch.start
  dateTo.max = sch.end
  // min="2018-02-01" max="2019-01-31"
  date_picker_s()
  altFrom.value = (task) ? (pad(task.dateFrom.getDate()) + ' ' + monthNames[task.dateFrom.getMonth()].slice(0,4) + ' ' + task.dateFrom.getFullYear()) : ""
  dateFrom.value = (task) ? task.dateFrom.Ymd() : ""
  if (dateFrom.value && dateFrom.value != "") {
    setDateTo(dateFrom.value)
  }
  altTo.value = (task) ? (pad(task.dateTo.getDate()) + ' ' + monthNames[task.dateTo.getMonth()].slice(0,4) + ' ' + task.dateTo.getFullYear()) : ""
  dateTo.value = (task) ? task.dateTo.Ymd() : ""
}

// Set minimum date of dateTo input
function setDateTo (date) {
  var dateTo = document.querySelector('#dateTo_s')
  dateTo.min = date
  date_picker_s()
}

// Set value of "all" input
function setValueAll(value, type) {
  var equal = true
  var who_options = document.querySelectorAll('.who-options')
  for (var i = 0; i < who_options.length; i++) {
    if (!who_options[i].classList.contains('Tout')) {
      var input = who_options[i].querySelector('.'+value.className)
      switch(type) {
        case 'checkbox':
          if (input.checked != value.checked) {
            equal = false
          }
        break

        case 'text':
          if (input.value != value.value) {
            equal = false
          }
        break
      }
    }
  }
  var valueAll = document.querySelector('.who-options.Tout input[type='+type+'].'+value.className)
  switch(type) {
    case 'checkbox':
      valueAll.checked = false
      if (equal) {
        valueAll.checked = value.checked
      }
    break

    case 'text':
      valueAll.value = ""
      if (equal) {
        valueAll.value = value.value
      }
    break
  }
}

// Add event to who selection
function whoEventUpdate (date, mod = false, who_sel = false, who_ptr = false) {
  var who = document.querySelector('#whoS_s')
  var whoS = findHeader(sch.months[getMonth(date)])

  who.innerHTML = ""
  var option = document.createElement('option')
  option.innerHTML = 'Tout'
  who.appendChild(option)

  // Init who options
  var who_options = document.querySelectorAll('.who-options')
  for (var i = 0; i < who_options.length; i++) {
    if (!who_options[i].classList.contains('Tout')) {
      var parent = who_options[i].parentNode
      parent.removeChild(who_options[i])
    }
  }
  document.querySelector('.who-options.Tout .who-del-col_s').style.display = "block"
  if (mod) {
    document.querySelector('.who-options.Tout .who-del-col_s').style.display = "none"
  }

  var who_option = document.querySelector('.who-options.Tout')
  who_option.classList.remove('active')
  for (var i = 0; i < whoS.length; i++) {
    if (whoS[i][0] != '_') {
      var option = document.createElement('option')
      option.innerHTML = whoS[i]
      who.appendChild(option)

      // Create who option
      var div = who_option.cloneNode(true)
      div.classList.remove('Tout')
      div.classList.add(whoS[i])

      // Set textbox events
      var checkboxes = div.querySelectorAll('input[type=checkbox]')
      for (var j = 0; j < checkboxes.length; j++) {
        checkboxes[j].addEventListener('change', function () {
          if (this.checked) {
            var parent = this.parentNode.parentNode.parentNode
            var checkboxes = parent.querySelectorAll('input[type=checkbox]')
            for (var k = 0; k < checkboxes.length; k++) {
              checkboxes[k].checked = false
            }
            this.checked = true
          }
          if (this.classList.contains('who_del_s')) {
            var parent = this.parentNode.parentNode.parentNode.parentNode
            var del_cols = parent.querySelectorAll('.del-col')
            for (var k = 0; k < del_cols.length; k++) {
              del_cols[k].style.display = "block"
              if (this.checked) {
                del_cols[k].style.display = "none"
              }
            }
          }
          setValueAll(this, 'checkbox')
          var checkboxAll = document.querySelector('.who-options.Tout input[type=checkbox].'+this.className)
          if (checkboxAll.classList.contains('who_del_s')) {
            var parent = checkboxAll.parentNode.parentNode.parentNode.parentNode
            var del_cols = parent.querySelectorAll('.del-col')
            for (var k = 0; k < del_cols.length; k++) {
              del_cols[k].style.display = "block"
              if (checkboxAll.checked) {
                del_cols[k].style.display = "none"
              }
            }
          }
        })
      }

      // Set text events
      var texts = div.querySelectorAll('input[type=text]')
      for (var j = 0; j < texts.length; j++) {
        texts[j].addEventListener('change', function () {
          setValueAll(this, 'text')
        })
      }
      who_option.parentNode.appendChild(div)

      // Set who value
      if (who_sel) {
        var sel_options = document.querySelector('.who-options.'+whoS[i])
        for (var key in who_sel[whoS[i]]) {
          if (key != 'proj') {
            var value = sel_options.querySelector('.who_'+key+'_s')
            switch (typeof(who_sel[whoS[i]][key])) {
              case 'boolean':
                value.checked = who_sel[whoS[i]][key]
                setValueAll(value, 'checkbox')
              break

              case 'string':
                value.value = who_sel[whoS[i]][key]
                setValueAll(value, 'text')
              break
            }
          }
        }
      }
    }
  }
  if (who_ptr && who_ptr.length == 1) {
    document.querySelector('.who-options.'+who_ptr[0]).classList.add('active')
    document.querySelector('#whoS_s').value = who_ptr[0]
  }
  else {
    who_option.classList.add('active')
  }
}

// Find project list and create selection
function findProj_s (proj_sel = false) {
  var project = document.querySelector('#project_s'),
      propts = project.querySelectorAll('optgroup')

  var proj = findHeader(sch.project)
  for (var i = 0; i < propts.length; i++) {
    project.removeChild(propts[i])
  }

  var types = {}
  for (var i = 0; i < proj.length; i++) {
    var value = sch.project[proj[i]]
    if (types[value.type] == undefined) {
      types[value.type] = []
    }
    types[value.type].push(value.name)
  }

  for (var type in types) {
    var optgroup = document.createElement('optgroup');
    optgroup.label = type
    for (var i = 0; i < types[type].length; i++) {
      var option = document.createElement('option')
      option.text = types[type][i]
      optgroup.appendChild(option)
    }
    project.add(optgroup)
  }
  if (proj_sel && proj_sel != "Aucun" && !/^#/gi.test(proj_sel)) {
    project.value = sch.project[proj_sel].name
  }
}

// Find details of project select in the schedule and create list
function findProjDet_s () {
  var project_details_obj = document.querySelector('#project_details_s'),
      propts = project_details_obj.querySelectorAll('option')
  var project = findProjectID(document.querySelector('#project_s').value)
  var list = [], pos = []

  if (project) {
    var dateF_obj = document.querySelector('#dateFrom_s').value,
        dateT_obj = document.querySelector('#dateTo_s').value

    var dateFrom = convStr_Date(dateF_obj)
    var dateTo = convStr_Date(dateT_obj)

    var NbrM = (dateTo.getMonth() - dateFrom.getMonth()) + 1
    var monthN = findMonthN(NbrM, dateFrom)

    for(var i = 0; i < monthN.length; i++) {
      var proj = findProject(sch.months[monthN[i]])
      for(var j = 0; j < proj.length; j++) {

        if (i == 0) {
          pos[0] = dateFrom.getUTCDate() - 1
        }
        else {
          pos[0] = 0
        }

        if (i == (monthN.length - 1)) {
          pos[1] = dateTo.getUTCDate() - 1
        }
        else {
          pos[1] = sch.months[monthN[i]]["_Week"].length - 1
        }

        for(var k = pos[0]; k <= pos[1]; k++) {
          try { var projCell = sch.months[monthN[i]][proj[j]][k][3] }
          catch(err) { var projCell = "" }
          try { var detCell = sch.months[monthN[i]][proj[j]][k][1] }
          catch(err) { var detCell = "" }

          if (projCell == project && projCell != "") {
            var exist = false
            for(var l = 0; l < list.length; l++) {
              if (detCell == list[l]) {
                exist = true
              }
            }
            if (!exist && detCell != "") {
              list[list.length] = detCell
            }
          }
        }
      }
    }
  }

  for (var i = 0; i < propts.length; i++) {
    project_details_obj.removeChild(propts[i])
  }
  for (var i = 0; i < list.length; i++) {
    var option = document.createElement('option')
    option.value = list[i]
    project_details_obj.appendChild(option)
  }
}

// Find team and create selection
function findAttr_s (date, clear = true, who_sel = false) {
  var who = document.querySelector('#checkboxes')
  var whoSel_obj = document.querySelector('#selectBoxes'),
      whopts = whoSel_obj.querySelectorAll('option')
  var whoS = findHeader(sch.months[getMonth(date)])
  var count = 0

  // Save exists checkbox checked
  var who_sc = {}
  var who_s = who.querySelectorAll('input[type=checkbox].who_s')
  for (var i = 0; i < who_s.length; i++) {
    who_sc[who_s[i].value] = {}
    who_sc[who_s[i].value].proj = false
    if (who_s[i].checked) {
      who_sc[who_s[i].value].proj = true
    }
  }

  who.innerHTML = ""
  who.style.display = "none"

  var label = document.createElement('label')
  var input = document.createElement('input')
  input.type = 'checkbox'
  input.className = 'all_s'

  label.appendChild(input)
  label.innerHTML += 'Tout'
  who.appendChild(label)

  for (var i = 0; i < whoS.length; i++) {
    if (whoS[i][0] != '_') {
      var label = document.createElement('label')
      var input = document.createElement('input')

      input.setAttribute('type', 'checkbox')
      input.className = 'who_s'
      input.value = whoS[i]

      label.appendChild(input)
      label.innerHTML += whoS[i]
      who.appendChild(label)
    }
  }

  if (who_sel || !clear) {
    var who_val = (who_sel) ? who_sel : who_sc
    var header = findHeader(who_val)
    for (var i = 0; i < header.length; i++) {
      var checkbox = document.querySelector('input[value='+header[i]+'].who_s')
      if (checkbox) {
        checkbox.checked = who_val[header[i]].proj
      }
      if (who_val[header[i]].proj) {
        count++
      }
    }
    if (count >= header.length && header.length == whoS.length) {
      document.querySelector('.all_s').checked = true
    }
  }
  whopts[0].text = "Attr(" + count + ")"
}

// Check and send new task
var check_s = document.querySelector('#check_s')
check_s.addEventListener('click', function (e) {
  e.preventDefault()

  var dateF = document.querySelector('#dateFrom_s').value,
      dateT = document.querySelector('#dateTo_s').value
  var projectS = document.querySelector('#project_s').value
  var proj = findProjectID(projectS)

  var who_obj = document.querySelectorAll('.who_s')
  var attr = []

  for (var i = 0; i < who_obj.length; i++) {
    if (who_obj[i].checked) {
      attr.push(who_obj[i].value)
    }
  }

  var persons = {}
  var who_options = document.querySelectorAll('.who-options')
  var who_team = who_options[0].parentNode.querySelectorAll('#whoS_s option')
  for (var i = 0; i < who_options.length; i++) {
    var person = who_team[i].innerHTML
    if (person != "Tout") {
      // person = { del, det, proj, back }
      persons[person] = {}
      persons[person].del = false
      persons[person].det = ""
      persons[person].back = ""
      persons[person].proj = ""

      if (attr.indexOf(person) >= 0) {
        persons[person].proj = proj
      }

      var checkboxes = who_options[i].querySelectorAll('input[type=checkbox]')
      for (var j = 0; j < checkboxes.length; j++) {
        var name = checkboxes[j].className.split('_')[1]

        if (name == "del") {
          persons[person].del = checkboxes[j].checked
        } else if (name == "indisp" && checkboxes[j].checked) {
          persons[person].proj = "#000000"
        } else if (name == "depl" && checkboxes[j].checked) {
          persons[person].back = "mesh"
        } else if (name == "temp" && checkboxes[j].checked) {
          persons[person].back = "cross"
        }
      }

      var tests = who_options[i].querySelectorAll('input[type=text]')
      for (var j = 0; j < tests.length; j++) {
        var name = tests[j].className.split('_')[1]

        if (name == "det") {
          persons[person].det = tests[j].value
        }
      }
    }
  }

  var checkboxes = {}
  var pjt_checkboxes = document.querySelectorAll('.pjt_checkboxes_s input[type=checkbox]')
  for (var i = 0; i < pjt_checkboxes.length; i++) {
    var name = pjt_checkboxes[i].className.split('_')[1]
    checkboxes[name] = pjt_checkboxes[i].checked
  }

  var dateFrom = convStr_Date(dateF)
  var dateTo = convStr_Date(dateT)
  //console.log(dateFrom)
  //console.log(dateTo)
  var project_det = document.querySelector("input[name='project_details_s']").value
  //var project = [proj, checkboxes, project_det]

  if (dateFrom > dateTo || dateF == "" || dateT == "") {
    window.alert("Les dates sont incohérentes !")
    return -1
  }
  if (projectS != "Aucun" && !checkboxes.del && project_det == "") {
    window.alert("Veuillez choisir un détails pour le projet")
    return -1
  }

  var modal_modif = document.querySelector('#modal_modif_s')
  var clickTask = modal_modif.clickTask
  modal_modif.style.display = "none"

  if (clickTask) {
    if (/^#/.test(clickTask.project[0])) {
      clickTask.project[0] = "Aucun"
    }
    if (clickTask.project[0] != "Aucun" && clickTask.team_ptr.length == clickTask.team_ptrAll.length) {
      clickTask.project[1].del = true
    }
    for (var key in clickTask.who) {
      if (clickTask.team_ptr.indexOf(key) > -1) {
        clickTask.who[key].del = true
      }
    }
    delete clickTask.team_ptr
    delete clickTask.team_ptrAll
  }

  var task = { clickTask: clickTask, newTask: { monthFrom: getMonth(dateFrom), dayFrom: dateFrom.getDate(), monthTo: getMonth(dateTo), dayTo: dateTo.getDate(), persons: persons } }
  console.log(task)
  socket.emit('newTasks', JSON.stringify(task))
})

// Show checkboxes (Multiselect with checkbox)
var expanded = false
function showCheckboxes () {
  var checkboxes = document.querySelector('#checkboxes')
  if (!expanded) {
    checkboxes.style.display = "block"
    expanded = true
  } else {
    checkboxes.style.display = "none"
    expanded = false
  }
}

/* -------------------- SCHEDULE CELLS FUNCTION -------------------- */
// Find cell limit of a task on schedule
function findCellLimits (table, month, column, row) {
  var header = findHeader(table)
  var currentValue = table[header[column]][row]
  var project = false, projectTemp = false
  var projectDet = ""

  if (/_Project/gi.test(header[column])) {
    project = currentValue[3]
    projectTemp = (currentValue[4]) ? true : false
    projectDet = currentValue[1]
  }

  // Find start cell on schedule
  var startCell = {}
  var month_s = month
  var table_s = table
  var header_s = header

  if (project && (!currentValue[3] || currentValue[3] == "") || (!project && (!currentValue[1] || currentValue[1] == "") && (!currentValue[2] || currentValue[2] == "") && (!currentValue[3] || currentValue[3] == "") && (!currentValue[4] || currentValue[4] == ""))) {
    startCell.month = month_s
    startCell.column = column
    startCell.row = row
    startCell.day = Schedule[startCell.month][header[1]][startCell.row][1]
    startCell.date = copyOfDate(retrieveDate(startCell.month), true, 0, 0, startCell.day)
    return { project: { id: null, det: null, temp: null }, startCell: startCell, endCell: startCell }
  }

  for (var i = row-1; i >= -1; i--) {
    var previousValue = table_s[header_s[column]][i]
    if (!previousValue) {
      try {
        month_s = incMonthHeader(month_s, -1)
        table_s = Schedule[month_s]
        header_s = findHeader(table_s)
        i = table_s[header_s[column]].length-1
        previousValue = table_s[header_s[column]][i]

        if (previousValue[3] == undefined) {
          month_s = incMonthHeader(month_s, 1)
          startCell.month = month_s
          startCell.column = column
          startCell.row = 0
          console.log("start undefined: " + startCell.row);
          break
        }
      }
      catch(err) {
        month_s = incMonthHeader(month_s, 1)
        startCell.month = month_s
        startCell.column = column
        startCell.row = i+1
        break
      }
    }

    if (previousValue[3] != currentValue[3] || previousValue[1] != currentValue[1] || (!project && previousValue[2] != currentValue[2])) {
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
        month_e = incMonthHeader(month_e, 1)
        table_e = Schedule[month_e]
        header_e = findHeader(table_e)
        i = 0
        nextValue = table_e[header_e[column]][i]

        if (nextValue[3] == undefined) {
          month_e = incMonthHeader(month_e, -1)
          table_e = Schedule[month_e]
          header_e = findHeader(table_e)
          endCell.month = month_e
          endCell.column = column
          endCell.row = table_e[header_e[column]].length-1
          console.log("undefined: " + endCell.row)
          break
        }
      }
      catch(err) {
        month_e = incMonthHeader(month_e, -1)
        table_e = Schedule[month_e]
        header_e = findHeader(table_e)
        endCell.month = month_e
        endCell.column = column
        endCell.row = table_e[header_e[column]].length-1
        break
      }
    }

    if (nextValue[3] != currentValue[3] || nextValue[1] != currentValue[1] || (!project && nextValue[2] != currentValue[2])) {
      endCell.month = month_e
      endCell.column = column
      endCell.row = i-1
      break
    }
  }

  startCell.day = Schedule[startCell.month][header[1]][startCell.row][1]
  startCell.date = copyOfDate(retrieveDate(startCell.month), true, 0, 0, startCell.day)

  endCell.day = Schedule[endCell.month][header[1]][endCell.row][1]
  endCell.date = copyOfDate(retrieveDate(endCell.month), true, 0, 0, endCell.day)

  return { project: { id: project, det: projectDet, temp: projectTemp }, startCell: startCell, endCell: endCell }
}

// Find users link to project
function usersOfProject (monthID, NbrM, start_row, end_row, project) {
  var team_pjt = []
  for (var i = 0; i < NbrM; i++) {
    var month = incMonthHeader(monthID, i)
    var table = Schedule[month]
    var header = findHeader(table)
    var row_start = (i > 0) ? 0 : start_row,
        row_end = (i < NbrM-1) ? table[header[0]].length-1 : end_row

    for (var j = row_start; j <= row_end; j++) {
      var team = findTeam(table)
      for (var k = 0; k < team.length; k++) {
        if (table[team[k]][j][3] == project && team_pjt.indexOf(team[k]) === -1) {
          team_pjt.push(team[k])
        }
      }
    }
  }
  return team_pjt
}

// Find task on schedule
function findTask (month, column, row) {
  var table = Schedule[month]
  var team = findTeam(table)

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
        var header = findHeader(table)
        var header_pjt = findProject(table)
        var currentValue = table[header[column]][row]

        limits.project.id = (currentValue[3] && currentValue[3] != "" && !/^#/gi.test(currentValue[3])) ? currentValue[3] : "Aucun"
        limits.project.temp = false
        limits.project.det = ""

        if (limits.project.id != "Aucun") {
          for (var j = 0; j < header_pjt.length; j++) {
            currentValue = table[header_pjt[j]][row]
            if (currentValue[3] == limits.project.id) {
              limits.project.temp = (currentValue[4] == "mesh") ? true : false
              limits.project.det = currentValue[1]
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
        who[team[i]]['depl'] = ((team_pjt.indexOf(team[i]) > -1) && currentValue[4] == "cross") ? true : false
        who[team[i]]['details'] = (team_pjt.indexOf(team[i]) > -1) ? currentValue[1] : ""
        who[team[i]]['indisp'] = ((team_pjt.indexOf(team[i]) > -1) && testIndisp(currentValue[3])) ? true : false
        who[team[i]]['temp'] = ((team_pjt.indexOf(team[i]) > -1) && currentValue[4] == "mesh") ? true : false
        who[team[i]]['proj'] = (limits.project.id != "Aucun" && team_pjt.indexOf(team[i]) > -1) ? true : false
      }

      // Project | proj = [proj, { del, temp }, project_det]
      var project = [limits.project.id, { del: false, temp: limits.project.temp }, limits.project.det]
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
  var task = findTask(getMonthHeader(month), column, row-1)
  if (task) {
    console.log(task)
    openSchModal(false, task)
  }
  else {
    console.log("Empty cell")
    openSchModal()
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
