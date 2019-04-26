'use strict';
const appConfig = require('./config');
const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, printf } = format;

const customLogFormat = printf(info => {
    if (info.timestamp) {
        info['@timestamp'] = info.timestamp;
    }
    return info;
});

const loggerFactory = config => {
    const isProduction = config.env === 'production';

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
            new winston.transports.File({ filename: 'combined.log' })
        ]
    });

    if (isProduction) {
        logger.add(new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }));

        logger.add(new winston.transports.File({
            filename: 'combined.log'
        }));
    } else {
        logger.add(new winston.transports.Console({
            format: combine(
                timestamp(),
                customLogFormat,
                format.json()
            )
        }));
    }

    return logger;
};

module.exports = loggerFactory(appConfig);
