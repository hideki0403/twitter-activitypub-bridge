import log4js from 'log4js'
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%d{hh:mm:ss} %[%p [%c]%] %m'
            }
        },
        file: {
            type: 'file',
            filename: './logs/system.log',
            pattern: 'yyyy-MM-dd',
            daysToKeep: 31,
            compress: true,
            keepFileExt: true,
            layout: {
                type: 'basic'
            }

        },
        filter: {
            type: 'logLevelFilter',
            appender: 'file',
            level: 'info'
        }
    },
    categories: {
        default: {
            appenders: ['console', 'filter'],
            level: 'trace'
        }
    }
})

export function getLogger(name: string) {
    return log4js.getLogger(name)
}