const http = require('http')
const path = require("path")
const log4js = require('log4js')
const child_process = require("child_process");
const mime = require('mime-types')
const fs = require("fs")
const url = require('url')
const dns = require('dns')
const hostile = require('hostile')
const mkdirp = require('mkdirp')
const yaml = require('read-yaml')
const crypto = require('crypto')
const EventEmitter = require('events').EventEmitter

let resourcesPath = path.join(__dirname, '../resources')
let config = yaml.sync(path.join(__dirname, '../config.yaml'))
let logPath = path.join(__dirname, '../logs/all-the-logs.log')
let domain = 'web.sanguosha.com'

let search = function(file) {
    let filemd5 = crypto.createHash("md5").update(file).digest('hex');
    for (i = 0; i < config.length; i++) {
        if (filemd5 == crypto.createHash("md5").update(config[i]).digest('hex')) {
            return true;
        }
    }
}

log4js.configure({
    appenders: {
        everything: {
            type: 'dateFile',
            filename: logPath,
            pattern: '.yyyy-MM-dd-hh',
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ['everything'],
            level: 'debug'
        }
    }
})
const localLogger = log4js.getLogger('local')
const remoteLogger = log4js.getLogger('remote')

let events = new EventEmitter()
module.exports.createServer = (port = 80) => {
    let server = http.createServer((request, response) => {}).listen(port)
    dns.lookup(domain, (err, address, family) => {
        hostile.set('127.0.0.1', domain, (err) => {
            if (err) {
                events.emit('sgsc:error', err)
            } else {
                server.on('connection', (err, socket) => {})
                server.on('request', (request, response) => {
                    let exis = search(request.url)
                    if (exis) {
                        localLogger.debug(request.url)
                        let file = fs.readFileSync(resourcesPath + '/' + request.url);
                        let contentType = mime.lookup(request.url);
                        response.writeHead(200, {
                            'Content-Type': '' + contentType + ''
                        });
                        response.write(new Buffer(file, 'binary'));
                        response.end();
                    } else {
                        let arg = url.parse(request.url);
                        let curl = 'curl  http://' + address + '/' + arg.pathname + ' -H "X-Forwarded-For: 1.1.1.1" -H "Host: ' + request.headers['host'] + '"';
                        let child = child_process.exec(curl, {
                            encoding: 'binary',
                            timeout: 0,
                            maxBuffer: 20000 * 10240
                        }, function(err, stdout, stderr) {
                            let d = path.parse(arg.pathname);
                            mkdirp(resourcesPath + '/' + d.dir, (err) => {
                                if (err)
                                    console.error(err)
                                else
                                    fs.writeFile(resourcesPath + '/' + d.dir + '/' + d.base, new Buffer(stdout, 'binary'), () => {});
                                }
                            );
                            let contentType = mime.lookup(arg.pathname);
                            if (contentType == false) {
                                //contentType = 'application/octet-stream';
                            }
                            response.writeHead(200, {
                                'Content-Type': '' + contentType + '',
                                'Content-Length': Buffer.byteLength(new Buffer(stdout, 'binary'), 'binary')
                            });
                            remoteLogger.debug(request.url)
                            response.end(new Buffer(stdout, 'binary'));
                        })
                    }
                })
            }
        })
    })
    server.on('error', (e) => {
        events.emit('sgsc:error', e)

    })
    server.on('listening', (err, socket) => {
        events.emit('sgsc:listening', '服务启动成功 ')
    })
    return events
}
