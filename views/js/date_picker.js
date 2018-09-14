var date_picker_s = function () {
	'use strict'

	var dayNamesShort = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
	var monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
	var icon = '<svg viewBox="0 0 512 512"><polygon points="268.395,256 134.559,121.521 206.422,50 411.441,256 206.422,462 134.559,390.477 "/></svg>'
	var doc = document.documentElement

	function hide () {
		rootFrom.setAttribute('hidden', '')
		rootTo.setAttribute('hidden', '')
		doc.removeEventListener('click', hide)
	}

	function format (dt) {
		return Picker.prototype.pad(dt.getDate()) + ' ' + monthNames[dt.getMonth()].slice(0,3) + ' ' + dt.getFullYear()
	}

	/* -------------------- SCHEDULE DATE FROM -------------------- */
	var rootFrom = document.getElementById('pickerFrom_s')
	var dateInputFrom = document.getElementById('dateFrom_s')
	var altInputFrom = document.getElementById('altFrom_s')

	function showFrom () {
		rootFrom.removeAttribute('hidden')
		rootTo.setAttribute('hidden', '')
	}

	function onSelectHandlerFrom () {

		var value = this.get()

		if (value.start) {
			dateInputFrom.value = value.start.Ymd()
			altInputFrom.value = format(value.start)
			hide()
			findProjDet_s()
			findAttr_s(new Date(dateInputFrom.value), false)
			setDateTo_s(dateInputFrom.value)
		}
	}

	var pickerFrom = new Picker(rootFrom, {
		min: new Date(dateInputFrom.min),
		max: new Date(dateInputFrom.max),
		icon: icon,
		twoCalendars: false,
		dayNamesShort: dayNamesShort,
		monthNames: monthNames,
		onSelect: onSelectHandlerFrom
	})

	rootFrom.parentElement.addEventListener('click', (e) => { e.stopPropagation()	})

	dateInputFrom.addEventListener('change', () => {

		if (dateInputFrom.value) {
			pickerFrom.select(new Date(dateInputFrom.value))
		}
		else {
			pickerFrom.clear()
		}
	})

	altInputFrom.addEventListener('focus', () => {
		altInputFrom.blur()
		showFrom()
		doc.addEventListener('click', hide, false)
	})


	/* -------------------- SCHEDULE DATE TO -------------------- */
	var rootTo = document.getElementById('pickerTo_s')
	var dateInputTo = document.getElementById('dateTo_s')
	var altInputTo = document.getElementById('altTo_s')

	function showTo () {
		rootFrom.setAttribute('hidden', '')
		rootTo.removeAttribute('hidden')
	}

	function onSelectHandlerTo () {

		var value = this.get()

		if (value.start) {
			dateInputTo.value = value.start.Ymd()
			altInputTo.value = format(value.start)
			hide()
			findProjDet_s()
		}
	}

	var pickerTo = new Picker(rootTo, {
		min: new Date(dateInputTo.min),
		max: new Date(dateInputTo.max),
		icon: icon,
		twoCalendars: false,
		dayNamesShort: dayNamesShort,
		monthNames: monthNames,
		onSelect: onSelectHandlerTo
	})

	rootTo.parentElement.addEventListener('click', function (e) { e.stopPropagation() })

	dateInputTo.addEventListener('change', () => {

		if (dateInputTo.value) {
			pickerTo.select(new Date(dateInputTo.value))
		}
		else {
			pickerTo.clear()
		}
	})

	altInputTo.addEventListener('focus', () => {
		altInputTo.blur()
		showTo()
		doc.addEventListener('click', hide, false)
	})
}

var date_picker_a = function () {
	'use strict'

	var dayNamesShort = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
	var monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
	var icon = '<svg viewBox="0 0 512 512"><polygon points="268.395,256 134.559,121.521 206.422,50 411.441,256 206.422,462 134.559,390.477 "/></svg>'
	var doc = document.documentElement

	function hide () {
		rootFrom.setAttribute('hidden', '')
		rootTo.setAttribute('hidden', '')
		doc.removeEventListener('click', hide)
	}

	function format (dt) {
		return Picker.prototype.pad(dt.getDate()) + ' ' + monthNames[dt.getMonth()].slice(0,3) + ' ' + dt.getFullYear()
	}

	/* -------------------- ARCHIVES DATE FROM -------------------- */
	var rootFrom = document.getElementById('pickerFrom_a')
	var dateInputFrom = document.getElementById('dateFrom_a')
	var altInputFrom = document.getElementById('altFrom_a')

	function showFrom () {
		rootFrom.removeAttribute('hidden')
		rootTo.setAttribute('hidden', '')
	}

	function onSelectHandlerFrom () {

		var value = this.get()

		if (value.start) {
			dateInputFrom.value = value.start.Ymd()
			altInputFrom.value = format(value.start)
			hide()
			setDateTo_a(dateInputFrom.value)
		}
	}

	var pickerFrom = new Picker(rootFrom, {
		min: new Date(dateInputFrom.min),
		max: new Date(dateInputFrom.max),
		icon: icon,
		twoCalendars: false,
		dayNamesShort: dayNamesShort,
		monthNames: monthNames,
		onSelect: onSelectHandlerFrom
	})

	rootFrom.parentElement.addEventListener('click', (e) => { e.stopPropagation()	})

	dateInputFrom.addEventListener('change', () => {

		if (dateInputFrom.value) {
			pickerFrom.select(new Date(dateInputFrom.value))
		}
		else {
			pickerFrom.clear()
		}
	})

	altInputFrom.addEventListener('focus', () => {
		altInputFrom.blur()
		showFrom()
		doc.addEventListener('click', hide, false)
	})


	/* -------------------- ARCHIVES DATE TO -------------------- */
	var rootTo = document.getElementById('pickerTo_a')
	var dateInputTo = document.getElementById('dateTo_a')
	var altInputTo = document.getElementById('altTo_a')

	function showTo () {
		rootFrom.setAttribute('hidden', '')
		rootTo.removeAttribute('hidden')
	}

	function onSelectHandlerTo () {

		var value = this.get()

		if (value.start) {
			dateInputTo.value = value.start.Ymd()
			altInputTo.value = format(value.start)
			hide()
		}
	}

	var pickerTo = new Picker(rootTo, {
		min: new Date(dateInputTo.min),
		max: new Date(dateInputTo.max),
		icon: icon,
		twoCalendars: false,
		dayNamesShort: dayNamesShort,
		monthNames: monthNames,
		onSelect: onSelectHandlerTo
	})

	rootTo.parentElement.addEventListener('click', function (e) { e.stopPropagation() })

	dateInputTo.addEventListener('change', () => {

		if (dateInputTo.value) {
			pickerTo.select(new Date(dateInputTo.value))
		}
		else {
			pickerTo.clear()
		}
	})

	altInputTo.addEventListener('focus', () => {
		altInputTo.blur()
		showTo()
		doc.addEventListener('click', hide, false)
	})
}

var date_picker_t = function () {
	'use strict'

	var dayNamesShort = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
	var monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
	var icon = '<svg viewBox="0 0 512 512"><polygon points="268.395,256 134.559,121.521 206.422,50 411.441,256 206.422,462 134.559,390.477 "/></svg>'
	var doc = document.documentElement

	function hide () {
		root.setAttribute('hidden', '')
		doc.removeEventListener('click', hide)
	}

	function format (dt) {
		return Picker.prototype.pad(dt.getDate()) + ' ' + monthNames[dt.getMonth()].slice(0,3) + ' ' + dt.getFullYear()
	}

	/* -------------------- TEAM DATE -------------------- */
	var root = document.getElementById('picker_t')
	var dateInput = document.getElementById('date_t')
	var altInput = document.getElementById('alt_t')

	function show () {
		root.removeAttribute('hidden')
	}

	function onSelectHandler () {

		var value = this.get()

		if (value.start) {
			dateInput.value = value.start.Ymd()
			altInput.value = format(value.start)
			hide()
			findWho_t(Sch.getMonth(new Date(dateInput.value)))
		}
	}

	var picker = new Picker(root, {
		min: new Date(dateInput.min),
		max: new Date(dateInput.max),
		icon: icon,
		twoCalendars: false,
		dayNamesShort: dayNamesShort,
		monthNames: monthNames,
		onSelect: onSelectHandler
	})

	root.parentElement.addEventListener('click', function (e) { e.stopPropagation() })

	dateInput.addEventListener('change', () => {

		if (dateInput.value) {
			picker.select(new Date(dateInput.value))
		}
		else {
			picker.clear()
		}
	})

	altInput.addEventListener('focus', () => {
		altInput.blur()
		show()
		doc.addEventListener('click', hide, false)
	})
}
