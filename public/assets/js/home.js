var app = {};

app.timelineD3 = function(timesvg, eventItem, height){

		width = $('.info-container').width() - 20;

		var viewTimes = [{starttime: new Date(app.starttime), endtime: new Date(app.endtime)}]
		var data = [{starttime: new Date(eventItem.starttime), endtime: new Date(eventItem.endtime)}]

		// Chart parameters
		var margin = {	top: height, 
						right: 20,
						bottom: 0,
						left: 20 };

		var height = height - margin.top - margin.bottom,
				width = width - margin.left - margin.right;

		var timeScale = d3.time.scale()
							.domain([viewTimes[0].starttime, viewTimes[0].endtime])
							.range([0, width]);

		var timeChart = d3.select(timesvg)
							.append('svg')
								.attr('width', width + margin.left + margin.right)
								.attr('height', height + margin.top + margin.bottom)
							.append('rect')
								.attr({
									'x': timeScale(data[0].starttime),
									'width': timeScale(data[0].endtime) - timeScale(data[0].starttime),
									'y': height+2,
									'height': 8,
									'fill': '#e20033',
									'opacity': .7,
									'rx': 2,
									'ry': 2
								})
								.attr('transform', 'translate(' + margin.left + ', ' + 0 + ')');

		var timeAxis = d3.svg.axis()
							.scale(timeScale)
							.orient('top')
							.tickSize(3);
							//.ticks(d3.time.hour, 6);

		var timeGuide = d3.select(timesvg)
						.select('svg')
						.append('g')
						.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

		timeAxis(timeGuide);

}

app.initMap = function(){

	// Leaflet Map
	app.map = L.map('map', {closePopupOnClick: true}).setView([40.7, -74.0], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'carriesmith.nii6d5je',
	    accessToken: 'pk.eyJ1IjoiY2Fycmllc21pdGgiLCJhIjoiY2lmNGQ2MWloMDFmaXg0a3NibnpyY3I2bCJ9.MTvJHm90YDJtaIyxvvNoKw'
	}).addTo(app.map);

}

app.createEvents = function(){

	// Trash any existing events
	$('.eventitem').remove();
	$('.leaflet-objects-pane').find('img').remove();

	app.eventList.forEach(function(eventItem){
		
		// if the eventList item has not yet had a value set for the 'removed' flag, set it to false
		if (eventItem.removed == null) {
			eventItem.removed = false;
		}

		// Process event price
		// see: http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
		// parseFloat parses its argument, a string, and returns a floating point number. 
		// 		If it encounters a character other than a sign (+ or -), numeral (0-9), a decimal point, 
		// 		or an exponent, it returns the value up to that point and ignores that character 
		// 		and all succeeding characters. Leading and trailing spaces are allowed.
		// 		If the first character cannot be converted to a number, parseFloat returns NaN.
		// isFinite used to determine whether a number is a finite number. 
		// 		The isFinite function examines the number in its argument. 
		// 		If the argument is NaN, positive infinity, or negative infinity, 
		// 		this method returns false; otherwise, it returns true.

		if (eventItem.price === 0){
			eventItem.price = 'free';
		}
		// if numeric, add dollar sign
		if (!isNaN(parseFloat(eventItem.price)) && isFinite(eventItem.price)){
			eventItem.price = '$' + eventItem.price;
		}

		// create new list item for an event
		eventItem.li = $('<li>').addClass('eventitem');

		// timesvg div will contain the SVG time visual
		var timesvg = $('<div>').addClass('timesvg');

		// append event name with link to event website
		var name = $('<div>')
						.addClass('eventname')
						.append('<a href = "'+ eventItem.link + '" target="_blank">' + eventItem.eventname.toLowerCase() + '</a>');
		
		// append price of admission
		var price = $('<div>')
						.append(eventItem.price.toLowerCase())
						.addClass('price');

		// shortdesc div contains the short description of the event
		var shortdesc = $('<div>')
						.append(eventItem.shortdesc)
						.addClass('shortdesc');
		
		// X button and listener to hide
		var xButton = $('<div>')
							.addClass('xbutton')
							.append('<i class="fa fa-times"></i>')
							.click(function(){
								$(eventItem.li).slideUp();
								// app.map.removeLayer(eventItem.marker);
								app.map.removeLayer(eventItem.marker);
								eventItem.removed = true;
							});

		// Toggle view of event description
		var viewButton = $('<div>')
								.addClass('viewbutton')
								.append('<i class="fa fa-caret-up"></i>')
								.click(function(){
									$(shortdesc).toggleClass('open');
									$(this).find('i').toggleClass('fa-caret-up');
									$(this).find('i').toggleClass('fa-caret-down');
								});

		// Assemble event information section
		var infosection = $('<div>')
								.addClass('infosection')

		infosection.append(name)
			.append(price)
			.append(viewButton)
			.append(xButton)
			.append(shortdesc);

		// Combine into a single list item
		eventItem.li.append(infosection)
			.append(timesvg);

		// Add the D3 timeline
		app.timelineD3(timesvg[0], eventItem, app.infosectionH);

		// Add a marker to the Leaflet map
		eventItem.marker = L.marker([eventItem.location[1], eventItem.location[0]]);
		eventItem.marker.bindPopup(eventItem.eventname);

		// Hover over Leaflet marker --> highlight event list item
		eventItem.marker.on('mouseover', function(){
			$('.eventList').scrollTop($('.eventList').scrollTop() + $(eventItem.li).position().top);
			$(eventItem.li).addClass('selected');
		});
		eventItem.marker.on('mouseout', function(){
			$(eventItem.li).removeClass('selected');
		});

		// Hover over highlight event list item --> activate Leaflet marker
		$(eventItem.li).on('mouseover', function(){
				eventItem.marker.openPopup()
			});
		$(eventItem.li).on('mouseout', function(){
				eventItem.marker.closePopup()
			});

		// CHECK WHETHER SHOULD BE VISIBLE
		if (eventItem.removed || new Date(eventItem.starttime) < app.starttime || new Date(eventItem.endtime) > app.endtime){
			eventItem.li.addClass('hide');
			eventItem.visible = false;
		} else {
			eventItem.li.removeClass('hide');
			eventItem.visible = true;
			eventItem.marker.addTo(app.map);
		}

		// Append completed event information to ul
		$('#eventList').append(eventItem.li);	

	})
}

app.populateDates = function (){

	$('#date-select span').text( app.today.toString().split(' ').slice(0,4).join(' ') );

	var date = app.today;
	
	var $dateList = $('#date-select .dropdown');
	for (var i = 1; i<9; i++){
		
		var li = $('<li>')
				.append('<a href="#">' + date.toString().split(' ').slice(0,4).join(' ') + '</a>' );
		$dateList.append(li);
		date.setDate(date.getDate() + 1)

	}

}

app.getData = function(){
		$.ajax({
		url: 'http://localhost:3000/events/date/' + app.startdate.toISOString() + '/' + app.enddate.toISOString(),
		type: 'GET',
		dataType: 'json',
		success: function(data){
			app.eventList = data;
			app.eventList.sort(function(a,b){
				var keyA = new Date(a.starttime),
				 	keyB = new Date(b.starttime);

				if (keyA < keyB) return -1;
				if (keyA > keyB) return 1;

				return 0;
			})
			app.createEvents();
		}
	});
}

app.updateDate = function(datestring){

	var newstarttime = new Date(datestring);
	newstarttime.setHours( app.starttime.getHours() );
	newstarttime.setMinutes( app.starttime.getMinutes() ); // not currently necessary

	var newendtime = new Date(datestring);
	newendtime.setHours( app.endtime.getHours() );
	newendtime.setMinutes( app.endtime.getMinutes() ); // not currently necessary	

	// If the end time is earlier than the start time, assume we are rolling into the next morning
	if ( newendtime < newstarttime ) {
		newendtime.setDate( newendtime.getDate() + 1 );
	}

	app.starttime = newstarttime;
	app.endtime = newendtime;

	app.startdate = new Date(app.starttime.getFullYear(), app.starttime.getMonth(), app.starttime.getDate(), 0,0,0);
	app.enddate = new Date(app.starttime.getFullYear(), app.starttime.getMonth(), app.starttime.getDate() + 1, 23,59,59);

}

app.init = function(){
	
	app.eventList = [];

	removedEvents = localStorage['removedEvents'];
	if (removedEvents == null) {
		app.removedEvents = [];
	}

	app.infosectionH = 30;

	app.today = new Date();
	app.defaultStart = 18;
	app.defaultEnd = 3;

	app.startdate = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), 0,0,0);
	app.enddate = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, 23,59,59);

	app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), app.defaultStart,0,0);
	app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, app.defaultEnd,0,0);

	// Initialize the Map
	app.initMap();

	// AJAX request to get and display events
	app.getData();

	// Dropdowns adapted from:
	// http://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/

	function DropDown(el) {
	    this.dd = el;
	    this.placeholder = this.dd.children('span');
	    this.opts = this.dd.find('ul.dropdown > li');
	    this.val = this.dd.children('span').text(); // save initial value
	    this.lastval = this.val;  // preserve previous value
	    this.index = -1;
	    this.initEvents();
	}

	DropDown.prototype = {
	    initEvents : function() {
	        var obj = this;

	        obj.dd.on('click', function(event){
	            $(this).toggleClass('active');
	            return false;
	        });

	        obj.opts.on('click',function(){
	            var opt = $(this);
	            obj.lastval = obj.val;
	            obj.val = opt.text();
	            obj.index = opt.index();
	            obj.placeholder.text(obj.val);
	            console.log(obj.val);
	        });
	    },
	    getValue : function() {
	        return this.val;
	    },
	    getIndex : function() {
	        return this.index;
	    }
	}

	app.populateDates();
	app.ddDate = new DropDown( $('#date-select') );
	app.ddDate.opts.on('click', function(){
		if (app.ddDate.lastval != app.ddDate.val){
				app.updateDate(app.ddDate.val);
				app.getData();
			}
	})

	app.ddSTime = new DropDown( $('#start-select') );
	app.ddSTime.opts.on('click', function(){
		if (app.ddSTime.lastval != app.ddSTime.val){
				
				// if PM and select 12 --> noon
				if (parseInt(app.ddSTime.val) === 12 && app.starttime.getHours()>=12) {
					app.starttime.setHours(12);  // noon

				// if AM and select 12 --> midnight
				} else if (parseInt(app.ddSTime.val) === 12 && app.starttime.getHours()<12) {
					app.starttime.setHours(0);  // then midnight

				// if PM and not 12 --> add 12 to time
				} else if (app.starttime.getHours()>=12){
					app.starttime.setHours(parseInt(app.ddSTime.val) + 12) 

				// else AM
				} else {
					app.starttime.setHours(parseInt(app.ddSTime.val))
				}

				app.endtime.setDate( app.starttime.getDate() );
				if ( app.starttime > app.endtime ) {
					app.endtime.setDate( app.endtime.getDate() + 1 );
				}

				console.log(app.starttime);
				console.log(app.endtime);

				app.createEvents();
			}
	})

	app.ddSTimeAMPM = new DropDown( $('#start-ampm') );
	app.ddSTimeAMPM.opts.on('click', function(){
		if (app.ddSTimeAMPM.lastval != app.ddSTimeAMPM.val){
			// was midnight --> noon
			if (app.ddSTimeAMPM.val.toLowerCase() === "pm"){
				app.starttime.setHours( app.starttime.getHours() + 12 );
			} else {
				app.starttime.setHours( app.starttime.getHours() - 12 );
			}

			app.endtime.setDate( app.starttime.getDate() );
			if ( app.starttime > app.endtime ) {
				app.endtime.setDate( app.endtime.getDate() + 1 );
			}

			app.createEvents();
		}
	})

	app.ddETime = new DropDown( $('#end-select') );
	app.ddETime.opts.on('click', function(){
		if (app.ddETime.lastval != app.ddETime.val){
				
				// if PM and select 12 --> noon
				if (parseInt(app.ddETime.val) === 12 && app.endtime.getHours()>=12) {
					app.endtime.setHours(12);  // noon

				// if AM and select 12 --> midnight
				} else if (parseInt(app.ddETime.val) === 12 && app.endtime.getHours()<12) {
					app.endtime.setHours(0);  // then midnight

				// if PM and not 12 --> add 12 to time
				} else if (app.endtime.getHours()>=12){
					app.endtime.setHours(parseInt(app.ddETime.val) + 12) 

				// else AM
				} else {
					app.endtime.setHours(parseInt(app.ddETime.val))
				}

				app.endtime.setDate( app.starttime.getDate() );
				if ( app.starttime > app.endtime ) {
					app.endtime.setDate( app.endtime.getDate() + 1 );
				}

				app.createEvents();
			}
	})

	app.ddETimeAMPM = new DropDown( $('#end-ampm') );
	app.ddETimeAMPM.opts.on('click', function(){
		if (app.ddETimeAMPM.lastval != app.ddETimeAMPM.val){
			// was midnight --> noon
			if (app.ddETimeAMPM.val.toLowerCase() === "pm"){
				app.endtime.setHours( app.endtime.getHours() + 12 );
			} else {
				app.endtime.setHours( app.endtime.getHours() - 12 );
			}

			app.endtime.setDate( app.starttime.getDate() );
			if ( app.starttime > app.endtime ) {
				app.endtime.setDate( app.endtime.getDate() + 1 );
			}

			app.createEvents();
		}
	})

	$('.wrapper-dropdown').removeClass('active');

	// make it sortable with jQuery UI
	$('ul#eventList').sortable({
	  connectWith: ".connected"
	});

};

$(function() {

  app.init();

});