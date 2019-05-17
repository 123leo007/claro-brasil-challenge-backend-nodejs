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

router.get('/retrieveUsers', (req, res) => {
    Users.find({},(err,user)=>{
        res.send(JSON.stringify(user));
    })
})

router.get('/retrieveDevices/:userId', (req, res) => {
    Devices.find({userId:req.params.userId},(err,devices)=>{
        res.send(devices);
    })
})

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
                    const diffDays = compareDates(docs[0].lastChangeDeviceDate, new Date());
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

    Users.findOne({ login: login }, (err, docs) => { }).then((doc) => {
        var diffDays = compareDates(doc.lastChangeDeviceDate, Date.now());
        if (diffDays >= 30) {
            console.log("doc login = " + doc.login);
            Devices.findOneAndUpdate({ macAddress: oldMAC, userId: doc.login }, { macAddress: MAC, name: name, model: model, registeredDate: Date.now() }, (err, docs) => {
                if (docs != undefined) {
                    var body = getBody();
                    body.arrayOfMessage[0] = "device changed";
                    body.result = docs;
                    res.status(202).send(body);
                    Users.findOneAndUpdate({ login: login }, { lastChangeDeviceDate: Date.now() }, (err, docs) => { });
                    docs.save();
                } else {
                    console.log("why?");
                    var body = getBody();
                    body.arrayOfMessage[0] = "device not found or already exist";
                    body.result = '';
                    res.status(500).send(body);
                }
            }).catch(() => {
                res.status(500).send(body);
            });
        } else {
            var body = getBody();
            body.arrayOfMessage[0] = "your limit of change devices was reached you need to wait " + (30 - diffDays) + " days to change again";
            body.result = '';
            res.status(202).send(body);
        }
    });
});

router.post('/removeDevice', function (req, res) {

    var MAC = req.body.MAC;
    console.log(req.body);
    Devices.findOne({ macAddress: MAC }, function (err, result) {
        if (result !== null) {
            Users.findOne({ login: result.userId }, (err, docs) => {
            }).then((doc) => {

                var diffDays = compareDates(doc.lastChangeDeviceDate, Date.now());
                Devices.count({ userId: doc.login }, (err, ct) => {
                    if (diffDays >= 30 || ct > 1) {
                        Devices.deleteMany({ macAddress: MAC }, (err) => {
                            var body = getBody();
                            body.arrayOfMessage[0] = "object removed";
                            body.result = doc;

                            res.status(200).send(body);
                            //res.send("device Removed", 202);
                        });
                    } else {
                        var body = getBody();
                        var time = new Date(Date.now() + ((30 - diffDays) * 24 * 60 * 60 * 1000));
                        body.arrayOfMessage[0] = "you can not remove a device until date: " + time;
                        body.result = time;
                        res.status(202).send(body);
                    }
                });
            });
        } else {
            var body = getBody();
            body.arrayOfMessage[0] = "device not removed";
            body.result = '';
            res.status(202).send(body);
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
            lastChangeDeviceDate: new Date("2016-05-16"),
            password: '@123'
        });

        addUser({
            name: '456',
            email: '456@teste.com.br',
            login: '456',
            lastChangeDeviceDate: new Date("2016-05-16"),
            password: '@456'
        });

        addUser({
            name: '789',
            email: '789@teste.com.br',
            login: '789',
            lastChangeDeviceDate: new Date(),
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
            registeredDate: new Date()
        }, '456');

        addDevice({
            macAddress: '90-32-4B-BF-74-86',
            name: 'CELLPHONE',
            model: 'Android',
            registeredDate: new Date()
        }, '456');

        addDevice({
            macAddress: '90-32-4B-BF-74-87',
            name: 'CELLPHONE',
            model: 'Android',
            registeredDate: new Date()
        }, '456');

        addDevice({
            macAddress: '90-32-4B-BF-74-90',
            name: 'CELLPHONE',
            model: 'iOS',
            registeredDate: new Date()
        }, '789');

        addDevice({
            macAddress: '90-32-4B-BF-74-91',
            name: 'CELLPHONE',
            model: 'iOS',
            registeredDate: new Date()
        }, '789');
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
        lastChangeDeviceDate: data.lastChangeDeviceDate,
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

//app.use('/',Front);

app.use('/', proxy('http://localhost:8000'));

module.exports = app;