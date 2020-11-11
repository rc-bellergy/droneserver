import fs from 'fs';
import { config } from './config.js';

export default class Log {
    constructor(file) {
        this.logFile = fs.createWriteStream(config.LOG_FILE_PATH + file, {flags : 'w'});
    }
    log(data) {
        var log = new Date().toISOString() + ", ";
        log += data + "\n";
        this.logFile.write(log);
        console.log(log);
    }

    event(data, event="") {
        var log = new Date().toISOString() + ", ";
        log += event + ", ";
        if (typeof(data) == "object") {
            data = JSON.stringify(data);
        }
        log += data + "\n";
        this.logFile.write(log);
        console.log(log);
    }

}
