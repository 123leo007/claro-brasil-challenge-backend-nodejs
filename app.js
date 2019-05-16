var express = require('express');
var app = express();
var Front = require('./js/front');


//htmlDocument = jsServer.createHTMLDocument();

/*app.use('/js', express.static('js'));
app.get('/', function (req, res) {
   res.sendFile('./js/index.js');
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   fs.readFile('./public/index.html', null, function (error, doc) {
      if (error) {
         res.writeHead(404);
         res.write('File not found!');
      } else {
         
        // document.LoadHtml(doc);
         doc.getElementById('dropUsers').innerHTML='<button class="dropdown-item" type="button">Action</button>' +
         '<button class="dropdown-item" type="button">Another action</button>' +
         '<button class="dropdown-item" type="button">Something else here</button>';
         res.write(doc);
      }
      res.end();
   });
});*/
app.use('/', express.static('public'));

app.get('/js/front.js',(req,res)=>{
   res.send(Front.init());
});

app.get('/', function(req, res) {
   res.sendFile('./public/index.html');
});

app.listen(8000);