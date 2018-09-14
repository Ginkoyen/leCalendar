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


/* -------------------- ARCHIVES MODAL -------------------- */
// When the user clicks on the <button> (btn_archive_s), open the archives modal
var btn_a = document.querySelector('#btn_archive_s')
btn_a.addEventListener('click', function () {
  document.querySelector('#modal_archive_s').style.display = "block"
  var dateFrom = document.querySelector('#dateFrom_a'),
      dateTo = document.querySelector('#dateTo_a')
  var altFrom = document.querySelector('#altFrom_a'),
      altTo = document.querySelector('#altTo_a')

  var date_min = new Date(Sch.first_date)
  date_min.setDate(1)
  var date_max = new Date(Sch.last_date)
  date_max.setMonth(date_max.getMonth()+1)
  date_max.setDate(0)

  dateFrom.min = date_min
  dateFrom.max = date_max
  dateTo.min = date_min
  dateTo.max = date_max
  // min="2018-02-01" max="2019-01-31"
  date_picker_a()
  altFrom.value = ""
  dateFrom.value = ""
  altTo.value = ""
  dateTo.value = ""
})

// When the user clicks on <span> (x), close the archives modal
var span_a = document.querySelector('.close_a')
span_a.addEventListener('click', function () {
  document.querySelector('#modal_archive_s').style.display = "none"
})

// When the user clicks on <button> (check_a_mod), open archives
var check_a_mod = document.querySelector('#check_archive_s')
check_a_mod.addEventListener('click', function (e) {
  e.preventDefault()
  check_a(false)
})


/* -------------------- FUNCTION -------------------- */
// Set minimum date of dateTo input
function setDateTo_a (date, modal) {
  var dateTo = document.querySelector('#dateTo_a')
  dateTo.min = date
  date_picker_a()
}

// Open archives
function check_a () {
  var dateFrom = document.querySelector('#dateFrom_a').value,
      dateTo = document.querySelector('#dateTo_a').value
  var monthFrom = Sch.getMonth(new Date(dateFrom)),
      monthTo = Sch.getMonth(new Date(dateTo))

  if (monthFrom > monthTo || dateFrom == "" || dateTo == "") {
    window.alert("Les dates sont incohérentes !")
    return -1
  }

  Sch.months = new Object()
  Sch.updateDateMonth(monthFrom, monthTo, false)
  document.querySelector('#modal_archive_s').style.display = "none"
  console.log(Sch.request)
  socket.emit('getSch', Sch.request.month_from, Sch.request.month_to)
}
