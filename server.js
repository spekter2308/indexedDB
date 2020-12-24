const http = require('http');
const test = require('./index.js');

function onRequest(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    //response.write(test.test());
    response.end(JSON.stringify(test.test()));
}

http.createServer(onRequest).listen(8000);
