var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    userId:String,
    macAddress:{ type: String, unique: true },
    name:String,
    model:{
        type: String,
        enum: ['iOS', 'Android']
      },
    registeredDate:{type:Date, default: Date.now}
});

var Devices = mongoose.model('devices',DeviceSchema);

module.exports = Devices;