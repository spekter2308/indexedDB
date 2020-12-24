module.exports = {
    insertDeviceValue: (arr, min, max, value) => {
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
    },
    average: (avg, value, length) => {
        const newAvg = (avg * (length - 1) + value) / length;
        return newAvg;
    },
    median: (arr) => {
        const values = arr;
        const length = values.length;
        const median = length % 2 === 0 ? (values[length / 2] + values[length / 2 - 1]) / 2 : values[(length - 1) / 2];
        return median;
    }
}