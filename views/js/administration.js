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


/* --- MENU --- */
(function () {
  var adminmenu = document.querySelectorAll('.admin-sidenav a')
  for (var i = 0; i < adminmenu.length; i++) {
    adminmenu[i].addEventListener('click', function (e) {
      e.preventDefault()
      var a = this
      var div = this.parentNode.parentNode.parentNode

      if (a.classList.contains('active') || this.getAttribute('href') == '#') {
        return false
      }
      div.querySelector('.admin-sidenav .active').classList.remove('active')
      a.classList.add('active')
      div.querySelector('.admin-content.active').classList.remove('active')
      div.querySelector(this.getAttribute('href')).classList.add('active')
      if (div.querySelector(this.getAttribute('href')).classList.contains('user-nav')) {
        div.querySelector('.user-sidenav').classList.add('active')
      }
      else {
        div.querySelector('.user-sidenav').classList.remove('active')
      }
    })
  }

  var usermenu = document.querySelectorAll('.user-sidenav li')
  for (var i = 0; i < usermenu.length; i++) {
    usermenu[i].addEventListener('click', function (e) {
      e.preventDefault();
      var li = this
      var div = this.parentNode.parentNode.parentNode

      if (li.classList.contains('active') || this.getAttribute('href') == '#') {
        return false
      }
      div.querySelector('.user-sidenav .active').classList.remove('active')
      li.classList.add('active')
      div.querySelector('.user-content.active').classList.remove('active')
      div.querySelector(this.getAttribute('href')).classList.add('active')
    })
  }
  usermenu[0].classList.add('active')
  usermenu[0].parentNode.parentNode.parentNode.querySelector(usermenu[0].getAttribute('href')).classList.add('active')
})()
