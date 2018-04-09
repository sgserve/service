const sgsc = require('./../lib').createServer(80)

const hostile = require('hostile')

process.on('SIGINT', ()=> {
    hostile.remove('127.0.0.1', 'web.sanguosha.com', (err)=> {
      if (err) {
        console.error(err)
      } else {
        console.log('set /etc/hosts successfully!')
        process.exit();
      }
    })
});
