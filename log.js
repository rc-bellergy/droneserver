const fs = require('fs');
const config = require('./config.js');

module.exports = class Log {
    constructor(file) {
        this.logFile = fs.createWriteStream(config.LOG_FILE_PATH + file, {flags : 'w'});
    }
    log(data) {
        this.logFile.write(Date.now() + ',' + data + '\n');
        console.log(data);
    }
}
