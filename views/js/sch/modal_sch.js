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

// Modal schedules class
class Modal_sch {
  // Constructor
  constructor() {
    this.persons = new Object()
    this.project = new Object()
    //this.clickTask = new Object()
    this.init(['Tout'], null, null)
  }

  init(persons, who, proj) {
    for (var i = 0; i < persons.length; i++) {
      this.persons[persons[i]] = {
        del: false,
        temp: false,
        depl: false,
        indisp: false,
        det: "",
        proj: false
      }
    }
    for (var name in who) {
      this.persons[name] = Object.assign({}, who[name])
    }
    this.project = (proj) ? proj : {
      del: false,
      temp: false,
      det: ""
    }
  }
  resetPerson_check(name) {
    for (var ref in this.persons[name]) {
      if (typeof this.persons[name][ref] == 'boolean') {
        this.persons[name][ref] = false
      }
    }
  }
  resetProject_check() {
    for (var ref in this.project) {
      if (typeof this.project[ref] == 'boolean') {
        this.project[ref] = false
      }
    }
  }
  setPerson(name, vals) {
    for (var ref in vals) {
      if (vals[ref] !== null || vals[ref] !== undefined) {
        if (name == "Tout") {
          for (var name in this.persons) {
            this.resetPerson_check(name)
            this.persons[name][ref] = vals[ref]
          }
        } else {
          this.resetPerson_check(name)
          this.persons[name][ref] = vals[ref]

          if (typeof this.persons["Tout"][ref] == 'boolean') {
            this.persons["Tout"][ref] = false
          } else {
            this.persons["Tout"][ref] = ""
          }

          var equal = true
          for (var name in this.persons) {
            if (name != "Tout") {
              if (this.persons[name][ref] != vals[ref]) {
                equal = false
              }
            }
          }
          if (equal) {
            this.persons["Tout"][ref] = vals[ref]
          }
        }
      }
    }
  }
  setProject(vals) {
    for (var ref in vals) {
      if (vals[ref] !== null || vals[ref] !== undefined) {
        this.resetProject_check()
        this.project[ref] = vals[ref]
      }
    }
  }
  setClickTask() {
    if (/^#/.test(this.clickTask.project[0])) {
      this.clickTask.project[0] = "Aucun"
    }
    if (this.clickTask.project[0] != "Aucun" && this.clickTask.team_ptr.length == this.clickTask.team_ptrAll.length) {
      this.clickTask.project[1].del = true
    }
    for (var key in this.clickTask.who) {
      if (this.clickTask.team_ptr.indexOf(key) > -1) {
        this.clickTask.who[key].del = true
      } else {
        delete this.clickTask.who[key]
      }
    }
    return this.clickTask.project[2]
  }
}
var mod_sch = new Modal_sch()


/* -------------------- SCHEDULE MODAL -------------------- */
// When the user clicks on the <button> (btn_modif_s), open the schedule modal
var btn_s = document.querySelector('#btn_modif_s')
btn_s.addEventListener('click', function() {
  openSchModal(null, null)
})

// When the user clicks on the <checkboxes> (.pjt_checkboxes_s), set checkboxes value
var pjt_checkboxes = document.querySelectorAll('.pjt_checkboxes_s input[type=checkbox]')
for (var i = 0; i < pjt_checkboxes.length; i++) {
  pjt_checkboxes[i].addEventListener('change', function () {
    var val = {}
    val[this.classList.value.split('_')[1]] = this.checked
    mod_sch.setProject(val)
    update_proj_check ()
  })
}

// When the user enter text on the <texts> (.pjt_checkboxes_s), set texts value
var pjt_texts = document.querySelectorAll('.pjt_texts_s input[type=text]')
for (var i = 0; i < pjt_texts.length; i++) {
  pjt_texts[i].addEventListener('change', function () {
    var val = {}
    val[this.classList.value.split('_')[1]] = this.value
    mod_sch.setProject(val)
    update_proj_text ()
  })
}

// Select who in function of who selection
var whoS_s = document.querySelector('#whoS_s')
whoS_s.addEventListener('change', function (e) {
  var select = this
  update_who_check (select.value)
  update_who_text (select.value)
  del_col(document.querySelector('.who-options input[type=checkbox].who_del_s'))
})

// When the user clicks on the <checkboxes> (.who-options), set checkboxes value
var who_check = document.querySelectorAll('.who-options input[type=checkbox]')
for (var i = 0; i < who_check.length; i++) {
  who_check[i].addEventListener('change', function (e) {
    var val = {}
    val[this.classList.value.split('_')[1]] = this.checked
    mod_sch.setPerson(document.querySelector('#whoS_s').value, val)
    update_who_check (document.querySelector('#whoS_s').value)
  })
}

// When the user enter text on the <texts> (.who-options), set texts value
var who_text = document.querySelectorAll('.who-options input[type=text]')
for (var i = 0; i < who_text.length; i++) {
  who_text[i].addEventListener('change', function (e) {
    var val = {}
    val[this.classList.value.split('_')[1]] = this.value
    mod_sch.setPerson(document.querySelector('#whoS_s').value, val)
    update_who_text (document.querySelector('#whoS_s').value)
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
// Update project checkboxes value from modal_sch
function update_proj_check () {
  var who_check = document.querySelectorAll('.pjt_checkboxes_s input[type=checkbox]')
  for (var i = 0; i < who_check.length; i++) {
    var ref = who_check[i].classList.value.split('_')[1]
    who_check[i].checked = mod_sch.project[ref]
  }
}
// Update project texts value from modal_sch
function update_proj_text () {
  var who_text = document.querySelectorAll('.pjt_texts_s input[type=text]')
  for (var i = 0; i < who_text.length; i++) {
    var ref = who_text[i].classList.value.split('_')[1]
    who_text[i].value = mod_sch.project[ref]
  }
}

// Manage who del-col display
function del_col (del) {
  var parent = del.parentNode.parentNode.parentNode.parentNode
  var del_cols = parent.querySelectorAll('.del-col')
  for (var k = 0; k < del_cols.length; k++) {
    del_cols[k].style.display = "block"
    if (del.checked) {
      del_cols[k].style.display = "none"
    }
  }
}
// Update who checkboxes value from modal_sch
function update_who_check (name) {
  var who_check = document.querySelectorAll('.who-options input[type=checkbox]')
  for (var i = 0; i < who_check.length; i++) {
    var ref = who_check[i].classList.value.split('_')[1]
    who_check[i].checked = mod_sch.persons[name][ref]
  }
}
// Update who texts value from modal_sch
function update_who_text (name) {
  var who_text = document.querySelectorAll('.who-options input[type=text]')
  for (var i = 0; i < who_text.length; i++) {
    var ref = who_text[i].classList.value.split('_')[1]
    who_text[i].value = mod_sch.persons[name][ref]
  }
}

// Define who value
function whoDefine (date, mod, persons, proj, who_ptr) {
  var who = document.querySelector('#whoS_s')
  var whoS = Sch.findHeader(Sch.months[Sch.getMonth(date)])
  var team = ['Tout']

  for (var i = 0; i < whoS.length; i++) {
    if (whoS[i][0] != '_') {
      team.push(whoS[i])
    }
  }
  who.innerHTML = ""
  for (var i = 0; i < team.length; i++) {
    var option = document.createElement('option')
    option.innerHTML = team[i]
    who.appendChild(option)
  }
  mod_sch.init(team, persons, proj)

  if (who_ptr && who_ptr.length == 1) {
    document.querySelector('#whoS_s').value = who_ptr[0]
  }

  update_who_check (document.querySelector('#whoS_s').value)
  update_who_text (document.querySelector('#whoS_s').value)
  update_proj_check ()
  update_proj_text ()
}

// Set minimum date of dateTo input
function setDateTo_s (date, modal) {
  var dateTo = document.querySelector('#dateTo_s')
  dateTo.min = date
  date_picker_s()
}

// Find project list and create selection
function findProj_s (proj_sel) {
  var project = document.querySelector('#project_s'),
      propts = project.querySelectorAll('optgroup')

  var proj = Sch.findHeader(Sch.project)
  for (var i = 0; i < propts.length; i++) {
    project.removeChild(propts[i])
  }

  var types = {}
  for (var i = 0; i < proj.length; i++) {
    var value = Sch.project[proj[i]]
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
    project.value = Sch.project[proj_sel].name
  }
}

// Find details of project select in the schedule and create list
function findProjDet_s () {
  var project_det_obj = document.querySelector('#project_det_s'),
      propts = project_det_obj.querySelectorAll('option')
  var project = Sch.findProjectID(document.querySelector('#project_s').value)
  var list = [], pos = []

  if (project) {
    var dateF_obj = document.querySelector('#dateFrom_s').value,
        dateT_obj = document.querySelector('#dateTo_s').value

    var dateFrom = new Date(dateF_obj)
    var dateTo = new Date(dateT_obj)

    var NbrM = (dateTo.getMonth() - dateFrom.getMonth()) + 1
    var monthN = Sch.findMonthN(dateFrom, NbrM)

    for(var i = 0; i < monthN.length; i++) {
      var proj = Sch.findProject(Sch.months[monthN[i]])
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
          pos[1] = Sch.months[monthN[i]]["_Week"].length - 1
        }

        for(var k = pos[0]; k <= pos[1]; k++) {
          try { var projCell = Sch.months[monthN[i]][proj[j]][k][2] }
          catch(err) { var projCell = "" }
          try { var detCell = Sch.months[monthN[i]][proj[j]][k][0] }
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
    project_det_obj.removeChild(propts[i])
  }
  for (var i = 0; i < list.length; i++) {
    var option = document.createElement('option')
    option.value = list[i]
    project_det_obj.appendChild(option)
  }
}

// Find team and create selection
function findAttr_s (date, who_sel, clear) {
  var who = document.querySelector('#checkboxes')
  var whoSel_obj = document.querySelector('#selectBoxes'),
      whopts = whoSel_obj.querySelectorAll('option')
  var whoS = Sch.findHeader(Sch.months[Sch.getMonth(date)])
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
    var header = Sch.findHeader(who_val)
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

// Open schedule modal
function openSchModal (mod, task) {
  var modal_modif = document.querySelector('#modal_modif_s')
  modal_modif.style.display = "block"
  mod_sch.clickTask = task

  var dateFrom = document.querySelector('#dateFrom_s'),
      dateTo = document.querySelector('#dateTo_s')
  var altFrom = document.querySelector('#altFrom_s'),
      altTo = document.querySelector('#altTo_s')

  if (task) {
    findProj_s(task.project[0])
    findAttr_s(new Date(task.dateFrom), Object.assign({}, task.who), true)
    whoDefine (new Date(task.dateFrom), mod, Object.assign({}, task.who), Object.assign({}, task.project[1]), task.team_ptr)
  }
  else {
    findProj_s(false)
    findAttr_s(Sch.start, false, true)
    whoDefine (Sch.start, mod, null, null, null)
  }

  var date_min = new Date(Sch.start)
  date_min.setDate(1)
  var date_max = new Date(Sch.end)
  date_max.setMonth(date_max.getMonth()+1)
  date_max.setDate(0)

  //console.log(Sch.start)
  //console.log(Sch.end)
  dateFrom.min = date_min
  dateFrom.max = date_max
  dateTo.min = date_min
  dateTo.max = date_max
  // min="2018-02-01" max="2019-01-31"
  date_picker_s()
  altFrom.value = (task) ? (pad(task.dateFrom.getDate()) + ' ' + monthNames[task.dateFrom.getMonth()].slice(0,3) + ' ' + task.dateFrom.getFullYear()) : ""
  dateFrom.value = (task) ? task.dateFrom.Ymd() : ""
  if (dateFrom.value && dateFrom.value != "") {
    setDateTo_s(dateFrom.value)
  }
  altTo.value = (task) ? (pad(task.dateTo.getDate()) + ' ' + monthNames[task.dateTo.getMonth()].slice(0,3) + ' ' + task.dateTo.getFullYear()) : ""
  dateTo.value = (task) ? task.dateTo.Ymd() : ""
}

// Convert persons to server format
function convPersons (project_name, attr, proj, project_ref, persons_ref) {
  // person = { del, det, proj, back }
  var persons = {}
  //console.log(attr)

  var project = project_ref
  if (proj && proj != "Aucun" || (!project.del && project.det && project.det != "")) {
    persons[project_name] = {
      del: project.del,
      det: project.det,
      back: (project.temp) ? "mesh" : "",
      proj: proj ? proj : ""
    }
  }

  for (var name in persons_ref) {
    if (name != "Tout") {
      // person = { del, det, proj, back }
      var person = persons_ref[name]
      persons[name] = {
        del: false,
        det: "",
        back: "",
        proj: ""
      }

      if (attr.indexOf(name) >= 0) {
        persons[name].proj = proj
      }

      for (var ref in person) {
        if (ref == "del") {
          persons[name].del = (person[ref]) ? true : false
        } else if (ref == "indisp" && person[ref]) {
          persons[name].proj = "#000000"
        } else if (ref == "depl" && person[ref]) {
          persons[name].back = "cross"
        } else if (ref == "temp" && person[ref]) {
          persons[name].back = "mesh"
        } else if (ref == "det") {
          persons[name].det = (person[ref] != undefined) ? person[ref] : ""
        }
      }

      if (persons[name].del == false && persons[name].det == "" && persons[name].back == "" && persons[name].proj == "") {
        delete persons[name]
      }
    }
  }
  return persons
}

// Check and send new task
var check_s = document.querySelector('#check_s')
check_s.addEventListener('click', function (e) {
  e.preventDefault()

  var dateF = document.querySelector('#dateFrom_s').value,
      dateT = document.querySelector('#dateTo_s').value
  var projectS = document.querySelector('#project_s').value
  var proj = Sch.findProjectID(projectS)

  var who_obj = document.querySelectorAll('.who_s')
  var attr = []

  for (var i = 0; i < who_obj.length; i++) {
    if (who_obj[i].checked) {
      attr.push(who_obj[i].value)
    }
  }

  var project_name = '_Project'
  var clickTask = mod_sch.clickTask
  if (clickTask) {
    project_name = mod_sch.setClickTask()
    var clickTask_persons = convPersons(project_name, clickTask.team_ptr, clickTask.project[0], clickTask.project[1], clickTask.who)
    clickTask = { monthFrom: Sch.getMonth(clickTask.dateFrom), dayFrom: clickTask.dateFrom.getDate(), monthTo: Sch.getMonth(clickTask.dateTo), dayTo: clickTask.dateTo.getDate(), persons: clickTask_persons }
  }
  var persons = convPersons(project_name, attr, proj, mod_sch.project, mod_sch.persons)

  var dateFrom = new Date(dateF)
  var dateTo = new Date(dateT)

  var project_det = document.querySelector("input[name='project_det_s']").value

  if (dateFrom > dateTo || dateF == "" || dateT == "") {
    window.alert("Les dates sont incohérentes !")
    return -1
  }
  if (projectS != "Aucun" && !mod_sch.project.del && mod_sch.project.det == "") {
    window.alert("Veuillez choisir un détails pour le projet")
    return -1
  }

  var modal_modif = document.querySelector('#modal_modif_s')
  modal_modif.style.display = "none"

  var task = { clickTask: clickTask, newTask: { monthFrom: Sch.getMonth(dateFrom), dayFrom: dateFrom.getDate(), monthTo: Sch.getMonth(dateTo), dayTo: dateTo.getDate(), persons: persons } }
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
