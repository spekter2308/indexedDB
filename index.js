const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);
const { table } = require('table');

const { formattedData } = require('./lib/index.js')
const outputPath = './resultFile/'

generateFile();

async function generateFile() {
    const data = await formattedData();
    let outputText = '';
    for (const [ts, content] of data.entries()) {
        outputText += ts + "\n";
        outputText += table(content)
        outputText += "\n";
    }
    try {
        await writeFile(outputPath + 'report.txt', outputText
        );
        console.log("file generated");
    } catch (error) {
        console.log(error);
    }
}

