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

app.resizeD3 = function(){


	console.log(d3.selectAll('.timesvg'));

}

app.displayEvents = function(){

	// Leaflet Map
	var map = L.map('map', {closePopupOnClick: true}).setView([40.7, -74.0], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'carriesmith.nii6d5je',
	    accessToken: 'pk.eyJ1IjoiY2Fycmllc21pdGgiLCJhIjoiY2lmNGQ2MWloMDFmaXg0a3NibnpyY3I2bCJ9.MTvJHm90YDJtaIyxvvNoKw'
	}).addTo(map);

	app.eventList.forEach(function(eventItem){
		
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
		var li = $('<li>').addClass('eventitem');

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
								$(li).slideUp();
								map.removeLayer(eventItem.marker);
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
		li.append(infosection)
			.append(timesvg);

		// Add the D3 timeline
		app.timelineD3(timesvg[0], eventItem, app.infosectionH);

		// Add start and end times as data attributes to list item element (?)
		li.attr('data-starttime', eventItem.starttime);
		li.attr('data-endtime', eventItem.endtime);

		// Append completed event information to ul
		$('#eventList').append(li);	

		// Add a marker to the Leaflet map
		eventItem.marker = L.marker([eventItem.location[1], eventItem.location[0]]).addTo(map);
		eventItem.marker.bindPopup(eventItem.eventname);

		// $(eventItem.marker).mouseover(function(){
		// 	$(li).addClass('selected');
		// });

		// $(eventItem.marker).mouseout(function(){
		// 	$(li).removeClass('selected');
		// });

		// Hover over Leaflet marker --> highlight event list item
		eventItem.marker.on('mouseover', function(){
			$(li).addClass('selected');
		});
		eventItem.marker.on('mouseout', function(){
			$(li).removeClass('selected');
		});

		// Hover over highlight event list item --> activate Leaflet marker
		$(li).on('mouseover', function(){
				eventItem.marker.openPopup()
			});
		$(li).on('mouseout', function(){
				eventItem.marker.closePopup()
			});

	})
}

app.getData = function(){
		$.ajax({
		url: 'http://localhost:3000/events/date/' + app.starttime + '/' + app.endtime,
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
			app.displayEvents();
		}
	});
}

app.init = function(){
	
	app.infosectionH = 30;

	app.today = new Date();
	app.defaultStart = 18;
	app.defaultEnd = 3;
	app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), app.defaultStart,0,0)
							.toISOString();
	app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, app.defaultEnd,0,0)
							.toISOString();

	// AJAX request to get and display events
	app.getData();

	// Dropdowns adapted from:
	// http://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/

	function DropDown(el) {
	    this.dd = el;
	    this.placeholder = this.dd.children('span');
	    this.opts = this.dd.find('ul.dropdown > li');
	    this.val = '';
	    this.lastval = null;  // preserve previous value
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
	            if (obj.val === obj.lastval){
	            	console.log("Date Changed");
	            }else{
	            	console.log("SAME SAME");
	            }
	        });
	    },
	    getValue : function() {
	        return this.val;
	    },
	    getIndex : function() {
	        return this.index;
	    }
	}

	app.ddDate = new DropDown( $('#date-select') );
	app.ddSTime = new DropDown( $('#start-select') );
	app.ddSTimeAMPM = new DropDown( $('#start-ampm') );
	app.ddETime = new DropDown( $('#end-select') );
	app.ddETimeAMPM = new DropDown( $('#end-ampm') );

	$('.wrapper-dropdown').removeClass('active');

	// make it sortable with jQuery UI
	$('ul#eventList').sortable({
	  connectWith: ".connected"
	});

};

$(function() {

  app.init();

});