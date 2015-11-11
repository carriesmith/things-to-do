$(document).ready(function(){
  
	$.ajax({
		url: 'http://localhost:3000/events',
		type: 'GET',
		dataType: 'json',
		success: function(data){
			data.forEach( function(anevent){
				console.log(anevent.eventname);
			})
		}
	});

});