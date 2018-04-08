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
const http_request = require('request');

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
                        fs.stat(resourcesPath + request.url,  (err, stats) =>{
                            if (!err && stats.isFile()) {
                                console.log('200 ' + request.url)
                                response.writeHead(200)
                                fs.createReadStream(resourcesPath  + request.url).pipe(response)
                            }else{
                                console.log('404 ' + request.url)
                                response.writeHead(404)
                                response.end('404 Not Found')
                            }
                        })
                    } else {
                        let arg = url.parse(request.url);
                        let d = path.parse(arg.pathname);

                        let options = {
                          url: 'http://' + address + arg.pathname,
                          headers: {
                            'X-Forwarded-For': '1.1.1.1',
                            'Host':request.headers['host']
                          }
                        }
                        mkdirp(resourcesPath  + d.dir, (err) => {
                            let contentType = mime.lookup(arg.pathname);
                            if( !contentType ){
                                response.writeHead(404,{'Content-Type': 'text/html'})
                                response.write('<head><meta charset="utf-8"/></head>');
                                response.end('<a href="http://web.sanguosha.com/220/play.html">进入游戏</a>')
                            }else{
                                remoteLogger.debug(request.url)
                                let writeStream = fs.createWriteStream(resourcesPath  + '/'+ d.dir  + '/'+d.base)
                                let readStream = http_request(options)
                                readStream.pipe(writeStream)
                                readStream.on('response',(x)=>{
                                    response.writeHead(x.statusCode, x.headers)
                                }).pipe(response)
                            }
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
