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
// Logs Schema
var logSchema = new mongoose.Schema({
  author: { type: String, match: /^[a-zA-Z0-9-_]+$/ },
  client: String,
  log: String,
  date: { type: Date, default: (new Date().toDateString() + ' ' + new Date().toLocaleTimeString('en-US')) }
})
var logModel = mongoose.model('log', logSchema)
module.exports = logModel
