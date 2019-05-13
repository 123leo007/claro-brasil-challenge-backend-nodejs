var proxy = require('express-http-proxy');
var express = require('express');
var Users = require('../data/users');
var router = express.Router();
var app = express();
var mongo = require('mongoose');
var url = "mongodb://localhost:27017";
var dbName = "/challengerDB";
mongo.Promise = global.Promise;

mongo.connect(url + dbName);

mongo.connection.once('open', function(){
   console.log('uhull');
}).on('error', function(error){
   console.log('error');
});

router.get('/startProject',function(req,res){

    var user = new Users({
        name: '123',
        email: '123@teste.com.br',
        login:'123',
        password:'@123'
    });
    var user2 = new Users({
        name: '456',
        email: '456@teste.com.br',
        login:'456',
        password:'@456'
    });

    var user3 = new Users({
        name: '789',
        email: '789@teste.com.br',
        login:'789',
        password:'@789'
    });

    user.save().then(function(){
        console.log('saved on DB:' + user);
    });
    user2.save().then(function(){
        console.log('saved on DB:' + user);
    });
    user3.save().then(function(){
        console.log('saved on DB:' + user);
    });
});

router.get('/teste',function(req,res){
    res.send({
        "Name":"teste",
        "email":"teste@teste.com.br",
        "user":"user"
    });
});

app.use(router);

app.use('/', proxy('http://localhost:8000'));

module.exports = app;