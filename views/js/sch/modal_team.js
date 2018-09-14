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


/* -------------------- TEAM MODAL -------------------- */
// When the user clicks on the <button> (btn_modif_t), open the team modal
var btn_t = document.querySelector('#btn_modif_t')
btn_t.addEventListener('click', function () {
  console.log(Sch)
  document.querySelector('#modal_modif_t').style.display = "block"
  var date = document.querySelector('#date_t')
  var alt = document.querySelector('#alt_t')
  var who_obj = document.querySelector("input[name='who_t']")

  who_obj.value = ""

  var date_min = new Date(Sch.start)
  date_min.setDate(1)
  var date_max = new Date(Sch.end)
  date_max.setMonth(date_max.getMonth()+1)
  date_max.setDate(0)

  date.min = date_min
  date.max = date_max
  //min="2018-02-01" max="2019-01-31"
  date_picker_t()
  alt.value = ""
  date.value = ""

  findWho_t(Sch.start_month)
})

// When the user clicks on <span> (x), close the team modal
var span_t = document.querySelector('.close_t')
span_t.addEventListener('click', function () {
  document.querySelector('#modal_modif_t').style.display = "none"
})

// When the user clicks on <button> (check_t_del), delete a user
var check_t_del = document.querySelector('#check_t_del')
check_t_del.addEventListener('click', function (e) {
  e.preventDefault()
  check_t(true)
})

// When the user clicks on <button> (check_t_add), add a new user
var check_t_add = document.querySelector('#check_t_add')
check_t_add.addEventListener('click', function (e) {
  e.preventDefault()
  check_t(false)
})


/* -------------------- FUNCTION -------------------- */
// Find team in the schedule and create list
function findWho_t (monthFrom) {
  var who_obj = document.querySelector('#who_t'),
      whopts = who_obj.querySelectorAll('option')
  var whoS = Sch.findHeader(Sch.months[monthFrom])

  for (var i = 0; i < whopts.length; i++) {
    who_obj.removeChild(whopts[i])
  }

  for (var i = 0; i < whoS.length; i++) {
    if (!/^_/gi.test(whoS[i])) {
      var option = document.createElement('option')
      option.value = whoS[i]
      who_obj.appendChild(option)
    }
  }
}

// Check and send team
function check_t (del) {
  var monthFrom = Sch.getMonth(new Date(document.querySelector('#date_t').value))
  var person = document.querySelector("input[name='who_t']").value
  var task = { monthFrom: monthFrom, monthTo: Sch.request.month_to, person: person }

  if (!monthFrom) {
    window.alert("Veuillez choisir une date !")
    return -1
  }
  if (person == "") {
    window.alert("Aucune personne selectionnée !")
    return -1
  }

  if (del) {
    var confirmation = confirm("Êtes-vous sûr de vouloir supprimer " + person + " ?")
    if (confirmation) {
      document.querySelector('#modal_modif_t').style.display = "none"
      socket.emit('delPerson', JSON.stringify(task))
    }
  }
  else {
    var confirmation = confirm("Êtes-vous sûr de vouloir ajouter " + person + " ?")
    if (confirmation) {
      document.querySelector('#modal_modif_t').style.display = "none"
      socket.emit('newPerson', JSON.stringify(task))
    }
  }
}
