const path = require('path')
const sgsc = require('./../lib').createServer(80)
const colors = require( "colors")

sgsc.on('sgsc:error', e=>{
    process.send({
        state: 0,
        message: e.toString()
    })
})
sgsc.on('sgsc:listening', con=>{
    process.send({
        state: 1,
        message: con
    })
})
sgsc.on('sgsc:message', message=>{})
