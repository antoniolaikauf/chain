const net = require('net') // modulo per rete peer to peer 
const Socket = new net.Socket()
const event = require('events')
// const emitter = new EventEmitter()


const server = net.createServer((socket) => {
    socket.on(('data'), (data) => {
        console.log(data);
        socket.write('ciao')
        
    })
    socket.on('end', () => {
        console.log('close');
    })
    
})

server.listen(9000, () => {
    console.log('server attivo');
    
});
