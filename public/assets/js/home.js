var app = {};

app.displayEvents = function(){

	var map = L.map('map').setView([40.7, -74.0], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'carriesmith.nii6d5je',
	    accessToken: 'pk.eyJ1IjoiY2Fycmllc21pdGgiLCJhIjoiY2lmNGQ2MWloMDFmaXg0a3NibnpyY3I2bCJ9.MTvJHm90YDJtaIyxvvNoKw'
	}).addTo(map);

	app.eventList.forEach(function(eventItem){

		// create new list item for an event
		var li = $('<li>').addClass('eventitem');

		// The basic div contains the basic event deets
		var basic = $('<div>').addClass('basic');
		// append event name
		var name = $('<div>').append('<a href = "'+ eventItem.link + '">' + eventItem.eventname.toLowerCase() + '</a>').addClass('eventname');
		// append price of admission
		var price = $('<div>').append(eventItem.price).addClass('price');
		basic.append(name).append(price);

		// timesvg div will contain the SVG time visual
		var timesvg = $('<div>').addClass('timesvg');
		// temporary
		timesvg.append('<img src="http://placehold.it/200x40">')

		// shortdesc div contains the short description of the event
		var shortdesc = $('<div>')
								.append(eventItem.shortdesc)
								.addClass('shortdesc');
		
		var info = $('<div>').addClass('infosection');
		info.append(basic).append(timesvg).append(shortdesc);

		// eventbuttons contain the X, view (more/less), and link buttons
		var eventbuttons = $('<div>').addClass('eventbuttons');

		var xButton = $('<button>')
							.addClass('xbutton btn btn-default')
							.append('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
							.click(function(){
								$(li).slideUp();
								map.removeLayer(eventItem.marker);
							});

		var viewButton = $('<button>')
								.addClass('viewbutton btn btn-default')
								.append('<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>');

		eventbuttons.append(xButton).append(viewButton);

		// combine into a single list item
		li.append(info).append(eventbuttons);

		// add start and end times as data attributes to list item element
		li.attr('data-starttime', eventItem.starttime);
		li.attr('data-endtime', eventItem.endtime);

		$('#eventList').append(li);	

		eventItem.marker = L.marker([eventItem.location[1], eventItem.location[0]]).addTo(map);
		eventItem.marker.bindPopup(eventItem.eventname);

		$(eventItem.marker).mouseover(function(){
			$(li).addClass('selected');
		});

		$(eventItem.marker).mouseout(function(){
			$(li).removeClass('selected');
		});

	})

}

app.init = function(){
	
	app.today = new Date();

	app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), 8,0,0)
							.toISOString();
	app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, 8,0,0)
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