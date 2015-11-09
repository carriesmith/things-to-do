// pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Create an event using this schema
// This will be the basis of how events data is stored.
var EventSchema = new Schema({
  eventname: {type: String, required: true},
  shortdesc: {type: String, required: true},
  longdesc: {type: String, required: true},
  starttime: {type: Date, default: Date.now},
  endtime: {type: Date, default: Date.now},
  location: {type: [Number], required: true}, // [Long, Lat]
  venuename: {type: String, required: true},
  address: {type: String, required: true},
  price: {type: String, required: true},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
  link: {type: String, required: true}
});

// Sets the created_at parameter equal to the current time
EventSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Exports the EventSchema for use elsewhere.
// Sets the MongoDB collection to be used as 'mean-google-maps-user'
module.exports = mongoose.model('wassondb', EventSchema);