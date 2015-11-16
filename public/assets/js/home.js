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
									'height': 10,
									'fill': '#136E71',
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

		// create new list item for an event
		var li = $('<li>').addClass('eventitem');

		// timesvg div will contain the SVG time visual
		var timesvg = $('<div>').addClass('timesvg');

		// append event name
		var name = $('<div>').append('<a href = "'+ eventItem.link + '" target="_blank">' + eventItem.eventname.toLowerCase() + '</a>').addClass('eventname');
		// append price of admission
		var price = $('<div>').append(eventItem.price).addClass('price');

		// shortdesc div contains the short description of the event
		var shortdesc = $('<div>')
								.append(eventItem.shortdesc)
								.addClass('shortdesc');
		
		var xButton = $('<div>')
							.addClass('xbutton')
							.append('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
							.click(function(){
								$(li).slideUp();
								map.removeLayer(eventItem.marker);
							});

		var viewButton = $('<div>')
								.addClass('viewbutton')
								.append('<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>')
								.click(function(){
									$(shortdesc).toggleClass('open');
									$(this).find('span').toggleClass('glyphicon-chevron-down');
									$(this).find('span').toggleClass('glyphicon-chevron-up');
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

		app.timelineD3(timesvg[0], eventItem, 30, 645);

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

app.init = function(){
	
	app.today = new Date();

	app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), 4,0,0)
							.toISOString();
	app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, 1,0,0)
							.toISOString();

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

};

$(function() {

  app.init();

  // make it sortable with jQuery UI
  $('ul#eventList').sortable({
    connectWith: ".connected"
  });

});