var app = {};

app.timelineD3 = function(timesvg, eventItem, height, width){

		var viewTimes = [{starttime: app.starttime, endtime: app.endtime}]
		var data = [{starttime: eventItem.starttime, endtime: eventItem.endtime}]

		// Chart parameters
		var margin = {	top: height, 
						right: 20,
						bottom: 0,
						left: 20 };

		var height = height - margin.top - margin.bottom,
			width = width - margin.left - margin.right;

		var timeScale = d3.time.scale.utc()
							.domain([new Date(viewTimes[0].starttime), new Date(viewTimes[0].endtime)])
							.range([0, width]);

		var timeChart = d3.select(timesvg)
							.append('svg')
								.attr('width', width + margin.left + margin.right)
								.attr('height', height + margin.top + margin.bottom)
							.append('rect')
								.attr({
									'x': timeScale(new Date(data[0].starttime)),
									'width': timeScale(new Date(data[0].endtime)) - timeScale(new Date(data[0].starttime)),
									'y': height+2,
									'height': 8,
									'fill': '#ad0025',
									'stroke': '#ad0025',
									'stroke-width': 2,
									'opacity': .75,
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

app.displayEvents = function(){

	var map = L.map('map', {closePopupOnClick: true}).setView([40.7, -74.0], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'carriesmith.nii6d5je',
	    accessToken: 'pk.eyJ1IjoiY2Fycmllc21pdGgiLCJhIjoiY2lmNGQ2MWloMDFmaXg0a3NibnpyY3I2bCJ9.MTvJHm90YDJtaIyxvvNoKw'
	}).addTo(map);

	app.eventList.forEach(function(eventItem){

		// Process start / end times correct for UTC offset
		eventItem.starttime = new Date(eventItem.starttime);
		eventItem.starttime = new Date(eventItem.starttime.getFullYear(), eventItem.starttime.getMonth(), eventItem.starttime.getDate(), eventItem.starttime.getHours() + app.utcOffset,eventItem.starttime.getMinutes(),0)
							.toISOString();
		eventItem.endtime = new Date(eventItem.endtime);
		eventItem.endtime = new Date(eventItem.endtime.getFullYear(), eventItem.endtime.getMonth(), eventItem.endtime.getDate(), eventItem.endtime.getHours() + app.utcOffset,eventItem.endtime.getMinutes(),0)
							.toISOString();
		
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
		if (!isNaN(parseFloat(eventItem.price)) && isFinite(eventItem.price)){
			eventItem.price = '$' + eventItem.price;
		}


		// create new list item for an event
		var li = $('<li>').addClass('eventitem');

		// timesvg div will contain the SVG time visual
		var timesvg = $('<div>').addClass('timesvg');

		// append event name
		var name = $('<div>').append('<a href = "'+ eventItem.link + '" target="_blank">' + eventItem.eventname.toLowerCase() + '</a>').addClass('eventname');
		// append price of admission

		var price = $('<div>').append(eventItem.price.toLowerCase()).addClass('price');

		// shortdesc div contains the short description of the event
		var shortdesc = $('<div>')
								.append(eventItem.shortdesc)
								.addClass('shortdesc');
		
		var xButton = $('<div>')
							.addClass('xbutton')
							.append('<i class="fa fa-times"></i>')
							.click(function(){
								$(li).slideUp();
								map.removeLayer(eventItem.marker);
							});

		var viewButton = $('<div>')
								.addClass('viewbutton')
								.append('<i class="fa fa-caret-up"></i>')
								.click(function(){
									$(shortdesc).toggleClass('open');
									$(this).find('i').toggleClass('fa-caret-up');
									$(this).find('i').toggleClass('fa-caret-down');
								});

		var infosection = $('<div>')
								.addClass('infosection')

		infosection.append(name)
			.append(price)
			.append(viewButton)
			.append(xButton)
			.append(shortdesc);

		// combine into a single list item
		li.append(infosection)
			.append(timesvg);

		app.timelineD3(timesvg[0], eventItem, 30, 620);

		// add start and end times as data attributes to list item element
		li.attr('data-starttime', eventItem.starttime);
		li.attr('data-endtime', eventItem.endtime);

		$('#eventList').append(li);	

		eventItem.marker = L.marker([eventItem.location[1], eventItem.location[0]]).addTo(map);
		eventItem.marker.bindPopup(eventItem.eventname);

		// $(eventItem.marker).mouseover(function(){
		// 	$(li).addClass('selected');
		// });

		// $(eventItem.marker).mouseout(function(){
		// 	$(li).removeClass('selected');
		// });

		eventItem.marker.on('mouseover', function(){
			$(li).addClass('selected');
		});

		eventItem.marker.on('mouseout', function(){
			$(li).removeClass('selected');
		});

		$(li).on('mouseover', function(){
				console.log();
				eventItem.marker.openPopup()
			});

		$(li).on('mouseout', function(){
				console.log();
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
	
	app.today = new Date();

	app.utcOffset = parseInt(moment().format("Z").slice(0,3));

	app.defaultStart = 9 + app.utcOffset;

	app.defaultEnd = 6 + app.utcOffset;

	app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), app.defaultStart,0,0)
							.toISOString();
	app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, app.defaultEnd,0,0)
							.toISOString();

	app.getData();

	// Dropdowns adapted from:
	// http://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/

	function DropDown(el) {
	    this.dd = el;
	    this.placeholder = this.dd.children('span');
	    this.opts = this.dd.find('ul.dropdown > li');
	    this.val = '';
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
	            obj.val = opt.text();
	            obj.index = opt.index();
	            obj.placeholder.text(obj.val);
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

};

$(function() {

  app.init();

  // make it sortable with jQuery UI
  $('ul#eventList').sortable({
    connectWith: ".connected"
  });

});