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
  /* -------------------- PROJECT MODAL -------------------- */
  // When the user clicks on the <button> (btn_modif_p), open the project modal
  var btn_p = document.querySelector('#btn_modif_p')
  btn_p.addEventListener('click', function () {
    document.querySelector('#modal_modif_p').style.display = "block"
    var proj = Sch.findHeader(Sch.project)
    var new_name_obj = document.querySelector('#newName_p')
    var new_check_obj = document.querySelector('#new_p')
    var name_obj = document.querySelector('#name_p'),
        propts = name_obj.querySelectorAll('option')

    name_obj.style.display = "block"
    new_name_obj.style.display = "none"
    new_name_obj.value = ""
    new_check_obj.checked = false

    for (var i = 0; i < propts.length; i++) {
      name_obj.removeChild(propts[i])
    }
    for (var i = 0; i < proj.length; i++) {
      var option = document.createElement('option')
      option.text = Sch.project[proj[i]].name
      name_obj.add(option)
    }
    updateProjEdition()
  })

  // When the user clicks on <span> (x), close the project modal
  var span_p = document.querySelector('.close_p')
  span_p.addEventListener('click', function () {
    document.querySelector('#modal_modif_p').style.display = "none"
  })

  // When <select> (projectSel_p) change, find project properties
  var name_obj = document.querySelector('#name_p')
  name_obj.addEventListener('change', function () {
    updateProjEdition()
  })

  // When the user clicks on <checkbox> (projectNew_p), select project addition or delete
  var new_obj = document.querySelector('#new_p')
  new_obj.addEventListener('change', function () {
    var name_obj = document.querySelector('#name_p')
    var newName_obj = document.querySelector('#newName_p')

    if (new_obj.checked == false) {
      name_obj.style.display = "block"
      newName_obj.style.display = "none"
    }
    else {
      name_obj.style.display = "none"
      newName_obj.style.display = "block"
    }
  })

  // When the user clicks on <button> (check_p_del), delete a project
  var check_p_del = document.querySelector('#check_p_del')
  check_p_del.addEventListener('click', function (e) {
    e.preventDefault()
    check_p(true)
  })

  // When the user clicks on <button> (check_p_add), add a new project
  var check_p_add = document.querySelector('#check_p_add')
  check_p_add.addEventListener('click', function (e) {
    e.preventDefault()
    check_p(false)
  })


  /* -------------------- FUNCTION -------------------- */
  // Check and send project
  function check_p (del) {
    var shortId = document.querySelector("#shortId_p").value

    if (del) {
      // task = { monthFrom, monthTo, shortId }
      var confirmation = confirm("Êtes-vous sûr de vouloir supprimer le projet ?")
      if (confirmation) {
        var task = { monthFrom: Sch.request.month_from, monthTo: Sch.request.month_to, shortId: shortId }
        document.querySelector('#modal_modif_p').style.display = "none"
        socket.emit('delProject', JSON.stringify(task))
      }
    } else {
      // task = { shortId, name, type, color, new }
      var new_check = document.querySelector('#new_p').checked
      var name = (new_check) ? document.querySelector('#newName_p').value : document.querySelector('#name_p').value,
          type = document.querySelector('#type_p').value,
          color = document.querySelector('#color_p').value

      if (new_check && name == "") {
        window.alert("Veuillez choisir un nom pour projet")
        return -1
      }

      for (var proj in Sch.project) {
        if (new_check && name == Sch.project[proj].name) {
          window.alert("Le projet existe déjà !")
          return -1
        }
        if (shortId != proj && color == Sch.project[proj].color) {
          window.alert("La couleur est déjà utilisé par un autre projet !")
          return -1
        }
        if (color == "#000000" || color == "#ffffff") {
          window.alert("Impossible d'utiliser cette couleur !")
          return -1
        }
      }

      var task = { shortId: shortId, name: name, type: type, color: color, new: new_check }
      console.log(task)

      document.querySelector('#modal_modif_p').style.display = "none"
      socket.emit('newProject', JSON.stringify(task))
    }
  }

  // Update edition input of the project modal
  function updateProjEdition () {
    var shortId = Sch.findProjectID(document.querySelector('#name_p').value),
        shortId_obj = document.querySelector('#shortId_p'),
        type_obj = document.querySelector('#type_p'),
        color_obj = document.querySelector('#color_p')

    shortId_obj.value = shortId
    type_obj.value = Sch.project[shortId].type
    color_obj.value = Sch.project[shortId].color
  }
})()
