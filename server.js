const http = require('http');
const reportData = require('./index.js');

async function onRequest(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    //response.write(test.test());
    //console.log(reportData.reportDataJson())
    const data = await reportData.reportDataJson();
    response.end(JSON.stringify(data));
}

http.createServer(onRequest).listen(8000);
