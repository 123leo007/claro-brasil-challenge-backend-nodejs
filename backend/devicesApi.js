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
var msg = "";
var body = {
    result: '',
    arrayOfMessage: []
};

//const moment = require('moment');
mongo.Promise = global.Promise;

mongo.connect(url + dbName);

mongo.connection.once('open', function () {
    console.log('uhull');
}).on('error', function (error) {
    console.log('error');
});

function setMsg(m) {
    msg = m;
}

function getMsg() {
    return msg;
}

function setBody(m) {
    body = m;
}

function getBody() {
    return body;
}

function compareDates(date1, date2) {

    var e = new Date(date1);
    var d = new Date(date2);
    const diffTime = Math.abs(e.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;

    return diffDays;
}
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
        var limitOver = undefined;

        Devices.find({ userId: login }, (err, res) => {
            limitOver = res.length >= 3;

        }).then((data) => {
            if (limitOver) {
                data.forEach(element => {

                    /*var e = new Date(element.registeredDate);
                    var d = new Date();
                    const diffTime = Math.abs(e.getTime() - d.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;*/
                    var canChange = false;
                    const diffDays = compareDates(element.registeredDate, new Date());
                    if (diffDays >= 30) {
                        console.log(true);
                        canChange = true;
                        setMsg("device limit reached, but you can change one");
                        //res.send("device limit reached, but you can change one", 202);
                    } else if (!canChange) {
                        setMsg("device limit reached, and you need to wait " + (30 - diffDays) + " to change one");
                    }
                });
                var body = getBody();
                body.arrayOfMessage[0] = getMsg();
                body.result = '';

                res.status(202).send(body);
            } else {
                Devices.find({ macAddress: MAC }, (err, res) => {
                    hasOne = res[0] !== undefined;
                }).then(() => {
                    console.log(hasOne);
                    if (!hasOne) {
                        device.save().then(function () {

                            var body = getBody();
                            body.arrayOfMessage[0] = 'SUCCESS';
                            body.result = device;

                            res.status(201).send(body);
                        }).catch(function () {
                            res.send(err, 500);
                        });
                    } else {
                        var body = getBody();
                        body.arrayOfMessage[0] = "device already registered";
                        body.result = '';

                        res.status(202).send(body);
                    }
                });
            }
        })

    })
});

router.post('/changeName', function (req, res) {

    var MAC = req.body.MAC;
    var name = req.body.name;

    Devices.findOneAndUpdate({ macAddress: MAC }, { name: name }, (error, doc) => {
        if (doc === null) {
            var body = getBody();
            body.arrayOfMessage[0] = "object not found";
            body.result = device;

            res.status(204).send(body);
        } else {
            var body = getBody();
            body.arrayOfMessage[0] = "object updated";
            body.result = doc;

            res.status(200).send(body);
            doc.save();
        }
        // error: any errors that occurred
        // doc: the document before updates are applied if `new: false`, or after updates if `new = true`
    });
});

router.post('/changeDevice', function (req, res) {

    var login = req.body.login;
    var MAC = req.body.MAC;
    var name = req.body.name;
    var model = req.body.model;
    var oldMAC = req.body.oldMAC;

    Users.find({ login: login }, function (err, docs) {
        var device = new Devices({
            userId: docs[0].login,
            macAddress: MAC,
            name: name,
            model: model
        });
        var hasOne = undefined;
        var newOne = undefined;

        Devices.find({ userId: login }, (err, res) => {
            limitOver = res.length >= 3;

        }).then((data) => {
            if (limitOver) {
                var lastMacAddress = '';
                data.forEach(element => {
                    var getError = undefined;
                    if (element.macAddress === oldMAC) {
                        const diffDays = compareDates(element.registeredDate, new Date());
                        console.log(diffDays);
                        var canChange = false;
                        if (diffDays >= 30) {
                            canChange = true;
                            var body = getBody();
                            Devices.findOneAndUpdate({ macAddress: oldMAC },
                                { macAddress: MAC, name: name, model: model, registeredDate: new Date() },
                                (err, doc) => {
                                    getError = err;
                                    if (doc !== undefined) {
                                        body.arrayOfMessage[0] = 'SUCCESS';
                                        body.result = doc;
                                        res.status(202).send(body);
                                        doc.save();
                                    } else {
                                        body.arrayOfMessage[0] = "new device already registered";
                                        body.result = '';
                                        res.status(202).send(body);
                                    }
                                }).catch();
                        } else if (!canChange) {
                            var body = getBody();
                            body.arrayOfMessage[0] = "device limit reached, and you need to wait " + (30 - diffDays) + " to change one";
                            body.result = '';

                            res.status(202).send(body);
                        }
                    } else if (element.macAddress === data[data.length - 1].macAddress) {
                        if (getError === undefined) {
                            var body = getBody();
                            body.arrayOfMessage[0] = "device not found";
                            body.result = '';
                            res.status(202).send(body);
                        } else {
                            body.arrayOfMessage[0] = "new device already registered: " + getError;
                            body.result = '';
                            res.status(202).send(body);
                        }
                    }
                    lastMacAddress = element.macAddress;
                });
                while (lastMacAddress !== data[data.length - 1].macAddress) {
                    console.log('waiting!');
                }
                var body = getBody();
                body.arrayOfMessage[0] = "device not found";
                body.result = '';
                //res.status(202).send(body);
                console.log('ops');
            } else {
                Devices.find({ macAddress: oldMAC }, (err, res) => {
                    hasOne = res[0] !== undefined;
                    newOne = res[0];
                }).then(() => {
                    if (!hasOne) {
                        device.save().then(function () {
                            var body = getBody();
                            body.arrayOfMessage[0] = 'SUCCESS';
                            body.result = device;

                            res.status(201).send(body);
                        }).catch(function () {
                            res.send(err, 500);
                        });
                    } else {
                        var diffDays = compareDates(data.registeredDate, new Date());
                        if (diffDays >= 30) {
                            Devices.findOneAndUpdate({ macAddress: oldMAC },
                                { macAddress: MAC, name: name, model: model, registeredDate: new Date() },
                                (err, doc) => {

                                    var body = getBody();
                                    body.arrayOfMessage[0] = 'SUCCESS';
                                    body.result = doc;

                                    res.status(201).send(body);
                                    doc.save();

                                });
                        } else {
                            var body = getBody();
                            body.arrayOfMessage[0] = "this device can't be changed";
                            body.result = '';

                            res.status(202).send(body);
                        }
                    }
                });
            }
        })
    })
});

router.post('/removeDevice', function (req, res) {

    var MAC = req.body.MAC;
    var data = undefined;
    Devices.find({ macAddress: MAC }, function (err, res) {
        data = res[0];
    }).then(() => {
        if (data !== undefined) {
            Devices.deleteMany({ macAddress: MAC }, (err) => {
                var body = getBody();
                body.arrayOfMessage[0] = "object removed";
                body.result = doc;

                res.status(200).send(body);
                //res.send("device Removed", 202);
            });
        } else {
            var body = getBody();
            body.arrayOfMessage[0] = "device not found";
            body.result = doc;

            res.status(204).send(body);
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
    Users.remove({}, () => { }).then(() => {

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
    });

    res.send(true);
});

router.get('/addDevices', function () {
    Devices.remove({}, () => { }).then(() => {
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