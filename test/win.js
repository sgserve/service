const hostile = require('hostile')
const child_process = require("child_process");
const path = require("path")
const dns = require('dns')
const fs = require("fs")

const request = require('request');
// hosts test
hostile.remove('127.0.0.1', 'web.sanguosha.com', (err)=> {
  if (err) {
    console.error(err)
  } else {
    console.log('remove /etc/hosts successfully!')
  }
})



// path test
let resourcesPath = path.join(__dirname, '../resources')
let config = path.join(__dirname, '../config.yaml')
let logPath = path.join(__dirname, '../logs/all-the-logs.log')

console.log('resourcesPath',resourcesPath)
console.log('config',config)
console.log('logPath',logPath)

//exec
dns.lookup('web.sanguosha.com', (err, address, family) => {
    console.log( address )
    let host = {
        headers:{
            host:'web.sanguosha.com'
        }
    }
    let arg={}
    arg.pathname = '/220/assets/simplified/DianJiang/55.png';

    let curl = 'curl  http://' + address + arg.pathname + ' -H "X-Forwarded-For: 1.1.1.1" -H "Host: ' + host.headers['host'] + '"';
    console.log( curl );
    let child = child_process.exec(curl, {
        encoding: 'binary',
        timeout: 0,
        maxBuffer: 20000 * 10240
    }, function(err, stdout, stderr) {
        fs.writeFile('55.txt',new Buffer(stdout, 'binary'), () => {});

    })



    let options = {
      url: 'http://' + address + arg.pathname,
      headers: {
        'X-Forwarded-For': '1.1.1.1',
        'Host':host.headers['host']
      }
    };
    let writeStream = fs.createWriteStream('doodle.png',{autoClose:true})
    request(options).pipe(writeStream)

    writeStream.on("finish", function() {
        console.log(writeStream);
    });

})

/**

let curl = 'curl  http://' + address + '/' + arg.pathname + ' -H "X-Forwarded-For: 1.1.1.1" -H "Host: ' + request.headers['host'] + '"';
let child = child_process.exec(curl, {
    encoding: 'binary',
    timeout: 0,
    windowHide:true,
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

**/

console.log(process.platform)

//const sgsc = require('../index').createServer(80)
