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
  document.querySelector('#modal_modif_t').style.display = "block"
  var date = document.querySelector('#date_t')
  var alt = document.querySelector('#alt_t')
  var who_obj = document.querySelector("input[name='who_t']")

  who_obj.value = ""

  date.min = Sch_start
  date.max = Sch_end
  //min="2018-02-01" max="2019-01-31"
  date_picker_t()
  alt.value = ""
  date.value = ""
  findWho_t(convStr_Date(Sch_start))
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
function findWho_t (date) {
  var who_obj = document.querySelector('#who_t'),
      whopts = who_obj.querySelectorAll('option')
  var whoS = findHeader(Schedule[getMonthN(date)])

  for (var i = 0; i < whopts.length; i++) {
    who_obj.removeChild(whopts[i])
  }

  for (var i = 0; i < whoS.length; i++) {
    if (whoS[i][0] != '_') {
      var option = document.createElement('option')
      option.value = whoS[i]
      who_obj.appendChild(option)
    }
  }
}

// Check and send team
function check_t (del) {
  var date_obj = document.querySelector('#date_t').value
  var date = convStr_Date(date_obj)
  var who = document.querySelector("input[name='who_t']").value
  var task = { 'date': date, 'who': who }

  if (date_obj == "") {
    window.alert("Veuillez choisir une date !")
    return -1
  }
  if (who == "") {
    window.alert("Aucune personne selectionnée !")
    return -1
  }

  if (del) {
    var confirmation = confirm("Êtes-vous sûr de vouloir supprimer " + who + " ?")
    if (confirmation) {
      document.querySelector('#modal_modif_t').style.display = "none"
      socket.emit('delWho', JSON.stringify(task))
    }
  }
  else {
    var confirmation = confirm("Êtes-vous sûr de vouloir ajouter " + who + " ?")
    if (confirmation) {
      document.querySelector('#modal_modif_t').style.display = "none"
      socket.emit('newWho', JSON.stringify(task))
    }
  }
}
