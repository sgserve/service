const   http = require('http');
const   child_process = require("child_process");
const   mime = require('mime-types');
const   path = require("path")
const   fs = require("fs");
const   url = require('url');
const   dns = require('dns');
const   hostile = require('hostile')
const   mkdirp = require('mkdirp');
const   yaml = require('read-yaml');
const   crypto=require('crypto');
let config = yaml.sync('config.yaml');
let server = http.createServer( (request , response ) => {});
let domain = 'web.sanguosha.com';

let search = function( file ){
    let filemd5 = crypto.createHash("md5").update(file).digest('hex');
    for( i=0; i<config.length; i++ ){
        if( filemd5  == crypto.createHash("md5").update(config[i]).digest('hex') ) {
            return true;
        }
    }
}
// 读取 替换 资源
dns.lookup( domain,( err, address, family )=>{ //
    hostile.set('127.0.0.1', domain, (err)=> {
        if ( err  ) {
            console.error( err )
        }else{
            console.log( address , family );
            server.on('connection' , ( err, socket )=>{});
            //http start
            server.on( 'request' , ( request , response ) =>{
                // 这是一张我们个人常用武将里面的那个小图
                let exis = search( request.url ) ;
                if ( exis ) {
                    console.log('本地读取' , '文件名:',request.url)
                    //匹配到的就是我们要拦截的，读取我们自己的资源
                    let file = fs.readFileSync('resources'+request.url);
                    let contentType = mime.lookup(request.url);
                    response.writeHead(200, {'Content-Type': ''+contentType+'' });
                    response.write(new Buffer(file, 'binary'));
                    response.end();
                } else {
                    //这里我们会将请求扔回去
                    let  arg = url.parse(request.url);
                    let curl = 'curl  http://'+address+'/'+ arg.pathname +' -H "X-Forwarded-For: 1.1.1.1" -H "Host: '+ request.headers['host'] +'"';
                    let child = child_process.exec(curl,{encoding: 'binary',timeout:0,maxBuffer: 20000 * 10240} ,function(err, stdout, stderr ) {
                        let d = path.parse(arg.pathname);
                        mkdirp('resources'+d.dir, (err)=> {
                            if (err) console.error(err)
                            else fs.writeFile('resources'+d.dir+'/'+d.base,new Buffer(stdout, 'binary'),()=>{});
                        });
                        let contentType = mime.lookup(arg.pathname);
                        if( contentType == false ){
                            //contentType = 'application/octet-stream';
                        }
                        response.writeHead(200, {'Content-Type': ''+contentType+'','Content-Length': Buffer.byteLength(new Buffer(stdout, 'binary'), 'binary') });
                        console.log('远程读取','文件名:',request.url,'文件类型:', arg.pathname,contentType , '文件大小:',Buffer.byteLength(new Buffer(stdout, 'binary'), 'binary') )
                        response.end(new Buffer(stdout, 'binary'));
                    })
                }
            })
            server.listen(80);
            //http end
        }
    })

})
process.on('exit', ()=> {
　　console.log('Bye.');
})
process.on('SIGINT', ()=> {
    hostile.remove('127.0.0.1', domain, (err)=> {
      if (err) {
        console.error(err)
      } else {
        console.log('set /etc/hosts successfully!')
        process.exit();
      }
    })
});
process.on('uncaughtException', (err)=> {
　　console.log('Caught exception: ' + err);
})
