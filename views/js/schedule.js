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
  /* -------------------- EVENTS CLICK AND MOVE SCHEDULE -------------------- */
  // When the user clicks anywhere inside of the schedule, move it
  dragElements('.schedules-content', '.schedules-header')
  //dragElement('.menu-content', '.menus-content', 'y')
  function dragElements(elmnt, elmntH = false) {
    var x, y
    // Otherwise, move the DIV from anywhere inside the DIV
    document.querySelector(elmnt).onmousedown = dragMouseDown

    function dragMouseDown(e) {
      e = e || window.event
      this.style.cursor = 'move'

      // Store current position
      x = e.clientX
      y = e.clientY

      document.onmouseup = closeDragElement
      // Call a function whenever the cursor moves
      document.onmousemove = handleMouse // ElementDrag
    }

    // Variables for current position
    function handleMouse(e) {
      // Verify that x and y already have some value
      if (x && y) {
        var posX = x - e.clientX
        var posY = y - e.clientY
        // Scroll window by difference between current and previous positions
        try {
          document.querySelector(elmnt).scrollBy(posX, posY)
          if (elmntH) {
            document.querySelector(elmntH).scrollBy(posX, 0)
          }
        } catch (err) {}
      }
      // Store current position
      x = e.clientX
      y = e.clientY
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null
      document.onmousemove = null
      document.querySelector(elmnt).style.cursor = 'cell'
    }
  }

  function resizeSch (height) {
    var height = window.innerHeight
    var min = 200
    var coef = 190
    var scheduleHeight = ((height - coef) < min) ? min+"px" : parseInt(height - coef)+"px"
    document.querySelector('.schedules-header').style.maxHeight = scheduleHeight
    document.querySelector('.schedules-content').style.maxHeight = scheduleHeight
  }
  resizeSch()

  window.addEventListener('resize', function () {
    resizeSch()
  })
})()
