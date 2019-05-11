var proxy = require('express-http-proxy');
var express = require('express');
var router = express.Router();
var app = express();

router.get('/teste',function(){
    log.info('teste');
})

app.use('/', proxy('http://localhost:8000'));
//app.listen(3000);

app.use(router);

module.exports = app;