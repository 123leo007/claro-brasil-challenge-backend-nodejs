var proxy = require('express-http-proxy');
var express = require('express');
var jsonBody = require('body-parser');
var Users = require('../data/users');
var Devices = require('../data/Devices');
var router = express.Router();
var app = express();
var mongo = require('mongoose');
var url = "mongodb://localhost:27017";
var dbName = "/challengerDB";
var axios = require('axios');
mongo.Promise = global.Promise;

mongo.connect(url + dbName);

mongo.connection.once('open', function () {
    console.log('uhull');
}).on('error', function (error) {
    console.log('error');
});

/*
1. Adicionar um dispositivo, informando:
	- ID do usuário
	- ID do dispositivo
	- Nome do dispositivo
	- Modelo do dispositivo (Android, iOS)
2. Alterar o nome de um dispositivo através do ID
3. Remover um dispositivo através do ID
*/
router.post('/addDevice', function (req, res) {

    var login = req.body.login;
    var MAC = req.body.MAC;
    var name = req.body.name;
    var model = req.body.model;

    Users.find({ login: login }, function (err, docs) {
        var device = new Devices({
            userId: docs[0].login,
            macAddress: MAC,
            name: name,
            model: model
        });
        var hasOne = undefined;
        Devices.find({ macAddress: MAC }, (err, res) => {
            hasOne = res[0] !== undefined;
        }).then((data) => {
            console.log(hasOne);
                if (hasOne) {
                    device.save().then(function () {
                        res.send(device, 201);
                    }).catch(function () {
                        res.send(err);
                    });
                }else{
                    res.send("device already registered");
                }
            });
    })
});

router.post('/changeName', function (req, res) {

    var MAC = req.body.MAC;
    var name = req.body.name;

    Devices.findOneAndUpdate({ macAddress: MAC }, { name: name }, (error, doc) => {
        if (doc === null) {
            res.send("object not found");
        } else {
            res.send(doc);
            doc.save();
        }
        // error: any errors that occurred
        // doc: the document before updates are applied if `new: false`, or after updates if `new = true`
    });
});

router.post('/removeDevice', function (req, res) {

    var MAC = req.body.MAC;
    var data = undefined;
    Devices.find({ macAddress: MAC }, function (err, res) {
        data = res[0];
    }).then(() => {
        if (data !== undefined) {
            Devices.deleteMany({ macAddress: MAC }, (err) => {
                res.send("device Removed");
            });
        } else {
            res.send("device not found");
        }
    });
});

router.get('/deviceTeste', function (req, res) {
    res.send({
        "Name": "teste",
        "email": "teste@teste.com.br",
        "user": "user"
    });
});

router.get('/startProject', function (req, res) {

    addUser({
        name: '123',
        email: '123@teste.com.br',
        login: '123',
        password: '@123'
    });

    addUser({
        name: '456',
        email: '456@teste.com.br',
        login: '456',
        password: '@456'
    });

    addUser({
        name: '789',
        email: '789@teste.com.br',
        login: '789',
        password: '@789'
    });

    res.send(true);
});

router.get('/addDevices', function () {

    addDevice({
        macAddress: '90-32-4B-BF-74-85',
        name: 'CELLPHONE',
        model: 'Android',
        registeredDate: new Date("2016-05-16")
    }, '456');

    addDevice({
        macAddress: '90-32-4B-BF-74-86',
        name: 'CELLPHONE',
        model: 'Android',
        registeredDate: new Date("2016-05-17")
    }, '456');

    addDevice({
        macAddress: '90-32-4B-BF-74-87',
        name: 'CELLPHONE',
        model: 'Android',
        registeredDate: new Date("2016-05-18")
    }, '456');

});

function start() {
    return axios({
        url: `http://localhost:3000/startProject`,
        method: "GET",
        crossDomain: true,
        withCredentials: false,
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (data) {
        if (data) {
            return axios({
                url: `http://localhost:3000/addDevices`,
                method: "GET",
                crossDomain: true,
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
    });
}

start();

function addUser(data) {
    var user = new Users({
        name: data.name,
        email: data.email,
        login: data.login,
        password: data.password
    });

    user.save().then(function () {
        console.log("saved on DB: " + user);
    }).catch(
        console.log("error found")
    );
}

function addDevice(data, user) {
    Users.find({ login: user }, function (err, docs) {
        console.log(docs);

        var device = new Devices({
            userId: docs[0].login,
            macAddress: data.macAddress,
            name: data.name,
            model: data.model,
            registeredDate: data.registeredDate
        });

        device.save().then(function () {
            console.log('saved on DB:' + device);
        }).catch(
            console.log(err)
        );
    })
}

app.use(jsonBody.json());

app.use(router);

app.use('/', proxy('http://localhost:8000'));

module.exports = app;