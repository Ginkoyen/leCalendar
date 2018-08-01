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


Date.prototype.getYearDay = function () { // 1 - 366
	var year  = this.getFullYear()
	var month = this.getMonth()
	var day   = this.getDate()
	var offset = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
	var bissextile = (month < 2) ? 0 : (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))

  return parseInt(day + offset[month] + bissextile)
}

Date.prototype.getMonday = function () {
	var offset = (this.getDay() + 6) % 7
	return new Date(this.getFullYear(), this.getMonth(), this.getDate()-offset)
}

Date.prototype.getWeek = function () { // 1 - 53
	var year = this.getFullYear()
	var week
	var lastMonday = new Date(year, 11, 31).getMonday()

	if (this >= lastMonday && lastMonday.getDate() > 28) {
		week = 1
	}
	else {
		var firstMonday = new Date(year, 0, 1).getMonday()
		if (firstMonday.getFullYear() < year) firstMonday = new Date(year, 0, 8).getMonday()
		var days = this.getYearDay() - firstMonday.getYearDay()

    if (days < 0) {
			week = new Date(year, this.getMonth(), this.getDate()+days).getWeek()
		}
		else {
			week = 1 + parseInt(days / 7)
			week += (new Date(year-1, 11, 31).getMonday().getDate() > 28)
		}
	}
	return parseInt(week)
}

Date.prototype.getNbrDay = function () {
  return new Date(this.getFullYear(), this.getMonth()+1, -1).getDate()+1
}

Date.prototype.getDayOfWeek = function (short) {
	var short = short || false
  var tab_day = new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi")
  if (short) return tab_day[this.getDay()][0]
  return tab_day[this.getDay()]
}

Date.prototype.getMonthStr = function (short) {
	var short = short || false
  var tab_month = new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre")
	var tab_month_short = new Array("janv", "févr", "mars", "avr", "mai", "juin", "juill", "août", "sept", "oct", "nov", "déc")
  if (short) return tab_month_short[this.getMonth()]
  return tab_month[this.getMonth()]
}

Date.prototype.holidays = function () {
	var year = this.getFullYear()
	var JourAn = new Date(year, "00", "01")
	var FeteTravail = new Date(year, "04", "01")
	var Victoire1945 = new Date(year, "04", "08")
	var FeteNationale = new Date(year,"06", "14")
	var Assomption = new Date(year, "07", "15")
	var Toussaint = new Date(year, "10", "01")
	var Armistice = new Date(year, "10", "11")
	var Noel = new Date(year, "11", "25")
	var SaintEtienne = new Date(year, "11", "26")

	var G = year%19
	var C = Math.floor(year/100)
	var H = (C - Math.floor(C/4) - Math.floor((8*C+13)/25) + 19*G + 15)%30
	var I = H - Math.floor(H/28)*(1 - Math.floor(H/28)*Math.floor(29/(H + 1))*Math.floor((21 - G)/11))
	var J = (year*1 + Math.floor(year/4) + I + 2 - C + Math.floor(C/4))%7
	var L = I - J
	var MoisPaques = 3 + Math.floor((L + 40)/44)
	var JourPaques = L + 28 - 31*Math.floor(MoisPaques/4)
	var Paques = new Date(year, MoisPaques-1, JourPaques)
	var VendrediSaint = new Date(year, MoisPaques-1, JourPaques-2)
	var LundiPaques = new Date(year, MoisPaques-1, JourPaques+1)
	var Ascension = new Date(year, MoisPaques-1, JourPaques+39)
	var Pentecote = new Date(year, MoisPaques-1, JourPaques+49)
	var LundiPentecote = new Date(year, MoisPaques-1, JourPaques+50)

	return new Array(JourAn, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel, VendrediSaint, SaintEtienne)
}
