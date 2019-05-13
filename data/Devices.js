var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name:String,
    email:String,
    login:String,
    password:String
});

var User = mongoose.model('user',UserSchema);

module.exports = User;