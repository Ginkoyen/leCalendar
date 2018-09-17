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


var mongoose = require('mongoose')

/* -------------------- MONGO DB -------------------- */
//Months schema
// Cell = [Bordure, Details, DetailsColor, Project, Background]
var tasksSchema = new mongoose.Schema({
  author: { type: String, match: /^[a-zA-Z0-9-_]+$/ },
  type: String,
  month: Number,
  day: Number,
  person: String,
  details: String,
  details_color: String,
  project: String,
  background: String,
  date: { type: Date, default: (new Date().toDateString() + ' ' + new Date().toLocaleTimeString('en-US')) }
})
var tasksModel = mongoose.model('tasks', tasksSchema)
module.exports = tasksModel
