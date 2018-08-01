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
  var media_mobile = !window.matchMedia("only screen and (min-width: 768px)").matches
  window.onresize = function() {
    media_mobile = !window.matchMedia("only screen and (min-width: 768px)").matches
  }

  var sidenav = document.querySelectorAll('.sidenav a')
  for (var i = 0; i < sidenav.length; i++) {
    if (/^#/.test(sidenav[i].getAttribute('href'))) {
      sidenav[i].addEventListener('click', function (e) {
        e.preventDefault();
        var a = this
        var div = this.parentNode.parentNode.parentNode

        if (a.classList.contains('active') || this.getAttribute('href') == '#') {
          return false
        }
        div.querySelector('.sidenav .active').classList.remove('active')
        a.classList.add('active')
        div.querySelector('.menu-content.active').classList.remove('active')
        div.querySelector(this.getAttribute('href')).classList.add('active')
        document.querySelector('.sidenav').style.width = "0"
      })
    }
  }

  window.addEventListener('click', function (e) {
    if(document.querySelector('.menu-open').contains(e.target)) {
      document.querySelector('.sidenav').style.width = "250px"
    }
    else if (!document.querySelector('.sidenav').contains(e.target)) {
      document.querySelector('.sidenav').style.width = "0"
    }
  })
})()

var mobile = document.querySelector('#mediatype').className
if (mobile) {
  document.querySelector('.schedules-content').classList.add('scroll')
}

class Schedules {
  // Constructor
  constructor() {
    this.months = new Object()
    this.start = undefined
    this.end = undefined
    this.project = undefined
    this.team = undefined

    this.monthFrom = getMonth(new Date())
    this.monthTo = getMonth(new Date())
  }
  updateDateMonth(monthFrom, nbrMonth) {
    if (monthFrom) {
      this.monthFrom = monthFrom
    }
    this.monthTo = setMonth(monthFrom, nbrMonth)
  }
  updateDate() {
    var months = findHeader(this.months)
    this.start = getDate(months[0])
    this.end = getDate(months[months.length-1])
  }
  updateInfos(months, project, team) {
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
}
var sch = new Schedules()

sch.updateDateMonth(getMonth(new Date()), parseInt(document.querySelector('#nbrMonth_mp').value))

/* --- SOCKET IO --- */
var socket = io.connect/*('http://solsteoapp.tk')*/('http://localhost:8082')/*('http://82.227.24.160')*/
//console.log(window.cookie)
socket.emit('getSch', sch.monthFrom, sch.monthTo)

socket.on('schedule', function (data) {
  var obj = JSON.parse(data)
  console.log(obj)
  sch.updateInfos(obj.schedule, obj.project, obj.team)
  sch.updateDate()

  var x = [], y = []
  var schedules_header = document.querySelector('.schedules-header')
  var schedules_content = document.querySelector('.schedules-content')

  if (schedules_header && schedules_content) {
    x.push(schedules_header.scrollLeft)
    x.push(schedules_content.scrollLeft)
    y.push(schedules_header.scrollTop)
    y.push(schedules_content.scrollTop)
  }
  showSchedule('.schedules-header', '.schedules-content', sch.months, mobile)

  try {
    schedules_content.scrollTo(x.pop(), y.pop())
    schedules_header.scrollTo(x.pop(), y.pop())
  } catch (err) {
    schedules_header.innerHTML = ""
    schedules_content.classList.add('scroll')
  }
})
