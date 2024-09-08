const net = require('net') // modulo per rete peer to peer 
const Socket = new net.Socket()

let clients = []
const server = net.createServer((socket) => {
    clients.push({'IP':socket.remoteAddress, data:socket})
    socket.on(('data'), (data) => {
        let text =data.toString('utf-8')
        console.log(text);
        clients.forEach((element,i) => {
            console.log(element.IP);
        });
        socket.write('ciao')
    })
    socket.on('end', () => {
        console.log('close');
    })
})

server.listen(3000, '0.0.0.0', () => {
    console.log('server attivo');
    
});
