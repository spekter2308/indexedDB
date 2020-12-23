const util = require('util');
const fs = require('fs');
const xlsx = require('xlsx');
const tableImport = require('table');
const { table } = tableImport;
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
const fileTxt = './inputFiles/results.txt'
const fileExcel = './inputFiles/devices.csv'
const outputPath = './resultFile/'

init();
async function init() {
    const fileExcelData = await getExcelFileData(fileExcel);
    const fileTxtData = await getTxtFileData(fileTxt);

    const devicesByLocation = groupDevicesByLocation(fileExcelData);
    //const maxLength = groupDevicesByLocation.pop();
    const devicesValuesByTimestamp = groupDevicesValuesByTimestamp(fileTxtData);

    const sortedTimestapms = Array.from(devicesValuesByTimestamp.keys()).sort((a, b) => {return parseInt(a) - parseInt(b)})
    const timeRanges = groupTimestampsByTimeRange(sortedTimestapms);

    const formattedData = formatData(timeRanges, devicesValuesByTimestamp, devicesByLocation);
    generateFile(outputPath, formattedData);

    function formatData(timeGroups, devicesData, groupDevicesByLocation) {
        const outputData = new Map();
        for (const [timeGroup, dates] of timeGroups) {
            const devicesDataTable = [['Device', 'Min', 'Max', 'Avg', 'Median']];
            for (const date of dates) {
                if (devicesData.has(date)) {
                    const devicesForDateGroup = devicesData.get(date);
                    for (const deviceInfo of groupDevicesByLocation) {
                        if (devicesForDateGroup.has(deviceInfo.id)) {
                            const deviceValues = devicesForDateGroup.get(deviceInfo.id);
                            const deviceName = deviceInfo.location + ': ' + deviceInfo.name;
                            devicesDataTable.push([deviceName, deviceValues.min, deviceValues.max, deviceValues.avg, deviceValues.median])
                        }
                    }
                }
            }
            outputData.set(timeGroup, devicesDataTable);
        }
        return outputData;
    }
}

function groupTimestampsByTimeRange(timestamps) {
    const orderedDatesByGroup = new Map();
    for (const ts of timestamps) {
        const timestampWithoutMinutes = new Date(parseInt(ts)).setMinutes(0,0);
        const timeOutputFormat = getTimeGroupAsString(timestampWithoutMinutes);
        if (!orderedDatesByGroup.has(timeOutputFormat)) {
            orderedDatesByGroup.set(timeOutputFormat, [ts]);
        }
        const dateGroup = orderedDatesByGroup.get(timeOutputFormat);
        if (!dateGroup.includes(ts)) {
            dateGroup.push(ts);
        }
    }

    return orderedDatesByGroup;
}

async function generateFile(path, data) {
    let outputText = '';
    for (const [ts, content] of data.entries()) {
        console.log(ts, content)
        break
        outputText += ts + "\n";
        outputText += table(content)
    }
    console.log(outputText)
    try {
        await writeFile(outputPath + 'report.txt', reportData
        );
        console.log("file generated");
    } catch (error) {
        console.log(error);
    }
}

function getTimeGroupAsString(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    let day = date.getDay();
    day = day < 10 ? '0' + day : day;
    let hours = date.getHours();
    const nextHours = hours + 1 < 10 ? '0' + (hours + 1) : hours + 1;
    hours = hours < 10 ? '0' + hours : hours;
    return year + '-' + month + '-' + day + " " + hours + ':00-' + nextHours + ':00';
}

function groupDevicesValuesByTimestamp(lines) {
    const result = new Map();
    for (const line of lines) {
        let id, ts, value;
        if (line.trim()[0] === "{") {
            const parsedLine = JSON.parse(line);
            id = parsedLine.id;
            ts = Date.parse(parsedLine.ts).toString();
            value = parseInt(parsedLine.value);
        } else {
            const parsedLine = line.trim().split('\\t');
            id = parsedLine[0];
            ts = parsedLine[1];
            value = parseInt(parsedLine[2]);
        }
        //add new timestamp
        if (!result.has(ts)) {
            result.set(ts, new Map([[id, {min: value, max: value, avg: value, median: value, values: [value]}]]));
        }
        const timestamp = result.get(ts);
        //add new device to timestamp
        if (!timestamp.has(id)) {
            timestamp.set(id, {min: value, max: value, avg: value, median: value, values: [value]});
        }
        const deviceValues = timestamp.get(id);
        //set min/max value for device
        deviceValues.min = deviceValues.min < value ? deviceValues.min : value;
        deviceValues.max = deviceValues.max > value ? deviceValues.max : value;
        //insert value to device values with correct order
        deviceValues.values = insertDeviceValue(deviceValues.values, deviceValues.min, deviceValues.max, value);
        deviceValues.median = median(deviceValues.values);
        deviceValues.avg = average(deviceValues.avg, value, deviceValues.values.length);
    }
    return result;

    function insertDeviceValue(arr, min, max, value) {
        const values = arr;
        const length = values.length - 1;
        if (value <= min) {
            values.unshift(value);
            return values;
        }
        if (value >= max) {
            values.push(value);
            return values;
        }
        let index = 0;
        while (index <= length) {
            if (value < values[index]) {
                break;
            }
            index++;
        }
        values.splice(index, 0, value);
        return values;
    }

    function average(avg, value, length) {
        const newAvg = (avg * (length - 1) + value) / length;
        return newAvg;
    }

    function median(arr) {
        const values = arr;
        const length = values.length;
        const median = length % 2 === 0 ? (values[length / 2] + values[length / 2 - 1]) / 2 : values[(length - 1) / 2];
        return median;
    }
}

function groupDevicesByLocation(rows) {
    const result = [];
    //let maxLength = 0;
    for (const row of rows) {
        const locLen = row[2].length;
        const nameLen = row[1].length;
        //maxLength = locLen + nameLen > maxLength ? locLen + nameLen : maxLength;
        result.push({location: row[2], id: row[0], name: row[1]});
    }
    const sorted = result.sort((a, b) => (a.location > b.location ? 1 : -1));
    //sorted.push({maxLength})
    return sorted;
}

async function getTxtFileData(file) {
    const data = await readFile(file, 'utf8')
    const lines = data.split(/\r?\n/);
    return lines;
}

async function getExcelFileData(file) {
    const data = await xlsx.readFile(file);
    const result = [];
    let row, rowNum, colNum;
    const range = xlsx.utils.decode_range(data.Sheets.Sheet1['!ref']);
    for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
        row = [];
        for(colNum=range.s.c; colNum<=range.e.c; colNum++){
            const nextCell = data.Sheets.Sheet1[
                xlsx.utils.encode_cell({r: rowNum, c: colNum})
                ];
            if( typeof nextCell === 'undefined' ){
                continue;
            } else row.push(nextCell.v);
        }
        result.push(row);
    }
    return result;
}

