var app = {};

app.today = new Date();


app.starttime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate(), 8,0,0)
						.toISOString();
app.endtime = new Date(app.today.getFullYear(), app.today.getMonth(), app.today.getDate() + 1, 8,0,0)
						.toISOString();

app.displayEvents = function(){

	app.eventList.forEach(function(eventItem){

		var $li = $('<li>').addClass('eventitem');
		var $name = $('<div>').append(eventItem.eventname).addClass('eventname')
		var $price = $('<div>').append(eventItem.price).addClass('price')
		$li.append($name).append($price);

		$('#eventList').append($li);	

	})

}

app.init = function(){
	
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