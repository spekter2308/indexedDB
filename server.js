const http = require('http');
const { formattedData } = require('./lib/index.js')

async function formattedResponseJsonData() {
    const jsonData = {};
    const data = await formattedData();
    for (const [date, devices] of data) {
        jsonData[date] = devices;
    }
    return jsonData;
}
async function onRequest(request, response) {
    console.log('handling...')
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const data = await formattedResponseJsonData();
    response.end(JSON.stringify(data));
}

http.createServer(onRequest).listen(8000);
