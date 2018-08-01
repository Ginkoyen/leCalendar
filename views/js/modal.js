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


(function () {
  /* -------------------- EVENTS CLICK AND CLOSE MODALS -------------------- */
  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function (e) {
    if (!document.querySelector('.multiselect').contains(e.target)){
      document.querySelector('#checkboxes').style.display = "none"
    }

    var whoSel_obj = document.querySelector('#selectBoxes'),
        whopts = whoSel_obj.querySelectorAll('option')
    var who_obj = document.querySelectorAll('.who_s')
    var all_obj = document.querySelectorAll('.all_s')
    var who_tab = [], count = 0

    if (all_obj.length > 0) {
      if (all_obj[0].contains(e.target)){
        for (var i = 0; i < who_obj.length; i++) {
          if (all_obj[0].checked) {
            who_obj[i].checked = true
          }
          else {
            who_obj[i].checked = false
          }
        }
      }

      for (var i = 0; i < who_obj.length; i++) {
        if (who_obj[i].checked) {
          count++
        }
      }
      whopts[0].text = "Attr(" + count + ")"

      if (count < who_obj.length) {
        all_obj[0].checked = false
      }
      else {
        all_obj[0].checked = true
      }
    }
  })

  // When the user press escape key, close modals
  window.addEventListener('keydown', function (e) {
    var e = e || window.event
    var key = e.keyCode || e.which

    if (key == '27') {
      var modals = document.querySelectorAll('.modal')
      for (var i = 0; i < modals.length; i++) {
        modals[i].style.display = "none"
      }
    }
  })
})()
