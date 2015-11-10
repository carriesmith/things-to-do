var mongoose = require('mongoose');
var Event = require('../models/events.js');
var path = require('path');

// Open app routes
module.exports = function(app, express){

  // ROUTES FOR OUR API
  // ==================================

  // GET Routes
  // ---------------------------------------
  // Retrieve records for all events in the db

  // app.post('/addevent', function(req, res) {

  //   // concatenate date of event with start time & end time
  //   var starttime = new Date(req.body.eventdate + ' ' + req.body.starttime);
  //   var endtime = new Date(req.body.eventdate + ' ' + req.body.endtime);

  //   // if the starttime is later than the endtime, then the event 
  //   // rolls into the next day. Add +1 to the date for the endtime.
  //   if (starttime > endtime) {
  //     endtime.setDate(endtime.getDate() + 1);
  //   }

  //   req.body.starttime = starttime;
  //   req.body.endtime = endtime;

  //   res.send(req.body);

  // });

  app.route('/events')
  .get(function(req,res){
    // Uses Mongoose schema to run the search (empty conditions)
    var query = Event.find({});
    query.exec(function(err, events){
      
      if(err)
        res.send(err);

      // if no errors, responds with JSON of all events
      res.json(events);

    });
  });

  // POST Routes
  // ---------------------------------------
  // Provides a method for saving new events in the db

  app.post('/events', function(req, res){

    // Do some manipulation of the addevent form elements to 
    // match the event schema.

    // concatenate date of event with start time & end time
    var starttime = new Date(req.body.eventdate + ' ' + req.body.starttime);
    var endtime = new Date(req.body.eventdate + ' ' + req.body.endtime);

    // if the starttime is later than the endtime, then the event 
    // rolls into the next day. Add +1 to the date for the endtime.
    if (starttime > endtime) {
      endtime.setDate(endtime.getDate() + 1);
    }

    req.body.starttime = starttime;
    req.body.endtime = endtime;

    req.body.location = [req.body.longitude, req.body.latitude];

    // Creates a new event based on the Mongoose schema
    // and add the post to body

    var newevent = new Event(req.body);

    // ??? Necessary to do a type conversion here ???
    newevent.starttime = new Date(newevent.starttime);
    newevent.endtime = new Date(newevent.endtime);

    // Save new event to the database.
    newevent.save(function(err){
      if(err)
        res.send(err);

      // if no errors are found, response with a JSON
      // of the new user
      res.json(req.body);

    });

    // res.send(newevent);

  });

  // http://localhost:3000/events/date/2015-11-09T20:00:00/2015-11-10T05:30:00/
  // http://localhost:3000/events/date/2015-11-09T13:00:00/2015-11-10T03:30:00
  app.route('/events/date/:start/:end')
    // GET Get the events on :date (accessed at GET http://localhost:8080/events/:date)
    .get(function(req, res){

      // ToDo: Add try / catch
      var starttime = new Date(req.params.start);
      var endtime = new Date(req.params.end);

      debugger;

      Event.find(
        {
          starttime: { $gte: starttime },
          endtime: { $lte: endtime }
        }
        , function(err, events){
        if(err) res.send(err);

        // // return the user
        res.json(events);

      }); // close Event.findById
    }) // close .get

  app.route('/events/price/:price')
    // GET Get the events on :date (accessed at GET http://localhost:8080/events/:date)
    .get(function(req, res){
      Event.find({price: req.params.price}, function(err, events){
        if(err) res.send(err);

        // return the user
        res.json(events);

      }); // close Event.findById
    }) // close .get

    app.route('/events/:event_id')
        .get(function(req, res){
          Event.findById(req.params.event_id, function(err, event){
            if(err) res.send(err);

            // return the user
            res.json(event);

          }); // close User.findById
        })
        .delete(function(req, res){
          Event.remove({
              _id: req.params.event_id
            }, function(err, event){
              if (err) return res.send(err);

              res.json({
                message: 'event deleted.'
              }); // close res.json

            }); // close User.remove
        });

};